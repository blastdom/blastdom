import * as React from 'react';
import { BaseBDomNodeDefinition } from './_base';
import type {
  BaseBDomNode,
  BDomNode,
  NodeFields,
  RenderBDomNodeProps,
} from '../types';
import { useBDomNodeAttributes } from '../react';

export interface NodeBDomNode extends BaseBDomNode {
  readonly $$n: 'node';
  readonly attrs?: never;
  readonly props?: never;
  readonly children?: BDomNode[];
}

export class NodeBDomNodeDefinition extends BaseBDomNodeDefinition<NodeBDomNode> {
  readonly name = 'NodeBDomNode';
  readonly type = 'node';

  get attributes(): NodeFields<NodeBDomNode, 'attrs'> {
    return {};
  }

  get properties(): NodeFields<NodeBDomNode, 'props'> {
    return {};
  }

  override shouldProcessChildren(node: NodeBDomNode): boolean {
    return super.shouldProcessChildren(node);
  }

  override renderComponent({
    node,
    parentNode,
  }: RenderBDomNodeProps<NodeBDomNode>) {
    useBDomNodeAttributes(node, parentNode);

    return React.createElement(React.Fragment, {}, this.renderChildren(node));
  }
}
