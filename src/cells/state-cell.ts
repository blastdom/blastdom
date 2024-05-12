import { BaseCell } from '@framjet/cell';
import type { ValueCell } from './states';
import { BDomNodeState, StateRef } from '../state';
import { Path } from '../common';

export abstract class BaseStateCell<
  T,
  VC extends ValueCell<T> = ValueCell<T>,
> extends BaseCell<VC> {
  protected readonly _nodeStateRef: StateRef<BDomNodeState>;
  protected readonly _owner: Path;

  protected constructor(
    valueCell: VC | undefined,
    nodeStateRef: StateRef<BDomNodeState>,
    owner: Path,
  ) {
    super(valueCell);

    this._nodeStateRef = nodeStateRef;
    this._owner = owner;

    this.name = owner.nodePath();
  }
}

export class UninitialisedStateCell<T> extends BaseStateCell<T> {
  constructor(nodeStateRef: StateRef<BDomNodeState>, owner: Path) {
    super(undefined, nodeStateRef, owner);
  }
}

export type StateCell<T> = BaseStateCell<T>;
export type AnyStateCell = StateCell<unknown>;
