export const BDomItemTypeField: unique symbol = Symbol.for('_BDomItemTypeField');
export const BDomItemTypeIgnoreFields: unique symbol = Symbol.for(
  '_BDomItemTypeIgnoreFields',
);

export interface BaseBDomItem<TField extends PropertyKey> {
  readonly id?: string;
  readonly [BDomItemTypeField]?: TField;
}

export interface BaseProcessedBDomItem<
  TField extends PropertyKey,
  TIgnoreFields extends PropertyKey,
> extends BaseBDomItem<TField> {
  readonly [BDomItemTypeIgnoreFields]?: TIgnoreFields;
}
