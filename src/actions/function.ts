import { BaseBDomActionDefinition } from './_base';
import type { BaseBDomAction, BDomValue, ItemFields } from '../types';
import { type AnyValueCell } from '../cells';
import { ItemResolveContext } from '../common';

export interface FunctionBDomAction extends BaseBDomAction {
  readonly $$a: 'function';
  readonly name: string | BDomValue<string>;
}

export class FunctionBDomActionDefinition extends BaseBDomActionDefinition<FunctionBDomAction> {
  readonly name = 'FunctionBDomAction';
  readonly type = 'function';

  get fields(): ItemFields<FunctionBDomAction> {
    return {
      name: {
        typeName: 'string',
        optional: false,
        defaultValue: undefined,
        isArray: false,
        isObject: false,
        isRaw: 'dual',
        isReadOnly: true,
      },
    };
  }

  override resolveItem(
    context: ItemResolveContext<FunctionBDomAction>,
  ): AnyValueCell {
    return context.calculatedFunc((get) => {
      return (...args: Parameters<typeof JSON.stringify>) =>
        JSON.stringify(...args);
    });
  }
}
