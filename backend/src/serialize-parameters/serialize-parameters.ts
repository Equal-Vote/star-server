import { ColumnDataType, RawBuilder, sql } from 'kysely'

export type Caster = (
  serializedValue: unknown,
  value: unknown
) => RawBuilder<unknown>
export type Serializer = (parameter: unknown) => unknown

export const createDefaultPostgresCaster: (castTo: ColumnDataType) => Caster =
  (castTo = 'jsonb') =>
  (serializedValue) =>
    sql`${serializedValue}::${sql.raw(castTo)}`

export const defaultSerializer: Serializer = (parameter) => {
  if (parameter && typeof parameter === 'object') {
    return JSON.stringify(parameter)
  }

  return parameter
}