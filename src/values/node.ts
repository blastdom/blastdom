import { BaseBDomValueDefinition } from './_base';
import type { BaseBDomValue, BDomNode, BDomValue, ItemFields } from '../types';
import type { AnyValueCell, ValueCell } from '../cells';
import { ItemResolveContext } from '../common';
import * as React from 'react';
import { BDomNodeRegistry } from '../registry';

export interface NodeBDomValue extends BaseBDomValue<React.ReactElement> {
  readonly $$v: 'node';
  node: BDomNode | BDomValue<BDomNode>;
  key?: React.Key | BDomValue<React.Key>;
}

export class NodeBDomValueDefinition extends BaseBDomValueDefinition<NodeBDomValue> {
  readonly name = 'NodeBDomValue';
  readonly type = 'node';

  get fields(): ItemFields<NodeBDomValue> {
    return {
      node: {
        typeName: 'BDomNode',
        isRaw: 'dual',
        isReadOnly: false,
        defaultValue: undefined,
        isArray: false,
        isObject: false,
        optional: false,
      },
      key: {
        typeName: 'ReactKey',
        optional: true,
        defaultValue: undefined,
        isArray: false,
        isObject: false,
        isRaw: 'dual',
        isReadOnly: false,
      },
    };
  }

  override resolveItem(
    context: ItemResolveContext<NodeBDomValue>,
  ): AnyValueCell {
    const nodeCell = context.getFieldValueCell('node') as ValueCell<BDomNode>;
    const keyCell = context.getFieldValueCell('key') as ValueCell<React.Key>;

    return context.calculatedValue((getter) => {
      const node = getter(nodeCell);
      const key = keyCell !== undefined ? getter(keyCell) : undefined;

      return BDomNodeRegistry.renderNode(node, context.nodeState.node, key);
    });
  }
}
