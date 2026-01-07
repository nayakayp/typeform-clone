"use client";

import * as React from "react";
import { QRCodeSVG } from "qrcode.react";
import { Download, Copy, Check } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  type QRCodeOptions,
  type QRCodeFormat,
  DEFAULT_QR_OPTIONS,
} from "@/lib/share/types";
import { copyToClipboard, downloadQRCode } from "@/lib/share/utils";

export interface QRCodeGeneratorProps {
  url: string;
  className?: string;
}

export function QRCodeGenerator({ url, className }: QRCodeGeneratorProps) {
  const qrRef = React.useRef<SVGSVGElement>(null);
  const [options, setOptions] = React.useState<QRCodeOptions>(DEFAULT_QR_OPTIONS);
  const [copied, setCopied] = React.useState(false);

  const handleCopyUrl = async () => {
    const success = await copyToClipboard(url);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = (format: QRCodeFormat) => {
    if (qrRef.current) {
      downloadQRCode(qrRef.current, "qr-code", format);
    }
  };

  const updateOption = <K extends keyof QRCodeOptions>(
    key: K,
    value: QRCodeOptions[K]
  ) => {
    setOptions((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* QR Code Preview */}
      <div className="flex flex-col items-center gap-4">
        <div
          className="rounded-lg border p-4"
          style={{ backgroundColor: options.bgColor }}
        >
          <QRCodeSVG
            ref={qrRef}
            value={url}
            size={options.size}
            fgColor={options.fgColor}
            bgColor={options.bgColor}
            level={options.level}
            includeMargin={options.includeMargin}
          />
        </div>

        {/* Download Buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDownload("png")}
          >
            <Download className="mr-2 size-4" />
            PNG
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDownload("svg")}
          >
            <Download className="mr-2 size-4" />
            SVG
          </Button>
          <Button variant="outline" size="sm" onClick={handleCopyUrl}>
            {copied ? (
              <Check className="mr-2 size-4" />
            ) : (
              <Copy className="mr-2 size-4" />
            )}
            {copied ? "Copied!" : "Copy URL"}
          </Button>
        </div>
      </div>

      {/* Customization Options */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium">Customize QR Code</h4>

        {/* Size */}
        <div className="space-y-2">
          <Label htmlFor="qr-size">Size</Label>
          <Select
            value={options.size.toString()}
            onValueChange={(value) => updateOption("size", parseInt(value))}
          >
            <SelectTrigger id="qr-size">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="128">Small (128px)</SelectItem>
              <SelectItem value="256">Medium (256px)</SelectItem>
              <SelectItem value="512">Large (512px)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Error Correction Level */}
        <div className="space-y-2">
          <Label htmlFor="qr-level">Error Correction</Label>
          <Select
            value={options.level}
            onValueChange={(value) =>
              updateOption("level", value as QRCodeOptions["level"])
            }
          >
            <SelectTrigger id="qr-level">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="L">Low (7%)</SelectItem>
              <SelectItem value="M">Medium (15%)</SelectItem>
              <SelectItem value="Q">Quartile (25%)</SelectItem>
              <SelectItem value="H">High (30%)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Colors */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fg-color">Foreground Color</Label>
            <div className="flex gap-2">
              <Input
                id="fg-color"
                type="color"
                value={options.fgColor}
                onChange={(e) => updateOption("fgColor", e.target.value)}
                className="h-9 w-12 cursor-pointer p-1"
              />
              <Input
                type="text"
                value={options.fgColor}
                onChange={(e) => updateOption("fgColor", e.target.value)}
                className="flex-1"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bg-color">Background Color</Label>
            <div className="flex gap-2">
              <Input
                id="bg-color"
                type="color"
                value={options.bgColor}
                onChange={(e) => updateOption("bgColor", e.target.value)}
                className="h-9 w-12 cursor-pointer p-1"
              />
              <Input
                type="text"
                value={options.bgColor}
                onChange={(e) => updateOption("bgColor", e.target.value)}
                className="flex-1"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
