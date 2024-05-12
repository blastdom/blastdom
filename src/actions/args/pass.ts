import { BaseBDomActionDefinition } from '../_base';
import type { BaseBDomAction, ItemFields } from '../../types';
import { type AnyValueCell } from '../../cells';
import { ItemResolveContext } from '../../common';

export interface ArgsPassBDomAction extends BaseBDomAction {
  readonly $$a: 'args.pass';
}

export class ArgsPassBDomActionDefinition extends BaseBDomActionDefinition<ArgsPassBDomAction> {
  readonly name = 'ArgsPassBDomAction';
  readonly type = 'args.pass';

  get fields(): ItemFields<ArgsPassBDomAction> {
    return {};
  }

  override resolveItem(
    context: ItemResolveContext<ArgsPassBDomAction>,
  ): AnyValueCell {
    return context.calculatedFunc(() => {
      return (...args: unknown[]) => args;
    });
  }
}
