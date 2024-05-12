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
import { useBDomNodeAttributes, useBDomNodeProperties } from '../react';

type ElementTypes = keyof React.JSX.IntrinsicElements;
type ElementProps<TName extends ElementTypes> =
  React.JSX.IntrinsicElements[TName];

type ElementPropsMapped<TName extends string> = TName extends ElementTypes
  ? {
      [K in keyof ElementProps<TName>]: BDomValue<
        NonNullable<ElementProps<TName>[K]>
      >;
    }
  : Record<string, AnyBDomValue>;

export interface ElementBDomNode<TName extends ElementTypes>
  extends BaseBDomNode {
  readonly $$n: 'element';
  readonly attrs: {
    name: TName | string | BDomValue<TName>;
  };
  readonly props?: ElementPropsMapped<TName>;
  readonly children?: BDomNode[];
}

export type AnyElementBDomNode = ElementBDomNode<ElementTypes>;

export class ElementBDomNodeDefinition extends BaseBDomNodeDefinition<AnyElementBDomNode> {
  readonly name = 'ElementBDomNode';
  readonly type = 'element';

  get attributes(): NodeFields<AnyElementBDomNode, 'attrs'> {
    return {
      name: {
        typeName: 'unknown',
        optional: false,
        defaultValue: undefined,
        isRaw: 'dual',
        isArray: false,
        isObject: false,
        isReadOnly: false,
      },
    };
  }

  get properties(): NodeFields<AnyElementBDomNode, 'props'> {
    return {} as never;
  }

  override renderComponent({
    node,
    parentNode,
  }: RenderBDomNodeProps<AnyElementBDomNode>) {
    const props = useBDomNodeProperties(node, parentNode);
    const attrs = useBDomNodeAttributes(node, parentNode);

    let children: React.ReactNode =
      (node.children?.length ?? 0) > 0 ? this.renderChildren(node) : undefined;

    if (children === undefined && 'children' in props) {
      children = props['children'] as React.ReactNode;
    }

    return React.createElement(attrs.name, props, children);
  }
}
