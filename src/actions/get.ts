import { BaseBDomActionDefinition } from './_base';
import type { BaseBDomAction, BDomValue, ItemFields } from '../types';
import { type AnyValueCell } from '../cells';
import { ItemResolveContext } from '../common';

export interface GetBDomAction extends BaseBDomAction {
  readonly $$a: 'get';
  readonly path: BDomValue<string>;
}

export class GetBDomActionDefinition extends BaseBDomActionDefinition<GetBDomAction> {
  readonly name = 'GetBDomAction';
  readonly type = 'get';

  get fields(): ItemFields<GetBDomAction> {
    return {
      path: {
        typeName: 'string',
        optional: false,
        defaultValue: undefined,
        isArray: false,
        isObject: false,
        isRaw: false,
        isRef: true,
        isReadOnly: true,
      },
    };
  }

  override resolveItem(
    context: ItemResolveContext<GetBDomAction>,
  ): AnyValueCell {
    const path = context.getFieldValueCell('path');

    return context.calculatedFunc((getter) => {
      const pathRef = context.readRef(
        getter(path),
        undefined,
        undefined,
        getter,
      );

      const value = pathRef !== undefined ? getter(pathRef) : undefined;

      return () => value;
    });
  }
}
