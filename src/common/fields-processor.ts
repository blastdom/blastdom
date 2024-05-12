import type { FieldSettings } from '../types';
import type { AnyStateCell } from '../cells';
import type { Path } from './path';
import type { BDomNodeState, StateRef } from '../state';
import { Objects } from '@framjet/common';

export class FieldsProcessor {
  static processField(
    fieldName: PropertyKey,
    fieldOptions: FieldSettings,
    fieldValue: unknown,
    fieldPath: Path,
    nodeStateRef: StateRef<BDomNodeState>,
  ): AnyStateCell {
    const schemaState = nodeStateRef.get().getSchemaState();

    if (fieldOptions.isRaw === true) {
      if (fieldOptions.isArray === true) {
        if (Objects.isType(fieldValue, 'array') === false) {
          if (fieldOptions.optional === false) {
            throw new Error(
              `Field at "${fieldPath.toStringPath()}" is not an array but ${typeof fieldValue}`,
            );
          }

          const defaultValue: unknown = fieldOptions.defaultValue;
          if (defaultValue === undefined) {
            return schemaState.processValue([], nodeStateRef, fieldPath);
          } else {
            if (Objects.isType(defaultValue, 'array') === false) {
              throw new Error(
                `Field at "${fieldPath.toStringPath()}" default value is not array but: ${typeof defaultValue}`,
              );
            }

            return schemaState.processValue(
              defaultValue,
              nodeStateRef,
              fieldPath,
            );
          }
        } else {
          return schemaState.processValue(
            fieldValue.map((item, index) =>
              schemaState.processValue(
                item,
                nodeStateRef,
                fieldPath.index(index),
              ),
            ),
            nodeStateRef,
            fieldPath,
          );
        }
      } else if (fieldOptions.isObject === true) {
        if (Objects.isType(fieldValue, 'object') === false) {
          if (fieldOptions.optional === false) {
            throw new Error(
              `Field at "${fieldPath.toStringPath()}" is not an object but ${typeof fieldValue}`,
            );
          }

          const defaultValue: unknown = fieldOptions.defaultValue;
          if (defaultValue === undefined) {
            return schemaState.processValue({}, nodeStateRef, fieldPath);
          } else {
            if (Objects.isType(defaultValue, 'object') === false) {
              throw new Error(
                `Field at "${fieldPath.toStringPath()}" default value is not object but: ${typeof defaultValue}`,
              );
            }

            return schemaState.processValue(
              defaultValue,
              nodeStateRef,
              fieldPath,
            );
          }
        } else {
          return schemaState.processValue(
            Objects.fromEntries(
              Objects.entries(fieldValue).map(([k, v]) => [
                k,
                schemaState.processValue(v, nodeStateRef, fieldPath.field(k)),
              ]),
            ),
            nodeStateRef,
            fieldPath,
          );
        }
      } else {
        if (Objects.isType(fieldValue, 'BDomAction')) {
          return schemaState.processValue(fieldValue, nodeStateRef, fieldPath);
        } else {
          if (fieldValue === undefined) {
            if (fieldOptions.optional === false) {
              throw new Error(
                `Field at "${fieldPath.toStringPath()}" is missing`,
              );
            }

            return schemaState.processValue(
              fieldOptions.defaultValue,
              nodeStateRef,
              fieldPath,
            );
          } else {
            return schemaState.processValue(
              fieldValue,
              nodeStateRef,
              fieldPath,
            );
          }
        }
      }
    } else if (fieldOptions.isRaw === false) {
      if (Objects.isType(fieldValue, 'BDomValue') === false) {
        if (fieldOptions.optional === false) {
          throw new Error(
            `Value "${fieldValue}" at "${fieldPath.toStringPath()}" is not an BDomValue`,
          );
        }

        return schemaState.processValue(
          fieldOptions.defaultValue,
          nodeStateRef,
          fieldPath,
        );
      } else {
        return schemaState.processValue(fieldValue, nodeStateRef, fieldPath);
      }
    } else {
      return schemaState.processValue(
        fieldValue,
        nodeStateRef,
        fieldPath,
        fieldOptions.isArray === 'dual',
      );
    }
  }

  static processFields(
    fields: Record<PropertyKey, unknown>,
    fieldsOptions: Record<PropertyKey, FieldSettings>,
    path: Path,
    nodeStateRef: StateRef<BDomNodeState>,
  ): Record<PropertyKey, AnyStateCell> {
    const fieldStateCells: Record<PropertyKey, AnyStateCell> = {};

    for (const [name, fieldOptions] of Objects.entries(fieldsOptions)) {
      fieldStateCells[name] = FieldsProcessor.processField(
        name,
        fieldOptions,
        fields[name],
        path.field(name),
        nodeStateRef,
      );
    }

    return fieldStateCells;
  }
}
