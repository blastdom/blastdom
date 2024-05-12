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

export type ArrayToBDomArray<T> = {
  [K in keyof T]: IsUnknown<T[K], AnyBDomValue, BDomValue<T[K]>>;
};

export interface ArrayBDomValue<TValue extends unknown[]>
  extends BaseBDomValue<TValue> {
  readonly $$v: 'array';
  readonly value?: ArrayToBDomArray<TValue>;
}

export type AnyArrayBDomValue = ArrayBDomValue<unknown[]>;

export class ArrayBDomValueDefinition extends BaseBDomValueDefinition<AnyArrayBDomValue> {
  readonly name = 'ArrayBDomValue';
  readonly type = 'array';

  get fields(): ItemFields<AnyArrayBDomValue> {
    return {
      value: {
        typeName: 'array',
        optional: true,
        defaultValue: [],
        isArray: true,
        isObject: false,
        isRaw: true,
        isReadOnly: true,
      },
    };
  }

  override resolveItem(
    context: ItemResolveContext<AnyArrayBDomValue>,
  ): AnyValueCell {
    return context.getFieldValueCell('value') as AnyValueCell;
  }
}
