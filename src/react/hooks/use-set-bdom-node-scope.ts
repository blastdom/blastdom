import type { BDomNode } from '../../types';
import { useBDomNodeState } from './use-bdom-node-state';
import { useSetCell } from '@framjet/cell-react';

export function useSetBDomNodeScope(
  options: {
    name: string;
    defaultValue?: unknown | undefined;
    renamer?: ((prev: string) => string) | undefined;
  },
  node: BDomNode,
  parentNode?: BDomNode,
): (value: unknown) => void {
  const nodeState = useBDomNodeState(node, parentNode);
  const scopeCell = nodeState.createScopedValue(
    options.name,
    options.defaultValue,
    options.renamer,
  );

  return useSetCell(scopeCell);
}
