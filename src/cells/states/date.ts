import { cell, Cell } from '@framjet/cell';
import { SimpleValueCell } from './simple';
import { format as dateFnsFormat } from 'date-fns';
import type { FormatOptions } from 'date-fns/format';

export class DateValueCell extends SimpleValueCell<Date> {
  format(template: string, options?: FormatOptions): Cell<string> {
    return cell((get) => {
      return dateFnsFormat(get(this), template, options);
    });
  }
}
