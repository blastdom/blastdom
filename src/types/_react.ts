export interface Wakeable<Result = any> {
  then(
    onFulfill: () => Result,
    onReject: () => Result,
  ): void | Wakeable<Result>;
}

interface ThenableImpl<T, Result, Err> {
  then(
    onFulfill: (value: T) => Result,
    onReject: (error: Err) => Result,
  ): void | Wakeable<Result>;
}

interface UntrackedThenable<T, Result, Err>
  extends ThenableImpl<T, Result, Err> {
  status?: void;
}

export interface PendingThenable<T, Result, Err>
  extends ThenableImpl<T, Result, Err> {
  status: 'pending';
}

export interface FulfilledThenable<T, Result, Err>
  extends ThenableImpl<T, Result, Err> {
  status: 'fulfilled';
  value: T;
}

export interface RejectedThenable<T, Result, Err>
  extends ThenableImpl<T, Result, Err> {
  status: 'rejected';
  reason: Err;
}

export type Thenable<T, Result = void, Err = any> =
  | UntrackedThenable<T, Result, Err>
  | PendingThenable<T, Result, Err>
  | FulfilledThenable<T, Result, Err>
  | RejectedThenable<T, Result, Err>;

export interface PayloadStatus {
  Uninitialized: -1;
  Pending: 0;
  Resolved: 1;
  Rejected: 2;
}

export const Status: PayloadStatus = {
  Pending: 0,
  Rejected: 2,
  Resolved: 1,
  Uninitialized: -1,
};

export interface BasePayload {
  _status: PayloadStatus[keyof PayloadStatus];
  _result: unknown;
}

export interface UninitializedPayload<T> extends BasePayload {
  _status: PayloadStatus['Uninitialized'];
  _result: () => Thenable<{ default: T }>;
}

export interface PendingPayload extends BasePayload {
  _status: PayloadStatus['Pending'];
  _result: Wakeable;
}

export interface ResolvedPayload<T> extends BasePayload {
  _status: PayloadStatus['Resolved'];
  _result: { default: T };
}

export interface RejectedPayload extends BasePayload {
  _status: PayloadStatus['Rejected'];
  _result: unknown;
}

export type Payload<T> =
  | UninitializedPayload<T>
  | PendingPayload
  | ResolvedPayload<T>
  | RejectedPayload;

export interface LazyComponent<T, P extends Payload<T>> {
  $$typeof: symbol | number;
  _payload: P;
  _init: (payload: P) => T;
}
