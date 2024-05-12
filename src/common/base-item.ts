/* eslint-disable @typescript-eslint/no-unused-vars */
import type { ItemResolveContext } from './item-resolve-context';
import type { BaseBDomItem, ItemFields } from '../types';
import type { AnyValueCell } from '../cells';
import type { TypeName } from '@framjet/types';
import { BaseObject } from './base-object';

export abstract class BaseBDomItemDefinition<
  T extends BaseBDomItem<TF>,
  TF extends keyof T,
> extends BaseObject {
  abstract readonly type: T[TF];
  abstract readonly name: BaseBDomItem<TF> extends T ? string : TypeName<T>;

  abstract fields: ItemFields<T>;

  resolveItem(context: ItemResolveContext<T>): AnyValueCell {
    this.getLogger().atError().log(`${this}::resolveValue not implemented.`);

    return context.undefinedValue();
  }

  validate(node: T): void {
    // noop
  }
}
