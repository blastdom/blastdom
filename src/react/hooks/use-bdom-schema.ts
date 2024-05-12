import * as React from 'react';
import type { BDomSchema } from '../../types';
import { BDomSchemaContext } from '../context';

export function useBDomSchema(): BDomSchema {
  const context = React.useContext(BDomSchemaContext);

  if (!context) {
    throw new Error('BDomSchemaProvider not found');
  }

  React.useDebugValue(context.schema);

  return context.schema;
}
