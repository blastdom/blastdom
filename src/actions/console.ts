import { BaseBDomActionDefinition } from './_base';
import type { BaseBDomAction, ItemFields } from '../types';
import { type AnyValueCell } from '../cells';
import { ItemResolveContext } from '../common';

export interface ConsoleBDomAction extends BaseBDomAction {
  readonly $$a: 'console';
}

export class ConsoleBDomActionDefinition extends BaseBDomActionDefinition<ConsoleBDomAction> {
  readonly name = 'ConsoleBDomAction';
  readonly type = 'console';

  get fields(): ItemFields<ConsoleBDomAction> {
    return {};
  }

  override resolveItem(
    context: ItemResolveContext<ConsoleBDomAction>,
  ): AnyValueCell {
    return context.calculatedFunc(() => {
      return (...args: unknown[]) => console.log(...args);
    });
  }
}
