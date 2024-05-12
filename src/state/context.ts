import { BDomNodeState } from './node';
import { StateRef } from './ref';
import { Path } from '../common';
import type {
  AnyCell,
  CellGetter,
  CellSetter,
  WritableCell,
} from '@framjet/cell';

export class StateContext {
  protected readonly _nodeStateRef: StateRef<BDomNodeState>;
  protected readonly _path: Path;
  protected readonly _cellGetter: CellGetter;
  protected readonly _cellSetter: CellSetter;
  protected _finished = false;

  constructor(
    nodeStateRef: StateRef<BDomNodeState>,
    path: Path,
    cellGetter: CellGetter,
    cellSetter: CellSetter,
  ) {
    this._nodeStateRef = nodeStateRef;
    this._path = path;
    this._cellGetter = cellGetter;
    this._cellSetter = cellSetter;
  }

  close() {
    this._finished = true;
  }

  readCell(cell: AnyCell) {
    if (this._finished === true) {
      throw new Error(`${this} is closed`);
    }

    return this._cellGetter(cell);
  }

  writeCell<TArgs extends unknown[], TResult>(
    cell: WritableCell<unknown, TArgs, TResult>,
    ...args: TArgs
  ): TResult {
    if (this._finished === true) {
      throw new Error(`${this} is closed`);
    }

    return this._cellSetter(cell, ...args);
  }
}
