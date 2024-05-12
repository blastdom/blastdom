/* eslint-disable @typescript-eslint/ban-types */
import {
  type AnyFunction,
  TypeName,
  type WidenPrimitives,
} from '@framjet/types';
import { type IsEqual, type IsNever, type IsUndefined } from 'type-plus';
import {
  type AnyBDomValue,
  type BaseBDomAction,
  type BaseBDomItem,
  type BaseBDomValue,
  type BDomValue,
  type InferBDomValue,
} from 'blastdom';
import type { InferRawType, InferRawTypeCell } from './state-cell';

export type IsReadOnly<T, K> = K extends keyof T
  ? K extends NonNullable<
      {
        [P in keyof T]: IsEqual<
          { [Q in P]: T[P] },
          { readonly [Q in P]: T[P] }
        > extends true
          ? P
          : never;
      }[keyof T]
    >
    ? true
    : false
  : never;

export type IsOptional<T, K> = K extends keyof T
  ? K extends Exclude<
      {
        [KK in keyof T]: T extends Record<KK, T[KK]> ? never : KK;
      }[keyof T],
      undefined
    >
    ? true
    : false
  : never;

export type FieldSettingOld<
  T,
  TOptional extends boolean,
  TReadOnly extends boolean,
> =
  IsEqual<T, AnyBDomValue> extends true
    ? {
        typeName: 'any';
        optional: TOptional;
        defaultValue: unknown | undefined;
        isArray: false;
        isObject: false;
        isRaw: false;
        isReadOnly: TReadOnly;
      }
    : T extends BaseBDomValue<infer V>
      ? {
          typeName: TypeName<WidenPrimitives<V, true>>;
          optional: TOptional;
          defaultValue: WidenPrimitives<V, true> | undefined;
          isArray: false;
          isObject: false;
          isRaw: false;
          isReadOnly: TReadOnly;
        }
      : T extends Record<infer K, BaseBDomValue<infer V>>
        ? {
            typeName: TypeName<Record<K, V>>;
            optional: TOptional;
            defaultValue: Record<K, V> | undefined;
            isArray: false;
            isObject: true;
            isRaw: true;
            isReadOnly: TReadOnly;
          }
        : T extends Array<BaseBDomValue<unknown>>
          ? {
              typeName: TypeName<unknown[]>;
              optional: TOptional;
              defaultValue: [] | undefined;
              isArray: true;
              isObject: false;
              isRaw: true;
              isReadOnly: TReadOnly;
            }
          : T extends BaseBDomAction
            ? {
                typeName: TypeName<AnyFunction>;
                optional: TOptional;
                defaultValue: undefined;
                isArray: false;
                isObject: false;
                isRaw: true;
                isReadOnly: TReadOnly;
              }
            : T extends Array<BaseBDomAction>
              ? {
                  typeName: TypeName<AnyFunction[]>;
                  optional: TOptional;
                  defaultValue: undefined;
                  isArray: true;
                  isObject: false;
                  isRaw: true;
                  isReadOnly: TReadOnly;
                }
              : T extends Array<BaseBDomAction | BaseBDomValue<unknown>>
                ? {
                    typeName: 'array';
                    optional: TOptional;
                    defaultValue: [];
                    isArray: true;
                    isObject: false;
                    isRaw: true;
                    isReadOnly: TReadOnly;
                  }
                : {
                    typeName: TypeName<T>;
                    optional: TOptional;
                    defaultValue: T | undefined;
                    isArray: false;
                    isObject: false;
                    isRaw: true;
                    isReadOnly: TReadOnly;
                  };

export type DualType<T> = T extends T ? T | BDomValue<T> : never;

type IsRaw<T> = T extends BaseBDomValue<infer _V> ? false : true;
type IsObject<T> =
  IsRaw<T> extends true
    ? T extends Record<PropertyKey, BaseBDomValue<unknown>>
      ? true
      : false
    : false;
type IsArray<T> =
  IsRaw<T> extends true
    ? T extends Array<infer V>
      ? V extends BaseBDomValue<unknown> | BaseBDomAction
        ? true
        : false
      : false
    : boolean extends IsRaw<T>
      ? T extends Array<infer V>
        ? true
        : false
      : false;
type IsRef<T> =
  IsRaw<T> extends false
    ? T extends BaseBDomValue<string>
      ? boolean
      : false
    : T extends string
      ? boolean
      : false;

type FieldTypeName<T> =
  IsRaw<T> extends true
    ? IsArray<T> extends true
      ? 'array'
      : IsObject<T> extends true
        ? 'object'
        : TypeName<T>
    : boolean extends IsRaw<T>
      ? T extends BDomValue<infer V>
        ? V
        : never
      : IsEqual<T, AnyBDomValue> extends true
        ? 'any'
        : TypeName<InferBDomValue<T>>;

export interface FieldSettings {
  typeName: string;
  optional: boolean;
  defaultValue: unknown;
  isArray: boolean | 'dual';
  isObject: boolean;
  isRaw: boolean | 'dual';
  isRef?: boolean;
  isReadOnly: boolean;
}

export type FieldSetting<
  T,
  TOptional extends boolean,
  TReadOnly extends boolean,
> = {
  typeName: FieldTypeName<T>;
  optional: TOptional;
  defaultValue: IsArray<T> extends true
    ? []
    : IsRaw<T> extends true
      ? T | undefined
      : InferBDomValue<T> | undefined;
  isArray: boolean extends IsArray<T> ? 'dual' : IsArray<T>;
  isObject: IsObject<T>;
  isRaw: boolean extends IsRaw<T> ? 'dual' : IsRaw<T>;
  isRef?: IsRef<T>;
  isReadOnly: TReadOnly;
};

export type NodeFieldsInner<T, TO> = {
  [K in keyof T]-?: FieldSetting<T[K], IsOptional<TO, K>, IsReadOnly<TO, K>>;
};

export type NodeFields<T, F extends keyof T> = IsNever<
  T[F],
  {},
  NodeFieldsInner<RequiredNonNullable<T[F]>, T[F]>
>;

export type RequiredNonNullable<T> = {
  [K in keyof Required<T>]-?: Exclude<T[K], undefined>;
};

export type ItemFieldsInner<T, TO> = {
  [K in keyof Omit<
    T,
    ItemTypeField<TO> | 'id' | '$$ro' | symbol
  >]-?: FieldSetting<T[K], IsOptional<TO, K>, IsReadOnly<TO, K>>;
};

type ItemTypeField<T> = T extends BaseBDomItem<infer TF> ? TF : never;

export type ItemFields<T> = ItemFieldsInner<RequiredNonNullable<T>, T>;

export type ItemFieldStates<T> = {
  [K in keyof Omit<T, ItemTypeField<T> | symbol>]-?: InferRawType<T[K]>;
} & unknown;

export type ItemFieldStateCells<T> = {
  [K in keyof Omit<T, ItemTypeField<T> | symbol>]-?: InferRawTypeCell<
    NonNullable<T[K]>
  >;
} & unknown;
