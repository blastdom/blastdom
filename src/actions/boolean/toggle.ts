import { BaseBDomActionDefinition } from '../_base';
import type { BaseBDomAction, BDomValue, ItemFields } from '../../types';
import { type AnyValueCell, BooleanValueCell } from '../../cells';
import { ItemResolveContext } from '../../common';

export interface BooleanToggleBDomAction extends BaseBDomAction {
  readonly $$a: 'bool.toggle';
  readonly path: string | BDomValue<string>;
}

export class BooleanToggleBDomActionDefinition extends BaseBDomActionDefinition<BooleanToggleBDomAction> {
  readonly name = 'BooleanToggleBDomAction';
  readonly type = 'bool.toggle';

  get fields(): ItemFields<BooleanToggleBDomAction> {
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
    context: ItemResolveContext<BooleanToggleBDomAction>,
  ): AnyValueCell {
    const refPath = context.getFieldValueCell('path');

    return context.calculatedFunc((getter) => {
      const ref = getter(refPath);
      const valueCell = context.readRef(
        ref,
        undefined,
        context.path.field('path'),
        getter,
      );

      if (valueCell instanceof BooleanValueCell === false) {
        throw new Error(
          `${context.path.field('path')} value is not a boolean value.`,
        );
      }

      const value = !getter(valueCell);

      return () => {
        context.writeRef(
          ref,
          context.processValue(value),
          context.path.field('path'),
        );
      };
    });
  }
}
