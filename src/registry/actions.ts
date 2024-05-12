import type { AnyBDomAction, BaseBDomAction } from '../types';
import { Objects } from '@framjet/common';
import type { BaseBDomActionDefinition } from '../actions/_base';

export class BDomActionRegistry {
  static readonly #actionDefinitions = new Map<
    string,
    BaseBDomActionDefinition<AnyBDomAction>
  >();

  static register(
    actionDefinition: BaseBDomActionDefinition<AnyBDomAction>,
  ): typeof BDomActionRegistry {
    if (BDomActionRegistry.#actionDefinitions.has(actionDefinition.type)) {
      throw new Error(
        `BDomAction definition "${actionDefinition.type}" already registered by: ` +
          `"${BDomActionRegistry.#actionDefinitions.get(actionDefinition.type)}"`,
      );
    }

    BDomActionRegistry.#actionDefinitions.set(
      actionDefinition.type,
      actionDefinition,
    );

    return this;
  }

  static registerAll(
    ...valueDefinitions: BaseBDomActionDefinition<BaseBDomAction>[]
  ): typeof BDomActionRegistry {
    valueDefinitions.forEach(this.register.bind(this));

    return this;
  }

  static getDefinition(type: string): BaseBDomActionDefinition<AnyBDomAction>;
  static getDefinition<T extends AnyBDomAction>(
    node: T,
  ): BaseBDomActionDefinition<T>;
  static getDefinition(
    type: string | AnyBDomAction,
  ): BaseBDomActionDefinition<AnyBDomAction> {
    if (Objects.isType(type, 'string')) {
      const definition = BDomActionRegistry.#actionDefinitions.get(type);

      if (definition === undefined) {
        throw new Error(`BDomAction definition "${type}" does not exist`);
      }

      return definition;
    }

    return this.getDefinition(type.$$a);
  }
}
