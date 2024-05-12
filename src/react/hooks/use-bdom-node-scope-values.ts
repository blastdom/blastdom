import type { BDomNode } from '../../types';
import type { AnyStateCell } from '../../cells';
import { useBDomNodeState } from './use-bdom-node-state';
import { useCellValue } from '@framjet/cell-react';
import * as React from 'react';
import { Objects } from '@framjet/common';

export function useBDomNodeScopeValues(
  node: BDomNode,
  parentNode?: BDomNode,
): Record<string, unknown> {
  const nodeState = useBDomNodeState(node, parentNode);

  const scopedValues: Record<string, AnyStateCell | undefined> = useCellValue(
    nodeState.getScopedValues(),
  );

  const result = Objects.fromEntries(
    Objects.entries(scopedValues).map(([k, v]) => [k, v]),
  );

  React.useDebugValue(result);

  return result;
}
