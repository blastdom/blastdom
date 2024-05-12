import type { BaseBDomNodeDefinition } from '../nodes';
import type { BaseBDomNode, BDomNode } from '../types';
import * as React from 'react';
import { Objects } from '@framjet/common';

export class BDomNodeRegistry {
  static readonly #nodeDefinitions = new Map<
    string,
    BaseBDomNodeDefinition<BaseBDomNode>
  >();

  static register(
    nodeDefinition: BaseBDomNodeDefinition<BaseBDomNode>,
  ): typeof BDomNodeRegistry {
    if (BDomNodeRegistry.#nodeDefinitions.has(nodeDefinition.type)) {
      throw new Error(
        `Node definition ${nodeDefinition.type} already registered by "${BDomNodeRegistry.#nodeDefinitions.get(nodeDefinition.type)}"`,
      );
    }

    BDomNodeRegistry.#nodeDefinitions.set(nodeDefinition.type, nodeDefinition);

    return this;
  }

  static registerAll(
    ...nodeDefinitions: BaseBDomNodeDefinition<BaseBDomNode>[]
  ): typeof BDomNodeRegistry {
    nodeDefinitions.forEach(this.register);

    return this;
  }

  static getDefinition(type: string): BaseBDomNodeDefinition<any>;
  static getDefinition(node: BDomNode): BaseBDomNodeDefinition<any>;
  static getDefinition(type: string | BDomNode): BaseBDomNodeDefinition<any> {
    if (Objects.isType(type, 'string')) {
      const definition = BDomNodeRegistry.#nodeDefinitions.get(type);

      if (definition === undefined) {
        throw new Error(`BDomNode definition "${type}" does not exist`);
      }

      return definition;
    }

    return this.getDefinition(type.$$n);
  }

  static renderNode(
    node: BDomNode,
    parentNode?: BDomNode,
    key?: React.Key,
  ): React.ReactElement {
    const definition = this.getDefinition(node);

    return definition.render(node, parentNode, key);
  }

  static renderNodes(
    nodes: BDomNode[],
    parentNode: BDomNode,
  ): React.ReactElement[] {
    return (nodes ?? []).map((child) =>
      this.renderNode(child, parentNode, child.id),
    );
  }

  static getNodeType<T extends BDomNode>(node: T): T['$$n'] {
    if (!Objects.isType(node, 'BDomNode')) {
      throw new Error(`Not BDomNode value provided but: "${typeof node}"`);
    }

    return node['$$n'];
  }

  static getNodeName(node: BDomNode): string {
    return BDomNodeRegistry.getDefinition(node).name;
  }
}
