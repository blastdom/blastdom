import * as React from 'react';
import { BaseBDomNodeDefinition } from './_base';
import {
  type AnyBDomValue,
  type BaseBDomNode,
  type BDomNode,
  type BDomValue,
  type NodeFields,
  type RenderBDomNodeProps,
} from '../types';
import { BDomComponentRegistry } from '../registry';
import { useBDomNodeAttributes, useBDomNodeProperties } from '../react/hooks';

export interface ComponentBDomNode extends BaseBDomNode {
  readonly $$n: 'component';
  readonly attrs: {
    name: string | BDomValue<string>;
  };
  readonly props?: Record<string, AnyBDomValue>;
  readonly children?: BDomNode[];
}

export class ComponentBDomNodeDefinition extends BaseBDomNodeDefinition<ComponentBDomNode> {
  readonly name = 'ComponentBDomNode';
  readonly type = 'component';

  get attributes(): NodeFields<ComponentBDomNode, 'attrs'> {
    return {
      name: {
        typeName: 'string',
        optional: false,
        defaultValue: undefined,
        isRaw: 'dual',
        isArray: false,
        isObject: false,
        isReadOnly: false,
      },
    };
  }

  get properties(): NodeFields<ComponentBDomNode, 'props'> {
    return {} as never;
  }

  override renderComponent({
    node,
    parentNode,
    ...rest
  }: RenderBDomNodeProps<ComponentBDomNode>) {
    const { name } = useBDomNodeAttributes(node, parentNode);
    const props = useBDomNodeProperties(node, parentNode) as Record<
      string,
      unknown
    >;

    let children =
      (node.children?.length ?? 0) > 0 ? this.renderChildren(node) : undefined;

    if (children === undefined && 'children' in props) {
      children = props['children'] as any;
    }

    const component = BDomComponentRegistry.getComponent(
      name,
    ) as unknown as React.ComponentType;

    return React.createElement(component, { ...props, ...rest }, children);
  }
}
