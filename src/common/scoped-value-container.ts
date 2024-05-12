import { type Cell, cell, type CellSetter } from '@framjet/cell';
import { Objects } from '@framjet/common';
import { BDomNodeState, BDomSchemaState, StateRef } from '../state';
import type { Path } from './path';
import { type AnyScopeCell, ScopeCell } from '../cells/scope';
import { type AnyStateCell } from '../cells/state-cell';

export class ScopedValueContainer {
  protected readonly scopedValueGetters = new Map<string, AnyScopeCell>();
  protected readonly scopedValues = new Map<string, AnyScopeCell>();
  protected readonly allValuesCell: Cell<
    Record<string, AnyStateCell | undefined>
  >;
  protected readonly refreshCell = cell(0);

  protected readonly nodeStateRef: StateRef<BDomNodeState>;
  protected readonly parentContainer?: ScopedValueContainer;
  protected readonly setter: CellSetter;
  protected readonly owner: Path;

  constructor(
    nodeStateRef: StateRef<BDomNodeState>,
    parentContainer: ScopedValueContainer | undefined,
    setter: CellSetter,
    owner: Path,
  ) {
    this.nodeStateRef = nodeStateRef;
    this.setter = setter;
    this.owner = owner;

    this.parentContainer = parentContainer;

    this.allValuesCell = cell((get) => {
      get(this.refreshCell);

      let parent = {};
      if (this.parentContainer !== undefined) {
        parent = get(this.parentContainer.all());
      }

      return {
        ...(parent ?? {}),
        ...Objects.fromEntries(
          Array.from(this.scopedValueGetters.entries()).map(([k, v]) => [
            k,
            get(v),
          ]),
        ),
      };
    });
  }

  protected get schemaState(): BDomSchemaState {
    return this.nodeStateRef.get().getSchemaState();
  }

  all(): Cell<Record<string, AnyStateCell | undefined>> {
    return this.allValuesCell;
  }

  has(name: string): boolean {
    if (this.scopedValueGetters.has(name)) {
      return true;
    }

    return !!this.parentContainer?.has(name);
  }

  get(name: string): AnyScopeCell {
    let scopeCell = this.scopedValueGetters.get(name);

    if (scopeCell === undefined) {
      scopeCell = new ScopeCell(name, this.nodeStateRef);
      this.scopedValueGetters.set(name, scopeCell);
      this.setter(this.refreshCell, (c) => c++);
    }

    return scopeCell;
  }

  create(
    name: string,
    value?: unknown,
    renamer?: (prev: string) => string,
  ): AnyScopeCell {
    let scopedValueCell = this.scopedValues.get(name);
    if (scopedValueCell !== undefined) {
      return scopedValueCell;
    }

    const stateCell = this.nodeStateRef
      .get()
      .processValue(value, this.owner.field(name));

    if (renamer !== undefined) {
      let currentName = name;
      let parentName = renamer(currentName);
      while (this.has(parentName)) {
        currentName = parentName;
        parentName = renamer(parentName);
      }

      this.scopedValueGetters.set(parentName, this.get(currentName));
      this.scopedValueGetters.delete(name);
      this.setter(this.refreshCell, (c) => c++);
    }

    scopedValueCell = this.get(name);

    scopedValueCell.setState(stateCell, this.setter);

    this.scopedValues.set(name, scopedValueCell);

    return scopedValueCell;
  }
}
