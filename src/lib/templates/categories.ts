import { TEMPLATE_CATEGORIES, TemplateCategory } from "@/lib/db/schema";

export interface CategoryInfo {
  id: TemplateCategory;
  name: string;
  description: string;
  icon: string;
}

export const categoryInfo: Record<TemplateCategory, CategoryInfo> = {
  surveys: {
    id: "surveys",
    name: "Surveys",
    description: "Customer satisfaction, employee feedback, market research",
    icon: "clipboard-list",
  },
  feedback: {
    id: "feedback",
    name: "Feedback",
    description: "Product feedback, event feedback, website feedback",
    icon: "message-square",
  },
  registration: {
    id: "registration",
    name: "Registration",
    description: "Event registration, course enrollment, membership",
    icon: "user-plus",
  },
  quizzes: {
    id: "quizzes",
    name: "Quizzes",
    description: "Knowledge quiz, personality quiz, assessment",
    icon: "brain",
  },
  contact: {
    id: "contact",
    name: "Contact",
    description: "Contact us, support request, sales inquiry",
    icon: "mail",
  },
  applications: {
    id: "applications",
    name: "Applications",
    description: "Job application, grant application, scholarship",
    icon: "file-text",
  },
  events: {
    id: "events",
    name: "Events",
    description: "Event planning, RSVP, venue booking",
    icon: "calendar",
  },
  research: {
    id: "research",
    name: "Research",
    description: "Academic research, market research, data collection",
    icon: "search",
  },
  orders: {
    id: "orders",
    name: "Orders",
    description: "Product orders, service requests, bookings",
    icon: "shopping-cart",
  },
  leads: {
    id: "leads",
    name: "Lead Generation",
    description: "Newsletter signup, demo request, consultation",
    icon: "target",
  },
};

export function getCategoryInfo(category: TemplateCategory): CategoryInfo {
  return categoryInfo[category];
}

export function getAllCategories(): CategoryInfo[] {
  return TEMPLATE_CATEGORIES.map((cat) => categoryInfo[cat]);
}
