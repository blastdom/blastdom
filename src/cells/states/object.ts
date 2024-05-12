import { BaseValueCell, type ValueCell } from './_base';
import { BDomNodeState, BDomSchemaState, StateRef } from '../../state';
import { Path } from '../../common';
import { type StateCell } from '../state-cell';
import {
  cell,
  type Cell,
  type CellGetter,
  type CellSetter,
} from '@framjet/cell';
import { Objects } from '@framjet/common';

type MapObjectToStateCell<T> = {
  [K in keyof T]: StateCell<T[K]>;
} & unknown;

type MapObjectToValueCell<T> = {
  [K in keyof T]: ValueCell<T[K]>;
} & unknown;

export class ObjectValueCell<T extends object> extends BaseValueCell<T> {
  protected _items: MapObjectToStateCell<T>;
  protected readonly _rootRaw: Cell<MapObjectToValueCell<T>>;
  protected readonly _root: Cell<T>;

  constructor(
    items: MapObjectToStateCell<T>,
    path: Path,
    nodeStateRef: StateRef<BDomNodeState>,
    schemaState: BDomSchemaState,
  ) {
    super(path, nodeStateRef, schemaState);

    this._items = items;

    this._rootRaw = cell((get) => {
      get(this._changed);

      const result = Objects.fromEntries(
        Objects.entries(this._items).map(([k, v]) => {
          const value = get(v);
          return [k, value];
        }),
      ) as never;

      return result;
    });

    this._root = cell((get) => {
      get(this._changed);

      return Objects.fromEntries(
        Objects.entries(this._items).map(([k, v]) => [k, get(get(v))]),
      ) as T;
    });
  }

  override read(getter: CellGetter): T {
    return getter(this._root);
  }

  protected override writeState(
    getter: CellGetter,
    setter: CellSetter,
    value: T,
  ) {
    this._items = this.wrapItems(value);

    this.refresh();
  }

  get<K extends keyof T>(field: K): Cell<T[K] | undefined> {
    return cell((get) => {
      return get(this)[field];
    });
  }

  set<K extends keyof T>(field: K, value: T[K]): StateCell<T[K]> | undefined {
    const oldValue: StateCell<T[K]> | undefined = this._items[field];

    this._items[field] = this._schemaState.processValue(
      value,
      this._nodeStateRef,
      this.path.field(field),
    ) as StateCell<T[K]>;

    this.refresh();

    return oldValue;
  }

  remove<K extends keyof T>(field: K): StateCell<T[K]> | undefined {
    const oldValue: StateCell<T[K]> | undefined = this._items[field];

    delete this._items[field];

    this.refresh();

    return oldValue;
  }

  values(): Cell<T[keyof T][]> {
    return cell((get) => Objects.values(get(this)));
  }

  keys(): Cell<(keyof T)[]> {
    return cell((get) => Objects.keys(get(this)));
  }

  protected wrapItems<V extends object>(items: V): MapObjectToStateCell<V> {
    return Objects.fromEntries(
      Objects.entries(items).map(([k, v]) => [
        k,
        this._schemaState.processValue(
          v,
          this._nodeStateRef,
          this.path.field(k),
        ),
      ]),
    ) as MapObjectToStateCell<V>;
  }
}
