import { type BaseProcessedBDomItem, type BDomActionMap } from 'blastdom';

export interface BaseBDomAction
  extends BaseProcessedBDomItem<'$$a', '$$a' | 'id'> {
  readonly $$a: string;
}

export type BDomAction = BDomActionMap[keyof BDomActionMap];

export type AnyBDomAction = BDomAction;
