import { SimpleValueCell } from './simple';

export class NumberValueCell extends SimpleValueCell<number> {
  increment(by = 1) {
    this._schemaState.writeCell(this, (v) => v + by);
  }

  decrement(by = 1) {
    this._schemaState.writeCell(this, (v) => v - by);
  }
}
