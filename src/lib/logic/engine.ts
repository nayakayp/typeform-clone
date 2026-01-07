import type {
  SkipLogic,
  VisibilityLogic,
  Calculator,
  CalculatorVariable,
  HiddenField,
  PipingToken,
  LogicValidationResult,
  LogicValidationError,
  LogicValidationWarning,
} from "./types";
import { evaluateConditions } from "./operators";
import type { BuilderQuestion } from "@/types/builder";

/**
 * Answer data structure for responses
 */
export interface AnswerData {
  questionId: string;
  value: unknown;
  displayValue?: string;
}

/**
 * Logic evaluation context
 */
export interface LogicContext {
  responses: Record<string, unknown>;
  hiddenFields: Record<string, string>;
  calculatorValues: Record<string, number>;
  urlParams: Record<string, string>;
}

/**
 * LogicEngine - Evaluates form logic and determines question flow
 */
export class LogicEngine {
  private questions: BuilderQuestion[];
  private skipLogicRules: SkipLogic[];
  private visibilityRules: VisibilityLogic[];
  private calculators: Calculator[];
  private hiddenFields: HiddenField[];
  private context: LogicContext;

  constructor(config: {
    questions: BuilderQuestion[];
    skipLogicRules?: SkipLogic[];
    visibilityRules?: VisibilityLogic[];
    calculators?: Calculator[];
    hiddenFields?: HiddenField[];
    initialContext?: Partial<LogicContext>;
  }) {
    this.questions = config.questions;
    this.skipLogicRules = config.skipLogicRules || [];
    this.visibilityRules = config.visibilityRules || [];
    this.calculators = config.calculators || [];
    this.hiddenFields = config.hiddenFields || [];
    this.context = {
      responses: {},
      hiddenFields: {},
      calculatorValues: {},
      urlParams: {},
      ...config.initialContext,
    };

    // Initialize hidden fields from URL params
    this.initializeHiddenFields();
  }

  /**
   * Initialize hidden fields from URL parameters
   */
  private initializeHiddenFields(): void {
    for (const field of this.hiddenFields) {
      if (field.source === "url_param" && field.urlParamName) {
        const value = this.context.urlParams[field.urlParamName];
        if (value !== undefined) {
          this.context.hiddenFields[field.id] = value;
        }
      } else if (field.source === "static" && field.value !== undefined) {
        this.context.hiddenFields[field.id] = field.value;
      }
    }
  }

  /**
   * Update responses in context
   */
  updateResponses(responses: Record<string, unknown>): void {
    this.context.responses = { ...this.context.responses, ...responses };
    // Recalculate calculators when responses change
    this.recalculateAll();
  }

  /**
   * Set a single response value
   */
  setResponse(questionId: string, value: unknown): void {
    this.context.responses[questionId] = value;
    this.recalculateAll();
  }

  /**
   * Get current context
   */
  getContext(): LogicContext {
    return { ...this.context };
  }

  /**
   * Evaluate if a question is visible based on visibility rules
   */
  isQuestionVisible(questionId: string): boolean {
    const visibilityRule = this.visibilityRules.find(
      (rule) => rule.questionId === questionId
    );

    // If no visibility rule, question is visible by default
    if (!visibilityRule || visibilityRule.showIf.length === 0) {
      return true;
    }

    return evaluateConditions(
      visibilityRule.showIf,
      visibilityRule.operator,
      this.context.responses
    );
  }

  /**
   * Get all visible questions in order
   */
  getVisibleQuestions(): BuilderQuestion[] {
    return this.questions
      .filter((question) => this.isQuestionVisible(question.id))
      .sort((a, b) => a.order - b.order);
  }

