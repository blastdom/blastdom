import { BaseBDomValueDefinition } from './_base';
import type {
  AnyBDomValue,
  BaseBDomValue,
  BDomAction,
  ItemFields,
} from '../types';
import type { AnyValueCell } from '../cells';
import { ItemResolveContext } from '../common';

export interface ActionExecBDomValue<TValue> extends BaseBDomValue<TValue> {
  readonly $$v: 'action.exec';
  action: BDomAction;
  args?: AnyBDomValue[];
}

export type AnyActionExecBDomValue = ActionExecBDomValue<unknown>;

export class ActionExecBDomValueDefinition extends BaseBDomValueDefinition<AnyActionExecBDomValue> {
  readonly name = 'ActionExecBDomValue';
  readonly type = 'action.exec';

  get fields(): ItemFields<AnyActionExecBDomValue> {
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
      args: {
        typeName: 'array',
        optional: true,
        defaultValue: [],
        isArray: true,
        isObject: false,
        isRaw: true,
        isReadOnly: false,
      },
    };
  }

  override resolveItem(
    context: ItemResolveContext<AnyActionExecBDomValue>,
  ): AnyValueCell {
    const action = context.getFieldValueCell('action');
    const argStates = context.getFieldValueCell('args');

    return context.calculatedValue((get) => {
      const args = argStates !== undefined ? get(argStates) ?? [] : [];
      const fn = get(action);

      return fn(...args);
    });
  }
}
