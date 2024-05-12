import * as React from 'react';
import { BaseBDomNodeDefinition } from './_base';
import type {
  BaseBDomNode,
  BDomNode,
  BDomValue,
  NodeFields,
  RenderBDomNodeProps,
} from '../types';
import {
  useBDomNodeAttributes,
  useBDomSchemaState,
  useSetBDomNodeScope,
} from '../react';
import type { FragmentBDomNode } from './fragment';
import { Objects } from '@framjet/common';
import { BDomNodeRegistry } from '../registry';

export interface ForeachBDomNode extends BaseBDomNode {
  readonly $$n: 'foreach';
  readonly attrs: {
    items: BDomValue<unknown[]>;
    readonly scopeItemName?: string;
    readonly scopeIndexName?: string;
    readonly scopeParentName?: string;
  };
  readonly props?: never;
  readonly children: [FragmentBDomNode];
}

interface ForeachItemNodeProps<T> {
  item: T;
  index: number;
  fragment: FragmentBDomNode;
  parentNode: BDomNode;
  scopeItemName: string;
  scopeIndexName: string;
  scopeParentName: string;
}

export class ForeachBDomNodeDefinition extends BaseBDomNodeDefinition<ForeachBDomNode> {
  readonly name = 'ForeachBDomNode';
  readonly type = 'foreach';

  #renderItemFn:
    | React.FunctionComponent<ForeachItemNodeProps<unknown>>
    | undefined;

  get attributes(): NodeFields<ForeachBDomNode, 'attrs'> {
    return {
      scopeIndexName: {
        typeName: 'string',
        optional: true,
        defaultValue: 'foreach.current.index',
        isArray: false,
        isObject: false,
        isRaw: true,
        isReadOnly: true,
      },
      scopeItemName: {
        typeName: 'string',
        optional: true,
        defaultValue: 'foreach.current',
        isArray: false,
        isObject: false,
        isRaw: true,
        isReadOnly: true,
      },
      scopeParentName: {
        typeName: 'string',
        optional: true,
        defaultValue: '.parent',
        isArray: false,
        isObject: false,
        isRaw: true,
        isReadOnly: true,
      },
      items: {
        typeName: 'array',
        optional: false,
        defaultValue: undefined,
        isArray: false,
        isObject: false,
        isRaw: false,
        isReadOnly: false,
      },
    };
  }

  get properties(): NodeFields<ForeachBDomNode, 'props'> {
    return {};
  }

  override shouldParseChildren(): boolean {
    return false;
  }

  protected renderArrayItem<T>(
    props: ForeachItemNodeProps<T>,
  ): React.ReactNode {
    const schemaState = useBDomSchemaState();
    const {
      item,
      index,
      fragment,
      parentNode,
      scopeItemName,
      scopeIndexName,
      scopeParentName,
    } = props;

    const [node] = React.useState<BDomNode>({
      $$n: 'node',
      id: `${parentNode.id}[${index}]`,
      children: [fragment],
    });

    React.useEffect(() => {
      return () => {
        if (node !== undefined) {
          schemaState.getNodeStore().remove(node);
        }
      };
    }, []);

    useBDomNodeAttributes(node, parentNode);

    const scopeCurrent = useSetBDomNodeScope(
      {
        name: scopeItemName,
        renamer: (v) => `${v}${scopeParentName}`,
        defaultValue: item,
      },
      node,
      parentNode,
    );

    const scopeCurrentIndex = useSetBDomNodeScope(
      {
        name: scopeIndexName,
        renamer: (v) => `${v}${scopeParentName}`,
        defaultValue: index,
      },
      node,
      parentNode,
    );

    React.useEffect(() => {
      scopeCurrent(item);
    }, [item]);

    React.useEffect(() => {
      scopeCurrentIndex(index);
    }, [index]);

    return this.renderNode(node, parentNode);
  }

  override renderComponent({
    node,
    parentNode,
  }: RenderBDomNodeProps<ForeachBDomNode>) {
    const attrs = useBDomNodeAttributes(node, parentNode);
    const {
      items = [],
      scopeItemName = 'foreach.current',
      scopeIndexName = 'foreach.current.index',
      scopeParentName = '.parent',
    } = attrs;
    const { children = [] } = node;

    if (children.length !== 1) {
      throw new Error('More than node children node detected');
    }

    const [fragment] = children;
    if (isFragment(fragment) === false) {
      const fragmentType = BDomNodeRegistry.getNodeType(fragment);

      throw new Error(
        `Unexpected children node: "${fragmentType}" expecting only "fragment"`,
      );
    }

    return React.createElement(
      React.Fragment,
      {},
      items.map((item, index) => {
        const itemFragment = Objects.deepClone(fragment);
        Object.assign(itemFragment, { id: `${itemFragment.id}[${index}]` });

        return React.createElement(this.getItemRenderFunction(), {
          key: `${node.id}[${index}]`,
          item,
          index,
          fragment: itemFragment,
          parentNode: node,
          scopeItemName,
          scopeIndexName,
          scopeParentName,
        });
      }),
    );
  }

  protected getItemRenderFunction(): React.FunctionComponent<
    ForeachItemNodeProps<unknown>
  > {
    if (this.#renderItemFn !== undefined) {
      return this.#renderItemFn;
    }

    const renderFn = this.renderArrayItem.bind(this) as React.FunctionComponent<
      ForeachItemNodeProps<unknown>
    >;

    renderFn.displayName = `${this.getRenderFunctionDisplayName()}Item`;

    return (this.#renderItemFn = React.memo(
      renderFn,
      this.memoIsEqual.bind(this),
    ));
  }
}

function isFragment(node: BDomNode): node is FragmentBDomNode {
  return BDomNodeRegistry.getNodeType(node) === 'fragment';
}