  /**
   * Get the next question based on skip logic
   */
  getNextQuestion(currentQuestionId: string): BuilderQuestion | null {
    const currentQuestion = this.questions.find(
      (q) => q.id === currentQuestionId
    );
    if (!currentQuestion) return null;

    // Check skip logic rules for this question
    const skipRule = this.skipLogicRules.find(
      (rule) => rule.questionId === currentQuestionId
    );

    if (skipRule && skipRule.conditions.length > 0) {
      const conditionsMet = evaluateConditions(
        skipRule.conditions,
        skipRule.operator,
        this.context.responses
      );

      if (conditionsMet) {
        if (skipRule.action.type === "end_form") {
          return null; // End the form
        }

        if (
          skipRule.action.type === "jump_to" &&
          skipRule.action.targetQuestionId
        ) {
          const targetQuestion = this.questions.find(
            (q) => q.id === skipRule.action.targetQuestionId
          );
          if (targetQuestion && this.isQuestionVisible(targetQuestion.id)) {
            return targetQuestion;
          }
        }
      }
    }

    // Default: get next visible question in order
    const visibleQuestions = this.getVisibleQuestions();
    const currentIndex = visibleQuestions.findIndex(
      (q) => q.id === currentQuestionId
    );

    if (currentIndex === -1 || currentIndex >= visibleQuestions.length - 1) {
      return null;
    }

    return visibleQuestions[currentIndex + 1];
  }

  /**
   * Get the previous question
   */
  getPreviousQuestion(currentQuestionId: string): BuilderQuestion | null {
    const visibleQuestions = this.getVisibleQuestions();
    const currentIndex = visibleQuestions.findIndex(
      (q) => q.id === currentQuestionId
    );

    if (currentIndex <= 0) {
      return null;
    }

    return visibleQuestions[currentIndex - 1];
  }

  /**
   * Calculate a calculator value
   */
  calculateValue(calculator: Calculator): number {
    let result = 0;

    switch (calculator.type) {
      case "sum":
        result = this.calculateSum(calculator.variables);
        break;
      case "average":
        result = this.calculateAverage(calculator.variables);
        break;
      case "score":
        result = this.calculateScore(calculator.variables);
        break;
      case "custom":
        result = this.evaluateFormula(
          calculator.formula || "0",
          calculator.variables
        );
        break;
    }

    return result;
  }

  /**
   * Calculate sum of variable values
   */
  private calculateSum(variables: CalculatorVariable[]): number {
    return variables.reduce((sum, variable) => {
      const value = this.getVariableValue(variable);
      return sum + (isNaN(value) ? 0 : value);
    }, 0);
  }

  /**
   * Calculate average of variable values
   */
  private calculateAverage(variables: CalculatorVariable[]): number {
    if (variables.length === 0) return 0;
    return this.calculateSum(variables) / variables.length;
  }

  /**
   * Calculate score based on option scores
   */
  private calculateScore(variables: CalculatorVariable[]): number {
    return variables.reduce((score, variable) => {
      const response = this.context.responses[variable.questionId];
      if (
        response === undefined ||
        response === null ||
        !variable.optionScores
      ) {
        return score + (variable.defaultValue || 0);
      }

      // Handle array responses (checkboxes)
      if (Array.isArray(response)) {
        return (
          score +
          response.reduce((s, optionId) => {
            return s + (variable.optionScores?.[optionId] || 0);
          }, 0)
        );
      }

      // Handle single selection
      const optionScore = variable.optionScores[String(response)];
      return score + (optionScore !== undefined ? optionScore : 0);
    }, 0);
  }

  /**
   * Get value for a calculator variable
   */
  private getVariableValue(variable: CalculatorVariable): number {
    const response = this.context.responses[variable.questionId];

    if (response === undefined || response === null) {
      return variable.defaultValue || 0;
    }

    if (typeof response === "number") {
      return response;
    }

    if (typeof response === "string") {
      const parsed = parseFloat(response);
      return isNaN(parsed) ? variable.defaultValue || 0 : parsed;
    }

    return variable.defaultValue || 0;
  }

