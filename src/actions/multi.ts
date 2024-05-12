import { BaseBDomActionDefinition } from './_base';
import type { BaseBDomAction, BDomAction, ItemFields } from '../types';
import { type AnyValueCell } from '../cells';
import { ItemResolveContext } from '../common';

export interface MultiBDomAction extends BaseBDomAction {
  readonly $$a: 'multi';
  readonly actions: BDomAction[];
}

export class MultiBDomActionDefinition extends BaseBDomActionDefinition<MultiBDomAction> {
  readonly name = 'MultiBDomAction';
  readonly type = 'multi';

  get fields(): ItemFields<MultiBDomAction> {
    return {
      actions: {
        typeName: 'array',
        optional: false,
        defaultValue: [],
        isArray: true,
        isObject: false,
        isRaw: true,
        isReadOnly: true,
      },
    };
  }

  override resolveItem(
    context: ItemResolveContext<MultiBDomAction>,
  ): AnyValueCell {
    const actionCells = context.getFieldValueCell('actions');

    return context.calculatedFunc((getter) => {
      const actions = getter(actionCells);
      return (...args: unknown[]) => {
        actions?.map((fn) => {
          fn(...args);
        });
      };
    });
  }
}
