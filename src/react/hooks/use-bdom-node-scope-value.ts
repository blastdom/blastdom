import type { BDomNode } from '../../types';
import { useBDomNodeState } from './use-bdom-node-state';
import { useCellValue } from '@framjet/cell-react';
import * as React from 'react';

export function useBDomNodeScopeValue(
  name: string,
  node: BDomNode,
  parentNode?: BDomNode,
): unknown {
  const nodeState = useBDomNodeState(node, parentNode);

  const result = useCellValue(nodeState.getScopedValue(name));

  React.useDebugValue(result);

  return result;
}
