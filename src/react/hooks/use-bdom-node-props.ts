import type { BDomNode, BDomNodeProps } from '../../types';
import { useBDomNodeState } from './use-bdom-node-state';
import { useCellValue } from '@framjet/cell-react';
import * as React from 'react';

export function useBDomNodeProperties<TNode extends BDomNode>(
  node: TNode,
  parentNode?: BDomNode,
): BDomNodeProps<TNode> {
  const nodeState = useBDomNodeState(node, parentNode);

  const result = useCellValue(nodeState.properties);

  React.useDebugValue(result);

  return result as BDomNodeProps<TNode>;
}
