import { BaseObject } from './base-object';

const refPathRegex =
  // eslint-disable-next-line no-useless-escape
  /^([\:#\!\$\|@])([\^a-zA-Z0-9_\.]+)([@\$\!])?([\^\.a-zA-Z0-9_]+)?([\|\[].*)?$/;

export class RefPath extends BaseObject {
  readonly path?: string;
  readonly ref: string;

  constructor(ref: string, path?: string) {
    super();

    this.ref = ref;
    this.path = path;
  }

  static parse(ref: string): RefPath {
    const matches = ref.match(refPathRegex);

    if (!matches) {
      throw new Error(`Invalid ref path: ${ref}`);
    }

    const [, prefix, nodeId, type, name, path] = matches;
    let parsedPath: string | undefined = path;
    if (path !== undefined && path.charAt(0) === '|') {
      parsedPath = path.slice(1);
    }

    if (prefix === ':') {
      return new GlobalRefPath(ref, nodeId + (path ?? ''));
    }

    if (prefix === '#') {
      if (type === undefined) {
        return new NodeRefPath(ref, parsedPath, nodeId);
      }

      if (type === '@') {
        return new NodeAttrRefPath(ref, parsedPath, nodeId, name);
      }

      if (type === '$') {
        return new NodePropRefPath(ref, parsedPath, nodeId, name);
      }

      if (type === '!') {
        return new NodeScopeRefPath(ref, parsedPath, nodeId, name);
      }

      throw new Error(`Invalid ref path: ${ref} Unknown type: ${type}`);
    }

    if (prefix === '!') {
      return new ScopeRefPath(ref, parsedPath, nodeId);
    }

    if (prefix === '$') {
      return new PropRefPath(ref, parsedPath, nodeId);
    }

    if (prefix === '@') {
      return new AttrRefPath(ref, parsedPath, nodeId);
    }

    if (prefix === '|') {
      return new PathRefPath(ref, nodeId + (path ?? ''));
    }

    throw new Error(`Invalid ref path: ${ref} Unknown prefix: ${prefix}`);
  }
}

export class GlobalRefPath extends RefPath {}

export class NodeRefPath extends RefPath {
  readonly nodeId: string;

  constructor(ref: string, path: string, nodeId: string) {
    super(ref, path);

    this.nodeId = nodeId;
  }
}

export class NodeAttrRefPath extends NodeRefPath {
  readonly name: string;

  constructor(ref: string, path: string, nodeId: string, name: string) {
    super(ref, path, nodeId);

    this.name = name;
  }
}

export class NodePropRefPath extends NodeRefPath {
  readonly name: string;

  constructor(ref: string, path: string, nodeId: string, name: string) {
    super(ref, path, nodeId);

    this.name = name;
  }
}

export class NodeScopeRefPath extends NodeRefPath {
  readonly name: string;

  constructor(ref: string, path: string, nodeId: string, name: string) {
    super(ref, path, nodeId);

    this.name = name;
  }
}

export class ScopeRefPath extends RefPath {
  readonly name: string;

  constructor(ref: string, path: string, name: string) {
    super(ref, path);

    this.name = name;
  }
}

export class PropRefPath extends RefPath {
  readonly name: string;

  constructor(ref: string, path: string, name: string) {
    super(ref, path);

    this.name = name;
  }
}

export class AttrRefPath extends RefPath {
  readonly name: string;

  constructor(ref: string, path: string, name: string) {
    super(ref, path);

    this.name = name;
  }
}

export class PathRefPath extends RefPath {}
