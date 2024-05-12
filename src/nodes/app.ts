import * as React from 'react';
import { BaseBDomNodeDefinition } from './_base';
import type {
  BaseBDomNode,
  BDomNode,
  BDomValue,
  NodeFields,
  RenderBDomNodeProps,
} from '../types';
import { useBDomNodeAttributes } from '../react/hooks/use-bdom-node-attributes';
import { AnyFunction } from '@framjet/types';

export interface AppBDomNode extends BaseBDomNode {
  readonly $$n: 'app';
  readonly attrs: {
    readonly id?: string;
    readonly onLoad?: BDomValue<AnyFunction>;
  };
  readonly props?: never;
  readonly children: BDomNode[];
}

export class AppBDomNodeDefinition extends BaseBDomNodeDefinition<AppBDomNode> {
  readonly name = 'AppBDomNode';
  readonly type = 'app';

  get attributes(): NodeFields<AppBDomNode, 'attrs'> {
    return {
      id: {
        typeName: 'string',
        optional: true,
        defaultValue: undefined,
        isRaw: true,
        isArray: false,
        isObject: false,
        isReadOnly: true,
      },
      onLoad: {
        typeName: 'Function',
        optional: true,
        defaultValue: undefined,
        isRaw: false,
        isArray: false,
        isObject: false,
        isReadOnly: true,
      },
    };
  }

  get properties(): NodeFields<AppBDomNode, 'props'> {
    return {};
  }

  override renderComponent({
    node,
    parentNode,
  }: RenderBDomNodeProps<AppBDomNode>): React.ReactNode {
    useBDomNodeAttributes(node, parentNode);

    return React.createElement(React.Fragment, {}, this.renderChildren(node));
  }
}
