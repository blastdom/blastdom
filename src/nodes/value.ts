import * as React from 'react';
import { BaseBDomNodeDefinition } from './_base';
import type {
  AnyBDomValue,
  BaseBDomNode,
  BDomNode,
  BDomValue,
  NodeFields,
  RenderBDomNodeProps,
} from '../types';
import { useBDomNodeAttributes } from '../react';

export interface ValueBDomNode extends BaseBDomNode {
  readonly $$n: 'value';
  readonly attrs: {
    readonly name?: string | BDomValue<string>;
    value: AnyBDomValue;
  };
  readonly props?: never;
  readonly children?: BDomNode[];
}

export class ValueBDomNodeDefinition extends BaseBDomNodeDefinition<ValueBDomNode> {
  readonly name = 'ValueBDomNode';
  readonly type = 'value';

  get attributes(): NodeFields<ValueBDomNode, 'attrs'> {
    return {
      name: {
        typeName: 'string',
        optional: true,
        defaultValue: undefined,
        isRaw: 'dual',
        isArray: false,
        isObject: false,
        isReadOnly: true,
      },
      value: {
        typeName: 'any',
        optional: false,
        defaultValue: undefined,
        isArray: false,
        isObject: false,
        isRaw: false,
        isReadOnly: false,
      },
    };
  }

  get properties(): NodeFields<ValueBDomNode, 'props'> {
    return {};
  }

  override renderComponent({
    node,
    parentNode,
  }: RenderBDomNodeProps<ValueBDomNode>) {
    const attrs = useBDomNodeAttributes(node, parentNode);

    return React.createElement(React.Fragment, {}, this.renderChildren(node));
  }
}
