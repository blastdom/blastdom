import { BaseBDomValueDefinition } from './_base';
import type { BaseBDomValue, BDomAction, ItemFields } from '../types';
import type { AnyValueCell } from '../cells';
import { ItemResolveContext } from '../common';
import { type AnyFunction, Objects } from '@framjet/common';
import * as React from 'react';

export interface EventBDomValue extends BaseBDomValue<AnyFunction> {
  readonly $$v: 'event';
  readonly selector?: string;
  readonly action: BDomAction;
}

export class EventBDomValueDefinition extends BaseBDomValueDefinition<EventBDomValue> {
  readonly name = 'EventBDomValue';
  readonly type = 'event';

  get fields(): ItemFields<EventBDomValue> {
    return {
      action: {
        typeName: 'BDomAction',
        optional: false,
        defaultValue: undefined,
        isArray: false,
        isObject: false,
        isRaw: true,
        isReadOnly: true,
      },
      selector: {
        typeName: 'string',
        optional: true,
        defaultValue: undefined,
        isArray: false,
        isObject: false,
        isRaw: true,
        isReadOnly: true,
      },
    };
  }

  override resolveItem(
    context: ItemResolveContext<EventBDomValue>,
  ): AnyValueCell {
    const selector = context.getFieldValueCell('selector');
    const action = context.getFieldValueCell('action');

    return context.calculatedValue((get) => {
      const path = selector !== undefined ? get(selector) : undefined;
      const fn = get(action);

      return (event: React.SyntheticEvent, ...rest: unknown[]) => {
        if (path !== undefined) {
          const value = Objects.get(event, path as never);

          return fn(value);
        }

        return fn(event, ...rest);
      };
    });
  }
}
