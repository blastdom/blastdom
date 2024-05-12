import type { AnyBDomValue, BaseBDomValue } from '../types';
import { BaseBDomItemDefinition } from '../common/base-item';
import type { TypeName } from '@framjet/types';

export abstract class BaseBDomValueDefinition<
  T extends BaseBDomValue<unknown>,
> extends BaseBDomItemDefinition<T, '$$v'> {
  abstract override readonly name: AnyBDomValue extends T
    ? string
    : TypeName<T>;
}
