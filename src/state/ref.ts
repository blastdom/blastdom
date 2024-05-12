import { Debug } from '@framjet/common';

export class StateRef<T extends object> {
  readonly #ref: WeakRef<T>;
  readonly #name: string;

  constructor(input: T) {
    this.#ref = new WeakRef(input);
    this.#name = Debug.getTag(input) ?? 'State';
  }

  get(): T {
    const state = this.#ref.deref();

    if (state) {
      return state;
    }

    throw new Error(`${this} was already disposed`);
  }

  has(): boolean {
    return this.#ref.deref() !== undefined;
  }

  safeGet(): T | undefined {
    return this.#ref.deref();
  }

  get [Symbol.toStringTag]() {
    return this.toString();
  }

  toString() {
    return `StateRef<${this.#name}>`;
  }
}
