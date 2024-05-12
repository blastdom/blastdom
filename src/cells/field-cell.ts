import {
  BaseCell,
  type CellGetter,
  type CellSetter,
  PrimitiveCell,
} from '@framjet/cell';
import { StateStoreCell } from './state-store-cell';
import { BDomNodeState, StateRef } from '../state';
import {
  BaseStateCell,
  type StateCell,
  UninitialisedStateCell,
} from './state-cell';
import { Path } from '../common';
import type { RefSetter } from '../types';

export class FieldCell<T>
  extends BaseCell<StateCell<T>>
  implements RefSetter<T>
{
  protected readonly stateCell: PrimitiveCell<StateCell<T>>;
  protected readonly initialized: PrimitiveCell<boolean>;
  protected readonly _readOnly: boolean;
  protected readonly _owner: Path;

  constructor(
    owner: Path,
    nodeStateRef: StateRef<BDomNodeState>,
    readOnly = false,
  ) {
    super();

    this._readOnly = readOnly;
    this._owner = owner;
    this.name = owner.nodePath();
    this.initialized = new PrimitiveCell(false).rename(
      `${this.name}.initialized`,
    );
    this.stateCell = new StateStoreCell(
      new UninitialisedStateCell<T>(nodeStateRef, owner),
    ).rename(`${this.name}.storage`);
  }

  override read(getter: CellGetter): StateCell<T> {
    getter(this.initialized);

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return getter(this.stateCell)!;
  }

  get owner(): Path {
    return this._owner;
  }

  setState(stateCell: StateCell<T>, cellSetter: CellSetter): void {
    if (stateCell instanceof BaseStateCell === false) {
      throw new Error(`${this}: Assigning incorrect state cell to field`);
    }

    cellSetter(this.stateCell, stateCell);
    cellSetter(this.initialized, (v) => !v);
  }
}

export type AnyFieldCell = FieldCell<unknown>;
