import type { AnyBDomValue, BaseBDomValue, BDomValueTypeMap } from '../types';
import { Objects } from '@framjet/common';
import { BaseBDomValueDefinition } from '../values/_base';

export class BDomValueRegistry {
  static readonly #valueDefinitions = new Map<
    string,
    BaseBDomValueDefinition<any>
  >();

  static register(
    valueDefinition: BaseBDomValueDefinition<any>,
  ): typeof BDomValueRegistry {
    if (BDomValueRegistry.#valueDefinitions.has(valueDefinition.type)) {
      throw new Error(
        `Node definition ${valueDefinition.type} already registered by "${this.#valueDefinitions.get(valueDefinition.type)}"`,
      );
    }

    BDomValueRegistry.#valueDefinitions.set(
      valueDefinition.type,
      valueDefinition,
    );

    return this;
  }

  static registerAll(
    ...valueDefinitions: BaseBDomValueDefinition<any>[]
  ): typeof BDomValueRegistry {
    valueDefinitions.forEach(this.register);

    return this;
  }

  static getDefinition<K extends keyof BDomValueTypeMap>(
    type: K,
  ): BaseBDomValueDefinition<BDomValueTypeMap[K]>;
  static getDefinition<T extends BaseBDomValue<unknown>>(
    node: T,
  ): BaseBDomValueDefinition<T>;
  static getDefinition(
    type: string | AnyBDomValue,
  ): BaseBDomValueDefinition<AnyBDomValue> {
    if (Objects.isType(type, 'string')) {
      const definition = BDomValueRegistry.#valueDefinitions.get(type);

      if (definition === undefined) {
        throw new Error(`BDomValue definition "${type}" does not exist`);
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return definition as any;
    }

    return this.getDefinition(type.$$v);
  }
}
