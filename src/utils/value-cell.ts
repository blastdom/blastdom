import { Path } from '../common';
import { BaseValueCell, ValueToStateCell } from '../cells/states/_base';
import { type AnyFunction, Objects } from '@framjet/common';
import { BDomNodeState, BDomSchemaState, StateRef } from '../state';
import { StringValueCell } from '../cells/states/string';
import { NumberValueCell } from '../cells/states/number';
import { BooleanValueCell } from '../cells/states/boolean';
import { ArrayValueCell } from '../cells/states/array';
import { FunctionValueCell } from '../cells/states/function';
import { BigIntValueCell } from '../cells/states/bigint';
import { SimpleValueCell } from '../cells/states/simple';
import { ObjectValueCell } from '../cells/states/object';
import { DateValueCell } from '../cells/states/date';
import { BaseStateCell } from '../cells/state-cell';
import { AnyValueStateCell, ValueStateCell } from '../cells/value-state-cell';

function valueCellInner<T>(
  value: T,
  path: Path,
  nodeStateRef: StateRef<BDomNodeState>,
  schemaState: BDomSchemaState,
): ValueToStateCell<T> {
  if (value instanceof BaseValueCell) {
    return value as ValueToStateCell<T>;
  }

  if (Objects.isType(value, 'string')) {
    return new StringValueCell(
      value,
      path,
      nodeStateRef,
      schemaState,
    ) as ValueToStateCell<T>;
  }

  if (Objects.isType(value, 'number')) {
    return new NumberValueCell(
      value,
      path,
      nodeStateRef,
      schemaState,
    ) as ValueToStateCell<T>;
  }

  if (Objects.isType(value, 'boolean')) {
    return new BooleanValueCell(
      value,
      path,
      nodeStateRef,
      schemaState,
    ) as ValueToStateCell<T>;
  }

  if (Objects.isType(value, 'array')) {
    return new ArrayValueCell(
      value.map((item, index) => {
        return valueCell(item, path.index(index), nodeStateRef, schemaState);
      }),
      path,
      nodeStateRef,
      schemaState,
    ) as ValueToStateCell<T>;
  }

  if (Objects.isType(value, 'Function')) {
    return new FunctionValueCell(
      value as AnyFunction,
      path,
      nodeStateRef,
      schemaState,
    ) as ValueToStateCell<T>;
  }

  if (Objects.isType(value, 'object')) {
    return new ObjectValueCell(
      Objects.fromEntries(
        Objects.entries(value).map(([k, v]) => [
          k,
          valueCell(v, path.field(k), nodeStateRef, schemaState),
        ]),
      ),
      path,
      nodeStateRef,
      schemaState,
    ) as unknown as ValueToStateCell<T>;
  }

  if (Objects.isType(value, 'Date')) {
    return new DateValueCell(
      value,
      path,
      nodeStateRef,
      schemaState,
    ) as ValueToStateCell<T>;
  }

  if (Objects.isType(value, 'bigint')) {
    return new BigIntValueCell(
      value,
      path,
      nodeStateRef,
      schemaState,
    ) as ValueToStateCell<T>;
  }

  return new SimpleValueCell(
    value,
    path,
    nodeStateRef,
    schemaState,
  ) as ValueToStateCell<T>;
}

export function valueCell<T>(
  value: T,
  path: Path,
  nodeStateRef: StateRef<BDomNodeState>,
  schemaState: BDomSchemaState,
  isDualArray = false,
): AnyValueStateCell {
  if (value instanceof BaseStateCell) {
    return value;
  }

  const valueCell = valueCellInner(value, path, nodeStateRef, schemaState);
  const valueStateCell = new ValueStateCell(valueCell, nodeStateRef, path);

  if (isDualArray && valueCell instanceof ArrayValueCell === false) {
    return new ValueStateCell(
      new ArrayValueCell([valueStateCell], path, nodeStateRef, schemaState),
      nodeStateRef,
      path,
    );
  }

  return valueStateCell;
}
