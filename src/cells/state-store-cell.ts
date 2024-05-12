import {
  BaseWritableCell,
  type CellGetter,
  type CellSetter,
} from '@framjet/cell';
import type { StateCell } from './state-cell';
import type { ValueCell } from './states';

export class StateStoreCell<T> extends BaseWritableCell<
  StateCell<T> | undefined,
  [StateCell<T> | undefined],
  void
> {
  override write(
    getter: CellGetter,
    setter: CellSetter,
    newState: StateCell<T> | undefined,
  ): void {
    if (newState === undefined) {
      return setter(this, newState);
    }

    const currentStateCell = getter(this);
    if (currentStateCell === undefined) {
      return setter(this, newState);
    }

    const newValueCell: ValueCell<T> | undefined = getter(newState);
    if (newValueCell === undefined) {
      return setter(this, newState);
    }

    const currentValueCell: ValueCell<T> | undefined = getter(currentStateCell);
    if (currentValueCell === undefined) {
      return setter(this, newState);
    }

    const newValue: T | undefined = getter(newValueCell);
    if (newValue === undefined) {
      return setter(this, newState);
    }

    const currentValue: T | undefined = getter(currentValueCell);
    if (currentValue === undefined || currentValue !== newValue) {
      return setter(this, newState);
    }
  }
}
