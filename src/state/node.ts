import { Objects } from '@framjet/common';
import { type Cell, cell, type PrimitiveCellType } from '@framjet/cell';
import type {
  BaseBDomNode,
  BaseBDomValue,
  BDomNode,
  BDomNodeId,
  BDomNodeTypes,
  FieldSettings,
} from '../types';
import {
  type AnyScopeCell,
  type AnyStateCell,
  BDomValueStateCell,
} from '../cells';
import {
  FieldsContainer,
  FieldsProcessor,
  Path,
  ScopedValueContainer,
} from '../common';
import { BDomNodeRegistry } from '../registry';
import { BDomSchemaState } from './schema';
import { createCellSetter } from '../utils';
import { BaseStateObject } from './_base';
import type { BaseBDomNodeDefinition } from '../nodes';

export class BDomNodeState extends BaseStateObject {
  protected readonly _schemaState: BDomSchemaState;
  protected readonly _node: BDomNode;
  protected readonly _parentNode: BDomNode | undefined;
  protected readonly _path: Path;
  protected readonly _nodeAttributes: FieldsContainer;
  protected readonly _nodeProperties: FieldsContainer;
  protected readonly _definition: BaseBDomNodeDefinition<BaseBDomNode>;
  protected readonly _scopedValueContainer: ScopedValueContainer;

  protected _processed = false;
  protected _mounted = cell(false);

  constructor(
    schemaState: BDomSchemaState,
    node: BDomNode,
    parentNode: BDomNode | undefined,
    path: Path,
  ) {
    super();

    this._schemaState = schemaState;
    this._node = node;
    this._parentNode = parentNode;
    this._path = path;

    this._definition = BDomNodeRegistry.getDefinition(this._node);

    this._scopedValueContainer = new ScopedValueContainer(
      this.createRef(),
      this.getParentNodeState()?.getScopedValueContainer(),
      createCellSetter(this._schemaState),
      path.field('scope'),
    );

    const nodeAttrs =
      (this._node.attrs as Record<string, BaseBDomValue<unknown>>) ?? {};
    this._nodeAttributes = new FieldsContainer(
      this.createRef(),
      nodeAttrs,
      this._definition.attributes as Record<string, FieldSettings>,
      createCellSetter(this._schemaState),
      path.field('attrs'),
    );

    const nodeProps: Record<string, BaseBDomValue<unknown>> = this._node
      .props ?? {};
    this._nodeProperties = new FieldsContainer(
      this.createRef(),
      nodeProps,
      this._definition.properties as Record<string, FieldSettings>,
      createCellSetter(this._schemaState),
      path.field('props'),
      true,
    );
  }

  get nodeId(): BDomNodeId {
    return this._node.id;
  }

  get type(): BDomNodeTypes {
    return this._node['$$n'];
  }

  get path(): Path {
    return this._path;
  }

  get node(): BDomNode {
    return this._node;
  }

  get parentNode(): BDomNode | undefined {
    return this._parentNode;
  }

  get children(): BDomNode[] {
    return this._node.children ?? [];
  }

  get processed(): boolean {
    return this._processed;
  }

  get mounted(): Cell<boolean> {
    return this._mounted;
  }

  get attributes() {
    if (this.processed === false) {
      this.process();
    }

    return this._nodeAttributes.getAll();
  }

  get properties() {
    if (this.processed === false) {
      this.process();
    }

    return this._nodeProperties.getAll();
  }

  get definition() {
    return this._definition;
  }

  override toString() {
    return `BDomNodeState<${BDomNodeRegistry.getDefinition(this._node).name}<${this.nodeId}>>`;
  }

  get [Symbol.toStringTag]() {
    return this.toString();
  }

  getScopedValueContainer(): ScopedValueContainer {
    return this._scopedValueContainer;
  }

  getSchemaState(): BDomSchemaState {
    return this._schemaState;
  }

