import {
  ArrayValueCell,
  type BaseBDomAction,
  type BaseBDomValue,
  BigIntValueCell,
  BooleanValueCell,
  DateValueCell,
  FunctionValueCell,
  NumberValueCell,
  ObjectValueCell,
  SimpleValueCell,
  StringValueCell,
} from 'blastdom';
import type { AnyFunction } from '@framjet/common';

type InferRawTypeTuple<
  T extends unknown[],
  Acc extends unknown[] = [],
> = T extends [infer L, ...infer R]
  ? InferRawTypeTuple<R, [...Acc, InferRawType<L>]>
  : Acc;

type InferRawTypeObject<T extends object> = {
  [K in keyof T]: InferRawType<T[K]>;
} & unknown;

export type InferRawType<T> =
  T extends BaseBDomValue<infer V>
    ? V
    : T extends BaseBDomAction
      ? AnyFunction
      : T extends unknown[]
        ? T extends Array<infer V>
          ? V[] extends T
            ? InferRawType<V>[]
            : InferRawTypeTuple<T>
          : never
        : T extends AnyFunction
          ? T
          : T extends object
            ? InferRawTypeObject<T>
            : T;

type InferRawTypeValueCell<T> = T extends AnyFunction
  ? FunctionValueCell<T>
  : T extends unknown[]
    ? ArrayValueCell<T>
    : T extends object
      ? ObjectValueCell<T>
      : T extends string
        ? StringValueCell
        : T extends number
          ? NumberValueCell
          : T extends boolean
            ? BooleanValueCell
            : T extends bigint
              ? BigIntValueCell
              : T extends Date
                ? DateValueCell
                : SimpleValueCell<T>;

export type InferRawTypeCell<T> =
  T extends BaseBDomValue<infer V>
    ? InferRawTypeValueCell<V>
    : T extends BaseBDomAction
      ? FunctionValueCell<AnyFunction>
      : T extends unknown[]
        ? T extends Array<infer V>
          ? V[] extends T
            ? ArrayValueCell<InferRawType<V>[]>
            : ArrayValueCell<InferRawTypeTuple<T>>
          : never
        : T extends AnyFunction
          ? FunctionValueCell<T>
          : T extends object
            ? ObjectValueCell<InferRawTypeObject<T>>
            : InferRawTypeValueCell<T>;
