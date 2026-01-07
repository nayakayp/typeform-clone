import type { LogicCondition, LogicOperator } from "./types";

/**
 * Evaluates a single logic condition against a value
 */
export function evaluateCondition(
  condition: LogicCondition,
  value: unknown
): boolean {
  const { operator, value: conditionValue } = condition;

  // Handle answered/not answered operators
  if (operator === "is_answered") {
    return value !== undefined && value !== null && value !== "";
  }

  if (operator === "is_not_answered") {
    return value === undefined || value === null || value === "";
  }

  // Handle empty/not empty operators
  if (operator === "is_empty") {
    if (typeof value === "string") return value.trim() === "";
    if (Array.isArray(value)) return value.length === 0;
    return value === undefined || value === null;
  }

  if (operator === "is_not_empty") {
    if (typeof value === "string") return value.trim() !== "";
    if (Array.isArray(value)) return value.length > 0;
    return value !== undefined && value !== null;
  }

  // For other operators, value must be answered
  if (value === undefined || value === null) {
    return false;
  }

  // Evaluate based on operator
  switch (operator) {
    case "equals":
      return normalizeValue(value) === normalizeValue(conditionValue);

    case "not_equals":
      return normalizeValue(value) !== normalizeValue(conditionValue);

    case "contains":
      return String(value)
        .toLowerCase()
        .includes(String(conditionValue).toLowerCase());

    case "not_contains":
      return !String(value)
        .toLowerCase()
        .includes(String(conditionValue).toLowerCase());

    case "starts_with":
      return String(value)
        .toLowerCase()
        .startsWith(String(conditionValue).toLowerCase());

    case "ends_with":
      return String(value)
        .toLowerCase()
        .endsWith(String(conditionValue).toLowerCase());

    case "greater_than":
      return Number(value) > Number(conditionValue);

    case "less_than":
      return Number(value) < Number(conditionValue);

    case "greater_or_equal":
      return Number(value) >= Number(conditionValue);

    case "less_or_equal":
      return Number(value) <= Number(conditionValue);

    default:
      console.warn(`Unknown operator: ${operator}`);
      return false;
  }
}

/**
 * Evaluates multiple conditions with AND/OR logic
 */
export function evaluateConditions(
  conditions: LogicCondition[],
  operator: "and" | "or",
  responses: Record<string, unknown>
): boolean {
  if (!conditions || conditions.length === 0) {
    return true;
  }

  const results = conditions.map((condition) => {
    const value = responses[condition.field];
    return evaluateCondition(condition, value);
  });

  if (operator === "and") {
    return results.every((result) => result === true);
  } else {
    return results.some((result) => result === true);
  }
}

/**
 * Normalize values for comparison
 */
function normalizeValue(value: unknown): unknown {
  if (typeof value === "string") {
    return value.trim().toLowerCase();
  }
  if (typeof value === "number") {
    return value;
  }
  if (typeof value === "boolean") {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map(normalizeValue);
  }
  return value;
}

/**
 * Check if operator requires a value
 */
export function operatorRequiresValue(operator: LogicOperator): boolean {
  return ![
    "is_empty",
    "is_not_empty",
    "is_answered",
    "is_not_answered",
  ].includes(operator);
}

/**
 * Get default value for an operator based on its type
 */
export function getDefaultValueForOperator(operator: LogicOperator): unknown {
  if (!operatorRequiresValue(operator)) {
    return undefined;
  }

  if (
    ["greater_than", "less_than", "greater_or_equal", "less_or_equal"].includes(
      operator
    )
  ) {
    return 0;
  }

  return "";
}

/**
 * Validate a logic condition
 */
export function validateCondition(condition: LogicCondition): {
  valid: boolean;
  error?: string;
} {
  if (!condition.field) {
    return { valid: false, error: "Field is required" };
  }

  if (!condition.operator) {
    return { valid: false, error: "Operator is required" };
  }

  if (operatorRequiresValue(condition.operator)) {
    if (condition.value === undefined || condition.value === null) {
      return { valid: false, error: "Value is required for this operator" };
    }

    // Additional validation for number operators
    if (
      [
        "greater_than",
        "less_than",
        "greater_or_equal",
        "less_or_equal",
      ].includes(condition.operator)
    ) {
      if (isNaN(Number(condition.value))) {
        return { valid: false, error: "Value must be a number" };
      }
    }
  }

  return { valid: true };
}
