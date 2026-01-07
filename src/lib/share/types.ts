/**
 * Share and Embed Types
 * Type definitions for form sharing and embedding functionality
 */

// Embed types
export type EmbedType = "standard" | "popup" | "slider" | "widget";

// Slider positions
export type SliderPosition = "left" | "right";

// Widget positions
export type WidgetPosition = "bottom-left" | "bottom-right";

// Social platforms
export type SocialPlatform =
  | "twitter"
  | "facebook"
  | "linkedin"
  | "whatsapp"
  | "email";

// QR Code formats
export type QRCodeFormat = "png" | "svg";

// QR Code customization options
export interface QRCodeOptions {
  size: number;
  fgColor: string;
  bgColor: string;
  includeMargin: boolean;
  level: "L" | "M" | "Q" | "H";
}

// Standard embed options
export interface StandardEmbedOptions {
  width: string;
  height: string;
  hideTitle: boolean;
  hideFooter: boolean;
  transparentBackground: boolean;
}

// Popup embed options
export interface PopupEmbedOptions {
  buttonText: string;
  buttonColor: string;
  buttonTextColor: string;
  width: string;
  height: string;
  hideTitle: boolean;
  hideFooter: boolean;
}

// Slider embed options
export interface SliderEmbedOptions {
  buttonText: string;
  buttonColor: string;
  buttonTextColor: string;
  position: SliderPosition;
  width: string;
  hideTitle: boolean;
  hideFooter: boolean;
}

// Widget embed options
export interface WidgetEmbedOptions {
  buttonColor: string;
  buttonIcon: "chat" | "form" | "help";
  position: WidgetPosition;
  greeting: string;
  hideTitle: boolean;
  hideFooter: boolean;
}

// Union type for all embed options
export type EmbedOptions =
  | { type: "standard"; options: StandardEmbedOptions }
  | { type: "popup"; options: PopupEmbedOptions }
  | { type: "slider"; options: SliderEmbedOptions }
  | { type: "widget"; options: WidgetEmbedOptions };

// Share link options
export interface ShareLinkOptions {
  includeUtmParams: boolean;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

// Social share data
export interface SocialShareData {
  url: string;
  title: string;
  description?: string;
}

// Generated embed code result
export interface EmbedCodeResult {
  html: string;
  script?: string;
  fullCode: string;
}

// Default options
export const DEFAULT_QR_OPTIONS: QRCodeOptions = {
  size: 256,
  fgColor: "#000000",
  bgColor: "#FFFFFF",
  includeMargin: true,
  level: "M",
};

export const DEFAULT_STANDARD_EMBED_OPTIONS: StandardEmbedOptions = {
  width: "100%",
  height: "500px",
  hideTitle: false,
  hideFooter: false,
  transparentBackground: false,
};

export const DEFAULT_POPUP_EMBED_OPTIONS: PopupEmbedOptions = {
  buttonText: "Open Form",
  buttonColor: "#3B82F6",
  buttonTextColor: "#FFFFFF",
  width: "600px",
  height: "80vh",
  hideTitle: false,
  hideFooter: false,
};

export const DEFAULT_SLIDER_EMBED_OPTIONS: SliderEmbedOptions = {
  buttonText: "Open Form",
  buttonColor: "#3B82F6",
  buttonTextColor: "#FFFFFF",
  position: "right",
  width: "400px",
  hideTitle: false,
  hideFooter: false,
};

export const DEFAULT_WIDGET_EMBED_OPTIONS: WidgetEmbedOptions = {
  buttonColor: "#3B82F6",
  buttonIcon: "chat",
  position: "bottom-right",
  greeting: "Hi! Need help?",
  hideTitle: false,
  hideFooter: false,
};
