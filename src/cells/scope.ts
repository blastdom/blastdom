import {
  BaseCell,
  cell,
  type CellGetter,
  type CellSetter,
} from '@framjet/cell';
import type { StateCell } from './state-cell';
import type { RefSetter } from '../types';
import { BDomNodeState, StateRef } from '../state';
import { StateStoreCell } from './state-store-cell';

export class ScopeCell<T>
  extends BaseCell<StateCell<T>>
  implements RefSetter<T>
{
  protected readonly scopeName: string;
  protected readonly nodeStateRef: StateRef<BDomNodeState>;
  protected readonly storage = new StateStoreCell<T>(undefined);
  protected readonly present = cell(false);

  constructor(scopeName: string, nodeStateRef: StateRef<BDomNodeState>) {
    super();

    this.scopeName = scopeName;
    this.nodeStateRef = nodeStateRef;
  }

  override read(getter: CellGetter): StateCell<T> {
    getter(this.present);
    const stateCell = getter(this.storage);

    if (stateCell !== undefined) {
      return stateCell;
    }

    const parentNodeState = this.nodeStateRef.get().getParentNodeState();
    if (parentNodeState !== undefined) {
      return getter(
        parentNodeState.getScopedValue(this.scopeName),
      ) as StateCell<T>;
    }

    return undefined as never;
  }

  setState<T>(stateCell: StateCell<T>, setter: CellSetter): void {
    setter(this.storage, stateCell as never);
    setter(this.present, true);
  }
}

export type AnyScopeCell = ScopeCell<unknown>;
