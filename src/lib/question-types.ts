import {
  Type,
  AlignLeft,
  Mail,
  Phone,
  Hash,
  Link,
  Calendar,
  Clock,
  CheckCircle,
  CheckSquare,
  ChevronDown,
  ThumbsUp,
  Star,
  Gauge,
  BarChart3,
  Image,
  ArrowUpDown,
  Grid3X3,
  PlayCircle,
  MessageSquare,
  Heart,
  ArrowRight,
  ImageIcon,
  type LucideIcon,
} from "lucide-react";

// Question type definitions
export const QUESTION_TYPE_LABELS: Record<string, string> = {
  // Input types
  short_text: "Short Text",
  long_text: "Long Text",
  email: "Email",
  phone: "Phone Number",
  number: "Number",
  url: "Website",
  date: "Date",
  time: "Time",

  // Selection types
  multiple_choice: "Multiple Choice",
  checkboxes: "Checkboxes",
  dropdown: "Dropdown",
  yes_no: "Yes / No",
  rating: "Rating",
  opinion_scale: "Opinion Scale",
  nps: "NPS",
  picture_choice: "Picture Choice",
  ranking: "Ranking",
  matrix: "Matrix",

  // Content blocks
  welcome_screen: "Welcome Screen",
  statement: "Statement",
  thank_you_screen: "Thank You Screen",
  redirect: "Redirect",
  video_embed: "Video",
  image_block: "Image",
};

export const QUESTION_TYPE_ICONS: Record<string, LucideIcon> = {
  // Input types
  short_text: Type,
  long_text: AlignLeft,
  email: Mail,
  phone: Phone,
  number: Hash,
  url: Link,
  date: Calendar,
  time: Clock,

  // Selection types
  multiple_choice: CheckCircle,
  checkboxes: CheckSquare,
  dropdown: ChevronDown,
  yes_no: ThumbsUp,
  rating: Star,
  opinion_scale: Gauge,
  nps: BarChart3,
  picture_choice: Image,
  ranking: ArrowUpDown,
  matrix: Grid3X3,

  // Content blocks
  welcome_screen: PlayCircle,
  statement: MessageSquare,
  thank_you_screen: Heart,
  redirect: ArrowRight,
  video_embed: PlayCircle,
  image_block: ImageIcon,
};

export function getQuestionTypeLabel(type: string): string {
  return QUESTION_TYPE_LABELS[type] || type;
}

export function getQuestionTypeIcon(type: string): LucideIcon | null {
  return QUESTION_TYPE_ICONS[type] || null;
}

// Question type categories for the sidebar
export const QUESTION_TYPE_CATEGORIES = [
  {
    name: "Text Inputs",
    types: ["short_text", "long_text", "email", "phone", "number", "url"],
  },
  {
    name: "Date & Time",
    types: ["date", "time"],
  },
  {
    name: "Selection",
    types: [
      "multiple_choice",
      "checkboxes",
      "dropdown",
      "yes_no",
      "picture_choice",
    ],
  },
  {
    name: "Rating & Scale",
    types: ["rating", "opinion_scale", "nps", "ranking", "matrix"],
  },
  {
    name: "Content Blocks",
    types: [
      "welcome_screen",
      "statement",
      "thank_you_screen",
      "redirect",
      "video_embed",
      "image_block",
    ],
  },
];

// Check if a type is a content block (non-input type)
export function isContentBlockType(type: string): boolean {
  return [
    "welcome_screen",
    "statement",
    "thank_you_screen",
    "redirect",
    "video_embed",
    "image_block",
  ].includes(type);
}

// Check if a type supports options
export function hasOptions(type: string): boolean {
  return [
    "multiple_choice",
    "checkboxes",
    "dropdown",
    "picture_choice",
    "ranking",
  ].includes(type);
}
