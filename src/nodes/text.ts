import * as React from 'react';
import { BaseBDomNodeDefinition } from './_base';
import type {
  BaseBDomNode,
  BDomValue,
  NodeFields,
  RenderBDomNodeProps,
} from '../types';
import { useBDomNodeAttributes } from '../react';

export interface TextBDomNode extends BaseBDomNode {
  readonly $$n: 'text';
  readonly attrs: {
    text: BDomValue<string> | string;
  };
  readonly props?: never;
  readonly children?: never;
}

export class TextBDomNodeDefinition extends BaseBDomNodeDefinition<TextBDomNode> {
  readonly name = 'TextBDomNode';
  readonly type = 'text';

  get attributes(): NodeFields<TextBDomNode, 'attrs'> {
    return {
      text: {
        typeName: 'string',
        optional: false,
        defaultValue: undefined,
        isArray: false,
        isObject: false,
        isRaw: 'dual',
        isReadOnly: false,
      },
    };
  }

  get properties(): NodeFields<TextBDomNode, 'props'> {
    return {};
  }

  override renderComponent({
    node,
    parentNode,
  }: RenderBDomNodeProps<TextBDomNode>) {
    const { text } = useBDomNodeAttributes(node, parentNode);

    return React.createElement(React.Fragment, {}, text);
  }
}
