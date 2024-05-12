import * as React from 'react';
import { BaseBDomValueDefinition } from './_base';
import type { BaseBDomValue, BDomValue, ItemFields } from '../types';
import type { AnyValueCell, ValueCell } from '../cells';
import type { ItemResolveContext } from '../common';
import { BDomComponentRegistry } from '../registry';

export interface ComponentBDomValue extends BaseBDomValue<React.ReactElement> {
  readonly $$v: 'component';
  name: string | BDomValue<string>;
}

export class ComponentBDomValueDefinition extends BaseBDomValueDefinition<ComponentBDomValue> {
  readonly name = 'ComponentBDomValue';
  readonly type = 'component';

  get fields(): ItemFields<ComponentBDomValue> {
    return {
      name: {
        typeName: 'string',
        isRaw: 'dual',
        isReadOnly: false,
        defaultValue: undefined,
        isArray: false,
        isObject: false,
        optional: false,
      },
    };
  }

  override resolveItem(
    context: ItemResolveContext<ComponentBDomValue>,
  ): AnyValueCell {
    const nameCell = context.getFieldValueCell('name') as ValueCell<string>;

    return context.calculatedValue((getter) => {
      const name = getter(nameCell);
      const component = BDomComponentRegistry.getComponent(
        name,
      ) as unknown as React.ComponentType;

      return component;
    });
  }
}
