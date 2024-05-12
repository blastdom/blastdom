import * as React from 'react';
import type { StateStore } from '../../store';

interface BDomStateStoreContextProps {
  store: StateStore;
}

export const BDomStateStoreContext = React.createContext<
  BDomStateStoreContextProps | undefined
>(undefined);

export interface BDomStateStoreProviderProps {
  store: StateStore;
  children?: React.ReactNode;
}

export function BDomStateStoreProvider({
  children,
  store,
}: BDomStateStoreProviderProps) {
  const storeRef = React.useRef<StateStore | undefined>(undefined);

  if (!storeRef.current) {
    storeRef.current = store;
  }

  return React.createElement(
    BDomStateStoreContext.Provider,
    {
      value: {
        store: storeRef.current,
      },
    },
    children,
  );
}
