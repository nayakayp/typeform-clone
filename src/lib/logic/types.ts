// Logic operator types
export type LogicOperator =
  | "equals"
  | "not_equals"
  | "contains"
  | "not_contains"
  | "starts_with"
  | "ends_with"
  | "greater_than"
  | "less_than"
  | "greater_or_equal"
  | "less_or_equal"
  | "is_empty"
  | "is_not_empty"
  | "is_answered"
  | "is_not_answered";

// Logic condition
export interface LogicCondition {
  field: string; // questionId or variable name
  operator: LogicOperator;
  value?: unknown;
}

// Skip logic action type
export type SkipLogicActionType = "jump_to" | "end_form";

export interface SkipLogicAction {
  type: SkipLogicActionType;
  targetQuestionId?: string;
}

// Skip logic (Jump to question)
export interface SkipLogic {
  questionId: string;
  conditions: LogicCondition[];
  operator: "and" | "or";
  action: SkipLogicAction;
}

// Visibility logic (Show/Hide)
export interface VisibilityLogic {
  questionId: string;
  showIf: LogicCondition[];
  operator: "and" | "or";
}

// Calculator/Score feature
export interface Calculator {
  id: string;
  formId: string;
  name: string;
  type: "score" | "sum" | "average" | "custom";
  variables: CalculatorVariable[];
  formula?: string; // For custom calculations
}

export interface CalculatorVariable {
  questionId: string;
  optionScores?: Record<string, number>; // Option ID -> score
  defaultValue?: number;
}

// Hidden fields
export interface HiddenField {
  id: string;
  name: string;
  source: "url_param" | "static" | "calculated";
  value?: string;
  urlParamName?: string;
}

// Answer piping token
export interface PipingToken {
  type: "question" | "variable" | "hidden_field" | "calculator";
  id: string;
  format?: "default" | "uppercase" | "lowercase" | "capitalize";
}

// Logic action types
export type LogicActionType = "jump_to" | "end_form" | "show" | "hide";

export interface LogicAction {
  type: LogicActionType;
  targetQuestionId?: string;
}

// Operator metadata for UI
export interface OperatorMeta {
  label: string;
  requiresValue: boolean;
  valueType?: "text" | "number" | "date" | "boolean" | "select";
  applicableTypes: string[]; // Question types this operator applies to
}

// Question type groups for operators
export const OPERATOR_QUESTION_TYPES = {
  text: ["short_text", "long_text", "email", "phone", "url"],
  number: ["number", "rating", "opinion_scale", "nps"],
  date: ["date", "time"],
  selection: [
    "multiple_choice",
    "checkboxes",
    "dropdown",
    "picture_choice",
    "yes_no",
  ],
  all: ["*"],
} as const;

// Operator metadata for display
export const OPERATOR_META: Record<LogicOperator, OperatorMeta> = {
  equals: {
    label: "equals",
    requiresValue: true,
    valueType: "text",
    applicableTypes: ["*"],
  },
  not_equals: {
    label: "does not equal",
    requiresValue: true,
    valueType: "text",
    applicableTypes: ["*"],
  },
  contains: {
    label: "contains",
    requiresValue: true,
    valueType: "text",
    applicableTypes: [...OPERATOR_QUESTION_TYPES.text],
  },
  not_contains: {
    label: "does not contain",
    requiresValue: true,
    valueType: "text",
    applicableTypes: [...OPERATOR_QUESTION_TYPES.text],
  },
  starts_with: {
    label: "starts with",
    requiresValue: true,
    valueType: "text",
    applicableTypes: [...OPERATOR_QUESTION_TYPES.text],
  },
  ends_with: {
    label: "ends with",
    requiresValue: true,
    valueType: "text",
    applicableTypes: [...OPERATOR_QUESTION_TYPES.text],
  },
  greater_than: {
    label: "is greater than",
    requiresValue: true,
    valueType: "number",
    applicableTypes: [...OPERATOR_QUESTION_TYPES.number],
  },
  less_than: {
    label: "is less than",
    requiresValue: true,
    valueType: "number",
    applicableTypes: [...OPERATOR_QUESTION_TYPES.number],
  },
  greater_or_equal: {
    label: "is greater than or equal to",
    requiresValue: true,
    valueType: "number",
    applicableTypes: [...OPERATOR_QUESTION_TYPES.number],
  },
  less_or_equal: {
    label: "is less than or equal to",
    requiresValue: true,
    valueType: "number",
    applicableTypes: [...OPERATOR_QUESTION_TYPES.number],
  },
  is_empty: {
    label: "is empty",
    requiresValue: false,
    applicableTypes: ["*"],
  },
  is_not_empty: {
    label: "is not empty",
    requiresValue: false,
    applicableTypes: ["*"],
  },
  is_answered: {
    label: "is answered",
    requiresValue: false,
    applicableTypes: ["*"],
  },
  is_not_answered: {
    label: "is not answered",
    requiresValue: false,
    applicableTypes: ["*"],
  },
};

// Get applicable operators for a question type
export function getApplicableOperators(questionType: string): LogicOperator[] {
  return Object.entries(OPERATOR_META)
    .filter(([_, meta]) => {
      return (
        meta.applicableTypes.includes("*") ||
        meta.applicableTypes.includes(questionType)
      );
    })
    .map(([operator]) => operator as LogicOperator);
}

// Extended form types with logic
export interface FormWithLogic {
  id: string;
  calculators?: Calculator[];
  hiddenFields?: HiddenField[];
}

// Logic validation result
export interface LogicValidationResult {
  valid: boolean;
  errors: LogicValidationError[];
  warnings: LogicValidationWarning[];
}

export interface LogicValidationError {
  type: "circular_reference" | "invalid_target" | "missing_condition";
  questionId: string;
  message: string;
}

export interface LogicValidationWarning {
  type: "unreachable_question" | "conflicting_logic" | "incomplete_coverage";
  questionId?: string;
  message: string;
}
