import { BDomSchemaState } from 'blastdom';
import type { CellSetter } from '@framjet/cell';

export function createCellSetter(schemaState: BDomSchemaState): CellSetter {
  return (cell, ...args) => schemaState.getCellStore().writeCell(cell, ...args);
}
