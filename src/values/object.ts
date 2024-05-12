import { BaseBDomValueDefinition } from './_base';
import type {
  AnyBDomValue,
  BaseBDomValue,
  BDomValue,
  ItemFields,
} from '../types';
import type { AnyValueCell } from '../cells';
import { ItemResolveContext } from '../common';
import { type IsUnknown } from 'type-plus';

export type Simplify<T> = {
  [KeyType in keyof T]: T[KeyType];
} & unknown;

export type ObjectToBDomObject<T> = Simplify<{
  [K in keyof T]: IsUnknown<T[K], AnyBDomValue, BDomValue<T[K]>>;
}>;

export interface ObjectBDomValue<TValue extends Record<PropertyKey, unknown>>
  extends BaseBDomValue<TValue> {
  readonly $$v: 'object';
  readonly value: ObjectToBDomObject<TValue>;
}

export type AnyObjectBDomValue = ObjectBDomValue<Record<PropertyKey, unknown>>;

export class ObjectBDomValueDefinition extends BaseBDomValueDefinition<AnyObjectBDomValue> {
  readonly name = 'ObjectBDomValue';
  readonly type = 'object';

  get fields(): ItemFields<AnyObjectBDomValue> {
    return {
      value: {
        typeName: 'object',
        optional: false,
        defaultValue: undefined,
        isArray: false,
        isObject: true,
        isRaw: true,
        isReadOnly: true,
      },
    };
  }

  override resolveItem(
    context: ItemResolveContext<AnyObjectBDomValue>,
  ): AnyValueCell {
    return context.getFieldValueCell('value') as AnyValueCell;
  }
}
