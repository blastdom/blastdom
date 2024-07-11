/* eslint-disable @typescript-eslint/ban-types */
import type { BaseBDomItem, BaseBDomValue, BDomNodeMap } from 'blastdom';

export type BDomNodeId = string;

export interface BaseBDomNode extends BaseBDomItem<'$$n'> {
  readonly $$n: string;
  readonly id: BDomNodeId;
  readonly attrs?: {};
  readonly props?: {};
  readonly children?: BaseBDomNode[];
}

export type BDomNode = BDomNodeMap[keyof BDomNodeMap];

export type BDomNodeTypes = BDomNode['$$n'];

export interface RenderBDomNodeProps<T extends BaseBDomNode> {
  node: T;
  parentNode: BDomNode | undefined;
}

export type BDomNodeProps<T extends BaseBDomNode> = {
  [K in keyof T['props']]: T['props'][K] extends BaseBDomValue<infer V>
    ? V
    : never;
};

export type BDomNodeAttrs<T extends BaseBDomNode> = {
  [K in keyof T['attrs']]: T['attrs'][K] extends BaseBDomValue<infer V>
    ? V
    : never;
};
