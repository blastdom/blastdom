import * as React from 'react';
import type { LazyComponent, Payload } from './_react';

export interface BDomReactIgnoredProps {
  children: true;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyReactComponent = React.ComponentType<any>;
export type ReactProps<T extends AnyReactComponent> = Omit<
  React.ComponentProps<T>,
  keyof BDomReactIgnoredProps
>;

export type BDomComponentProperty<
  TComponent extends AnyReactComponent,
  TName extends keyof ReactProps<TComponent>,
  TValue extends React.ComponentProps<TComponent>[TName],
> = {
  name: TName;
  /**
   * To be used instead of the property name for UI purposes in the editor.
   */
  label?: string;
  /**
   * A description of the property, to be used to supply extra information to the user.
   */
  description?: string;
  /**
   * Should this property be display in common properties
   */
  common?: boolean;
  /**
   * Describes the type of the values this property can accept.
   */
  typeDefinition?: string;
  /**
   * The control to be used to manipulate values for this property from the editor.
   */
  control?: string;
  /**
   * A default value for the property.
   */
  defaultValue?: ((props: ReactProps<TComponent>) => TValue) | TValue;
  /**
   * For compound components, this property is used to control the visibility of this property based on the selected value of another property.
   * If this property is not defined, the property will be visible at all times.
   * @param {ReactProps} props all the prop bindings of the component
   * @returns {boolean} a boolean value indicating whether the property should be visible or not
   */
  visible?: ((props: ReactProps<TComponent>) => boolean) | boolean;
  /**
   * A function that parses a given value and returns the parsed value.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  valueParser?: (value: any) => TValue;
};

export type BDomComponentProperties<TComponent extends AnyReactComponent> = {
  [K in keyof ReactProps<TComponent>]?: BDomComponentProperty<
    TComponent,
    K,
    ReactProps<TComponent>[K]
  >;
};

export interface BDomComponent<
  TComponent extends AnyReactComponent,
  TName extends string,
  TProps extends BDomComponentProperties<TComponent>,
  P extends Payload<TComponent>,
> extends LazyComponent<TComponent, P> {
  _BDomName: TName;
  _BDomProps: TProps;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyBDomComponent = BDomComponent<any, any, any, any>;

export type BDomComponentLoader<
  TComponent extends AnyReactComponent,
  TName extends string,
> = () => Promise<{
  default: BDomComponent<
    TComponent,
    TName,
    BDomComponentProperties<TComponent>,
    Payload<TComponent>
  >;
}>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyBDomComponentLoader = BDomComponentLoader<any, any>;

export type BDomComponentLoaders<T extends string> = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [K in T]: BDomComponentLoader<any, K> | string;
};
