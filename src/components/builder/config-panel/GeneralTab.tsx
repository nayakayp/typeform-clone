"use client";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ImagePlus, X, Video } from "lucide-react";
import type { BuilderQuestion } from "@/types/builder";
import { OptionsEditor } from "./OptionsEditor";
import {
  QuestionSettingsPanels,
  ContentBlockSettingsPanels,
} from "@/components/questions/settings";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface GeneralTabProps {
  question: BuilderQuestion;
  onUpdate: (updates: Partial<BuilderQuestion>) => void;
}

// Question types that have options
const OPTION_TYPES = [
  "multiple_choice",
  "checkboxes",
  "dropdown",
  "picture_choice",
  "ranking",
];

// Content block types (non-input types)
const CONTENT_BLOCK_TYPES = [
  "welcome_screen",
  "statement",
  "thank_you_screen",
  "redirect",
  "video_embed",
  "image_block",
];

export function GeneralTab({ question, onUpdate }: GeneralTabProps) {
  const [validationOpen, setValidationOpen] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [showMediaInput, setShowMediaInput] = useState(false);
  const [mediaType, setMediaType] = useState<"image" | "video">("image");

  const isContentBlock = CONTENT_BLOCK_TYPES.includes(question.type);
  const hasOptions = OPTION_TYPES.includes(question.type);

  // Cast settings to a flexible type for accessing common properties
  const settings = (question.settings || {}) as Record<string, unknown>;

  // Get the type-specific settings panels
  const QuestionPanel = !isContentBlock
    ? QuestionSettingsPanels[question.type]
    : null;
  const ContentBlockPanel = isContentBlock
    ? ContentBlockSettingsPanels[question.type]
    : null;

  const handleSettingsUpdate = (settings: unknown) => {
    onUpdate({ settings: settings as BuilderQuestion["settings"] });
  };

  const handleValidationUpdate = (
    key: string,
    value: string | number | undefined
  ) => {
    onUpdate({
      validations: {
        ...question.validations,
        [key]: value,
      },
    });
  };

  const handleMediaAdd = (url: string) => {
    if (mediaType === "image") {
      onUpdate({ image: url, video: null });
    } else {
      onUpdate({ video: url, image: null });
    }
    setShowMediaInput(false);
  };

  const handleMediaRemove = () => {
    onUpdate({ image: null, video: null });
  };

  return (
    <div className="space-y-6">
      {/* ===== CONTENT SECTION ===== */}

      {/* Placeholder (for input types) */}
      {["short_text", "long_text", "email", "phone", "number", "url"].includes(
        question.type
      ) && (
        <div className="space-y-2">
          <Label htmlFor="placeholder">Placeholder</Label>
          <Input
            id="placeholder"
            value={question.placeholder || ""}
            onChange={(e) => onUpdate({ placeholder: e.target.value || null })}
            placeholder="Type your answer here..."
          />
        </div>
      )}

      {/* Media */}
      <div className="space-y-2">
        <Label>Image or Video</Label>

        {question.image || question.video ? (
          <div className="bg-muted/50 relative rounded-lg border p-4">
            <div className="flex items-center gap-3">
              {question.image ? (
                <>
                  <ImagePlus className="text-muted-foreground h-8 w-8" />
                  <div className="flex-1 truncate text-sm">{question.image}</div>
                </>
              ) : (
                <>
                  <Video className="text-muted-foreground h-8 w-8" />
                  <div className="flex-1 truncate text-sm">{question.video}</div>
                </>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleMediaRemove}
                className="shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : showMediaInput ? (
          <div className="space-y-3">
            <div className="flex gap-2">
              <Button
                variant={mediaType === "image" ? "default" : "outline"}
                size="sm"
                onClick={() => setMediaType("image")}
              >
                <ImagePlus className="mr-1 h-4 w-4" />
                Image
              </Button>
              <Button
                variant={mediaType === "video" ? "default" : "outline"}
                size="sm"
                onClick={() => setMediaType("video")}
              >
                <Video className="mr-1 h-4 w-4" />
                Video
              </Button>
            </div>
            <Input
              type="url"
              placeholder={`Enter ${mediaType} URL...`}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleMediaAdd((e.target as HTMLInputElement).value);
                }
              }}
              autoFocus
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMediaInput(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setShowMediaInput(true)}
          >
            <ImagePlus className="mr-2 h-4 w-4" />
            Add Image or Video
          </Button>
        )}
      </div>

      {/* ===== SETTINGS SECTION ===== */}

      {/* Common Settings (only for non-content blocks) */}
      {!isContentBlock && (
        <>
          <div className="border-t pt-4" />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Required</Label>
              <p className="text-xs text-muted-foreground">
                Respondents must answer this question
              </p>
            </div>
            <Switch
              checked={question.required || false}
              onCheckedChange={(required) => onUpdate({ required })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Hide question number</Label>
              <p className="text-xs text-muted-foreground">
                Don&apos;t show the question number
              </p>
            </div>
            <Switch
              checked={(settings.hideQuestionNumber as boolean) || false}
              onCheckedChange={(hideQuestionNumber) =>
                onUpdate({
                  settings: {
                    ...question.settings,
                    hideQuestionNumber,
                  } as BuilderQuestion["settings"],
                })
              }
            />
          </div>
        </>
      )}

      {/* Options Editor (for selection types) */}
      {hasOptions && (
        <div className="space-y-2">
          <Label>Choices</Label>
          <OptionsEditor
            options={question.options || []}
            onChange={(options) =>
              onUpdate({ options: options as BuilderQuestion["options"] })
            }
            allowImages={question.type === "picture_choice"}
          />
        </div>
      )}

      {/* Type-specific Settings */}
      {QuestionPanel && (
        <div className="space-y-4 pt-2 border-t">
          <QuestionPanel
            settings={question.settings || {}}
            onChange={handleSettingsUpdate}
          />
        </div>
      )}
      {ContentBlockPanel && (
        <div className="space-y-4 pt-2 border-t">
          <ContentBlockPanel
            question={
              question as unknown as React.ComponentProps<
                typeof ContentBlockPanel
              >["question"]
            }
            onUpdate={handleSettingsUpdate}
          />
        </div>
      )}

      {/* Validation Settings (for input types) */}
      {!isContentBlock && (
        <Collapsible open={validationOpen} onOpenChange={setValidationOpen}>
          <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-medium">
            Validation
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform",
                validationOpen && "rotate-180"
              )}
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 pt-2">
            {["short_text", "long_text", "email"].includes(question.type) && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="minLength">Min length</Label>
                    <Input
                      id="minLength"
                      type="number"
                      min={0}
                      value={question.validations?.minLength || ""}
                      onChange={(e) =>
                        handleValidationUpdate(
                          "minLength",
                          e.target.value ? parseInt(e.target.value) : undefined
                        )
                      }
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxLength">Max length</Label>
                    <Input
                      id="maxLength"
                      type="number"
                      min={0}
                      value={question.validations?.maxLength || ""}
                      onChange={(e) =>
                        handleValidationUpdate(
                          "maxLength",
                          e.target.value ? parseInt(e.target.value) : undefined
                        )
                      }
                      placeholder="No limit"
                    />
                  </div>
                </div>
              </>
            )}

            {question.type === "number" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="min">Min value</Label>
                  <Input
                    id="min"
                    type="number"
                    value={question.validations?.min || ""}
                    onChange={(e) =>
                      handleValidationUpdate(
                        "min",
                        e.target.value ? parseFloat(e.target.value) : undefined
                      )
                    }
                    placeholder="No min"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max">Max value</Label>
                  <Input
                    id="max"
                    type="number"
                    value={question.validations?.max || ""}
                    onChange={(e) =>
                      handleValidationUpdate(
                        "max",
                        e.target.value ? parseFloat(e.target.value) : undefined
                      )
                    }
                    placeholder="No max"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="customError">Custom error message</Label>
              <Input
                id="customError"
                value={question.validations?.customError || ""}
                onChange={(e) =>
                  handleValidationUpdate(
                    "customError",
                    e.target.value || undefined
                  )
                }
                placeholder="Please enter a valid response"
              />
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Advanced Settings */}
      {!isContentBlock && (
        <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
          <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-medium">
            Advanced
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform",
                advancedOpen && "rotate-180"
              )}
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="variableName">Variable name</Label>
              <Input
                id="variableName"
                value={(settings.variableName as string) || ""}
                onChange={(e) =>
                  onUpdate({
                    settings: {
                      ...question.settings,
                      variableName: e.target.value || undefined,
                    } as BuilderQuestion["settings"],
                  })
                }
                placeholder={`question_${question.order + 1}`}
              />
              <p className="text-xs text-muted-foreground">
                Use this name to reference this answer in logic or piping
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="prefillParam">URL parameter for prefill</Label>
              <Input
                id="prefillParam"
                value={(settings.prefillParam as string) || ""}
                onChange={(e) =>
                  onUpdate({
                    settings: {
                      ...question.settings,
                      prefillParam: e.target.value || undefined,
                    } as BuilderQuestion["settings"],
                  })
                }
                placeholder="param_name"
              />
              <p className="text-xs text-muted-foreground">
                Pre-fill this field from URL: ?param_name=value
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Hidden field</Label>
                <p className="text-xs text-muted-foreground">
                  Collect data without showing the question
                </p>
              </div>
              <Switch
                checked={(settings.hidden as boolean) || false}
                onCheckedChange={(hidden) =>
                  onUpdate({
                    settings: {
                      ...question.settings,
                      hidden,
                    } as BuilderQuestion["settings"],
                  })
                }
              />
            </div>

            {hasOptions && (
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Randomize options</Label>
                  <p className="text-xs text-muted-foreground">
                    Show choices in random order
                  </p>
                </div>
                <Switch
                  checked={(settings.randomize as boolean) || false}
                  onCheckedChange={(randomize) =>
                    onUpdate({
                      settings: {
                        ...question.settings,
                        randomize,
                      } as BuilderQuestion["settings"],
                    })
                  }
                />
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
}
