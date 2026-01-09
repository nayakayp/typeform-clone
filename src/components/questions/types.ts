import type { Question, QuestionSettings } from "@/lib/db/schema/questions";
import type { InputStyle } from "@/lib/theme/types";

// Theme colors passed to question renderers
export interface ThemeColors {
  primary?: string;
  background?: string;
  foreground?: string;
  muted?: string;
  mutedForeground?: string;
  border?: string;
  input?: string;
}

// Base question renderer props
export interface QuestionRendererProps<T = unknown> {
  question: Question;
  value: T;
  onChange: (value: T) => void;
  error?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  inputStyle?: InputStyle;
  /** Primary theme color for custom styling */
  primaryColor?: string;
  /** Full theme colors for comprehensive theming */
  themeColors?: ThemeColors;
}

// Extended settings interfaces for each question type
export interface ShortTextSettings extends QuestionSettings {
  maxLength?: number;
  minLength?: number;
  placeholder?: string;
  defaultValue?: string;
  pattern?: string;
}

export interface LongTextSettings extends QuestionSettings {
  maxLength?: number;
  minLength?: number;
  maxWords?: number;
  minWords?: number;
  rows?: number;
  placeholder?: string;
  autoResize?: boolean;
}

export interface EmailSettings extends QuestionSettings {
  allowMultiple?: boolean;
  domains?: string[];
  blockedDomains?: string[];
  placeholder?: string;
}

export interface PhoneSettings extends QuestionSettings {
  defaultCountry?: string;
  allowedCountries?: string[];
  format?: "international" | "national";
  placeholder?: string;
}

export interface NumberSettings extends QuestionSettings {
  min?: number;
  max?: number;
  step?: number;
  decimalPlaces?: number;
  prefix?: string;
  suffix?: string;
  placeholder?: string;
  showButtons?: boolean;
}

export interface UrlSettings extends QuestionSettings {
  requireHttps?: boolean;
  allowedProtocols?: string[];
  placeholder?: string;
}

export interface DateSettings extends QuestionSettings {
  format?: string;
  minDate?: string;
  maxDate?: string;
  disabledDates?: string[];
  disabledDays?: number[];
  placeholder?: string;
}

export interface TimeSettings extends QuestionSettings {
  format?: "12h" | "24h";
  minuteStep?: number;
  minTime?: string;
  maxTime?: string;
  placeholder?: string;
}

// Selection & Rating Types

export interface ChoiceOption {
  id: string;
  label: string;
  value?: string;
  image?: string;
  order: number;
}

export interface MultipleChoiceSettings extends QuestionSettings {
  options?: ChoiceOption[];
  allowOther?: boolean;
  randomize?: boolean;
  layout?: "vertical" | "horizontal" | "grid";
  columns?: number;
}

export interface CheckboxesSettings extends QuestionSettings {
  options?: ChoiceOption[];
  minSelections?: number;
  maxSelections?: number;
  allowOther?: boolean;
  randomize?: boolean;
}

export interface DropdownSettings extends QuestionSettings {
  options?: ChoiceOption[];
  searchable?: boolean;
  placeholder?: string;
  allowOther?: boolean;
  alphabetize?: boolean;
}

export interface PictureChoiceSettings extends QuestionSettings {
  options?: ChoiceOption[];
  multipleSelection?: boolean;
  columns?: number;
  showLabels?: boolean;
  supersize?: boolean;
}

export interface YesNoSettings extends QuestionSettings {
  yesLabel?: string;
  noLabel?: string;
}

export interface RatingSettings extends QuestionSettings {
  maxRating?: number;
  icon?: "star" | "heart" | "thumbs" | "number";
  lowLabel?: string;
  highLabel?: string;
  showNumbers?: boolean;
}

export interface OpinionScaleSettings extends QuestionSettings {
  min?: number;
  max?: number;
  step?: number;
  lowLabel?: string;
  midLabel?: string;
  highLabel?: string;
  showLabels?: boolean;
}

export interface NpsSettings extends QuestionSettings {
  lowLabel?: string;
  highLabel?: string;
}

export interface RankingSettings extends QuestionSettings {
  options?: ChoiceOption[];
  randomize?: boolean;
}

export interface MatrixRow {
  id: string;
  label: string;
}

export interface MatrixColumn {
  id: string;
  label: string;
}

export interface MatrixSettings extends QuestionSettings {
  rows?: MatrixRow[];
  columns?: MatrixColumn[];
  allowMultiplePerRow?: boolean;
}

// Content Block Types
export interface WelcomeScreenSettings extends QuestionSettings {
  title?: string;
  description?: string;
  buttonText?: string;
  image?: string;
  video?: string;
  showEstimatedTime?: boolean;
  estimatedMinutes?: number;
}

export interface StatementSettings extends QuestionSettings {
  content?: string;
  contentType?: "plain" | "markdown";
  buttonText?: string;
  image?: string;
  imagePosition?: "left" | "right" | "top" | "bottom" | "background";
  textAlignment?: "left" | "center" | "right";
}

export interface ThankYouScreenSettings extends QuestionSettings {
  title?: string;
  description?: string;
  showSocialShare?: boolean;
  socialMessage?: string;
  showResponseSummary?: boolean;
  redirectUrl?: string;
  redirectDelay?: number;
  buttonText?: string;
  buttonUrl?: string;
  showConfetti?: boolean;
}

export interface RedirectSettings extends QuestionSettings {
  url?: string;
  delay?: number;
  openInNewTab?: boolean;
  showMessage?: string;
  passResponseData?: boolean;
}

export interface VideoEmbedSettings extends QuestionSettings {
  url?: string;
  provider?: "youtube" | "vimeo" | "wistia" | "loom" | "custom";
  autoplay?: boolean;
  showControls?: boolean;
  loop?: boolean;
  muted?: boolean;
  requiredWatchTime?: number;
}

export interface ImageBlockSettings extends QuestionSettings {
  url?: string;
  alt?: string;
  caption?: string;
  size?: "small" | "medium" | "large" | "full";
  alignment?: "left" | "center" | "right";
  link?: string;
  lightbox?: boolean;
}

export interface ContentBlockProps {
  question: Question;
  onContinue?: () => void;
  disabled?: boolean;
}
