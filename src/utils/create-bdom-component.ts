import {
  type Payload,
  type PendingPayload,
  type RejectedPayload,
  type ResolvedPayload,
  Status,
  type Thenable,
} from '../types/_react';
import type {
  AnyReactComponent,
  BDomComponent,
  BDomComponentProperties,
} from 'blastdom';
import { Debug } from '@framjet/common';

const REACT_LAZY_TYPE: symbol = Symbol.for('react.lazy');

function initializer<T>(payload: Payload<T>): T {
  if (payload._status === Status.Uninitialized) {
    const ctor = payload._result;
    const thenable = ctor();

    thenable.then(
      (moduleObject) => {
        if (
          (payload as Payload<T>)._status === Status.Pending ||
          (payload as Payload<T>)._status === Status.Uninitialized
        ) {
          const resolved = payload as unknown as ResolvedPayload<T>;
          resolved._status = Status.Resolved;
          resolved._result = moduleObject;
        }
      },
      (error) => {
        if (
          (payload as Payload<T>)._status === Status.Pending ||
          (payload as Payload<T>)._status === Status.Uninitialized
        ) {
          const rejected = payload as unknown as RejectedPayload;
          rejected._status = Status.Rejected;
          rejected._result = error;
        }
      },
    );

    if (payload._status === Status.Uninitialized) {
      const pending = payload as unknown as PendingPayload;
      pending._status = Status.Pending;
      pending._result = thenable;
    }
  }

  if (payload._status === Status.Resolved) {
    return payload._result.default;
  } else {
    throw payload._result;
  }
}

export function createBDomComponent<
  TComponent extends AnyReactComponent,
  TName extends string,
  TProps extends BDomComponentProperties<TComponent>,
>(
  component: TComponent,
  name: TName,
  props?: TProps,
): BDomComponent<TComponent, TName, TProps, Payload<TComponent>> {
  const payload: Payload<TComponent> = {
    _status: Status.Resolved,
    _result: {
      default: component,
    },
  };

  const definition: BDomComponent<
    TComponent,
    TName,
    TProps,
    Payload<TComponent>
  > = {
    $$typeof: REACT_LAZY_TYPE,
    _payload: payload,
    _BDomName: name,
    _BDomProps: props ?? ({} as TProps),
    _init: initializer,
  };

  return Debug.tagObject(definition, `BDomComponent<${name}>`);
}

export function createLazyBDomComponent<
  TComponent extends AnyReactComponent,
  TName extends string,
  TProps extends BDomComponentProperties<TComponent>,
>(
  ctor: () => Thenable<{ default: TComponent }>,
  name: TName,
  props?: TProps,
): BDomComponent<TComponent, TName, TProps, Payload<TComponent>> {
  const payload: Payload<TComponent> = {
    _status: Status.Uninitialized,
    _result: ctor,
  };

  const definition: BDomComponent<
    TComponent,
    TName,
    TProps,
    Payload<TComponent>
  > = {
    $$typeof: REACT_LAZY_TYPE,
    _payload: payload,
    _BDomName: name,
    _BDomProps: props ?? ({} as TProps),
    _init: initializer,
  };

  return Debug.tagObject(definition, `BDomComponent<${name}>`);
}
