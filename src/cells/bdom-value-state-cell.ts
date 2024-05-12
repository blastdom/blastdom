import type { BaseBDomValue } from '../types';
import { BaseStateCell } from './state-cell';
import { type CellGetter, type CellSetter, PrimitiveCell } from '@framjet/cell';
import { type ValueCell } from './states';
import { BDomNodeState, StateRef } from '../state';
import { FieldsProcessor, ItemResolveContext, Path } from '../common';
import { BDomValueRegistry } from '../registry';

export class BDomValueStateCell<
  T,
  D extends BaseBDomValue<T>,
> extends BaseStateCell<T> {
  protected readonly _definition: D;

  protected readonly _valueCell: PrimitiveCell<ValueCell<T> | undefined>;

  constructor(
    definition: D,
    nodeStateRef: StateRef<BDomNodeState>,
    owner: Path,
  ) {
    super(undefined, nodeStateRef, owner);

    this._definition = definition;

    this._valueCell = new PrimitiveCell();
  }

  override read(getter: CellGetter, setter: CellSetter): ValueCell<T> {
    let valueCell = getter(this._valueCell);

    if (valueCell !== undefined) {
      return valueCell;
    }

    valueCell = this.processBDomValueDefinition(getter, setter);

    setter(this._valueCell, valueCell);

    return valueCell;
  }

  protected processBDomValueDefinition(
    getter: CellGetter,
    setter: CellSetter,
  ): ValueCell<T> {
    const typeDefinition = BDomValueRegistry.getDefinition(this._definition);

    const fieldStateCells = FieldsProcessor.processFields(
      this._definition as Record<PropertyKey, unknown>,
      typeDefinition.fields as any,
      this._owner,
      this._nodeStateRef,
    );

    const context = new ItemResolveContext(
      getter,
      setter,
      this._definition,
      this._owner,
      this._nodeStateRef,
      typeDefinition.fields as any,
      fieldStateCells as any,
    );

    return typeDefinition.resolveItem(context) as ValueCell<T>;
  }
}