  /**
   * Evaluate a custom formula
   */
  private evaluateFormula(
    formula: string,
    variables: CalculatorVariable[]
  ): number {
    // Create a map of variable values
    const varMap: Record<string, number> = {};
    variables.forEach((v) => {
      varMap[v.questionId] = this.getVariableValue(v);
    });

    // Replace variable references in formula
    let evaluatedFormula = formula;
    for (const [key, value] of Object.entries(varMap)) {
      evaluatedFormula = evaluatedFormula.replace(
        new RegExp(`\\{${key}\\}`, "g"),
        String(value)
      );
    }

    // Safely evaluate the formula (only basic math operations)
    try {
      // Only allow numbers, operators, parentheses, and spaces
      if (!/^[\d\s+\-*/().]+$/.test(evaluatedFormula)) {
        console.warn("Invalid formula characters:", evaluatedFormula);
        return 0;
      }
      // Using Function to evaluate simple math expression
      return new Function(`return (${evaluatedFormula})`)() as number;
    } catch (error) {
      console.error("Formula evaluation error:", error);
      return 0;
    }
  }

  /**
   * Recalculate all calculator values
   */
  private recalculateAll(): void {
    for (const calculator of this.calculators) {
      this.context.calculatorValues[calculator.id] =
        this.calculateValue(calculator);
    }

    // Update calculated hidden fields
    for (const field of this.hiddenFields) {
      if (field.source === "calculated") {
        // Field value might reference a calculator
        const calculatorId = field.value;
        if (calculatorId && this.context.calculatorValues[calculatorId]) {
          this.context.hiddenFields[field.id] = String(
            this.context.calculatorValues[calculatorId]
          );
        }
      }
    }
  }

