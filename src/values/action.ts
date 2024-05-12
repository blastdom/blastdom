import { BaseBDomValueDefinition } from './_base';
import type { BaseBDomValue, BDomAction, ItemFields } from '../types';
import type { AnyValueCell } from '../cells';
import { ItemResolveContext } from '../common';
import type { AnyFunction } from '@framjet/common';

export interface ActionBDomValue extends BaseBDomValue<AnyFunction> {
  readonly $$v: 'action';
  action: BDomAction;
}

export class ActionBDomValueDefinition extends BaseBDomValueDefinition<ActionBDomValue> {
  readonly name = 'ActionBDomValue';
  readonly type = 'action';

  get fields(): ItemFields<ActionBDomValue> {
    return {
      action: {
        typeName: 'BDomAction',
        optional: false,
        defaultValue: undefined,
        isArray: false,
        isObject: false,
        isRaw: true,
        isReadOnly: false,
      },
    };
  }

  override resolveItem(
    context: ItemResolveContext<ActionBDomValue>,
  ): AnyValueCell {
    return context.getFieldValueCell('action') as AnyValueCell;
  }
}
