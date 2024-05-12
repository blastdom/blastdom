import * as React from 'react';
import type { BDomSchema } from '../../types';

interface BDomSchemaContextProps {
  schema: BDomSchema;
}

export const BDomSchemaContext = React.createContext<
  BDomSchemaContextProps | undefined
>(undefined);

export interface BDomSchemaProviderProps {
  schema: BDomSchema;
  children?: React.ReactNode;
}

export function BDomSchemaProvider({
  children,
  schema,
}: BDomSchemaProviderProps) {
  return React.createElement(
    BDomSchemaContext.Provider,
    {
      value: {
        schema,
      },
    },
    children,
  );
}
