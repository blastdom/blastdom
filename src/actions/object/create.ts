import { BaseBDomActionDefinition } from '../_base';
import type {
  AnyBDomValue,
  BaseBDomAction,
  BDomAction,
  ItemFields,
} from '../../types';
import { type AnyValueCell } from '../../cells';
import { ItemResolveContext } from '../../common';
import { Objects } from '@framjet/common';

export interface ObjectCreateBDomAction extends BaseBDomAction {
  readonly $$a: 'obj.create';
  readonly fields: Record<string, AnyBDomValue | BDomAction>;
}

export class ObjectCreateBDomActionDefinition extends BaseBDomActionDefinition<ObjectCreateBDomAction> {
  readonly name = 'ObjectCreateBDomAction';
  readonly type = 'obj.create';

  get fields(): ItemFields<ObjectCreateBDomAction> {
    return {
      fields: {
        typeName: 'unknown',
        optional: false,
        defaultValue: undefined,
        isArray: false,
        isObject: true as any,
        isRaw: true,
        isReadOnly: true,
      },
    };
  }

  override resolveItem(
    context: ItemResolveContext<ObjectCreateBDomAction>,
  ): AnyValueCell {
    const fieldsCell = context.getFieldValueCell('fields');

    return context.calculatedFunc((getter) => {
      const fields = getter(fieldsCell);

      return (...args: unknown[]) => {
        return Objects.fromEntries(
          Objects.entries(fields).map(([k, v]) => [
            k,
            typeof v === 'function' ? v(...args) : v,
          ]),
        );
      };
    });
  }
}
