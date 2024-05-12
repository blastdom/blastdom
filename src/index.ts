import { initDefault, typeRegister } from './init';
import type {
  CreateTypeNameResolver,
  FilterPossibleNames,
  FilterPossibleTypeNamesMap,
  StringContains,
} from '@framjet/types';
import type { BDomTypeNames } from './items';
import type * as React from 'react';
import type {
  AnyBDomAction,
  AnyBDomValue,
  BDomNode,
  BDomNodeId,
  BDomSchema,
  BDomSchemaId,
  BDomSchemaVersion,
} from './types';

export * from './actions';
export * from './cells';
export * from './common';
export * from './nodes';
export * from './react';
export * from './registry';
export * from './state';
export * from './store';
export * from './types';
export * from './utils';
export * from './values';
export * from './items';
export * from './blastdom';

typeRegister();

initDefault();

declare module '@framjet/types' {
  export interface TypeNamesProvider<
    TInput extends string,
    TInstanceOf = unknown,
  > {
    _blastdom: StringContains<TInput, '<' | '>'> extends true
      ? never
      : FilterPossibleNames<
          TInput,
          keyof FilterPossibleTypeNamesMap<BDomTypeNames, TInstanceOf>
        >;
  }

  export interface TypeNameResolvers<T, TExact extends boolean> {
    blastdom: CreateTypeNameResolver<T, TExact, BDomTypeNames>;
  }

  export interface CustomTypeNames {
    ReactKey: React.Key;
  }
}

declare module '@framjet/common' {
  export interface TypesRegistry {
    BDomValue: AnyBDomValue;
    BDomAction: AnyBDomAction;
    BDomNode: BDomNode;
    BDomNodeId: BDomNodeId;
    BDomSchema: BDomSchema;
    BDomSchemaId: BDomSchemaId;
    BDomSchemaVersion: BDomSchemaVersion;
  }
}
