import type { BaseBDomAction } from '../types';
import { BaseBDomItemDefinition } from '../common/base-item';
import type { TypeName } from '@framjet/types';

export abstract class BaseBDomActionDefinition<
  T extends BaseBDomAction,
> extends BaseBDomItemDefinition<T, '$$a'> {
  abstract override readonly name: BaseBDomAction extends T
    ? string
    : TypeName<T>;
}
