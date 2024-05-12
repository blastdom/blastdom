import * as React from 'react';
import { BDomComponentRegistry, BDomNodeRegistry } from '../registry';
import type { BDomSchema } from '../types';
import { type BDomSchemaState } from '../state';
import { BDomSchemaStore, StateStore } from '../store';
import { FramJetBlastDOM } from '../blastdom';
import {
  BDomSchemaProvider,
  BDomSchemaStateProvider,
  BDomSchemaStoreProvider,
  BDomStateStoreProvider,
} from './context';
import { Objects } from '@framjet/common';
import { CellStoreProvider } from '@framjet/cell-react';

export interface BlastDOMRenderProps {
  schema?: BDomSchema;
  schemaStore?: BDomSchemaStore;
  stateStore?: StateStore;
  schemaResolver?: () => BDomSchema;
  globalSchemaFieldName?: string;
}

export function BlastDOMRender(props: BlastDOMRenderProps) {
  const {
    schema,
    globalSchemaFieldName = '__BDomSchema',
    schemaResolver = () =>
      Objects.hasProperty(window, globalSchemaFieldName)
        ? window[globalSchemaFieldName]
        : undefined,
    stateStore = FramJetBlastDOM.getStateStore(),
    schemaStore = FramJetBlastDOM.getSchemaStore(stateStore),
  } = props;

  let bdomSchema = schema;
  if (bdomSchema === undefined) {
    bdomSchema = schemaResolver();
  }

  if (!bdomSchema) {
    throw new Error('No BDomSchema provided');
  }

  const [schemaState, setSchemaState] = React.useState<BDomSchemaState>();
  React.useEffect(() => {
    if (schemaState === undefined) {
      const state = schemaStore.create(bdomSchema);
      state.process();

      setSchemaState(state);
    }

    return () => {
      schemaStore.delete(bdomSchema);
    };
  }, [bdomSchema]);

  if (schemaState === undefined) {
    return undefined;
  }

  BDomComponentRegistry.waitReact();

  return React.createElement(
    BDomStateStoreProvider,
    {
      store: stateStore,
    },
    React.createElement(
      BDomSchemaStoreProvider,
      {
        store: schemaStore,
      },
      React.createElement(
        BDomSchemaProvider,
        {
          schema: bdomSchema,
        },
        React.createElement(
          BDomSchemaStateProvider,
          {
            state: schemaState,
          },
          React.createElement(
            CellStoreProvider,
            {
              store: schemaState.getCellStore(),
            },
            BDomNodeRegistry.renderNode(bdomSchema.root),
          ),
        ),
      ),
    ),
  );
}
