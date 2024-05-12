import { Objects, WeakValueMap } from '@framjet/common';
import type {
  AnyBDomComponent,
  AnyBDomComponentProvider,
  BDomComponentProvider,
  RemoteComponentProvider,
} from '../types';
import type { Wakeable } from '../types/_react';

export class BDomComponentRegistry {
  static readonly #providers = new Map<string, AnyBDomComponentProvider>();
  static readonly #components = new Map<string, () => AnyBDomComponent>();
  static readonly #componentsCache = new WeakValueMap<
    string,
    AnyBDomComponent
  >();

  static #loaded = false;

  static readonly #pendingRemoteProviders = new Set<Wakeable>();

  static registerRemoteProvider(
    provider: () => RemoteComponentProvider,
  ): typeof BDomComponentRegistry {
    const promise = provider();
    this.#pendingRemoteProviders.add(promise);

    promise
      .then(
        (module) => BDomComponentRegistry.registerProvider(module.default),
        (err: Error) => {
          console.error(
            `BDomComponentRegistry: Failed to load remote BDomComponentProvider with error: ${err.message}`,
            err,
          );
        },
      )
      .finally(() => {
        this.#pendingRemoteProviders.delete(promise);
      });

    return this;
  }

  static async registerProvider<TNames extends string>(
    provider: BDomComponentProvider<TNames>,
  ): Promise<void> {
    const name = provider.name;
    if (BDomComponentRegistry.#providers.has(name)) {
      throw new Error(
        `BDomComponentProvider with name "${name}" already registered by "${BDomComponentRegistry.#providers.get(name)}"`,
      );
    }

    BDomComponentRegistry.#providers.set(provider.name, provider);

    Objects.entries(provider.components ?? {}).forEach(([name, comp]) =>
      BDomComponentRegistry.registerLazy(name, comp),
    );

    await BDomComponentRegistry.wait();
  }

  static async wait() {
    await Promise.allSettled(
      BDomComponentRegistry.#pendingRemoteProviders.values(),
    );
  }

  static waitReact() {
    if (BDomComponentRegistry.#loaded === true) {
      return;
    }

    const promise = BDomComponentRegistry.wait().finally(() => {
      BDomComponentRegistry.#loaded = true;
    });

    if ((BDomComponentRegistry.#loaded as boolean) === true) {
      return;
    }

    throw promise;
  }

  static register(
    name: string,
    component: () => AnyBDomComponent,
  ): typeof BDomComponentRegistry {
    if (BDomComponentRegistry.#components.has(name)) {
      throw new Error(
        `Component definition ${name} already registered by "${BDomComponentRegistry.#components.get(name)}"`,
      );
    }

    BDomComponentRegistry.#components.set(name, component);

    return this;
  }

  static registerLazy(
    name: string,
    component: (() => Promise<{ default: AnyBDomComponent }>) | string,
  ): typeof BDomComponentRegistry {
    if (BDomComponentRegistry.#components.has(name)) {
      throw new Error(
        `Component definition ${name} already registered by "${BDomComponentRegistry.#components.get(name)}"`,
      );
    }

    if (typeof component === 'string') {
      return BDomComponentRegistry.registerLazy(name, () => import(component));
    }

    const promise = component();

    promise
      .then(
        (module) => {
          BDomComponentRegistry.register(name, () => module.default);
        },
        (err: Error) => {
          console.error(
            `BDomComponentRegistry: Failed to load remote BDomComponent with error: ${err.message}`,
            err,
          );
        },
      )
      .finally(() => {
        BDomComponentRegistry.#pendingRemoteProviders.delete(promise);
      });

    BDomComponentRegistry.#pendingRemoteProviders.add(promise);

    return this;
  }

  static registerAll(
    ...valueDefinitions: [string, () => AnyBDomComponent][]
  ): typeof BDomComponentRegistry {
    valueDefinitions.forEach(([name, comp]) => this.register(name, comp));

    return this;
  }

  static getComponent(name: string): AnyBDomComponent {
    let component = BDomComponentRegistry.#componentsCache.get(name);

    if (component === undefined) {
      const componentDef = BDomComponentRegistry.#components.get(name);

      if (componentDef === undefined) {
        throw new Error(`BDomComponent "${name}" does not exist`);
      }

      component = componentDef();

      BDomComponentRegistry.#componentsCache.set(name, component);
    }

    return component;
  }

  static preload(name?: string): void {
    const preloadInner = () => {
      if (name === undefined) {
        for (const n of BDomComponentRegistry.#components.keys()) {
          BDomComponentRegistry.preload(n);
        }
      } else {
        const c = BDomComponentRegistry.getComponent(name);
        if (c === undefined) {
          throw new Error(`BDomComponent "${name}" does not exist`);
        }

        try {
          c._init(c._payload);
        } catch (e: any) {
          if ('then' in e === false) {
            throw e;
          }
        }
      }
    };

    if (BDomComponentRegistry.#pendingRemoteProviders.size > 0) {
      Promise.all(BDomComponentRegistry.#pendingRemoteProviders.values()).then(
        () => preloadInner(),
      );
    } else {
      preloadInner();
    }
  }
}
