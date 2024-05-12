import { BaseBDomValueDefinition } from './_base';
import type { BaseBDomValue, ItemFields } from '../types';
import type { AnyValueCell } from '../cells';
import { ItemResolveContext } from '../common';
import type { JsonValue } from '@framjet/types';

export interface RefBDomValue<TValue> extends BaseBDomValue<TValue> {
  readonly $$v: 'ref';
  path: string;
}

export type AnyRefBDomValue = RefBDomValue<JsonValue>;

export class RefBDomValueDefinition extends BaseBDomValueDefinition<AnyRefBDomValue> {
  readonly name = 'RefBDomValue';
  readonly type = 'ref';

  get fields(): ItemFields<AnyRefBDomValue> {
    return {
      path: {
        typeName: 'string',
        optional: false,
        defaultValue: undefined,
        isArray: false,
        isObject: false,
        isRaw: true,
        isRef: false,
        isReadOnly: false,
      },
    };
  }

  override resolveItem(
    context: ItemResolveContext<AnyRefBDomValue>,
  ): AnyValueCell {
    return context.readFieldAsRef('path');
  }
}
