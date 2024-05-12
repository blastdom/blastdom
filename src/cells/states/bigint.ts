import { SimpleValueCell } from './simple';

export class BigIntValueCell extends SimpleValueCell<bigint> {
  increment(by = 1n) {
    this._schemaState.writeCell(this, (v) => v + by);
  }

  decrement(by = 1n) {
    this._schemaState.writeCell(this, (v) => v - by);
  }
}
