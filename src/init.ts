import {
  BDomActionRegistry,
  BDomNodeRegistry,
  BDomValueRegistry,
} from './registry';
import {
  AppBDomNodeDefinition,
  ComponentBDomNodeDefinition,
  ConditionalBDomNodeDefinition,
  DynamicBDomNodeDefinition,
  ElementBDomNodeDefinition,
  ForeachBDomNodeDefinition,
  FragmentBDomNodeDefinition,
  NodeBDomNodeDefinition,
  SuspenseBDomNodeDefinition,
  TextBDomNodeDefinition,
  ValueBDomNodeDefinition,
} from './nodes';
import {
  ActionBDomValueDefinition,
  ActionExecBDomValueDefinition,
  ArrayBDomValueDefinition,
  ComponentBDomValueDefinition,
  EventBDomValueDefinition,
  NodeBDomValueDefinition,
  ObjectBDomValueDefinition,
  RefBDomValueDefinition,
  StaticBDomValueDefinition,
} from './values';
import {
  ArgsMapBDomActionDefinition,
  ArgsPassBDomActionDefinition,
  ArgsSwapBDomActionDefinition,
  ArrayAddBDomActionDefinition,
  ArrayMapBDomActionDefinition,
  ArrayRemoveBDomActionDefinition,
  BooleanToggleBDomActionDefinition,
  CallBDomActionDefinition,
  ConsoleBDomActionDefinition,
  FunctionBDomActionDefinition,
  GetBDomActionDefinition,
  MultiBDomActionDefinition,
  ObjectCreateBDomActionDefinition,
  SetBDomActionDefinition,
  SetToBDomActionDefinition,
  StringTemplateBDomActionDefinition,
  ValueBDomActionDefinition,
} from './actions';
import { Objects, Strings } from '@framjet/common';

export function initDefault() {
  BDomNodeRegistry.registerAll(
    new AppBDomNodeDefinition(),
    new ComponentBDomNodeDefinition(),
    new ConditionalBDomNodeDefinition(),
    new DynamicBDomNodeDefinition(),
    new ElementBDomNodeDefinition(),
    new ForeachBDomNodeDefinition(),
    new FragmentBDomNodeDefinition(),
    new NodeBDomNodeDefinition(),
    new SuspenseBDomNodeDefinition(),
    new TextBDomNodeDefinition(),
    new ValueBDomNodeDefinition(),
  );

  BDomValueRegistry.registerAll(
    new ActionBDomValueDefinition(),
    new ActionExecBDomValueDefinition(),
    new ArrayBDomValueDefinition(),
    new ComponentBDomValueDefinition(),
    new EventBDomValueDefinition(),
    new NodeBDomValueDefinition(),
    new ObjectBDomValueDefinition(),
    new RefBDomValueDefinition(),
    new StaticBDomValueDefinition(),
  );

  BDomActionRegistry.registerAll(
    // Args
    new ArgsMapBDomActionDefinition(),
    new ArgsPassBDomActionDefinition(),
    new ArgsSwapBDomActionDefinition(),
    // Array
    new ArrayAddBDomActionDefinition(),
    new ArrayMapBDomActionDefinition(),
    new ArrayRemoveBDomActionDefinition(),
    // Boolean
    new BooleanToggleBDomActionDefinition(),
    // Object
    new ObjectCreateBDomActionDefinition(),
    // String
    new StringTemplateBDomActionDefinition(),
    // Root
    new CallBDomActionDefinition(),
    new ConsoleBDomActionDefinition(),
    new FunctionBDomActionDefinition(),
    new GetBDomActionDefinition(),
    new MultiBDomActionDefinition(),
    new SetBDomActionDefinition(),
    new SetToBDomActionDefinition(),
    new ValueBDomActionDefinition(),
  );
}

export function typeRegister() {
  Objects.registerTypeChecker(
    (v: unknown) => Objects.is(v) && Objects.hasProperty(v, '$$n'),
    'BDomNode',
  );

  Objects.registerTypeChecker(
    (v: unknown) => Objects.is(v) && Objects.hasProperty(v, '$$v'),
    'BDomValue',
  );

  Objects.registerTypeChecker(
    (v: unknown) => Objects.is(v) && Objects.hasProperty(v, '$$a'),
    'BDomAction',
  );

  Objects.registerTypeChecker(Strings.is, 'BDomNodeId');
}
