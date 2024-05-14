import { BDomSchemaStore, StateStore } from './store';

export class FramJetBlastDOM {
  static readonly #stateStore = new StateStore();
  static #schemaStore = new WeakMap<StateStore, BDomSchemaStore>();

  static getStateStore(): StateStore {
    return this.#stateStore;
  }

  static getSchemaStore(stateStore?: StateStore): BDomSchemaStore {
    stateStore ??= this.getStateStore();

    let schemaStore = this.#schemaStore.get(stateStore);

    if (schemaStore === undefined) {
      schemaStore = new BDomSchemaStore(stateStore);

      this.#schemaStore.set(stateStore, schemaStore);
    }

    return schemaStore;
  }

  static clear() {
    this.#schemaStore = new WeakMap();
    this.#stateStore.clear();
  }
}
