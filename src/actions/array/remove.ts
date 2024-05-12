import { BaseBDomActionDefinition } from '../_base';
import type { BaseBDomAction, BDomValue, ItemFields } from '../../types';
import { type AnyValueCell, ArrayValueCell } from '../../cells';
import { ItemResolveContext } from '../../common';
import { Objects } from '@framjet/common';

export interface ArrayRemoveBDomAction extends BaseBDomAction {
  readonly $$a: 'array.remove';
  readonly path: string | BDomValue<string>;
}

export class ArrayRemoveBDomActionDefinition extends BaseBDomActionDefinition<ArrayRemoveBDomAction> {
  readonly name = 'ArrayRemoveBDomAction';
  readonly type = 'array.remove';

  get fields(): ItemFields<ArrayRemoveBDomAction> {
    return {
      path: {
        typeName: 'string',
        optional: false,
        defaultValue: undefined,
        isArray: false,
        isObject: false,
        isRaw: 'dual',
        isRef: true,
        isReadOnly: true,
      },
    };
  }

  override resolveItem(
    context: ItemResolveContext<ArrayRemoveBDomAction>,
  ): AnyValueCell {
    const refPath = context.getFieldValueCell('path');

    return context.calculatedFunc((getter) => {
      const ref = getter(refPath);
      const arrayValueCell = context.readRef(ref, undefined, undefined, getter);

      return (index: number) => {
        if (arrayValueCell === undefined) {
          throw new Error(`${this}: path "${ref}" is undefined`);
        }

        if (arrayValueCell instanceof ArrayValueCell === false) {
          throw new Error(`${this}: path "${ref}" is not array value`);
        }

        if (Objects.isType(index, 'number')) {
          arrayValueCell.removeAt(index);
        } else {
          throw new Error(
            `${this}: index is not a number but: "${typeof index}"`,
          );
        }
      };
    });
  }
}
