import * as React from 'react';
import type { BDomSchemaState } from '../../state';

interface BDomSchemaStateContextProps {
  state: BDomSchemaState;
}

export const BDomSchemaStateContext = React.createContext<
  BDomSchemaStateContextProps | undefined
>(undefined);

export interface BDomSchemaStateProviderProps {
  state: BDomSchemaState;
  children?: React.ReactNode;
}

export function BDomSchemaStateProvider({
  children,
  state,
}: BDomSchemaStateProviderProps) {
  return React.createElement(
    BDomSchemaStateContext.Provider,
    {
      value: {
        state,
      },
    },
    children,
  );
}
