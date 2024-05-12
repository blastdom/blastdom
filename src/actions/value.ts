import { BaseBDomActionDefinition } from './_base';
import type { AnyBDomValue, BaseBDomAction, ItemFields } from '../types';
import { type AnyValueCell } from '../cells';
import { ItemResolveContext } from '../common';

export interface ValueBDomAction extends BaseBDomAction {
  readonly $$a: 'value';
  readonly value: AnyBDomValue;
}

export class ValueBDomActionDefinition extends BaseBDomActionDefinition<ValueBDomAction> {
  readonly name = 'ValueBDomAction';
  readonly type = 'value';

  get fields(): ItemFields<ValueBDomAction> {
    return {
      value: {
        typeName: 'any',
        optional: false,
        defaultValue: undefined,
        isArray: false,
        isObject: false,
        isRaw: false,
        isReadOnly: true,
      },
    };
  }

  override resolveItem(
    context: ItemResolveContext<ValueBDomAction>,
  ): AnyValueCell {
    const valueCell = context.getFieldValueCell('value');

    return context.calculatedFunc((getter) => {
      const value = getter(valueCell);

      return () => value;
    });
  }
}
