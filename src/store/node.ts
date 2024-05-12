import { type BDomNode, type BDomNodeId } from '../types';
import { BDomSchemaState } from '../state/schema';
import { BDomNodeState } from '../state/node';
import { BDomNodeRegistry } from '../registry';
import { Path } from '../common';
import { BaseObject } from '../common/base-object';
import { MapSet } from '@framjet/common';

export class BDomNodeStore extends BaseObject {
  protected readonly schemaState: BDomSchemaState;
  protected readonly nodeStateStore = new WeakMap<BDomNode, BDomNodeState>();
  protected readonly nodeIdStore = new Map<BDomNodeId, WeakRef<BDomNode>>();
  protected readonly nodeChildrenStore = new MapSet<BDomNodeId, BDomNodeId>();
  protected readonly finalizationRegistry = new FinalizationRegistry<
    [BDomNodeId, BDomNodeId?]
  >(([nodeId, parentNodeId]) => {
    this.nodeIdStore.delete(nodeId);
    this.nodeChildrenStore.delete(nodeId);

    if (
      parentNodeId !== undefined &&
      this.nodeChildrenStore.has(parentNodeId)
    ) {
      this.nodeChildrenStore.deleteItem(parentNodeId, nodeId);
    }
  });

  constructor(schemaState: BDomSchemaState) {
    super();

    this.schemaState = schemaState;
  }

  getNodeStateStore() {
    return this.nodeStateStore;
  }

  getNodeIdStore() {
    return this.nodeIdStore;
  }

  getNodeChildrenStore() {
    return this.nodeChildrenStore;
  }

  parse(
    node: BDomNode,
    parentNode: BDomNode | undefined,
    parentPath: Path,
  ): BDomNodeState {
    // this.getLogger().atDebug().trace(`${node.id} processing`);

    const path = parentPath.node(node);
    let nodeState = this.getNodeStateStore().get(node);
    if (nodeState !== undefined) {
      this.getLogger().atWarn().log(`${nodeState} already exists for BDomNode`);

      return nodeState;
    }

    nodeState = new BDomNodeState(this.schemaState, node, parentNode, path);

    this.finalizationRegistry.register(node, [node.id, parentNode?.id]);

    this.getNodeStateStore().set(node, nodeState);
    this.getNodeIdStore().set(node.id, new WeakRef(node));

    if (parentNode !== undefined) {
      this.getNodeChildrenStore().addItem(parentNode.id, node.id);
    }

    if (this.shouldProcessChildren(node) || this.shouldParseChildren(node)) {
      nodeState.children.forEach((child, index) => {
        if (this.has(child)) {
          return;
        }

        this.parse(child, node, path.field('children').index(index));
      });
    }

    return nodeState;
  }

  process(node: BDomNode): BDomNodeState {
    const nodeState = this.get(node);

    nodeState.process();

    if (this.shouldParseChildren(node) && this.shouldProcessChildren(node)) {
      nodeState.children.forEach(this.process.bind(this));
    }

    return nodeState;
  }

  has(node: BDomNode): boolean;
  has(nodeId: BDomNodeId): boolean;
  has(node: BDomNode | BDomNodeId): boolean {
    try {
      const refNode = this.resolveNodeSelector(node);

      return this.getNodeStateStore().has(refNode);
    } catch (_) {
      return false;
    }
  }

  get(nodeId: BDomNodeId): BDomNodeState;
  get(
    node: BDomNode,
    parentNode?: BDomNode | undefined,
    createIfNotPresent?: boolean,
  ): BDomNodeState;
  get(
    node: BDomNode | BDomNodeId,
    parentNode?: BDomNode,
    createIfNotPresent?: boolean,
  ): BDomNodeState {
    const refNode = this.resolveNodeSelector(node);

    const nodeState = this.getNodeStateStore().get(refNode);
    if (nodeState === undefined) {
      if (parentNode !== undefined && createIfNotPresent === true) {
        return this.parse(refNode, parentNode, Path.node(parentNode));
      }

      const name = '';

      throw new Error(`BDomNodeState for "${name}" not found`);
    }

    return nodeState;
  }

  remove(node: BDomNode): void;
  remove(nodeId: BDomNodeId): void;
  remove(node: BDomNode | BDomNodeId): void {
    try {
      const refNode = this.resolveNodeSelector(node);

      this.getNodeStateStore().delete(refNode);
      this.getNodeIdStore().delete(refNode.id);

      this.getNodeChildrenStore().forEachItem(
        refNode.id,
        this.remove.bind(this),
      );
      this.getNodeChildrenStore().delete(refNode.id);
    } catch (_) {
      return;
    }
  }

  protected resolveNodeSelector(node: BDomNodeId | BDomNode): BDomNode {
    if (typeof node === 'string') {
      const nodeRef = this.getNodeIdStore().get(node);
      if (nodeRef === undefined) {
        throw new Error(
          `BDomNodeState for BDomNode with id "${node}" not found`,
        );
      }

      const refNode = nodeRef.deref();
      if (refNode === undefined) {
        throw new Error(
          `BDomNodeState for BDomNode with id "${node}" not found`,
        );
      }

      return refNode;
    }

    return node;
  }

  protected shouldParseChildren<T extends BDomNode>(node: T): boolean {
    return BDomNodeRegistry.getDefinition(node).shouldParseChildren(node);
  }

  protected shouldProcessChildren<T extends BDomNode>(node: T): boolean {
    return BDomNodeRegistry.getDefinition(node).shouldProcessChildren(node);
  }
}
