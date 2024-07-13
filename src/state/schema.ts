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
  protected _processed = false;

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

  get processed(): boolean {
    return this._processed;
  }

  writeCell<T, TArgs extends unknown[], TResult>(
    cell: WritableCell<T, TArgs, TResult>,
    ...args: TArgs
  ): TResult {
    return this.getCellStore().writeCell(cell, ...args);
  }

  process(): void {
    if (this._processed) {
      this.getLogger().atWarn().log('BDomSchema is already processed');

      return;
    }

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

    let result: Cell<AnyStateCell | undefined>;

    if (
      refPath instanceof NodeScopeRefPath ||
      refPath instanceof ScopeRefPath
    ) {
      result = refNodeState.getScopedValue(refPath.name);
    } else if (
      refPath instanceof NodeAttrRefPath ||
      refPath instanceof AttrRefPath
    ) {
      result = refNodeState.getAttribute(refPath.name);
    } else if (
      refPath instanceof NodePropRefPath ||
      refPath instanceof PropRefPath
    ) {
      result = refNodeState.getProperty(refPath.name);
    } else if (
      refPath instanceof NodeRefPath ||
      refPath instanceof PathRefPath
    ) {
      result = cell(() =>
        this.processValue(refNodeState.node, nodeStateRef, parentPath),
      );
    } else {
      throw new Error(
        `Field at "${parentPath.toStringPath()}" is not valid BDomRef selector`,
      );
    }

    if (refPath.path == null) {
      return result;
    }

    return cell((getter) => {
      const stateCell = getter(result);
      if (stateCell == undefined) {
        return undefined;
      }

      return cell((getter2) => {
        const valueCell = getter2(stateCell);

        if (valueCell === undefined) {
          return undefined;
        }

        return cell((getter3) => {
          const value = getter3(valueCell);

          if (value === undefined) {
            return undefined;
          }

          return Objects.get(value, refPath.path as never);
        });
      }) as AnyStateCell;
    });
  }
}
