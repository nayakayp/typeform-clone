export { ShortTextSettingsPanel } from "./ShortTextSettings";
export { LongTextSettingsPanel } from "./LongTextSettings";
export { EmailSettingsPanel } from "./EmailSettings";
export { PhoneSettingsPanel } from "./PhoneSettings";
export { NumberSettingsPanel } from "./NumberSettings";
export { UrlSettingsPanel } from "./UrlSettings";
export { DateSettingsPanel } from "./DateSettings";
export { TimeSettingsPanel } from "./TimeSettings";

import { ShortTextSettingsPanel } from "./ShortTextSettings";
import { LongTextSettingsPanel } from "./LongTextSettings";
import { EmailSettingsPanel } from "./EmailSettings";
import { PhoneSettingsPanel } from "./PhoneSettings";
import { NumberSettingsPanel } from "./NumberSettings";
import { UrlSettingsPanel } from "./UrlSettings";
import { DateSettingsPanel } from "./DateSettings";
import { TimeSettingsPanel } from "./TimeSettings";

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
};
