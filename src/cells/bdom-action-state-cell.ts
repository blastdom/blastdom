import type { AnyBDomAction, BaseBDomAction } from '../types';
import { BaseStateCell } from './state-cell';
import { type CellGetter, type CellSetter, PrimitiveCell } from '@framjet/cell';
import { type AnyFunction } from '@framjet/common';
import { FunctionValueCell } from './states';
import { BDomNodeState, StateRef } from '../state';
import { FieldsProcessor, ItemResolveContext, Path } from '../common';
import { BDomActionRegistry } from '../registry';

export class BDomActionStateCell<
  T extends AnyFunction,
  D extends BaseBDomAction,
> extends BaseStateCell<T> {
  protected readonly _definition: D;

  protected readonly _valueCell: PrimitiveCell<
    FunctionValueCell<T> | undefined
  >;

  constructor(
    definition: D,
    nodeStateRef: StateRef<BDomNodeState>,
    owner: Path,
  ) {
    super(undefined, nodeStateRef, owner);

    this._definition = definition;

    this._valueCell = new PrimitiveCell();
  }

  override read(getter: CellGetter, setter: CellSetter): FunctionValueCell<T> {
    let valueCell = getter(this._valueCell);

    if (valueCell !== undefined) {
      return valueCell;
    }

    valueCell = this.processBDomActionDefinition(getter, setter);

    setter(this._valueCell, valueCell);

    return valueCell;
  }

  protected processBDomActionDefinition(
    getter: CellGetter,
    setter: CellSetter,
  ): FunctionValueCell<T> {
    const typeDefinition = BDomActionRegistry.getDefinition(
      this._definition as AnyBDomAction,
    );

    const fieldStateCells = FieldsProcessor.processFields(
      this._definition as Record<PropertyKey, unknown>,
      typeDefinition.fields as any,
      this._owner,
      this._nodeStateRef,
    );

    const context = new ItemResolveContext(
      getter,
      setter,
      this._definition as any,
      this._owner,
      this._nodeStateRef,
      typeDefinition.fields as any,
      fieldStateCells as any,
    );

    return typeDefinition.resolveItem(context) as FunctionValueCell<T>;
  }
}
