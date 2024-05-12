import type { BDomComponentLoaders } from './component';

export interface BDomComponentProvider<TNames extends string = string> {
  readonly name: string;

  readonly description?: string;

  readonly version: string;

  readonly author?: string;

  readonly url?: string;

  readonly source?: string;

  readonly components: BDomComponentLoaders<TNames>;
}

export type AnyBDomComponentProvider = BDomComponentProvider<string>;

export type RemoteComponentProvider = Promise<{
  default: AnyBDomComponentProvider;
}>;
