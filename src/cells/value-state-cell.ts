import { BaseStateCell } from './state-cell';
import type { AnyValueCell, ValueCell } from './states';
import { BDomNodeState, StateRef } from '../state';
import { Path } from '../common';

export class ValueStateCell<
  T,
  VC extends ValueCell<T> = ValueCell<T>,
> extends BaseStateCell<T, VC> {
  constructor(
    valueCell: VC,
    nodeStateRef: StateRef<BDomNodeState>,
    owner: Path,
  ) {
    super(valueCell, nodeStateRef, owner);
  }
}

export type AnyValueStateCell = ValueStateCell<unknown, AnyValueCell>;
