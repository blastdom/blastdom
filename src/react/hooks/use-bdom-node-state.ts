import type { BDomNode } from '../../types';
import { BDomNodeState } from '../../state';
import { useBDomSchemaState } from './use-bdom-schema-state';
import * as React from 'react';

export function useBDomNodeState(
  node: BDomNode,
  parentNode?: BDomNode,
): BDomNodeState {
  const schemaState = useBDomSchemaState();
  const nodeState = schemaState.getNodeState(node, parentNode, true);

  if (nodeState.processed == false) {
    nodeState.process();
  }

  React.useDebugValue(nodeState);

  return nodeState;
}
