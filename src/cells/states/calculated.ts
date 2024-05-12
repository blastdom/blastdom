import {
  cell,
  type Cell,
  CellGetter,
  type CellSetter,
  PrimitiveCell,
} from '@framjet/cell';
import { BDomNodeState, BDomSchemaState, StateRef } from '../../state';
import { Path } from '../../common';
import type { AnyFunction } from '@framjet/common';
import { BaseValueCell } from './_base';

export type CalculatedValueCellProvider<T> = (
  getter: CellGetter,
  setter: CellSetter,
) => T;

export class CalculatedValueCell<T> extends BaseValueCell<T> {
  protected readonly _storage: Cell<T>;
  protected readonly _overridden: PrimitiveCell<T | undefined>;

  constructor(
    valueProvider: CalculatedValueCellProvider<T>,
    path: Path,
    nodeStateRef: StateRef<BDomNodeState>,
    schemaState: BDomSchemaState,
  ) {
    super(path, nodeStateRef, schemaState);

    this._storage = cell(valueProvider);
    this._overridden = new PrimitiveCell();
  }

  override read(getter: CellGetter): T {
    const self =
      this._overridden !== undefined ? getter(this._overridden) : undefined;

    if (self !== undefined) {
      return self;
    }

    return getter(this._storage);
  }

  protected override writeState(
    getter: CellGetter,
    setter: CellSetter,
    value: T,
  ) {
    setter(this._overridden, value);
  }
}

export class CalculatedFunctionValueCell<
  T extends AnyFunction,
> extends CalculatedValueCell<T> {}
