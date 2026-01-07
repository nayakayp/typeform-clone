// Form types
export type QuestionType =
  | "short_text"
  | "long_text"
  | "email"
  | "phone"
  | "number"
  | "url"
  | "date"
  | "time"
  | "multiple_choice"
  | "checkboxes"
  | "dropdown"
  | "rating"
  | "opinion_scale"
  | "nps"
  | "ranking"
  | "matrix"
  | "file_upload"
  | "picture_choice"
  | "yes_no"
  | "statement"
  | "welcome_screen"
  | "thank_you_screen"
  | "redirect"
  | "video_embed"
  | "image_block";

// Validation types for questions
export interface QuestionValidations {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  customError?: string;
}

export interface Question {
  id: string;
  formId: string;
  type: QuestionType;
  title: string;
  description?: string;
  required: boolean;
  order: number;
  properties: Record<string, unknown>;
  settings?: Record<string, unknown>;
  validations: QuestionValidations;
  logic: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Form {
  id: string;
  workspaceId: string;
  title: string;
  description?: string;
  slug: string;
  settings: FormSettings;
  theme: FormTheme;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  questions?: Question[];
}

export interface FormSettings {
  showProgressBar?: boolean;
  showQuestionNumbers?: boolean;
  shuffleQuestions?: boolean;
  oneQuestionPerPage?: boolean;
  allowResponseEditing?: boolean;
  closeAfterSubmission?: boolean;
  responseLimitEnabled?: boolean;
  responseLimit?: number;
  scheduledCloseDate?: Date;
}

export interface FormTheme {
  backgroundColor?: string;
  textColor?: string;
  buttonColor?: string;
  buttonTextColor?: string;
  fontFamily?: string;
  backgroundImage?: string;
}

export interface FormResponse {
  id: string;
  formId: string;
  metadata: ResponseMetadata;
  answers: Answer[];
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ResponseMetadata {
  ipAddress?: string;
  userAgent?: string;
  referrer?: string;
  platform?: string;
  completionTime?: number; // in seconds
}

export interface Answer {
  id: string;
  responseId: string;
  questionId: string;
  value: unknown;
  createdAt: Date;
}

// User types
export interface User {
  id: string;
  email: string;
  name?: string;
  emailVerified: boolean;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}
