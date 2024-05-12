import type { Cell } from '@framjet/cell';
import type { RefSetter, StateCell } from 'blastdom';

export function isRefSetter<T>(
  cell: Cell<StateCell<T> | undefined>,
): cell is RefSetter<T> {
  return 'setState' in cell;
}
