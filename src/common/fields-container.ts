import {
  type AnyCell,
  type Cell,
  cell,
  type CellSetter,
  PrimitiveCell,
} from '@framjet/cell';
import { Objects } from '@framjet/common';
import { BDomNodeState, StateRef } from '../state';
import type { FieldSettings } from '../types';
import { Path } from './path';
import { type AnyFieldCell, FieldCell } from '../cells/field-cell';

export class FieldsContainer {
  protected readonly fieldsStorage: Record<string, AnyFieldCell>;
  protected readonly fieldsGetterStorage: Record<string, AnyCell>;
  protected readonly allFieldsCell: Cell<Record<string, unknown>>;
  protected readonly refreshCell: PrimitiveCell<number>;
  protected readonly setter: CellSetter;
  protected readonly createIfNoExist: boolean;
  protected readonly owner: Path;
  protected readonly nodeStateRef: StateRef<BDomNodeState>;

  constructor(
    nodeStateRef: StateRef<BDomNodeState>,
    fields: Record<string, unknown>,
    fieldSettings: Record<string, FieldSettings>,
    setter: CellSetter,
    owner: Path,
    createIfNoExist = false,
  ) {
    this.setter = setter;
    this.owner = owner;
    this.createIfNoExist = createIfNoExist;
    this.nodeStateRef = nodeStateRef;

    const fieldNames = new Set([
      ...Objects.keys(fields),
      ...Objects.keys(fieldSettings),
    ]);

    this.refreshCell = cell(0).rename(`${owner.nodePath()}.refresh`);

    this.fieldsStorage = Objects.fromEntries(
      Array.from(fieldNames).map((k) => [
        k,
        new FieldCell(owner.field(k), this.nodeStateRef),
      ]),
    );

    this.fieldsGetterStorage = Objects.fromEntries(
      Objects.entries(this.fieldsStorage).map(([k, v]) => [
        k,
        cell((get) => get(v)).rename(`${owner.field(k)}.get`),
      ]),
    );

    this.allFieldsCell = cell((get) => {
      get(this.refreshCell);

      return Objects.fromEntries(
        Objects.entries(this.fieldsStorage).map(([k, v]) => {
          const stateCell = get(v);
          const valueCell = get(stateCell);
          const value = valueCell != null ? get(valueCell) : undefined;

          return [k, value];
        }),
      );
    }).rename(`${owner.nodePath()}.all`);
  }

  getFields() {
    return this.fieldsStorage;
  }

  getAll() {
    return this.allFieldsCell;
  }

  get(field: string) {
    this.getField(field);

    return this.fieldsGetterStorage[field];
  }

  getField(field: string): AnyFieldCell {
    const fieldCell = this.fieldsStorage[field];
    if (fieldCell === undefined) {
      if (this.createIfNoExist === true) {
        const newFieldCell = new FieldCell(
          this.owner.field(field),
          this.nodeStateRef,
        );
        this.fieldsStorage[field] = newFieldCell;
        this.fieldsGetterStorage[field] = cell((get) => get(newFieldCell));

        this.setter(this.refreshCell, (c) => c++);

        return newFieldCell;
      } else {
        throw new Error(`${this} field "${String(field)}" not found.`);
      }
    }

    return fieldCell;
  }
}
