export { ShortText } from "./ShortText";
export { LongText } from "./LongText";
export { Email } from "./Email";
export { Phone } from "./Phone";
export { Number } from "./Number";
export { Url } from "./Url";
export { DatePicker } from "./Date";
export { Time } from "./Time";

import { ShortText } from "./ShortText";
import { LongText } from "./LongText";
import { Email } from "./Email";
import { Phone } from "./Phone";
import { Number } from "./Number";
import { Url } from "./Url";
import { DatePicker } from "./Date";
import { Time } from "./Time";
import type { QuestionRendererProps } from "../types";

// Question renderer map for dynamic rendering
export const QuestionRenderers: Record<
  string,
  React.ComponentType<QuestionRendererProps<unknown>>
> = {
  short_text: ShortText as React.ComponentType<QuestionRendererProps<unknown>>,
  long_text: LongText as React.ComponentType<QuestionRendererProps<unknown>>,
  email: Email as React.ComponentType<QuestionRendererProps<unknown>>,
  phone: Phone as React.ComponentType<QuestionRendererProps<unknown>>,
  number: Number as React.ComponentType<QuestionRendererProps<unknown>>,
  url: Url as React.ComponentType<QuestionRendererProps<unknown>>,
  date: DatePicker as React.ComponentType<QuestionRendererProps<unknown>>,
  time: Time as React.ComponentType<QuestionRendererProps<unknown>>,
};
