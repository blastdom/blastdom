import { BaseValueCell } from './_base';
import { BDomNodeState, BDomSchemaState, StateRef } from '../../state';
import { Path } from '../../common';
import { type CellGetter, type CellSetter } from '@framjet/cell';

export class SimpleValueCell<T> extends BaseValueCell<T> {
  constructor(
    value: T,
    path: Path,
    nodeStateRef: StateRef<BDomNodeState>,
    schemaState: BDomSchemaState,
  ) {
    super(path, nodeStateRef, schemaState, value);
  }

  override read(getter: CellGetter): T {
    return getter(this);
  }

  protected writeState(_: CellGetter, setter: CellSetter, value: T): void {
    setter(this, value);
  }
}
