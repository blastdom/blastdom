import { Strings } from '@framjet/common';
import { FramJetLogger } from '@framjet/logger';

type LoggerApi = ReturnType<(typeof FramJetLogger)['createLogger']>;

type LoggerCreator<T extends BaseObject> = (obj: T) => LoggerApi;

function createLogger<T extends BaseObject>(obj: T): LoggerApi {
  return FramJetLogger.createLogger(
    `framjet.bdom.${Strings.dotCase(obj.constructor.name)}`,
  );
}

export function setLoggerCreator(loggerCreator: LoggerCreator<BaseObject>) {
  // @ts-expect-error TS2445
  BaseObject.setLoggerCreator(loggerCreator);
}

export abstract class BaseObject {
  static #loggerCreator: LoggerCreator<BaseObject> = createLogger;

  readonly #logger = BaseObject.#loggerCreator(this);

  protected getLogger() {
    return this.#logger;
  }

  protected static setLoggerCreator(loggerCreator: LoggerCreator<BaseObject>) {
    this.#loggerCreator = loggerCreator;
  }
}
