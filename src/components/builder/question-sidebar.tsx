"use client";

import { QUESTION_CATEGORIES, QUESTION_TYPE_META } from "@/types/builder";
import { useBuilderStore } from "@/stores/builder-store";
import { cn } from "@/lib/utils";
import {
  Type,
  AlignLeft,
  Mail,
  Phone,
  Hash,
  Link,
  Calendar,
  Clock,
  CircleDot,
  CheckSquare,
  ChevronDown,
  Image,
  ToggleLeft,
  Star,
  Sliders,
  Gauge,
  ArrowUpDown,
  Grid3X3,
  Upload,
  PenTool,
  Video,
  Mic,
  Home,
  MessageSquare,
  Heart,
  ExternalLink,
  Play,
  ImageIcon,
  CreditCard,
  CalendarCheck,
  MapPin,
  FileText,
  Shield,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Type,
  AlignLeft,
  Mail,
  Phone,
  Hash,
  Link,
  Calendar,
  Clock,
  CircleDot,
  CheckSquare,
  ChevronDown,
  Image,
  ToggleLeft,
  Star,
  Sliders,
  Gauge,
  ArrowUpDown,
  Grid3X3,
  Upload,
  PenTool,
  Video,
  Mic,
  Home,
  MessageSquare,
  Heart,
  ExternalLink,
  Play,
  ImageIcon,
  CreditCard,
  CalendarCheck,
  MapPin,
  FileText,
  Shield,
};

interface QuestionSidebarProps {
  className?: string;
}

export function QuestionSidebar({ className }: QuestionSidebarProps) {
  const { addQuestion } = useBuilderStore();

  const handleAddQuestion = (type: string) => {
    addQuestion(type);
  };

  return (
    <div
      className={cn(
        "flex h-full w-64 flex-col border-r bg-muted/30",
        className
      )}
    >
      <div className="flex-1 overflow-y-auto p-2">
        <Accordion
          type="multiple"
          defaultValue={["basic", "selection"]}
          className="w-full"
        >
          {Object.entries(QUESTION_CATEGORIES).map(([key, category]) => (
            <AccordionItem key={key} value={key}>
              <AccordionTrigger className="px-2 py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground hover:no-underline">
                {category.label}
              </AccordionTrigger>
              <AccordionContent className="pb-2">
                <div className="grid grid-cols-2 gap-1">
                  {category.types.map((type) => {
                    const meta = QUESTION_TYPE_META[type];
                    if (!meta) return null;

                    const IconComponent = iconMap[meta.icon];

                    return (
                      <button
                        key={type}
                        onClick={() => handleAddQuestion(type)}
                        className="flex flex-col items-center gap-1 rounded-md p-2 text-xs transition-colors hover:bg-accent"
                        title={meta.description}
                      >
                        {IconComponent && (
                          <IconComponent className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="text-center leading-tight">
                          {meta.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
