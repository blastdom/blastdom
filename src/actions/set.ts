import { BaseBDomActionDefinition } from './_base';
import type { BaseBDomAction, BDomValue, ItemFields } from '../types';
import { type AnyValueCell } from '../cells';
import { ItemResolveContext } from '../common';

export interface SetBDomAction extends BaseBDomAction {
  readonly $$a: 'set';
  readonly path: string | BDomValue<string>;
}

export class SetBDomActionDefinition extends BaseBDomActionDefinition<SetBDomAction> {
  readonly name = 'SetBDomAction';
  readonly type = 'set';

  get fields(): ItemFields<SetBDomAction> {
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
    context: ItemResolveContext<SetBDomAction>,
  ): AnyValueCell {
    const refPath = context.getFieldValueCell('path');

    return context.calculatedFunc((getter) => {
      const ref = getter(refPath);

      return (value: unknown) => {
        context.writeRef(
          ref,
          context.processValue(value),
          context.path.field('path'),
        );
      };
    });
  }
}
