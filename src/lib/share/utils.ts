/**
 * Share and Embed Utilities
 * Helper functions for form sharing and embedding
 */

import type {
  EmbedType,
  SocialPlatform,
  SocialShareData,
  StandardEmbedOptions,
  PopupEmbedOptions,
  SliderEmbedOptions,
  WidgetEmbedOptions,
  EmbedCodeResult,
  ShareLinkOptions,
} from "./types";

/**
 * Generate social share URL for various platforms
 */
export function generateSocialShareUrl(
  platform: SocialPlatform,
  data: SocialShareData
): string {
  const encodedUrl = encodeURIComponent(data.url);
  const encodedTitle = encodeURIComponent(data.title);
  const encodedDescription = encodeURIComponent(data.description || "");

  switch (platform) {
    case "twitter":
      return `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;

    case "facebook":
      return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;

    case "linkedin":
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;

    case "whatsapp":
      return `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`;

    case "email":
      return `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`;

    default:
      return data.url;
  }
}

/**
 * Generate form URL with optional UTM parameters
 */
export function generateFormUrl(
  baseUrl: string,
  formSlug: string,
  options?: ShareLinkOptions
): string {
  const url = new URL(`/f/${formSlug}`, baseUrl);

  if (options?.includeUtmParams) {
    if (options.utmSource) {
      url.searchParams.set("utm_source", options.utmSource);
    }
    if (options.utmMedium) {
      url.searchParams.set("utm_medium", options.utmMedium);
    }
    if (options.utmCampaign) {
      url.searchParams.set("utm_campaign", options.utmCampaign);
    }
  }

  return url.toString();
}

/**
 * Generate standard iframe embed code
 */
export function generateStandardEmbedCode(
  formUrl: string,
  options: StandardEmbedOptions
): EmbedCodeResult {
  const params = new URLSearchParams();
  if (options.hideTitle) params.set("hideTitle", "true");
  if (options.hideFooter) params.set("hideFooter", "true");
  if (options.transparentBackground) params.set("transparent", "true");

  const embedUrl =
    formUrl + (params.toString() ? `?${params.toString()}` : "");

  const html = `<iframe
  src="${embedUrl}"
  width="${options.width}"
  height="${options.height}"
  frameborder="0"
  style="border: none; border-radius: 8px;"
  allow="clipboard-write"
></iframe>`;

  return {
    html,
    fullCode: html,
  };
}

/**
 * Generate popup/modal embed code
 */
export function generatePopupEmbedCode(
  formUrl: string,
  options: PopupEmbedOptions
): EmbedCodeResult {
  const params = new URLSearchParams();
  if (options.hideTitle) params.set("hideTitle", "true");
  if (options.hideFooter) params.set("hideFooter", "true");

  const embedUrl =
    formUrl + (params.toString() ? `?${params.toString()}` : "");

  const html = `<button
  onclick="window.TypeformEmbed.openPopup('${embedUrl}', { width: '${options.width}', height: '${options.height}' })"
  style="background-color: ${options.buttonColor}; color: ${options.buttonTextColor}; border: none; padding: 12px 24px; border-radius: 6px; font-size: 16px; font-weight: 500; cursor: pointer;"
>${options.buttonText}</button>`;

  const script = `<script src="${getEmbedScriptUrl(formUrl)}"></script>`;

  return {
    html,
    script,
    fullCode: `${html}\n${script}`,
  };
}

/**
 * Generate slider/side panel embed code
 */
export function generateSliderEmbedCode(
  formUrl: string,
  options: SliderEmbedOptions
): EmbedCodeResult {
  const params = new URLSearchParams();
  if (options.hideTitle) params.set("hideTitle", "true");
  if (options.hideFooter) params.set("hideFooter", "true");

  const embedUrl =
    formUrl + (params.toString() ? `?${params.toString()}` : "");

  const html = `<button
  onclick="window.TypeformEmbed.openSlider('${embedUrl}', { position: '${options.position}', width: '${options.width}' })"
  style="background-color: ${options.buttonColor}; color: ${options.buttonTextColor}; border: none; padding: 12px 24px; border-radius: 6px; font-size: 16px; font-weight: 500; cursor: pointer;"
>${options.buttonText}</button>`;

  const script = `<script src="${getEmbedScriptUrl(formUrl)}"></script>`;

  return {
    html,
    script,
    fullCode: `${html}\n${script}`,
  };
}

/**
 * Generate widget/chat-style embed code
 */
export function generateWidgetEmbedCode(
  formUrl: string,
  options: WidgetEmbedOptions
): EmbedCodeResult {
  const params = new URLSearchParams();
  if (options.hideTitle) params.set("hideTitle", "true");
  if (options.hideFooter) params.set("hideFooter", "true");

  const embedUrl =
    formUrl + (params.toString() ? `?${params.toString()}` : "");

  const iconSvg = getWidgetIconSvg(options.buttonIcon);

  const html = `<div
  id="typeform-widget"
  data-url="${embedUrl}"
  data-position="${options.position}"
  data-greeting="${options.greeting}"
  data-button-color="${options.buttonColor}"
  data-button-icon="${iconSvg}"
></div>`;

  const script = `<script src="${getEmbedScriptUrl(formUrl)}"></script>
<script>window.TypeformEmbed.initWidget();</script>`;

  return {
    html,
    script,
    fullCode: `${html}\n${script}`,
  };
}

/**
 * Generate embed code based on type
 */
export function generateEmbedCode(
  formUrl: string,
  embedType: EmbedType,
  options:
    | StandardEmbedOptions
    | PopupEmbedOptions
    | SliderEmbedOptions
    | WidgetEmbedOptions
): EmbedCodeResult {
  switch (embedType) {
    case "standard":
      return generateStandardEmbedCode(
        formUrl,
        options as StandardEmbedOptions
      );
    case "popup":
      return generatePopupEmbedCode(formUrl, options as PopupEmbedOptions);
    case "slider":
      return generateSliderEmbedCode(formUrl, options as SliderEmbedOptions);
    case "widget":
      return generateWidgetEmbedCode(formUrl, options as WidgetEmbedOptions);
    default:
      return generateStandardEmbedCode(
        formUrl,
        options as StandardEmbedOptions
      );
  }
}

/**
 * Get embed script URL from form URL
 */
function getEmbedScriptUrl(formUrl: string): string {
  try {
    const url = new URL(formUrl);
    return `${url.origin}/embed.js`;
  } catch {
    return "/embed.js";
  }
}

/**
 * Get widget icon SVG based on icon type
 */
function getWidgetIconSvg(icon: "chat" | "form" | "help"): string {
  switch (icon) {
    case "chat":
      return "chat";
    case "form":
      return "form";
    case "help":
      return "help";
    default:
      return "chat";
  }
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);
      return successful;
    } catch {
      return false;
    }
  }
}

/**
 * Download QR code as image
 */
export function downloadQRCode(
  svgElement: SVGSVGElement,
  filename: string,
  format: "png" | "svg"
): void {
  if (format === "svg") {
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], {
      type: "image/svg+xml;charset=utf-8",
    });
    const svgUrl = URL.createObjectURL(svgBlob);
    downloadFile(svgUrl, `${filename}.svg`);
    URL.revokeObjectURL(svgUrl);
  } else {
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngUrl = canvas.toDataURL("image/png");
      downloadFile(pngUrl, `${filename}.png`);
    };

    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  }
}

/**
 * Helper function to download a file
 */
function downloadFile(url: string, filename: string): void {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Validate hex color
 */
export function isValidHexColor(color: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
}

/**
 * Format color with hash prefix
 */
export function formatHexColor(color: string): string {
  if (color.startsWith("#")) {
    return color;
  }
  return `#${color}`;
}
