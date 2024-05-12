import * as React from 'react';
import type { BDomNode, BDomNodeAttrs } from '../../types';
import { useBDomNodeState } from './use-bdom-node-state';
import { useCellValue } from '@framjet/cell-react';

export function useBDomNodeAttributes<TNode extends BDomNode>(
  node: TNode,
  parentNode?: BDomNode,
): BDomNodeAttrs<TNode> {
  const nodeState = useBDomNodeState(node, parentNode);

  const result = useCellValue(nodeState.attributes);

  React.useDebugValue(result);

  return result as BDomNodeAttrs<TNode>;
}
