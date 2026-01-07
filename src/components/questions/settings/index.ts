export { ShortTextSettingsPanel } from "./ShortTextSettings";
export { LongTextSettingsPanel } from "./LongTextSettings";
export { EmailSettingsPanel } from "./EmailSettings";
export { PhoneSettingsPanel } from "./PhoneSettings";
export { NumberSettingsPanel } from "./NumberSettings";
export { UrlSettingsPanel } from "./UrlSettings";
export { DateSettingsPanel } from "./DateSettings";
export { TimeSettingsPanel } from "./TimeSettings";
export { MultipleChoiceSettingsPanel } from "./MultipleChoiceSettings";
export { CheckboxesSettingsPanel } from "./CheckboxesSettings";
export { DropdownSettingsPanel } from "./DropdownSettings";
export { YesNoSettingsPanel } from "./YesNoSettings";
export { RatingSettingsPanel } from "./RatingSettings";
export { OpinionScaleSettingsPanel } from "./OpinionScaleSettings";
export { NpsSettingsPanel } from "./NpsSettings";
export { PictureChoiceSettingsPanel } from "./PictureChoiceSettings";
export { RankingSettingsPanel } from "./RankingSettings";
export { MatrixSettingsPanel } from "./MatrixSettings";

import { ShortTextSettingsPanel } from "./ShortTextSettings";
import { LongTextSettingsPanel } from "./LongTextSettings";
import { EmailSettingsPanel } from "./EmailSettings";
import { PhoneSettingsPanel } from "./PhoneSettings";
import { NumberSettingsPanel } from "./NumberSettings";
import { UrlSettingsPanel } from "./UrlSettings";
import { DateSettingsPanel } from "./DateSettings";
import { TimeSettingsPanel } from "./TimeSettings";
import { MultipleChoiceSettingsPanel } from "./MultipleChoiceSettings";
import { CheckboxesSettingsPanel } from "./CheckboxesSettings";
import { DropdownSettingsPanel } from "./DropdownSettings";
import { YesNoSettingsPanel } from "./YesNoSettings";
import { RatingSettingsPanel } from "./RatingSettings";
import { OpinionScaleSettingsPanel } from "./OpinionScaleSettings";
import { NpsSettingsPanel } from "./NpsSettings";
import { PictureChoiceSettingsPanel } from "./PictureChoiceSettings";
import { RankingSettingsPanel } from "./RankingSettings";
import { MatrixSettingsPanel } from "./MatrixSettings";

// Settings panel map for dynamic rendering
export const QuestionSettingsPanels: Record<
  string,
  React.ComponentType<{
    settings: unknown;
    onChange: (settings: unknown) => void;
  }>
> = {
  short_text: ShortTextSettingsPanel as React.ComponentType<{
    settings: unknown;
    onChange: (settings: unknown) => void;
  }>,
  long_text: LongTextSettingsPanel as React.ComponentType<{
    settings: unknown;
    onChange: (settings: unknown) => void;
  }>,
  email: EmailSettingsPanel as React.ComponentType<{
    settings: unknown;
    onChange: (settings: unknown) => void;
  }>,
  phone: PhoneSettingsPanel as React.ComponentType<{
    settings: unknown;
    onChange: (settings: unknown) => void;
  }>,
  number: NumberSettingsPanel as React.ComponentType<{
    settings: unknown;
    onChange: (settings: unknown) => void;
  }>,
  url: UrlSettingsPanel as React.ComponentType<{
    settings: unknown;
    onChange: (settings: unknown) => void;
  }>,
  date: DateSettingsPanel as React.ComponentType<{
    settings: unknown;
    onChange: (settings: unknown) => void;
  }>,
  time: TimeSettingsPanel as React.ComponentType<{
    settings: unknown;
    onChange: (settings: unknown) => void;
  }>,
  multiple_choice: MultipleChoiceSettingsPanel as React.ComponentType<{
    settings: unknown;
    onChange: (settings: unknown) => void;
  }>,
  checkboxes: CheckboxesSettingsPanel as React.ComponentType<{
    settings: unknown;
    onChange: (settings: unknown) => void;
  }>,
  dropdown: DropdownSettingsPanel as React.ComponentType<{
    settings: unknown;
    onChange: (settings: unknown) => void;
  }>,
  yes_no: YesNoSettingsPanel as React.ComponentType<{
    settings: unknown;
    onChange: (settings: unknown) => void;
  }>,
  rating: RatingSettingsPanel as React.ComponentType<{
    settings: unknown;
    onChange: (settings: unknown) => void;
  }>,
  opinion_scale: OpinionScaleSettingsPanel as React.ComponentType<{
    settings: unknown;
    onChange: (settings: unknown) => void;
  }>,
  nps: NpsSettingsPanel as React.ComponentType<{
    settings: unknown;
    onChange: (settings: unknown) => void;
  }>,
  picture_choice: PictureChoiceSettingsPanel as React.ComponentType<{
    settings: unknown;
    onChange: (settings: unknown) => void;
  }>,
  ranking: RankingSettingsPanel as React.ComponentType<{
    settings: unknown;
    onChange: (settings: unknown) => void;
  }>,
  matrix: MatrixSettingsPanel as React.ComponentType<{
    settings: unknown;
    onChange: (settings: unknown) => void;
  }>,
};
