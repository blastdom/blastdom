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
import { Objects } from '@framjet/common';

function findAndReplace(
  value: unknown,
  strings: Record<string, string>,
): unknown {
  const re = new RegExp(Object.keys(strings).join('|'), 'gi');
  const matched = (matched: string) => {
    const replacement = strings[matched];

    if (replacement === undefined) {
      throw new Error(
        `FragmentBDomNode: found variable "${matched}" but no replacement value found`,
      );
    }

    return replacement;
  };

  const findAndReplaceInner = (
    value: unknown,
    re: RegExp,
    replacement: (matched: string) => string,
  ): unknown => {
    if (!value) {
      return value;
    }

    if (typeof value === 'string') {
      return value.replace(re, replacement);
    }

    if (Array.isArray(value)) {
      return value.map((v) => findAndReplaceInner(v, re, replacement));
    }

    if (typeof value === 'object') {
      return Objects.fromEntries(
        Objects.entries(value).map(([k, v]) => [
          k,
          findAndReplaceInner(v, re, replacement),
        ]),
      );
    }

    return value;
  };

  return findAndReplaceInner(value, re, matched);
}

export interface FragmentBDomNode extends BaseBDomNode {
  readonly $$n: 'fragment';
  readonly attrs: {
    readonly vars?: Record<string, BDomValue<string>>;
    readonly tagOpen?: string;
    readonly tagClose?: string;
  };
  readonly props?: never;
  readonly children: BDomNode[];
}

export class FragmentBDomNodeDefinition extends BaseBDomNodeDefinition<FragmentBDomNode> {
  readonly name = 'FragmentBDomNode';
  readonly type = 'fragment';

  get attributes(): NodeFields<FragmentBDomNode, 'attrs'> {
    return {
      vars: {
        typeName: 'object',
        optional: true,
        defaultValue: {},
        isArray: false,
        isObject: true,
        isRaw: true,
        isReadOnly: true,
      },
      tagOpen: {
        typeName: 'string',
        optional: true,
        defaultValue: '{{',
        isArray: false,
        isObject: false,
        isRaw: true,
        isReadOnly: true,
      },
      tagClose: {
        typeName: 'string',
        optional: true,
        defaultValue: '}}',
        isArray: false,
        isObject: false,
        isRaw: true,
        isReadOnly: true,
      },
    };
  }

  get properties(): NodeFields<FragmentBDomNode, 'props'> {
    return {};
  }

  override shouldParseChildren(node: FragmentBDomNode): boolean {
    return false;
  }

  override renderComponent({
    node,
    parentNode,
  }: RenderBDomNodeProps<FragmentBDomNode>) {
    const {
      vars = {},
      tagOpen,
      tagClose,
    } = useBDomNodeAttributes(node, parentNode);
    // const attrs = useBDomNodeAttributes(node, parentNode);
    const { children: rawChildren = [] } = node;
    const [children, setChildren] = React.useState<BDomNode[]>();

    React.useEffect(() => {
      setChildren(
        findAndReplace(
          Objects.deepClone(rawChildren),
          Objects.fromEntries(
            Objects.entries(vars).map(([k, v]) => [
              `${tagOpen}${k}${tagClose}`,
              v,
            ]),
          ),
        ) as BDomNode[],
      );
    }, [vars, tagOpen, tagClose, node]);

    if (children === undefined) {
      return;
    }

    return React.createElement(
      React.Fragment,
      {},
      this.renderNodes(children, node),
    );
  }
}
