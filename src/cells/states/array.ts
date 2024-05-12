import { BaseValueCell, type ValueCell } from './_base';
import { BDomNodeState, BDomSchemaState, StateRef } from '../../state';
import { Path } from '../../common';
import { type AnyStateCell, type StateCell } from '../state-cell';
import { type AnyValueStateCell } from '../value-state-cell';
import {
  cell,
  type Cell,
  type CellGetter,
  type CellSetter,
} from '@framjet/cell';

type MapArrayToStateCell<T> = {
  [K in keyof T]: StateCell<T[K]>;
};

type MapArrayToValueCell<T> = {
  [K in keyof T]: ValueCell<T[K]>;
};

export class ArrayValueCell<T extends unknown[]> extends BaseValueCell<T> {
  protected _items: MapArrayToStateCell<T>;
  protected readonly _rootRaw: Cell<MapArrayToValueCell<T>>;
  protected readonly _root: Cell<T>;

  constructor(
    items: MapArrayToStateCell<T>,
    path: Path,
    nodeStateRef: StateRef<BDomNodeState>,
    schemaState: BDomSchemaState,
  ) {
    super(path, nodeStateRef, schemaState);

    this._items = items;

    this._rootRaw = cell((get) => {
      get(this._changed);

      const result = this._items.map(get);

      return result as MapArrayToValueCell<T>;
    });

    this._root = cell((get) => {
      get(this._changed);

      const result = this._items.map(get).map(get);

      return result as T;
    });
  }

  override read(getter: CellGetter): T {
    return getter(this._root);
  }

  get all(): Cell<MapArrayToValueCell<T>> {
    return this._rootRaw;
  }

  add(...items: T[keyof T][]) {
    this._items.push(
      ...(this.wrapItems(items, this._items.length) as AnyStateCell[]),
    );

    this.refresh();
  }

  addAt(index: number, ...items: T[keyof T][]) {
    this._items = [
      ...this._items.slice(0, index),
      ...(this.wrapItems(items, this._items.length) as AnyStateCell[]),
      ...this._items.slice(index),
    ] as MapArrayToStateCell<T>;

    this.refresh();
  }

  getAt<K extends keyof T>(index: K): Cell<T[K] | undefined> {
    return cell((get) => {
      return get(this)[index] as T[K] | undefined;
    });
  }

  isEmpty(): Cell<boolean> {
    return cell((get) => get(this).length == 0);
  }

  isNotEmpty(): Cell<boolean> {
    return cell((get) => get(this).length > 0);
  }

  size(): Cell<number> {
    return cell((get) => get(this).length);
  }

  removeAt(index: number): AnyValueStateCell | undefined {
    let removedItem: AnyValueStateCell | undefined;

    this._items = this._items.filter((item, i) => {
      if (index !== i) {
        return true;
      }

      removedItem = item;

      return false;
    }) as MapArrayToStateCell<T>;

    this.refresh();

    return removedItem;
  }

  forEach(
    callbackFn: (
      value: StateCell<T[keyof T]>,
      index: number,
      array: MapArrayToStateCell<T>,
    ) => void,
  ): void {
    this._items.forEach((stateCell, index, stateCells) => {
      callbackFn(
        stateCell as StateCell<T[keyof T]>,
        index,
        stateCells as MapArrayToStateCell<T>,
      );
    });
  }

  protected override writeState(
    getter: CellGetter,
    setter: CellSetter,
    items: T,
  ): void {
    this._items = this.wrapItems(items);

    this.refresh();
  }

  protected wrapItems<V extends unknown[]>(
    items: V,
    indexPrefix = 0,
  ): MapArrayToStateCell<V> {
    return items.map((item: V[number], index) =>
      this._schemaState.processValue(
        item,
        this._nodeStateRef,
        this.path.index(indexPrefix + index),
      ),
    ) as MapArrayToStateCell<V>;
  }
}