  getParentNodeState(): BDomNodeState | undefined {
    const parentNode = this.parentNode;

    if (parentNode === undefined) {
      return undefined;
    }

    return this._schemaState.getNodeState(parentNode);
  }

  getAttribute(name: string) {
    return this._nodeAttributes.getField(name);
  }

  getProperty(name: string) {
    return this._nodeProperties.getField(name);
  }

  getScopedValues(): Cell<Record<string, AnyStateCell | undefined>> {
    return this.getScopedValueContainer().all();
  }

  hasScopedValue(name: string): boolean {
    return this.getScopedValueContainer().has(name);
  }

  getScopedValue(name: string): AnyScopeCell {
    return this.getScopedValueContainer().get(name);
  }

  findParentNode(nodeType: BDomNodeTypes): BDomNodeState | undefined {
    const parentNodeState = this.getParentNodeState();

    if (parentNodeState === undefined) {
      return undefined;
    }

    if (parentNodeState.type === nodeType) {
      return parentNodeState;
    }

    return parentNodeState.findParentNode(nodeType);
  }

  createScopedValue(
    name: string,
    value?: unknown,
    renamer?: (prev: string) => string,
  ): PrimitiveCellType<unknown> {
    const scopeCell = this.getScopedValueContainer().create(
      name,
      value,
      renamer,
    );

    return cell(
      (get) => {
        const stateCell = get(scopeCell);

        if (stateCell === undefined) {
          return undefined;
        }

        const valueCell = get(stateCell);
        if (valueCell !== undefined) {
          return get(valueCell);
        }

        return undefined;
      },
      (_get, set, value) => {
        const valueState = this.processValue(
          value,
          this.path.field(`^${name}`),
        );

        scopeCell.setState(valueState, set);
      },
    );
  }

  process(): void {
    if (this.processed === true) {
      throw new Error(`${this} is already processed`);
    }

    try {
      const nodeStateRef = this.createRef();
      const cellSetter = createCellSetter(this._schemaState);

      const attrFields = this._definition.attributes as Record<
        string,
        FieldSettings
      >;
      Objects.entries(this._nodeAttributes.getFields()).forEach(
        ([key, value]) => {
          const stateCell = FieldsProcessor.processField(
            key,
            attrFields[key],
            (this._node.attrs as Record<string, unknown>)[key],
            value.owner,
            nodeStateRef,
          );

          value.setState(stateCell, cellSetter);
        },
      );

      const propFields =
        (this._definition.properties as Record<string, FieldSettings>) ?? {};
      Objects.entries(this._nodeProperties.getFields()).forEach(
        ([key, value]) => {
          const propField = propFields[key];
          if (propFields[key] === undefined) {
            if (Objects.hasProperty(this._node.props, key)) {
              const propValue = this._node.props?.[key];

              let stateCell: AnyStateCell;
              if (propValue !== undefined) {
                stateCell = this.processBDomValue(propValue, value.owner);

                value.setState(stateCell, cellSetter);
              }
            }
          } else {
            Objects.entries(this._nodeProperties.getFields()).forEach(
              ([key, value]) => {
                const stateCell = FieldsProcessor.processField(
                  key,
                  propField,
                  (this._node.props as Record<string, unknown>)[key],
                  value.owner,
                  nodeStateRef,
                );

                value.setState(stateCell, cellSetter);
              },
            );
          }
        },
      );

      this._processed = true;
    } catch (error) {
      this.getLogger().atError().log(`Error while processing ${this}`, error);
      throw error;
    }
  }

  processValue<T>(value: T, path: Path): AnyStateCell {
    return this._schemaState.processValue(value, this.createRef(), path);
  }

  processBDomValue<T, D extends BaseBDomValue<T>>(
    value: D,
    parentPath: Path,
  ): BDomValueStateCell<T, D> {
    return this._schemaState.processBDomValue(
      value,
      this.createRef(),
      parentPath,
    );
  }
}
