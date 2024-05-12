import * as React from 'react';
import { BaseBDomNodeDefinition } from './_base';
import type {
  BaseBDomNode,
  BDomNode,
  BDomValue,
  NodeFields,
  RenderBDomNodeProps,
} from '../types';
import { useBDomNodeAttributes } from '../react';

export interface SuspenseBDomNode extends BaseBDomNode {
  $$n: 'suspense';
  attrs: {
    readonly fallback?: BDomValue<BDomNode>;
  };
  props?: never;
  children: BDomNode[];
}

export class SuspenseBDomNodeDefinition extends BaseBDomNodeDefinition<SuspenseBDomNode> {
  readonly name = 'SuspenseBDomNode';
  readonly type = 'suspense';

  get attributes(): NodeFields<SuspenseBDomNode, 'attrs'> {
    return {
      fallback: {
        typeName: 'BDomNode',
        optional: true,
        defaultValue: undefined,
        isArray: false,
        isObject: false,
        isRaw: false,
        isReadOnly: true,
      },
    };
  }

  get properties(): NodeFields<SuspenseBDomNode, 'props'> {
    return {};
  }

  override renderComponent({
    node,
    parentNode,
  }: RenderBDomNodeProps<SuspenseBDomNode>): React.ReactNode {
    const { fallback } = useBDomNodeAttributes(node, parentNode);

    return React.createElement(
      React.Suspense,
      {
        fallback:
          fallback !== undefined ? this.renderNode(fallback, node) : undefined,
      },
      this.renderChildren(node),
    );
  }
}
