import type {
  AnyBDomAction,
  AnyBDomValue,
  BDomNode,
  BDomSchema,
} from '../types';
import { BDomNodeRegistry } from '../registry';
import { Objects } from '@framjet/common';

type PathItemNarrowDown<T> = T extends BDomNode
  ? NodePath
  : T extends AnyBDomValue
    ? ValuePath
    : T extends AnyBDomAction
      ? ActionPath
      : Path;

export class Path {
  readonly #parent?: Path;

  constructor(parent?: Path) {
    this.#parent = parent;
  }

  get parent(): Path | undefined {
    return this.#parent;
  }

  get root(): Path {
    return this.parent !== undefined ? this.parent.root : this;
  }

  get path(): Path[] {
    return [...(this.#parent !== undefined ? this.#parent.path : []), this];
  }

  nodePath(): string {
    const path = [];
    let parent = this.parent;
    while (parent !== undefined) {
      if (parent instanceof NodePath) {
        path.unshift(parent.name);
        break;
      }

      path.unshift(parent.toStringPathValue());
      parent = parent.parent;
    }

    path.push(this.toStringPathValue());

    return path.join('');
  }

  item<T>(item: T): PathItemNarrowDown<T> {
    return Path.item(item, this);
  }

  schema(schema: BDomSchema): SchemaPath {
    return Path.schema(schema, this);
  }

  node(node: BDomNode): NodePath {
    return Path.node(node, this);
  }

  value(value: AnyBDomValue): ValuePath {
    return Path.value(value, this);
  }

  action(action: AnyBDomAction): ActionPath {
    return Path.action(action, this);
  }

  field(field: PropertyKey): FieldPath {
    return Path.field(field, this);
  }

  index(index: number): IndexPath {
    return Path.index(index, this);
  }

  toString(): string {
    if (this.#parent !== undefined) {
      return (
        this.#parent.toString() +
        ` -> ${this.constructor.name}<${this.toStringValue()}>`
      );
    }

    return `${this.constructor.name}`;
  }

  protected toStringValue(): string {
    return 'unknown';
  }

  toStringPath(): string {
    const parent = this.parent?.toStringPath() ?? '';

    return `${parent}${this.toStringPathValue()}`;
  }

  protected toStringPathValue(): string {
    return this.constructor.name;
  }

  static item<T>(item: T, parent?: Path): PathItemNarrowDown<T> {
    if (Objects.isType(item, 'BDomNode')) {
      return this.node(item, parent) as never;
    }

    if (Objects.isType(item, 'BDomValue')) {
      return this.value(item, parent) as never;
    }

    if (Objects.isType(item, 'BDomAction')) {
      return this.action(item, parent) as never;
    }

    if (Objects.isType(item, 'BDomSchema')) {
      return this.schema(item, parent) as never;
    }

    if (Objects.isType(item, 'number')) {
      return this.index(item, parent) as never;
    }

    if (Objects.isType(item, 'PropertyKey')) {
      return this.field(item, parent) as never;
    }

    throw new Error(`Unknown item type "${typeof item}"`);
  }

  static schema(schema: BDomSchema, parent?: Path): SchemaPath {
    return new SchemaPath(schema, parent);
  }

  static node(node: BDomNode, parent?: Path): NodePath {
    return new NodePath(node, parent);
  }

  static value(value: AnyBDomValue, parent?: Path): ValuePath {
    return new ValuePath(value, parent);
  }

  static action(action: AnyBDomAction, parent?: Path): ActionPath {
    return new ActionPath(action, parent);
  }

  static field(field: PropertyKey, parent?: Path): FieldPath {
    return new FieldPath(field, parent);
  }

  static index(index: number, parent?: Path): IndexPath {
    return new IndexPath(index, parent);
  }
}

export abstract class BasePathItem<T> extends Path {
  readonly #value: T;

  constructor(value: T, parent?: Path) {
    super(parent);

    this.#value = value;
  }

  getAssociatedValue(): T {
    return this.#value;
  }

  protected override toStringPathValue(): string {
    return '';
  }
}

export class SchemaPath extends BasePathItem<BDomSchema> {
  protected override toStringPathValue(): string {
    return 'root';
  }
}

export class NodePath extends BasePathItem<BDomNode> {
  #nodeName: string | undefined;
  #nodeType: string | undefined;

  get type(): string {
    if (this.#nodeType !== undefined) {
      return this.#nodeType;
    }

    return (this.#nodeType = BDomNodeRegistry.getDefinition(
      this.getAssociatedValue(),
    ).name);
  }

  get name(): string {
    if (this.#nodeName !== undefined) {
      return this.#nodeName;
    }

    return (this.#nodeName = `${this.type}<${this.getAssociatedValue().id}>`);
  }
}

export class ValuePath extends BasePathItem<AnyBDomValue> {}

export class ActionPath extends BasePathItem<AnyBDomAction> {}

export class FieldPath extends BasePathItem<PropertyKey> {
  override toStringValue(): string {
    return `"${String(this.getAssociatedValue())}"`;
  }

  protected override toStringPathValue(): string {
    return `.${String(this.getAssociatedValue())}`;
  }
}

export class IndexPath extends BasePathItem<number> {
  override toStringValue(): string {
    return `"${String(this.getAssociatedValue())}"`;
  }

  protected override toStringPathValue(): string {
    return `[${String(this.getAssociatedValue())}]`;
  }
}
