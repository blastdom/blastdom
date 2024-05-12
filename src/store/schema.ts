import type { BDomSchema } from '../types';
import { BDomSchemaState } from '../state/schema';
import { StateStore } from './state';
import { BaseObject } from '../common/base-object';

export class BDomSchemaStore extends BaseObject {
  protected readonly cellStateStore: StateStore;
  protected readonly schemaStateStore = new WeakMap<
    BDomSchema,
    BDomSchemaState
  >();
  protected schemaNr = 0;

  constructor(cellStateStore: StateStore) {
    super();

    this.cellStateStore = cellStateStore;
  }

  create(schema: BDomSchema): BDomSchemaState {
    const tagName = 'dd';
    let state = this.schemaStateStore.get(schema);
    if (state !== undefined) {
      this.getLogger().atWarn().log(`${state} for ${tagName} already exists`);
      return state;
    }

    state = new BDomSchemaState(
      this.cellStateStore.create(schema, tagName),
      schema,
      this.schemaNr++,
    );

    this.schemaStateStore.set(schema, state);

    return state;
  }

  has(schema: BDomSchema): boolean {
    return this.schemaStateStore.has(schema);
  }

  get(schema: BDomSchema): BDomSchemaState {
    const state = this.schemaStateStore.get(schema);

    if (state === undefined) {
      throw new Error(`BDomSchemaState not found`);
    }

    return state;
  }

  delete(schema: BDomSchema): BDomSchemaState {
    const state = this.schemaStateStore.get(schema);

    if (state === undefined) {
      throw new Error(`BDomSchemaState not found`);
    }

    this.schemaStateStore.delete(schema);
    this.cellStateStore.delete(schema);

    return state;
  }
}
