import { CellStore } from '@framjet/cell';
import { BaseObject } from '../common/base-object';

export class StateStore extends BaseObject {
  protected cellStateStore = new WeakMap<object, CellStore>();

  get(obj: object): CellStore {
    const cellStateStore = this.cellStateStore.get(obj);

    if (cellStateStore === undefined) {
      throw new Error(`CellStateStore not found: ${obj}`);
    }

    return cellStateStore;
  }

  create(obj: object, name?: string): CellStore {
    let store = this.cellStateStore.get(obj);
    if (store !== undefined) {
      this.getLogger()
        .atWarn()
        .log(`${store} for object "${obj}" already exists`);

      return store;
    }

    store = new CellStore(name);

    (globalThis as any).store = store;

    this.cellStateStore.set(obj, store);

    return store;
  }

  has(obj: object): boolean {
    return this.cellStateStore.has(obj);
  }

  delete(obj: object): CellStore {
    const store = this.cellStateStore.get(obj);
    if (store === undefined) {
      throw new Error(`CellStateStore not found for: ${obj}`);
    }

    this.cellStateStore.delete(obj);

    return store;
  }

  clear() {
    this.cellStateStore = new WeakMap();
  }
}
