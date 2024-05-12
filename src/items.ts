import * as React from 'react';
import type {
  AnyElementBDomNode,
  AppBDomNode,
  ComponentBDomNode,
  ConditionalBDomNode,
  DynamicBDomNode,
  ForeachBDomNode,
  FragmentBDomNode,
  NodeBDomNode,
  SuspenseBDomNode,
  TextBDomNode,
  ValueBDomNode,
} from './nodes';
import type {
  ArgsMapBDomAction,
  ArgsPassBDomAction,
  ArgsSwapBDomAction,
  ArrayAddBDomAction,
  ArrayMapBDomAction,
  ArrayRemoveBDomAction,
  BooleanToggleBDomAction,
  CallBDomAction,
  ConsoleBDomAction,
  FunctionBDomAction,
  GetBDomAction,
  MultiBDomAction,
  ObjectCreateBDomAction,
  SetBDomAction,
  SetToBDomAction,
  StringTemplateBDomAction,
  ValueBDomAction,
} from './actions';
import type { AnyFunction } from '@framjet/common';
import type {
  ActionBDomValue,
  ActionExecBDomValue,
  AnyActionExecBDomValue,
  AnyArrayBDomValue,
  AnyObjectBDomValue,
  AnyRefBDomValue,
  AnyStaticBDomValue,
  ArrayBDomValue,
  ComponentBDomValue,
  EventBDomValue,
  NodeBDomValue,
  ObjectBDomValue,
  RefBDomValue,
  StaticBDomValue,
} from './values';
import type {
  AnyBDomAction,
  AnyBDomValue,
  BDomNode,
  BDomNodeId,
  BDomSchema,
  BDomSchemaId,
  BDomSchemaVersion,
} from './types';

export interface BDomActionMap {
  // Args
  ArgsMapBDomAction: ArgsMapBDomAction;
  ArgsPassBDomAction: ArgsPassBDomAction;
  ArgsSwapBDomAction: ArgsSwapBDomAction;
  // Array
  ArrayAddBDomAction: ArrayAddBDomAction;
  ArrayMapBDomAction: ArrayMapBDomAction;
  ArrayRemoveBDomAction: ArrayRemoveBDomAction;
  // Boolean
  BooleanToggleBDomAction: BooleanToggleBDomAction;
  // Object
  ObjectCreateBDomAction: ObjectCreateBDomAction;
  // String
  StringTemplateBDomAction: StringTemplateBDomAction;
  // Root
  CallBDomAction: CallBDomAction;
  ConsoleBDomAction: ConsoleBDomAction;
  FunctionBDomAction: FunctionBDomAction;
  GetBDomAction: GetBDomAction;
  MultiBDomAction: MultiBDomAction;
  SetBDomAction: SetBDomAction;
  SetToBDomAction: SetToBDomAction;
  ValueBDomAction: ValueBDomAction;
}

export interface BDomValueMap {
  ActionBDomValue: ActionBDomValue;
  ActionExecBDomValue: AnyActionExecBDomValue;
  ArrayBDomValue: AnyArrayBDomValue;
  ComponentBDomValue: ComponentBDomValue;
  EventBDomValue: EventBDomValue;
  NodeBDomValue: NodeBDomValue;
  ObjectBDomValue: AnyObjectBDomValue;
  RefBDomValue: AnyRefBDomValue;
  StaticBDomValue: AnyStaticBDomValue;
}

export interface BDomValueSpecificMap<TValue> {
  ActionBDomValue: TValue extends AnyFunction ? ActionBDomValue : never;
  ActionExecBDomValue: ActionExecBDomValue<TValue>;
  ArrayBDomValue: TValue extends unknown[] ? ArrayBDomValue<TValue> : never;
  StaticBDomValue: StaticBDomValue<TValue>;
  RefBDomValue: RefBDomValue<TValue>;
  EventBDomValue: TValue extends React.EventHandler<never>
    ? EventBDomValue
    : never;
  ObjectBDomValue: TValue extends Record<PropertyKey, unknown>
    ? ObjectBDomValue<TValue>
    : never;
  NodeBDomValue: TValue extends React.ReactElement ? NodeBDomValue : never;
  ComponentBDomValue: TValue extends React.ReactElement
    ? ComponentBDomValue
    : never;
}

export interface BDomNodeMap {
  AppBDomNode: AppBDomNode;
  ComponentBDomNode: ComponentBDomNode;
  ConditionalBDomNode: ConditionalBDomNode;
  DynamicBDomNode: DynamicBDomNode;
  ElementBDomNode: AnyElementBDomNode;
  ForeachBDomNode: ForeachBDomNode;
  FragmentBDomNode: FragmentBDomNode;
  NodeBDomNode: NodeBDomNode;
  SuspenseBDomNode: SuspenseBDomNode;
  TextBDomNode: TextBDomNode;
  ValueBDomNode: ValueBDomNode;
}

export interface BDomCommonTypeNames {
  BDomValue: AnyBDomValue;
  BDomAction: AnyBDomAction;
  BDomNode: BDomNode;
  BDomNodeId: BDomNodeId;
  BDomSchema: BDomSchema;
  BDomSchemaId: BDomSchemaId;
  BDomSchemaVersion: BDomSchemaVersion;
}

export type BDomTypeNames = BDomNodeMap &
  BDomValueMap &
  BDomActionMap &
  BDomCommonTypeNames;
