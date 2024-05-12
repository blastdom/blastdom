import {
  BaseWritableCell,
  type Cell,
  cell,
  type CellGetter,
  type CellSetter,
  PrimitiveCell,
} from '@framjet/cell';
import {
  ArrayValueCell,
  BigIntValueCell,
  BooleanValueCell,
  DateValueCell,
  FunctionValueCell,
  NumberValueCell,
  ObjectValueCell,
  SimpleValueCell,
  StringValueCell,
} from './';
import { BDomNodeState, BDomSchemaState, StateRef } from '../../state';
import { Path } from '../../common';
import type { BaseBDomAction, BaseBDomValue } from '../../types';
import type { AnyFunction } from '@framjet/common';

type SetValueCellActionFn<T> = (
  prev: T,
  getter: CellGetter,
  setter: CellSetter,
) => T;
export type SetValueCellAction<T> = T | SetValueCellActionFn<T>;

function isSetValueCellActionFn<T>(
  value: SetValueCellAction<T>,
): value is SetValueCellActionFn<T> {
  return typeof value === 'function';
}

export abstract class BaseValueCell<T>
  extends BaseWritableCell<T, [SetValueCellAction<T>], void>
  implements ValueCell<T>
{
  protected readonly _path: Path;
  protected readonly _changed: PrimitiveCell<boolean>;
  protected readonly _nodeStateRef: StateRef<BDomNodeState>;
  protected readonly _schemaState: BDomSchemaState;

  protected constructor(
    path: Path,
    nodeStateRef: StateRef<BDomNodeState>,
    schemaState: BDomSchemaState,
    initialValue?: T,
    hasInitialValue = true,
  ) {
    super(initialValue, hasInitialValue);

    this._path = path;

    this._changed = cell(false);
    this._nodeStateRef = nodeStateRef;
    this._schemaState = schemaState;
  }

  get path(): Path {
    return this._path;
  }

  protected refresh() {
    this._schemaState.writeCell(this._changed, (v) => !v);
  }

  protected abstract writeState(
    getter: CellGetter,
    setter: CellSetter,
    value: T,
  ): void;

  override write(
    getter: CellGetter,
    setter: CellSetter,
    ...args: [SetValueCellAction<T>]
  ): void {
    const valueArg = args[0];
    const value: T = isSetValueCellActionFn(valueArg)
      ? valueArg(getter(this), getter, setter)
      : valueArg;

    return this.writeState(getter, setter, value);
  }
}

export type ValueCell<T> = BaseValueCell<T>;

export type AnyValueCell = ValueCell<unknown>;

export type AnyValueCellContainer = Cell<AnyValueCell>;

export type ValueToStateCell<T> = T extends AnyFunction
  ? FunctionValueCell<T>
  : T extends string
    ? StringValueCell
    : T extends bigint
      ? BigIntValueCell
      : T extends number
        ? NumberValueCell
        : T extends boolean
          ? BooleanValueCell
          : T extends Date
            ? DateValueCell
            : T extends Array<unknown>
              ? ArrayValueCell<T>
              : T extends Record<string, unknown>
                ? ObjectValueCell<T>
                : T extends ValueCell<infer V>
                  ? ValueToStateCell<V>
                  : SimpleValueCell<T>;

export type AnyToStateCell<T> =
  T extends BaseBDomValue<infer V>
    ? ValueToStateCell<V>
    : T extends BaseBDomAction
      ? FunctionValueCell<AnyFunction>
      : T extends Array<infer V>
        ? ArrayValueCell<AnyToStateCell<V>[]>
        : T extends Record<infer K, infer V>
          ? ObjectValueCell<Record<K, AnyToStateCell<V>>>
          : ValueToStateCell<T>;
