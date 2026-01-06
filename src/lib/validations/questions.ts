import { z } from "zod";

// Short Text validation
export const shortTextSchema = (options?: {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
}) => {
  let schema = z.string();

  if (options?.required) {
    schema = schema.min(1, "This field is required");
  }
  if (options?.minLength) {
    schema = schema.min(
      options.minLength,
      `Minimum ${options.minLength} characters required`
    );
  }
  if (options?.maxLength) {
    schema = schema.max(
      options.maxLength,
      `Maximum ${options.maxLength} characters allowed`
    );
  }
  if (options?.pattern) {
    schema = schema.regex(new RegExp(options.pattern), "Invalid format");
  }

  return schema;
};

// Long Text validation
export const longTextSchema = (options?: {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  minWords?: number;
  maxWords?: number;
}) => {
  let schema = z.string();

  if (options?.required) {
    schema = schema.min(1, "This field is required");
  }
  if (options?.minLength) {
    schema = schema.min(
      options.minLength,
      `Minimum ${options.minLength} characters required`
    );
  }
  if (options?.maxLength) {
    schema = schema.max(
      options.maxLength,
      `Maximum ${options.maxLength} characters allowed`
    );
  }

  return schema.refine(
    (value) => {
      if (!options?.minWords && !options?.maxWords) return true;
      const wordCount = value.trim().split(/\s+/).filter(Boolean).length;
      if (options?.minWords && wordCount < options.minWords) return false;
      if (options?.maxWords && wordCount > options.maxWords) return false;
      return true;
    },
    {
      message:
        options?.minWords && options?.maxWords
          ? `Must be between ${options.minWords} and ${options.maxWords} words`
          : options?.minWords
            ? `Minimum ${options.minWords} words required`
            : `Maximum ${options?.maxWords} words allowed`,
    }
  );
};

// Email validation
export const emailSchema = (options?: {
  required?: boolean;
  domains?: string[];
  blockedDomains?: string[];
}) => {
  let schema = z.string();

  if (options?.required) {
    schema = schema.min(1, "This field is required");
  }

  return schema.email("Please enter a valid email address").refine(
    (value) => {
      if (!value) return true;
      const domain = value.split("@")[1]?.toLowerCase();
      if (options?.domains && options.domains.length > 0) {
        return options.domains.some((d) => d.toLowerCase() === domain);
      }
      if (options?.blockedDomains && options.blockedDomains.length > 0) {
        return !options.blockedDomains.some((d) => d.toLowerCase() === domain);
      }
      return true;
    },
    {
      message: options?.domains
        ? `Email domain must be one of: ${options.domains.join(", ")}`
        : "This email domain is not allowed",
    }
  );
};

// Phone validation
export const phoneSchema = (options?: { required?: boolean }) => {
  let schema = z.string();

  if (options?.required) {
    schema = schema.min(1, "This field is required");
  }

  return schema.refine(
    (value) => {
      if (!value) return true;
      // Basic international phone number pattern
      return /^\+?[1-9]\d{1,14}$/.test(value.replace(/[\s\-()]/g, ""));
    },
    { message: "Please enter a valid phone number" }
  );
};

// Number validation
export const numberSchema = (options?: {
  required?: boolean;
  min?: number;
  max?: number;
  step?: number;
  decimalPlaces?: number;
}) => {
  let schema = z.coerce.number();

  if (options?.min !== undefined) {
    schema = schema.min(options.min, `Must be at least ${options.min}`);
  }
  if (options?.max !== undefined) {
    schema = schema.max(options.max, `Must be at most ${options.max}`);
  }
  if (options?.decimalPlaces !== undefined) {
    schema = schema.refine(
      (value) => {
        const decimals = (value.toString().split(".")[1] || "").length;
        return decimals <= options.decimalPlaces!;
      },
      { message: `Maximum ${options.decimalPlaces} decimal places allowed` }
    );
  }

  if (options?.required) {
    return schema;
  }

  return z.union([schema, z.literal("").transform(() => undefined)]);
};

// URL validation
export const urlSchema = (options?: {
  required?: boolean;
  requireHttps?: boolean;
}) => {
  let schema = z.string();

  if (options?.required) {
    schema = schema.min(1, "This field is required");
  }

  return schema.refine(
    (value) => {
      if (!value) return true;
      try {
        const url = new URL(
          value.startsWith("http") ? value : `https://${value}`
        );
        if (options?.requireHttps && url.protocol !== "https:") {
          return false;
        }
        return true;
      } catch {
        return false;
      }
    },
    {
      message: options?.requireHttps
        ? "Please enter a valid HTTPS URL"
        : "Please enter a valid URL",
    }
  );
};

// Date validation
export const dateSchema = (options?: {
  required?: boolean;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[];
  disabledDays?: number[];
}) => {
  let schema = z.coerce.date();

  if (options?.minDate) {
    schema = schema.min(
      options.minDate,
      `Date must be after ${options.minDate.toLocaleDateString()}`
    );
  }
  if (options?.maxDate) {
    schema = schema.max(
      options.maxDate,
      `Date must be before ${options.maxDate.toLocaleDateString()}`
    );
  }

  return schema.refine(
    (value) => {
      if (
        options?.disabledDays &&
        options.disabledDays.includes(value.getDay())
      ) {
        return false;
      }
      if (options?.disabledDates) {
        const dateStr = value.toDateString();
        return !options.disabledDates.some((d) => d.toDateString() === dateStr);
      }
      return true;
    },
    { message: "This date is not available" }
  );
};

// Time validation
export const timeSchema = (options?: {
  required?: boolean;
  minTime?: string;
  maxTime?: string;
}) => {
  let schema = z.string();

  if (options?.required) {
    schema = schema.min(1, "This field is required");
  }

  return schema
    .refine(
      (value) => {
        if (!value) return true;
        // Validate HH:MM format
        return /^([01]\d|2[0-3]):([0-5]\d)$/.test(value);
      },
      { message: "Please enter a valid time (HH:MM)" }
    )
    .refine(
      (value) => {
        if (!value || !options?.minTime) return true;
        return value >= options.minTime;
      },
      { message: `Time must be after ${options?.minTime}` }
    )
    .refine(
      (value) => {
        if (!value || !options?.maxTime) return true;
        return value <= options.maxTime;
      },
      { message: `Time must be before ${options?.maxTime}` }
    );
};
