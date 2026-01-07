export { ShortText } from "./ShortText";
export { LongText } from "./LongText";
export { Email } from "./Email";
export { Phone } from "./Phone";
export { Number } from "./Number";
export { Url } from "./Url";
export { DatePicker } from "./Date";
export { Time } from "./Time";
export { MultipleChoice } from "./MultipleChoice";
export { Checkboxes } from "./Checkboxes";
export { Dropdown } from "./Dropdown";
export { YesNo } from "./YesNo";
export { Rating } from "./Rating";
export { OpinionScale } from "./OpinionScale";
export { Nps } from "./Nps";
export { PictureChoice } from "./PictureChoice";
export { Ranking } from "./Ranking";
export { Matrix } from "./Matrix";

import { ShortText } from "./ShortText";
import { LongText } from "./LongText";
import { Email } from "./Email";
import { Phone } from "./Phone";
import { Number } from "./Number";
import { Url } from "./Url";
import { DatePicker } from "./Date";
import { Time } from "./Time";
import { MultipleChoice } from "./MultipleChoice";
import { Checkboxes } from "./Checkboxes";
import { Dropdown } from "./Dropdown";
import { YesNo } from "./YesNo";
import { Rating } from "./Rating";
import { OpinionScale } from "./OpinionScale";
import { Nps } from "./Nps";
import { PictureChoice } from "./PictureChoice";
import { Ranking } from "./Ranking";
import { Matrix } from "./Matrix";
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
  multiple_choice: MultipleChoice as React.ComponentType<
    QuestionRendererProps<unknown>
  >,
  checkboxes: Checkboxes as React.ComponentType<QuestionRendererProps<unknown>>,
  dropdown: Dropdown as React.ComponentType<QuestionRendererProps<unknown>>,
  yes_no: YesNo as React.ComponentType<QuestionRendererProps<unknown>>,
  rating: Rating as React.ComponentType<QuestionRendererProps<unknown>>,
  opinion_scale: OpinionScale as React.ComponentType<
    QuestionRendererProps<unknown>
  >,
  nps: Nps as React.ComponentType<QuestionRendererProps<unknown>>,
  picture_choice: PictureChoice as React.ComponentType<
    QuestionRendererProps<unknown>
  >,
  ranking: Ranking as React.ComponentType<QuestionRendererProps<unknown>>,
  matrix: Matrix as React.ComponentType<QuestionRendererProps<unknown>>,
};
