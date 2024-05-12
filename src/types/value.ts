import { type BaseProcessedBDomItem } from './item';
import type { IsNever } from 'type-plus';
import type { BDomValueMap, BDomValueSpecificMap } from '../items';

export const BDomValueTypeKey: unique symbol = Symbol.for('BDomValueType');

export interface BaseBDomValue<TValue>
  extends BaseProcessedBDomItem<'$$v', '$$ro' | 'id'> {
  readonly $$v: string;
  readonly $$ro?: boolean;
  readonly [BDomValueTypeKey]?: TValue;
}

type BDomValueInner<TValue> = {
  [K in keyof BDomValueSpecificMap<TValue> as IsNever<
    BDomValueSpecificMap<TValue>[K]
  > extends true
    ? never
    : K]: BDomValueSpecificMap<TValue>[K];
};

export type BDomValue<TValue> =
  BDomValueInner<TValue>[keyof BDomValueInner<TValue>];

export type AnyBDomValue = BDomValueMap[keyof BDomValueMap];

export type InferBDomValue<T> = T extends BaseBDomValue<infer V> ? V : never;

export type BDomValueTypeMap = {
  [K in keyof BDomValueMap as BDomValueMap[K]['$$v']]: BDomValueMap[K];
} & unknown;

export type BDomValueByType<T extends keyof BDomValueTypeMap> =
  BDomValueTypeMap[T];
