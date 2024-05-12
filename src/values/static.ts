import { BaseBDomValueDefinition } from './_base';
import type { BaseBDomValue, ItemFields } from '../types';
import type { AnyValueCell } from '../cells';
import { ItemResolveContext } from '../common';

export interface StaticBDomValue<TValue> extends BaseBDomValue<TValue> {
  readonly $$v: 'static';
  value: TValue;
}

export type AnyStaticBDomValue = StaticBDomValue<unknown>;

export class StaticBDomValueDefinition extends BaseBDomValueDefinition<AnyStaticBDomValue> {
  readonly name = 'StaticBDomValue';
  readonly type = 'static';

  get fields(): ItemFields<StaticBDomValue<unknown>> {
    return {
      value: {
        typeName: 'unknown',
        isRaw: true,
        isReadOnly: false,
        defaultValue: undefined,
        isArray: false,
        isObject: false,
        optional: false,
      },
    };
  }

  override resolveItem(
    context: ItemResolveContext<AnyStaticBDomValue>,
  ): AnyValueCell {
    return context.getFieldValueCell('value') as AnyValueCell;
  }
}