  /**
   * Interpolate piping tokens in text
   */
  interpolate(text: string): string {
    if (!text) return "";

    // Match {{questionId}} or {{questionId:format}} patterns
    const tokenPattern = /\{\{([^}:]+)(?::([^}]+))?\}\}/g;

    return text.replace(tokenPattern, (match, id, format) => {
      const token: PipingToken = {
        type: this.getTokenType(id),
        id,
        format: (format as PipingToken["format"]) || "default",
      };

      const value = this.getTokenValue(token);
      return this.formatValue(value, token.format);
    });
  }

  /**
   * Determine token type from ID
   */
  private getTokenType(id: string): PipingToken["type"] {
    if (this.context.hiddenFields[id] !== undefined) {
      return "hidden_field";
    }
    if (this.context.calculatorValues[id] !== undefined) {
      return "calculator";
    }
    // Default to question
    return "question";
  }

  /**
   * Get value for a piping token
   */
  private getTokenValue(token: PipingToken): string {
    switch (token.type) {
      case "question":
        const response = this.context.responses[token.id];
        if (response === undefined || response === null) {
          return "";
        }
        if (Array.isArray(response)) {
          return response.join(", ");
        }
        return String(response);

      case "hidden_field":
        return this.context.hiddenFields[token.id] || "";

      case "calculator":
        const calcValue = this.context.calculatorValues[token.id];
        return calcValue !== undefined ? String(calcValue) : "";

      case "variable":
        return "";

      default:
        return "";
    }
  }

  /**
   * Format a value based on format type
   */
  private formatValue(value: string, format: PipingToken["format"]): string {
    if (!value) return value;

    switch (format) {
      case "uppercase":
        return value.toUpperCase();
      case "lowercase":
        return value.toLowerCase();
      case "capitalize":
        return value
          .split(" ")
          .map(
            (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          )
          .join(" ");
      default:
        return value;
    }
  }

  /**
   * Validate all logic rules
   */
  validate(): LogicValidationResult {
    const errors: LogicValidationError[] = [];
    const warnings: LogicValidationWarning[] = [];

    // Check for circular references in skip logic
    for (const rule of this.skipLogicRules) {
      if (this.hasCircularReference(rule)) {
        errors.push({
          type: "circular_reference",
          questionId: rule.questionId,
          message: `Skip logic creates a circular reference`,
        });
      }
    }

    // Check for invalid targets
    for (const rule of this.skipLogicRules) {
      if (rule.action.type === "jump_to" && rule.action.targetQuestionId) {
        const targetExists = this.questions.some(
          (q) => q.id === rule.action.targetQuestionId
        );
        if (!targetExists) {
          errors.push({
            type: "invalid_target",
            questionId: rule.questionId,
            message: `Target question does not exist`,
          });
        }
      }
    }

    // Check for missing conditions
    for (const rule of this.skipLogicRules) {
      if (rule.conditions.length === 0) {
        errors.push({
          type: "missing_condition",
          questionId: rule.questionId,
          message: `Skip logic has no conditions`,
        });
      }
    }

    // Check for potentially unreachable questions
    const reachableQuestions = this.findReachableQuestions();
    for (const question of this.questions) {
      if (!reachableQuestions.has(question.id)) {
        warnings.push({
          type: "unreachable_question",
          questionId: question.id,
          message: `Question may be unreachable due to skip logic`,
        });
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Check for circular references in skip logic
   */
  private hasCircularReference(
    rule: SkipLogic,
    visited?: Set<string>
  ): boolean {
    visited = visited || new Set();

    if (visited.has(rule.questionId)) {
      return true;
    }

    visited.add(rule.questionId);

    if (rule.action.type === "jump_to" && rule.action.targetQuestionId) {
      const nextRule = this.skipLogicRules.find(
        (r) => r.questionId === rule.action.targetQuestionId
      );
      if (nextRule) {
        return this.hasCircularReference(nextRule, visited);
      }
    }

    return false;
  }

  /**
   * Find all reachable questions
   */
  private findReachableQuestions(): Set<string> {
    const reachable = new Set<string>();

    // Start from the first question
    if (this.questions.length > 0) {
      this.traverseQuestions(this.questions[0].id, reachable);
    }

    return reachable;
  }

  /**
   * Recursively traverse questions
   */
  private traverseQuestions(questionId: string, visited: Set<string>): void {
    if (visited.has(questionId)) return;

    visited.add(questionId);

    // Find skip logic for this question
    const skipRule = this.skipLogicRules.find(
      (r) => r.questionId === questionId
    );

    if (skipRule) {
      // Add the target question as reachable
      if (
        skipRule.action.type === "jump_to" &&
        skipRule.action.targetQuestionId
      ) {
        this.traverseQuestions(skipRule.action.targetQuestionId, visited);
      }
    }

    // Also traverse to the next question in order
    const currentQuestion = this.questions.find((q) => q.id === questionId);
    if (currentQuestion) {
      const nextIndex = currentQuestion.order + 1;
      const nextQuestion = this.questions.find((q) => q.order === nextIndex);
      if (nextQuestion) {
        this.traverseQuestions(nextQuestion.id, visited);
      }
    }
  }

  /**
   * Get progress percentage
   */
  getProgress(currentQuestionId: string): number {
    const visibleQuestions = this.getVisibleQuestions();
    const currentIndex = visibleQuestions.findIndex(
      (q) => q.id === currentQuestionId
    );

    if (currentIndex === -1 || visibleQuestions.length === 0) {
      return 0;
    }

    return Math.round(((currentIndex + 1) / visibleQuestions.length) * 100);
  }

  /**
   * Get question by ID
   */
  getQuestion(questionId: string): BuilderQuestion | undefined {
    return this.questions.find((q) => q.id === questionId);
  }

  /**
   * Get display value for a question response
   */
  getDisplayValue(questionId: string): string {
    const question = this.getQuestion(questionId);
    const response = this.context.responses[questionId];

    if (!question || response === undefined || response === null) {
      return "";
    }

    // For selection types with options, get the option label
    if (question.options && question.options.length > 0) {
      if (Array.isArray(response)) {
        return response
          .map((optionId) => {
            const option = question.options?.find((o) => o.id === optionId);
            return option?.label || optionId;
          })
          .join(", ");
      }

      const option = question.options.find((o) => o.id === response);
      return option?.label || String(response);
    }

    return String(response);
  }
}

/**
 * Create a new LogicEngine instance
 */
export function createLogicEngine(config: {
  questions: BuilderQuestion[];
  skipLogicRules?: SkipLogic[];
  visibilityRules?: VisibilityLogic[];
  calculators?: Calculator[];
  hiddenFields?: HiddenField[];
  initialContext?: Partial<LogicContext>;
}): LogicEngine {
  return new LogicEngine(config);
}
