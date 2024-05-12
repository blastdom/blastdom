import { SimpleValueCell } from './simple';
import type { AnyFunction } from '@framjet/common';

export class FunctionValueCell<
  T extends AnyFunction,
> extends SimpleValueCell<T> {}
