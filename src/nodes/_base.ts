/* eslint-disable @typescript-eslint/no-unused-vars */
import * as React from 'react';
import type {
  BaseBDomNode,
  BDomNode,
  NodeFields,
  RenderBDomNodeProps,
} from '../types';
import { BDomNodeRegistry } from '../registry';
import { BaseObject } from '../common/base-object';
import type { TypeName } from '@framjet/types';
import { ReactUtils } from '@framjet/common';

export abstract class BaseBDomNodeDefinition<
  T extends BaseBDomNode,
> extends BaseObject {
  abstract readonly type: T['$$n'];
  abstract readonly name: BaseBDomNode extends T ? string : TypeName<T>;
  readonly shouldMemo: boolean = true;

  abstract get attributes(): NodeFields<T, 'attrs'>;

  abstract get properties(): NodeFields<T, 'props'>;

  #renderFn:
    | React.FunctionComponent<RenderBDomNodeProps<BaseBDomNode>>
    | undefined;

  renderComponent(props: RenderBDomNodeProps<T>): React.ReactNode {
    this.getLogger().atError().log(`${this}::renderNode not implemented.`);

    return React.createElement(
      'span',
      {},
      '`${this}::renderNode not implemented.`',
    );
  }

  render(
    node: T,
    parentNode: BDomNode | undefined,
    key: React.Key | undefined,
  ): React.ReactElement {
    if (this.#renderFn === undefined) {
      this.#renderFn = this.createRenderFunction();
    }

    return React.createElement(this.#renderFn, {
      node,
      parentNode,
      key,
    } as never);
  }

  shouldParseChildren(node: T): boolean {
    return true;
  }

  shouldProcessChildren(node: T): boolean {
    return true;
  }

  protected renderNode(
    node: BDomNode,
    parentNode: BDomNode | undefined,
    key?: React.Key,
  ): React.ReactElement {
    return BDomNodeRegistry.renderNode(node, parentNode, key);
  }

  protected renderChildren(node: BDomNode): React.ReactElement[] {
    return BDomNodeRegistry.renderNodes(node.children ?? [], node);
  }

  protected renderNodes(nodes: BDomNode[], parentNode: BDomNode) {
    return BDomNodeRegistry.renderNodes(nodes, parentNode);
  }

  protected getRenderFunction() {
    return this.renderComponent.bind(this) as React.FunctionComponent<
      RenderBDomNodeProps<BaseBDomNode>
    >;
  }

  protected getRenderFunctionDisplayName(): string {
    return this.name;
  }

  protected createRenderFunction(): React.FunctionComponent<
    RenderBDomNodeProps<BaseBDomNode>
  > {
    const renderFn = this.getRenderFunction();
    renderFn.displayName = this.getRenderFunctionDisplayName();

    return (
      this.shouldMemo
        ? React.memo(renderFn, this.memoIsEqual.bind(this))
        : renderFn
    ) as React.FunctionComponent<RenderBDomNodeProps<BaseBDomNode>>;
  }

  protected memoIsEqual(left: unknown, right: unknown): boolean {
    return ReactUtils.isEqual(left, right);
  }

  validate(node: T, parentNode: BDomNode | undefined): void {
    // noop
  }
}
