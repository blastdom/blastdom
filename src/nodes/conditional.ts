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

export interface ConditionalBDomNode extends BaseBDomNode {
  $$n: 'conditional';
  attrs: {
    condition: BDomValue<boolean>;
  };
  props?: never;
  children: BDomNode[];
}

export class ConditionalBDomNodeDefinition extends BaseBDomNodeDefinition<ConditionalBDomNode> {
  readonly name = 'ConditionalBDomNode';
  readonly type = 'conditional';

  get attributes(): NodeFields<ConditionalBDomNode, 'attrs'> {
    return {
      condition: {
        typeName: 'boolean',
        optional: false,
        defaultValue: undefined,
        isArray: false,
        isObject: false,
        isRaw: false,
        isReadOnly: false,
      },
    };
  }

  get properties(): NodeFields<ConditionalBDomNode, 'props'> {
    return {};
  }

  override renderComponent({
    node,
    parentNode,
  }: RenderBDomNodeProps<ConditionalBDomNode>): React.ReactNode {
    const { condition } = useBDomNodeAttributes(node, parentNode);

    if (condition === true) {
      return React.createElement(React.Fragment, {}, this.renderChildren(node));
    }
  }
}
