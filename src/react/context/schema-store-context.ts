import * as React from 'react';
import type { BDomSchemaStore } from '../../store';

interface BDomSchemaStoreContextProps {
  store: BDomSchemaStore;
}

export const BDomSchemaStoreContext = React.createContext<
  BDomSchemaStoreContextProps | undefined
>(undefined);

export interface BDomSchemaStoreProviderProps {
  store: BDomSchemaStore;
  children?: React.ReactNode;
}

export function BDomSchemaStoreProvider({
  children,
  store,
}: BDomSchemaStoreProviderProps) {
  const storeRef = React.useRef<BDomSchemaStore | undefined>(undefined);

  if (!storeRef.current) {
    storeRef.current = store;
  }

  return React.createElement(
    BDomSchemaStoreContext.Provider,
    {
      value: {
        store: storeRef.current,
      },
    },
    children,
  );
}
