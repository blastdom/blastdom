import { BaseBDomActionDefinition } from '../_base';
import type {
  BaseBDomAction,
  BDomAction,
  DualType,
  ItemFields,
} from '../../types';
import { type AnyValueCell, ArrayValueCell } from '../../cells';
import { ItemResolveContext } from '../../common';

export interface ArgsSwapBDomAction extends BaseBDomAction {
  readonly $$a: 'args.swap';
  readonly order: DualType<number | number[]>;
  readonly action?: BDomAction;
}

export class ArgsSwapBDomActionDefinition extends BaseBDomActionDefinition<ArgsSwapBDomAction> {
  readonly name = 'ArgsSwapBDomAction';
  readonly type = 'args.swap';

  get fields(): ItemFields<ArgsSwapBDomAction> {
    return {
      action: {
        typeName: 'BDomAction',
        optional: true,
        defaultValue: undefined,
        isArray: false,
        isObject: false,
        isRaw: true,
        isReadOnly: true,
      },
      order: {
        typeName: undefined,
        optional: false,
        defaultValue: undefined,
        isArray: 'dual',
        isObject: false,
        isRaw: 'dual',
        isReadOnly: true,
      },
    };
  }

  override resolveItem(
    context: ItemResolveContext<ArgsSwapBDomAction>,
  ): AnyValueCell {
    const actionCell = context.getFieldValueCell('action');
    const orderCell = context.getFieldValueCell(
      'order',
    ) as unknown as ArrayValueCell<number[]>;

    return context.calculatedFunc((getter) => {
      const order = getter(orderCell);
      const action = actionCell !== undefined ? getter(actionCell) : undefined;

      return (...args: unknown[]) => {
        const newArgs = order.map((o) => args[o] ?? undefined);

        if (action !== undefined) {
          return action(...newArgs);
        }

        return newArgs;
      };
    });
  }
}
