import type { StateCell } from 'blastdom';
import { type Cell, CellSetter } from '@framjet/cell';

export interface RefSetter<T> extends Cell<StateCell<T>> {
  setState(stateCell: StateCell<T>, cellSetter: CellSetter): void;
}
