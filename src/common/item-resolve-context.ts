import type { BaseProcessedBDomItem, FieldSettings } from '../types';
import { type AnyStateCell, type StateCell } from '../cells/state-cell';
import { Path } from './path';
import { isRefSetter } from '../utils';
import { BDomNodeState, BDomSchemaState, StateRef } from '../state';
import { BaseObject } from './base-object';
import {
  type Cell,
  type CellGetter,
  type CellSetter,
  type WritableCell,
} from '@framjet/cell';
import type { InferRawType, InferRawTypeCell } from '../types/state-cell';
import type { AnyFunction } from '@framjet/common';
import { SimpleValueCell } from '../cells/states/simple';
import type { AnyValueCell, ValueCell } from '../cells/states/_base';
import {
  CalculatedFunctionValueCell,
  CalculatedValueCell,
  CalculatedValueCellProvider,
} from '../cells/states/calculated';

type FieldsToSettings<T> = {
  [K in keyof T]: FieldSettings;
} & unknown;

type FieldsToStateCells<T> = {
  [K in keyof T]: StateCell<InferRawType<NonNullable<T[K]>>>;
} & unknown;

type FieldsToValueCells<T> = {
  [K in keyof T]: InferRawTypeCell<NonNullable<T[K]>>;
} & unknown;

type FilteredItem<T> =
  T extends BaseProcessedBDomItem<infer A, infer B> ? Omit<T, A | B> : never;

export class ItemResolveContext<
  I extends BaseProcessedBDomItem<keyof I, keyof I>,
  T extends object = FilteredItem<I>,
> extends BaseObject {
  readonly #item: I;
  readonly #path: Path;

  readonly #cellGetter: CellGetter;
  readonly #cellSetter: CellSetter;
  readonly #nodeStateRef: StateRef<BDomNodeState>;
  readonly #fieldSettings: FieldsToSettings<T>;
  readonly #fieldCells: FieldsToStateCells<T>;

  constructor(
    get: CellGetter,
    set: CellSetter,
    item: I,
    path: Path,
    nodeStateRef: StateRef<BDomNodeState>,
    fieldSettings: FieldsToSettings<T>,
    fieldCells: FieldsToStateCells<T>,
  ) {
    super();

    this.#item = item;
    this.#path = path;

    this.#cellGetter = get;
    this.#cellSetter = set;
    this.#nodeStateRef = nodeStateRef;
    this.#fieldSettings = fieldSettings;
    this.#fieldCells = fieldCells;
  }

  get item(): I {
    return this.#item;
  }

  get path(): Path {
    return this.#path;
  }

  get fieldSettings(): FieldsToSettings<T> {
    return this.#fieldSettings;
  }

  getFieldSetting<K extends keyof T>(name: K): FieldSettings {
    return this.fieldSettings[name];
  }

  getFieldStateCell<K extends keyof T>(name: K): FieldsToStateCells<T>[K] {
    return this.#fieldCells[name];
  }

  getFieldValueCell<K extends keyof T>(name: K): FieldsToValueCells<T>[K] {
    const fieldStateCell = this.getFieldStateCell(name);

    if (fieldStateCell === undefined) {
      return undefined as unknown as FieldsToValueCells<T>[K];
    }

    return this.readCell(fieldStateCell) as FieldsToValueCells<T>[K];
  }

  getFieldValue<K extends keyof T>(name: K): InferRawType<T[K]> {
    const fieldValueCell = this.getFieldValueCell(name);

    if (fieldValueCell === undefined) {
      return undefined as InferRawType<T[K]>;
    }

    return this.readCell(fieldValueCell) as InferRawType<T[K]>;
  }

  get nodeState(): BDomNodeState {
    return this.#nodeStateRef.get();
  }

  get schemaState(): BDomSchemaState {
    return this.nodeState.getSchemaState();
  }

  processValue<V>(value: V, path?: Path): StateCell<V> {
    return this.nodeState.processValue(
      value,
      path ?? this.#path.field('unknown'),
    ) as StateCell<V>;
  }

  undefinedValue(path?: Path): ValueCell<unknown> {
    return new SimpleValueCell(
      undefined,
      path ?? this.path,
      this.#nodeStateRef,
      this.schemaState,
    );
  }

  calculatedValue<T>(
    valueProvider: CalculatedValueCellProvider<T>,
    path?: Path,
  ): CalculatedValueCell<T> {
    return new CalculatedValueCell<T>(
      valueProvider,
      path ?? this.path,
      this.#nodeStateRef,
      this.schemaState,
    );
  }

  calculatedFunc<T extends AnyFunction>(
    valueProvider: CalculatedValueCellProvider<T>,
    path?: Path,
  ): CalculatedFunctionValueCell<T> {
    return new CalculatedFunctionValueCell<T>(
      valueProvider,
      path ?? this.path,
      this.#nodeStateRef,
      this.schemaState,
    );
  }

  resolveRef(ref: string, path?: Path): Cell<AnyStateCell | undefined> {
    return this.schemaState.resolveRef(
      ref,
      this.#nodeStateRef,
      path ?? this.path,
    );
  }

  writeRef<T>(ref: string, value: StateCell<T>, path?: Path): void {
    const refPath = this.resolveRef(ref, path ?? this.path);

    if (isRefSetter(refPath)) {
      refPath.setState(value as never, this.#cellSetter);
    } else {
      throw new Error(`${refPath} is not compatible with RefSetter`);
    }
  }

  readRef(
    ref: string,
    defaultValue?: AnyValueCell,
    path?: Path,
    getter = this.#cellGetter,
  ): AnyValueCell | undefined {
    const refPath = this.resolveRef(ref, path ?? this.path);

    const stateCell = getter(refPath);
    if (stateCell === undefined) {
      return defaultValue;
    }

    const valueCell = getter(stateCell);
    if (valueCell !== undefined) {
      return valueCell;
    }

    return defaultValue;
  }

  readFieldAsRef<K extends keyof T>(
    field: K,
    defaultValue?: AnyValueCell,
    path?: Path,
  ): AnyValueCell {
    const refField = this.getFieldValueCell(field);

    return this.calculatedValue((getter) => {
      const ref = getter(refField) as string;
      const refPath = this.resolveRef(ref, path ?? this.path);

      const stateCell = getter(refPath);
      if (stateCell === undefined) {
        return defaultValue !== undefined ? getter(defaultValue) : undefined;
      }

      const valueCell = getter(stateCell);
      if (valueCell !== undefined) {
        return getter(valueCell);
      }

      return defaultValue !== undefined ? getter(defaultValue) : undefined;
    });
  }

  readCell<V>(cell: Cell<V>): V {
    return this.#cellGetter(cell);
  }

  writeCell<V, TArgs extends unknown[], TResult>(
    cell: WritableCell<V, TArgs, TResult>,
    ...args: TArgs
  ): TResult {
    return this.#cellSetter(cell, ...args);
  }
}
