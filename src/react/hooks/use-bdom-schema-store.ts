import * as React from 'react';
import { BDomSchemaStoreContext } from '../context';
import { BDomSchemaStore } from '../../store';

export function useBDomSchemaStore(): BDomSchemaStore {
  const context = React.useContext(BDomSchemaStoreContext);

  if (!context) {
    throw new Error(
      'useBDomSchemaStore must be used within a BDomSchemaStoreProvider',
    );
  }

  return context.store;
}
