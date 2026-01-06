import type { Question, QuestionOption } from "@/lib/db/schema/questions";
import type { Form } from "@/lib/db/schema/forms";

// Question types grouped by category
export const QUESTION_CATEGORIES = {
  basic: {
    label: "Basic",
    types: [
      "short_text",
      "long_text",
      "email",
      "phone",
      "number",
      "url",
      "date",
      "time",
    ],
  },
  selection: {
    label: "Selection",
    types: [
      "multiple_choice",
      "checkboxes",
      "dropdown",
      "picture_choice",
      "yes_no",
      "rating",
      "opinion_scale",
      "nps",
      "ranking",
      "matrix",
    ],
  },
  media: {
    label: "Media",
    types: ["file_upload", "signature", "video_recording", "audio_recording"],
  },
  content: {
    label: "Content",
    types: [
      "welcome_screen",
      "statement",
      "thank_you_screen",
      "redirect",
      "video_embed",
      "image_block",
    ],
  },
  advanced: {
    label: "Advanced",
    types: ["payment", "calendly", "address", "legal", "captcha"],
  },
} as const;

// Question type metadata
export const QUESTION_TYPE_META: Record<
  string,
  { label: string; icon: string; description: string }
> = {
  // Basic
  short_text: {
    label: "Short Text",
    icon: "Type",
    description: "Single-line text input",
  },
  long_text: {
    label: "Long Text",
    icon: "AlignLeft",
    description: "Multi-line text area",
  },
  email: { label: "Email", icon: "Mail", description: "Email address input" },
  phone: {
    label: "Phone",
    icon: "Phone",
    description: "Phone number with country code",
  },
  number: { label: "Number", icon: "Hash", description: "Numeric input" },
  url: { label: "Website", icon: "Link", description: "URL input" },
  date: { label: "Date", icon: "Calendar", description: "Date picker" },
  time: { label: "Time", icon: "Clock", description: "Time picker" },
  // Selection
  multiple_choice: {
    label: "Multiple Choice",
    icon: "CircleDot",
    description: "Single selection from options",
  },
  checkboxes: {
    label: "Checkboxes",
    icon: "CheckSquare",
    description: "Multiple selections allowed",
  },
  dropdown: {
    label: "Dropdown",
    icon: "ChevronDown",
    description: "Select from dropdown list",
  },
  picture_choice: {
    label: "Picture Choice",
    icon: "Image",
    description: "Select from images",
  },
  yes_no: { label: "Yes/No", icon: "ToggleLeft", description: "Binary choice" },
  rating: { label: "Rating", icon: "Star", description: "Star rating scale" },
  opinion_scale: {
    label: "Opinion Scale",
    icon: "Sliders",
    description: "Numeric scale with labels",
  },
  nps: {
    label: "NPS",
    icon: "Gauge",
    description: "Net Promoter Score (0-10)",
  },
  ranking: {
    label: "Ranking",
    icon: "ArrowUpDown",
    description: "Rank items by preference",
  },
  matrix: {
    label: "Matrix",
    icon: "Grid3X3",
    description: "Grid of questions",
  },
  // Media
  file_upload: {
    label: "File Upload",
    icon: "Upload",
    description: "Upload files",
  },
  signature: {
    label: "Signature",
    icon: "PenTool",
    description: "Digital signature",
  },
  video_recording: {
    label: "Video",
    icon: "Video",
    description: "Record video response",
  },
  audio_recording: {
    label: "Audio",
    icon: "Mic",
    description: "Record audio response",
  },
  // Content
  welcome_screen: {
    label: "Welcome Screen",
    icon: "Home",
    description: "Introduction screen",
  },
  statement: {
    label: "Statement",
    icon: "MessageSquare",
    description: "Information block",
  },
  thank_you_screen: {
    label: "Thank You",
    icon: "Heart",
    description: "Closing screen",
  },
  redirect: {
    label: "Redirect",
    icon: "ExternalLink",
    description: "Redirect to URL",
  },
  video_embed: {
    label: "Video Embed",
    icon: "Play",
    description: "Embed video content",
  },
  image_block: {
    label: "Image Block",
    icon: "ImageIcon",
    description: "Display image",
  },
  // Advanced
  payment: {
    label: "Payment",
    icon: "CreditCard",
    description: "Collect payment",
  },
  calendly: {
    label: "Calendly",
    icon: "CalendarCheck",
    description: "Schedule meeting",
  },
  address: {
    label: "Address",
    icon: "MapPin",
    description: "Full address input",
  },
  legal: { label: "Legal", icon: "FileText", description: "Terms acceptance" },
  captcha: { label: "CAPTCHA", icon: "Shield", description: "Bot protection" },
};

// Builder question (extends database Question with client-side fields)
export interface BuilderQuestion extends Omit<Question, "formId"> {
  options?: QuestionOption[];
  isNew?: boolean;
  isDeleted?: boolean;
}

// Builder form state
export interface BuilderForm extends Form {
  questions: BuilderQuestion[];
}

// Preview modes
export type PreviewMode = "desktop" | "tablet" | "mobile";

// History action for undo/redo
export interface HistoryAction {
  type: string;
  timestamp: number;
  data: unknown;
  previousState: BuilderQuestion[];
}
