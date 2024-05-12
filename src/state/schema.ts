import {
  type BaseBDomAction,
  type BaseBDomValue,
  type BDomNode,
  type BDomNodeId,
  type BDomSchema,
} from '../types';
import {
  type AnyStateCell,
  ArrayValueCell,
  BDomActionStateCell,
  BDomValueStateCell,
  ValueStateCell,
} from '../cells';
import {
  AttrRefPath,
  NodeAttrRefPath,
  NodePropRefPath,
  NodeRefPath,
  NodeScopeRefPath,
  Path,
  PathRefPath,
  PropRefPath,
  RefPath,
  ScopeRefPath,
} from '../common';
import { BDomNodeState, StateRef } from '../state';
import { BDomNodeStore } from '../store/node';
import { valueCell } from '../utils';
import { BaseObject } from '../common/base-object';
import { type AnyFunction, Objects } from '@framjet/common';
import {
  cell,
  type Cell,
  type CellStore,
  type WritableCell,
} from '@framjet/cell';

export class BDomSchemaState extends BaseObject {
  protected readonly _schema: BDomSchema;
  protected readonly _schemaNr: number;
  protected readonly cellStore: CellStore;
  protected readonly nodeStore: BDomNodeStore = new BDomNodeStore(this);

  constructor(cellStore: CellStore, schema: BDomSchema, schemaNr: number) {
    super();

    this.cellStore = cellStore;
    this._schema = schema;
    this._schemaNr = schemaNr;
  }

  getCellStore(): CellStore {
    return this.cellStore;
  }

  getNodeStore(): BDomNodeStore {
    return this.nodeStore;
  }

  getNodeState(nodeId: BDomNodeId): BDomNodeState;
  getNodeState(
    node: BDomNode,
    parentNode?: BDomNode,
    createIfNotPresent?: boolean,
  ): BDomNodeState;
  getNodeState(
    node: BDomNode | BDomNodeId,
    parentNode?: BDomNode,
    createIfNotPresent?: boolean,
  ): BDomNodeState {
    if (Objects.isType(node, 'BDomNodeId')) {
      return this.getNodeStore().get(node);
    }

    return this.getNodeStore().get(node, parentNode, createIfNotPresent);
  }

  get schema(): BDomSchema {
    return this._schema;
  }

  get schemaNr(): number {
    return this._schemaNr;
  }

  get version(): string {
    return this.schema.version;
  }

  get rootNode(): BDomNode {
    return this.schema.root;
  }

  writeCell<T, TArgs extends unknown[], TResult>(
    cell: WritableCell<T, TArgs, TResult>,
    ...args: TArgs
  ): TResult {
    return this.getCellStore().writeCell(cell, ...args);
  }

  process(): void {
    this.getNodeStore().parse(
      this.rootNode,
      undefined,
      Path.schema(this.schema),
    );

    this.getNodeStore().process(this.rootNode);
  }

  processValue<T>(
    value: T,
    nodeStateRef: StateRef<BDomNodeState>,
    path: Path,
    isDualArray = false,
  ): AnyStateCell {
    let result: AnyStateCell;
    if (value === undefined || value === null) {
      result = valueCell(undefined, path, nodeStateRef, this);
    } else if (Objects.isType(value, 'BDomValue')) {
      result = this.processBDomValue(value, nodeStateRef, path);
    } else if (Objects.isType(value, 'BDomAction')) {
      result = this.processBDomAction(
        value,
        nodeStateRef,
        path,
      ) as AnyStateCell;
    } else {
      return valueCell(value, path, nodeStateRef, this, isDualArray);
    }

    if (isDualArray) {
      return new ValueStateCell(
        new ArrayValueCell([result], path, nodeStateRef, this),
        nodeStateRef,
        path,
      );
    }

    return result;
  }

  processBDomValue<T, D extends BaseBDomValue<T>>(
    value: D,
    nodeStateRef: StateRef<BDomNodeState>,
    parentPath: Path,
  ): BDomValueStateCell<T, D> {
    return new BDomValueStateCell<T, D>(value, nodeStateRef, parentPath);
  }

  processBDomAction<D extends BaseBDomAction>(
    action: D,
    nodeStateRef: StateRef<BDomNodeState>,
    parentPath: Path,
  ): BDomActionStateCell<AnyFunction, D> {
    return new BDomActionStateCell<AnyFunction, D>(
      action,
      nodeStateRef,
      parentPath,
    );
  }

  resolveRef(
    ref: string,
    nodeStateRef: StateRef<BDomNodeState>,
    parentPath: Path,
  ): Cell<AnyStateCell | undefined> {
    const refPath = RefPath.parse(ref);

    let refNodeState: BDomNodeState = nodeStateRef.get();
    if (refPath instanceof NodeRefPath) {
      refNodeState = this.getNodeState(refPath.nodeId);
    }

    if (
      refPath instanceof NodeScopeRefPath ||
      refPath instanceof ScopeRefPath
    ) {
      return refNodeState.getScopedValue(refPath.name);
    }

    if (refPath instanceof NodeAttrRefPath || refPath instanceof AttrRefPath) {
      return refNodeState.getAttribute(refPath.name);
    }

    if (refPath instanceof NodePropRefPath || refPath instanceof PropRefPath) {
      return refNodeState.getProperty(refPath.name);
    }

    if (refPath instanceof NodeRefPath || refPath instanceof PathRefPath) {
      return cell(() =>
        this.processValue(refNodeState.node, nodeStateRef, parentPath),
      );
    }

    throw new Error(
      `Field at "${parentPath.toStringPath()}" is not valid BDomRef selector`,
    );
  }
}
