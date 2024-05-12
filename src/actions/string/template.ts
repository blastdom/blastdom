import { BaseBDomActionDefinition } from '../_base';
import type {
  AnyBDomValue,
  BaseBDomAction,
  BDomAction,
  BDomValue,
  ItemFields,
} from '../../types';
import { type AnyValueCell } from '../../cells';
import { ItemResolveContext } from '../../common';
import { type AnyFunction, Objects } from '@framjet/common';
import { compile } from 'micromustache';
import { cell } from '@framjet/cell';

export interface StringTemplateBDomAction extends BaseBDomAction {
  readonly $$a: 'string.template';
  readonly template: string | BDomValue<string> | BDomAction;
  readonly variables?: Record<string, AnyBDomValue | BDomAction>;
}

export class StringTemplateBDomActionDefinition extends BaseBDomActionDefinition<StringTemplateBDomAction> {
  readonly name = 'StringTemplateBDomAction';
  readonly type = 'string.template';

  get fields(): ItemFields<StringTemplateBDomAction> {
    return {
      template: {
        typeName: 'string',
        optional: false,
        defaultValue: undefined,
        isArray: false,
        isObject: false,
        isRaw: 'dual',
        isRef: true,
        isReadOnly: true,
      },
      variables: {
        typeName: 'unknown',
        optional: true,
        defaultValue: undefined,
        isArray: false,
        isObject: true as any,
        isRaw: true,
        isReadOnly: true,
      },
    };
  }

  override resolveItem(
    context: ItemResolveContext<StringTemplateBDomAction>,
  ): AnyValueCell {
    const templateCell = context.getFieldValueCell('template') as AnyValueCell;
    const variablesCell = context.getFieldValueCell('variables');
    const templateFnCell = cell((get) => {
      try {
        const t = (get(templateCell) ?? '') as string | AnyFunction;
        let val: string;
        if (typeof t === 'function') {
          val = t();
        } else {
          val = t;
        }

        val = val.replace(/\\{/g, 'ƒ!ƒ').replace(/\\}/g, 'ƒ@ƒ');

        return compile(val, {
          tags: ['{', '}'],
        }).render;
      } catch (error) {
        return () => `StringTemplateBDomAction Error: ${error}`;
      }
    });

    return context.calculatedFunc((getter) => {
      const template = (getter(templateCell) ?? '') as string | AnyFunction;
      const variablesRaw =
        variablesCell !== undefined ? getter(variablesCell) : {};

      return (...args: unknown[]) => {
        const variables = Objects.fromEntries(
          Objects.entries(variablesRaw).map(([k, v]) => [
            k,
            typeof v === 'function' ? v(...args) : v,
          ]),
        );

        try {
          let val: string;
          if (typeof template === 'function') {
            val = template(...args);
          } else {
            val = template;
          }

          val = val.replace(/\\{/g, 'ƒ!_!ƒ').replace(/\\}/g, 'ƒ@_@ƒ');

          return compile(val, {
            tags: ['{', '}'],
          })
            .render({ vars: variables, args })
            .replace(/ƒ!_!ƒ/g, '{')
            .replace(/ƒ@_@ƒ/g, '}');
        } catch (error) {
          return `StringTemplateBDomAction Error: ${error}`;
        }
      };
    });
  }
}
