import type { Circle, Line } from "@/shapes/types"

export type GNode = {
  id: string,
  label: string,
  x: number,
  y: number,
}

export type GEdge = {
  id: string,
  to: string,
  from: string,
}

/*
  @template T - the type of the value
  @template K - the type of the arguments
*/
export type MaybeGetter<T, K extends any[] = []> = T | ((...arg: K) => T)

export type NodeGetterOrValue<T> = MaybeGetter<T, [GNode]>
export type EdgeGetterOrValue<T> = MaybeGetter<T, [GEdge]>

type EventNames = keyof HTMLElementEventMap

type FilterEventNames<T> = {
  [K in EventNames]: HTMLElementEventMap[K] extends T ? K : never
}[EventNames]

type MouseEventNames = FilterEventNames<MouseEvent>
type KeyboardEventNames = FilterEventNames<KeyboardEvent>

type EventMap<T extends EventNames, E> = Record<T, (ev: E) => void>

export type MouseEventMap = EventMap<MouseEventNames, MouseEvent>
export type KeyboardEventMap = EventMap<KeyboardEventNames, KeyboardEvent>

export type MouseEventEntries = [keyof MouseEventMap, (ev: MouseEvent) => void][]
export type KeyboardEventEntries = [keyof KeyboardEventMap, (ev: KeyboardEvent) => void][]

type SharedSchemaItemFields = {
  id: string,
  graphType: string,
  priority: number,
}

type CircleSchemaItem = SharedSchemaItemFields & {
  schemaType: 'circle',
  schema: Circle,
}

type LineSchemaItem = SharedSchemaItemFields & {
  schemaType: 'line',
  schema: Line,
}

export type SchemaItem = CircleSchemaItem | LineSchemaItem