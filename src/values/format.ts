import { BaseBDomValueDefinition } from './_base';
import type { BaseBDomValue, BDomValue, ItemFields } from '../types';
import type { AnyValueCell } from '../cells';
import { ItemResolveContext } from '../common';
import { Strings } from '@framjet/common';

export interface FormatBDomValue extends BaseBDomValue<string> {
  readonly $$v: 'format';
  format: string | BDomValue<string>;
  args?: BDomValue<unknown>[];
}

export class FormatBDomValueDefinition extends BaseBDomValueDefinition<FormatBDomValue> {
  readonly name = 'FormatBDomValue';
  readonly type = 'format';

  get fields(): ItemFields<FormatBDomValue> {
    return {
      format: {
        typeName: 'string',
        optional: false,
        defaultValue: undefined,
        isArray: false,
        isObject: false,
        isRaw: 'dual',
        isReadOnly: false,
      },
      args: {
        typeName: 'array',
        optional: true,
        defaultValue: [],
        isArray: true,
        isObject: false,
        isRaw: true,
        isReadOnly: false,
      },
    };
  }

  override resolveItem(
    context: ItemResolveContext<FormatBDomValue>,
  ): AnyValueCell {
    const formatCell = context.getFieldValueCell('format');
    const argStates = context.getFieldValueCell('args');

    return context.calculatedValue((get) => {
      const args = argStates !== undefined ? get(argStates) ?? [] : [];
      const format = get(formatCell);

      return Strings.format(format, ...args);
    });
  }
}
