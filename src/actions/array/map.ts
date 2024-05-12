import { BaseBDomActionDefinition } from '../_base';
import type { BaseBDomAction, BDomAction, ItemFields } from '../../types';
import { type AnyValueCell } from '../../cells';
import { ItemResolveContext } from '../../common';

export interface ArrayMapBDomAction extends BaseBDomAction {
  readonly $$a: 'array.map';
  readonly action: BDomAction;
}

export class ArrayMapBDomActionDefinition extends BaseBDomActionDefinition<ArrayMapBDomAction> {
  readonly name = 'ArrayMapBDomAction';
  readonly type = 'array.map';

  get fields(): ItemFields<ArrayMapBDomAction> {
    return {
      action: {
        typeName: 'BDomAction',
        optional: false,
        defaultValue: undefined,
        isArray: false,
        isObject: false,
        isRaw: true,
        isRef: false,
        isReadOnly: true,
      },
    };
  }

  override resolveItem(
    context: ItemResolveContext<ArrayMapBDomAction>,
  ): AnyValueCell {
    const actionCell = context.getFieldValueCell('action');

    return context.calculatedFunc((getter) => {
      const action = getter(actionCell);

      return (input: unknown[]) => {
        if (Array.isArray(input)) {
          return input.map(action);
        }

        throw new Error(`ArrayMapBDomAction value given is not array`);
      };
    });
  }
}
