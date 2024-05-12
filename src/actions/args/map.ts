import { BaseBDomActionDefinition } from '../_base';
import type { BaseBDomAction, BDomAction, ItemFields } from '../../types';
import { type AnyValueCell } from '../../cells';
import { ItemResolveContext } from '../../common';
import { Objects } from '@framjet/common';

export interface ArgsMapBDomAction extends BaseBDomAction {
  readonly $$a: 'args.map';
  readonly map: (string | BDomAction)[];
  readonly action?: BDomAction;
}

export class ArgsMapBDomActionDefinition extends BaseBDomActionDefinition<ArgsMapBDomAction> {
  readonly name = 'ArgsMapBDomAction';
  readonly type = 'args.map';

  get fields(): ItemFields<ArgsMapBDomAction> {
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
      map: {
        typeName: 'unknown',
        optional: false,
        defaultValue: undefined,
        isArray: true as any,
        isObject: false,
        isRaw: true,
        isReadOnly: true,
      },
    };
  }

  override resolveItem(
    context: ItemResolveContext<ArgsMapBDomAction>,
  ): AnyValueCell {
    const actionCell = context.getFieldValueCell('action');
    const mapCell = context.getFieldValueCell('map');

    return context.calculatedFunc((getter) => {
      const map = getter(mapCell);
      const action = actionCell !== undefined ? getter(actionCell) : undefined;

      return (...args: unknown[]) => {
        const newArgs = map.map((a) => {
          if (typeof a === 'string') {
            return Objects.get(args, a as never);
          }

          return a(...args);
        });

        if (action !== undefined) {
          return action(...newArgs);
        }

        return newArgs;
      };
    });
  }
}
