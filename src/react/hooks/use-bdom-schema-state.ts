import * as React from 'react';
import { BDomSchemaStateContext } from '../context';
import { BDomSchema } from '../../types';
import { BDomSchemaState } from '../../state';
import { useBDomSchemaStore } from './use-bdom-schema-store';

export function useBDomSchemaState(schema?: BDomSchema): BDomSchemaState {
  if (schema === undefined) {
    const context = React.useContext(BDomSchemaStateContext);

    if (!context) {
      throw new Error(
        'BDomSchemaStateProvider not found in the component tree',
      );
    }

    React.useDebugValue(context.state);

    return context.state;
  }

  return useBDomSchemaStore().get(schema);
}
