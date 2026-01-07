"use client";

import * as React from "react";
import { Link2, QrCode, Share2, Code2, Copy, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QRCodeGenerator } from "./QRCodeGenerator";
import { SocialShareButtons } from "./SocialShareButtons";
import { EmbedCodeGenerator } from "./EmbedCodeGenerator";
import { EmbedPreview } from "./EmbedPreview";
import type {
  EmbedType,
  StandardEmbedOptions,
  PopupEmbedOptions,
  SliderEmbedOptions,
  WidgetEmbedOptions,
} from "@/lib/share/types";
import {
  DEFAULT_STANDARD_EMBED_OPTIONS,
} from "@/lib/share/types";
import { copyToClipboard } from "@/lib/share/utils";

export interface ShareDialogProps {
  formUrl: string;
  formTitle: string;
  formDescription?: string;
  trigger?: React.ReactNode;
  className?: string;
}

export function ShareDialog({
  formUrl,
  formTitle,
  formDescription,
  trigger,
  className,
}: ShareDialogProps) {
  const [copied, setCopied] = React.useState(false);
  const [embedType, setEmbedType] = React.useState<EmbedType>("standard");
  const [embedOptions, setEmbedOptions] = React.useState<
    StandardEmbedOptions | PopupEmbedOptions | SliderEmbedOptions | WidgetEmbedOptions
  >(DEFAULT_STANDARD_EMBED_OPTIONS);

  const handleCopyLink = async () => {
    const success = await copyToClipboard(formUrl);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleEmbedTypeChange = (type: EmbedType) => {
    setEmbedType(type);
  };

  const handleOptionsChange = (
    options: StandardEmbedOptions | PopupEmbedOptions | SliderEmbedOptions | WidgetEmbedOptions
  ) => {
    setEmbedOptions(options);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className={className}>
            <Share2 className="mr-2 size-4" />
            Share
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Share Form</DialogTitle>
          <DialogDescription>
            Share &quot;{formTitle}&quot; with others via link, QR code, social media, or embed
            it on your website.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="link" className="mt-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="link" className="gap-2">
              <Link2 className="size-4" />
              <span className="hidden sm:inline">Link</span>
            </TabsTrigger>
            <TabsTrigger value="qrcode" className="gap-2">
              <QrCode className="size-4" />
              <span className="hidden sm:inline">QR Code</span>
            </TabsTrigger>
            <TabsTrigger value="social" className="gap-2">
              <Share2 className="size-4" />
              <span className="hidden sm:inline">Social</span>
            </TabsTrigger>
            <TabsTrigger value="embed" className="gap-2">
              <Code2 className="size-4" />
              <span className="hidden sm:inline">Embed</span>
            </TabsTrigger>
          </TabsList>

          {/* Link Tab */}
          <TabsContent value="link" className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="form-link">Form URL</Label>
              <div className="flex gap-2">
                <Input
                  id="form-link"
                  value={formUrl}
                  readOnly
                  className="flex-1"
                />
                <Button onClick={handleCopyLink} variant="outline">
                  {copied ? (
                    <>
                      <Check className="mr-2 size-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 size-4" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="text-muted-foreground text-sm">
              Share this link with anyone to let them fill out your form.
            </div>
          </TabsContent>

          {/* QR Code Tab */}
          <TabsContent value="qrcode" className="mt-6">
            <QRCodeGenerator url={formUrl} />
          </TabsContent>

          {/* Social Sharing Tab */}
          <TabsContent value="social" className="mt-6 space-y-4">
            <div className="text-muted-foreground mb-4 text-sm">
              Share your form on social media platforms.
            </div>
            <SocialShareButtons
              data={{
                url: formUrl,
                title: formTitle,
                description: formDescription,
              }}
            />
          </TabsContent>

          {/* Embed Tab */}
          <TabsContent value="embed" className="mt-6 space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <EmbedCodeGenerator
                  formUrl={formUrl}
                  onEmbedTypeChange={handleEmbedTypeChange}
                  onOptionsChange={handleOptionsChange}
                />
              </div>
              <div>
                <Label className="mb-2 block">Preview</Label>
                <EmbedPreview
                  formUrl={formUrl}
                  embedType={embedType}
                  options={embedOptions}
                  className="h-[400px]"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
