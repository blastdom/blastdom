import { StateRef } from './ref';
import { BaseObject } from '../common/base-object';

export abstract class BaseStateObject extends BaseObject {
  createRef(): StateRef<this> {
    return new StateRef(this);
  }
}
