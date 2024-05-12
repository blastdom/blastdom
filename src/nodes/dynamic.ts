import { BaseBDomNodeDefinition } from './_base';
import type {
  BaseBDomNode,
  BDomNode,
  BDomValue,
  NodeFields,
  RenderBDomNodeProps,
} from '../types';
import { useBDomNodeAttributes } from '../react';

export interface DynamicBDomNode extends BaseBDomNode {
  readonly $$n: 'dynamic';
  readonly attrs: {
    node: BDomNode | BDomValue<BDomNode>;
  };
  readonly props?: never;
  readonly children?: never;
}

export class DynamicBDomNodeDefinition extends BaseBDomNodeDefinition<DynamicBDomNode> {
  readonly name = 'DynamicBDomNode';
  readonly type = 'dynamic';

  get attributes(): NodeFields<DynamicBDomNode, 'attrs'> {
    return {
      node: {
        typeName: 'BDomNode',
        optional: false,
        defaultValue: undefined,
        isArray: false,
        isObject: false,
        isRaw: 'dual',
        isReadOnly: false,
      },
    };
  }

  get properties(): NodeFields<DynamicBDomNode, 'props'> {
    return {};
  }

  override renderComponent({
    node,
    parentNode,
  }: RenderBDomNodeProps<DynamicBDomNode>) {
    const { node: nodeVal } = useBDomNodeAttributes(node, parentNode);

    return this.renderNode(nodeVal, node);
  }
}
