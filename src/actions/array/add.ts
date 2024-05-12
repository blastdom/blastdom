import { BaseBDomActionDefinition } from '../_base';
import type { BaseBDomAction, BDomValue, ItemFields } from '../../types';
import { type AnyValueCell, ArrayValueCell, type ValueCell } from '../../cells';
import { ItemResolveContext } from '../../common';

export interface ArrayAddBDomAction extends BaseBDomAction {
  readonly $$a: 'array.add';
  readonly path: string | BDomValue<string>;
}

export class ArrayAddBDomActionDefinition extends BaseBDomActionDefinition<ArrayAddBDomAction> {
  readonly name = 'ArrayAddBDomAction';
  readonly type = 'array.add';

  get fields(): ItemFields<ArrayAddBDomAction> {
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
    context: ItemResolveContext<ArrayAddBDomAction>,
  ): AnyValueCell {
    const refPath = context.getFieldValueCell('path') as ValueCell<string>;

    return context.calculatedFunc((getter) => {
      const ref = getter(refPath);
      const arrayValueCell = context.readRef(ref, undefined, undefined, getter);

      return (value: unknown, index?: number) => {
        if (arrayValueCell === undefined) {
          throw new Error(`${this}: path "${ref}" is undefined`);
        }

        if (arrayValueCell instanceof ArrayValueCell === false) {
          throw new Error(`${this}: path "${ref}" is not array value`);
        }

        if (index === undefined) {
          arrayValueCell.add(value);
        } else {
          arrayValueCell.addAt(index, value);
        }
      };
    });
  }
}
