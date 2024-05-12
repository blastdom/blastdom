import { BaseBDomActionDefinition } from './_base';
import type {
  AnyBDomValue,
  BaseBDomAction,
  BDomAction,
  ItemFields,
} from '../types';
import {
  type AnyStateCell,
  type AnyValueCell,
  CalculatedFunctionValueCell,
  FunctionValueCell,
} from '../cells';
import { ItemResolveContext } from '../common';

export interface CallBDomAction extends BaseBDomAction {
  readonly $$a: 'call';
  readonly action: BDomAction;
  readonly args?: Array<BDomAction | AnyBDomValue>;
}

export class CallBDomActionDefinition extends BaseBDomActionDefinition<CallBDomAction> {
  readonly name = 'CallBDomAction';
  readonly type = 'call';

  get fields(): ItemFields<CallBDomAction> {
    return {
      action: {
        typeName: 'BDomAction',
        optional: false,
        defaultValue: undefined,
        isArray: false,
        isObject: false,
        isRaw: true,
        isReadOnly: true,
      },
      args: {
        typeName: 'array',
        optional: true,
        defaultValue: [],
        isArray: true,
        isObject: false,
        isRaw: true,
        isReadOnly: true,
      },
    };
  }

  override resolveItem(
    context: ItemResolveContext<CallBDomAction>,
  ): AnyValueCell {
    const fnCell = context.getFieldValueCell('action');
    const args = context.getFieldValueCell('args');

    return context.calculatedFunc((get) => {
      const argSupplier: ((...args: unknown[]) => unknown)[] = [];
      const fn = get(fnCell);

      args?.forEach((state: AnyStateCell) => {
        const valueCell = get(state);

        if (
          valueCell instanceof FunctionValueCell ||
          valueCell instanceof CalculatedFunctionValueCell
        ) {
          const argFn = get(valueCell);

          argSupplier.push((...args: unknown[]) => argFn(...args));
        } else {
          const arg = get(valueCell);

          argSupplier.push(() => arg);
        }
      });

      return (...args: unknown[]) => {
        const callArgs: unknown[] = argSupplier.map((s) => s(...args));

        return fn(...callArgs);
      };
    });
  }
}
