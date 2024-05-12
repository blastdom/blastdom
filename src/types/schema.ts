import type { JsonObject } from '@framjet/common';
import type { BaseBDomItem, BDomNode } from 'blastdom';

export type BDomSchemaId = string;
export type BDomSchemaVersion = string;

export interface BDomSchema extends BaseBDomItem<'$$s'> {
  $$s: BDomSchemaId;
  version: BDomSchemaVersion;
  meta?: JsonObject;
  root: BDomNode;
}
