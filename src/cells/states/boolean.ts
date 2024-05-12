import { SimpleValueCell } from './simple';

export class BooleanValueCell extends SimpleValueCell<boolean> {
  toggle() {
    this._schemaState.writeCell(this, (v) => !v);
  }
}
