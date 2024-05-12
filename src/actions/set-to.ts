import { BaseBDomActionDefinition } from './_base';
import type {
  AnyBDomValue,
  BaseBDomAction,
  BDomAction,
  BDomValue,
  ItemFields,
} from '../types';
import { type AnyValueCell } from '../cells';
import { ItemResolveContext } from '../common';

export interface SetToBDomAction extends BaseBDomAction {
  readonly $$a: 'set.to';
  readonly path: string | BDomValue<string>;
  readonly value: BDomAction | AnyBDomValue;
}

export class SetToBDomActionDefinition extends BaseBDomActionDefinition<SetToBDomAction> {
  readonly name = 'SetToBDomAction';
  readonly type = 'set.to';

  get fields(): ItemFields<SetToBDomAction> {
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
      value: {
        typeName: 'unknown',
        optional: false,
        defaultValue: undefined,
        isArray: false,
        isObject: false,
        isRaw: 'dual',
        isReadOnly: true,
      },
    };
  }

  override resolveItem(
    context: ItemResolveContext<SetToBDomAction>,
  ): AnyValueCell {
    const pathCell = context.getFieldValueCell('path');
    const valueCell = context.getFieldValueCell('value');

    return context.calculatedFunc((getter) => {
      const value = getter(valueCell);
      const path = getter(pathCell);

      return () => {
        context.writeRef(path, context.processValue(value));
      };
    });
  }
}
