import {
  ADVISOR_IDS,
  RESOURCE_KEYS,
  TRACK_KEYS,
} from "./types";

export type UnknownRecord = Record<string, unknown>;

export function isRecord(value: unknown): value is UnknownRecord {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function isString(value: unknown): value is string {
  return typeof value === "string";
}

export function isNonEmptyString(value: unknown): value is string {
  return isString(value) && value.length > 0;
}

export function isNullableString(value: unknown): value is string | null {
  return value === null || isString(value);
}

export function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

export function isInteger(
  value: unknown,
  min = Number.MIN_SAFE_INTEGER,
): value is number {
  return Number.isInteger(value) && Number(value) >= min;
}

export function isMeter(value: unknown): value is number {
  return isFiniteNumber(value) && value >= 0 && value <= 100;
}

export function isBoolean(value: unknown): value is boolean {
  return typeof value === "boolean";
}

export function isOneOf<T extends readonly string[]>(
  value: unknown,
  values: T,
): value is T[number] {
  return isString(value) && values.includes(value);
}

export function isStringArray(
  value: unknown,
  check: (item: string) => boolean = () => true,
): value is string[] {
  return Array.isArray(value)
    && value.every((item) => isString(item) && check(item));
}

export function hasRecordKeys(
  value: unknown,
  keys: readonly string[],
  check: (item: unknown) => boolean,
): value is UnknownRecord {
  return isRecord(value) && keys.every((key) => key in value && check(value[key]));
}

export function isResourcePool(value: unknown, deposited = false): boolean {
  return hasRecordKeys(
    value,
    RESOURCE_KEYS,
    deposited
      ? (item) => isFiniteNumber(item) && item >= 0
      : isMeter,
  );
}

export function isPressurePool(value: unknown): boolean {
  return hasRecordKeys(value, ["stress", "panic"], isMeter);
}

export function isTrackPool(value: unknown): boolean {
  return hasRecordKeys(value, TRACK_KEYS, isMeter);
}

export function isAdvisorState(value: unknown): boolean {
  return isRecord(value)
    && isMeter(value.loyalty)
    && isMeter(value.alignment)
    && isMeter(value.leverage)
    && isMeter(value.competence)
    && isBoolean(value.active);
}

export function isAdvisorRecord(
  value: unknown,
  check = isAdvisorState,
): boolean {
  return hasRecordKeys(value, ADVISOR_IDS, check);
}
