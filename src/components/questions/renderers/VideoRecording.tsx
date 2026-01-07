"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  Video,
  VideoOff,
  Circle,
  Square,
  RotateCcw,
  Play,
  Pause,
  Upload,
  AlertCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import type { QuestionRendererProps } from "../types";
import type { VideoRecordingSettings } from "@/lib/db/schema/files";

interface VideoValue {
  type: "recorded" | "uploaded";
  url: string;
  duration?: number;
  filename?: string;
}

export function VideoRecording({
  question,
  value,
  onChange,
  disabled,
}: QuestionRendererProps<VideoValue | null>) {
  const settings = (question.settings || {}) as VideoRecordingSettings;
  const videoRef = useRef<HTMLVideoElement>(null);
  const previewRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const [status, setStatus] = useState<
    "idle" | "requesting" | "ready" | "recording" | "recorded" | "playing" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [uploading, setUploading] = useState(false);

  const maxDuration = settings.maxDuration || 120; // 2 minutes default
  const minDuration = settings.minDuration || 0;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Recording timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (status === "recording") {
      interval = setInterval(() => {
        setRecordingTime((prev) => {
          const newTime = prev + 1;
          if (newTime >= maxDuration) {
            stopRecording();
          }
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [status, maxDuration]);

  const requestCamera = async () => {
    setStatus("requesting");
    setErrorMessage(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: settings.quality === "high" ? 1920 : settings.quality === "low" ? 640 : 1280 },
          height: { ideal: settings.quality === "high" ? 1080 : settings.quality === "low" ? 480 : 720 },
        },
        audio: true,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setStatus("ready");
    } catch (error) {
      console.error("Camera access error:", error);
      if (error instanceof Error) {
        if (error.name === "NotAllowedError") {
          setErrorMessage(
            "Camera access was denied. Please allow camera access in your browser settings."
          );
        } else if (error.name === "NotFoundError") {
          setErrorMessage("No camera found. Please connect a camera and try again.");
        } else {
          setErrorMessage("Failed to access camera. Please try again.");
        }
      }
      setStatus("error");
    }
  };

  const startRecording = () => {
    if (!streamRef.current) return;

    chunksRef.current = [];
    setRecordingTime(0);

    const mediaRecorder = new MediaRecorder(streamRef.current, {
      mimeType: "video/webm;codecs=vp9,opus",
    });

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      onChange({
        type: "recorded",
        url,
        duration: recordingTime,
      });
      setStatus("recorded");

      // Stop camera stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };

    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start(1000); // Collect data every second
    setStatus("recording");
  };

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && status === "recording") {
      mediaRecorderRef.current.stop();
    }
  }, [status]);

  const retake = () => {
    onChange(null);
    setStatus("idle");
    setRecordingTime(0);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      const result = await response.json();
      onChange({
        type: "uploaded",
        url: result.url,
        filename: result.originalName,
      });
      setStatus("recorded");
    } catch (error) {
      setErrorMessage("Failed to upload video. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progressPercent = (recordingTime / maxDuration) * 100;

  return (
    <div className="space-y-4">
      {status === "idle" && (
        <div className="text-center space-y-4 p-8 border-2 border-dashed rounded-lg">
          <Video className="h-12 w-12 mx-auto text-muted-foreground" />
          <div>
            <p className="font-medium mb-2">Record a video response</p>
            <p className="text-sm text-muted-foreground mb-4">
              Maximum {formatTime(maxDuration)}
              {minDuration > 0 && `, minimum ${formatTime(minDuration)}`}
            </p>
          </div>
          <div className="flex items-center justify-center gap-3">
            <Button onClick={requestCamera} disabled={disabled}>
              <Video className="h-4 w-4 mr-2" />
              Start Camera
            </Button>
            {settings.allowUpload && (
              <>
                <span className="text-muted-foreground">or</span>
                <Button variant="outline" disabled={disabled || uploading} asChild>
                  <label className="cursor-pointer">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Video
                    <input
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </label>
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      {status === "error" && errorMessage && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {(status === "requesting" || status === "ready" || status === "recording") && (
        <div className="space-y-4">
          <div className="relative rounded-lg overflow-hidden bg-black aspect-video">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            {status === "recording" && (
              <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/50 text-white px-3 py-1 rounded-full">
                <Circle className="h-3 w-3 fill-red-500 text-red-500 animate-pulse" />
                <span className="font-mono">{formatTime(recordingTime)}</span>
              </div>
            )}
          </div>

          {status === "recording" && (
            <Progress value={progressPercent} className="h-2" />
          )}

          <div className="flex items-center justify-center gap-3">
            {status === "ready" && (
              <Button onClick={startRecording} size="lg">
                <Circle className="h-4 w-4 mr-2 fill-red-500 text-red-500" />
                Start Recording
              </Button>
            )}
            {status === "recording" && (
              <Button onClick={stopRecording} variant="destructive" size="lg">
                <Square className="h-4 w-4 mr-2" />
                Stop Recording
              </Button>
            )}
          </div>
        </div>
      )}

      {status === "recorded" && value && (
        <div className="space-y-4">
          <div className="relative rounded-lg overflow-hidden bg-black aspect-video">
            <video
              ref={previewRef}
              src={value.url}
              controls
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex items-center justify-center gap-3">
            <Button variant="outline" onClick={retake} disabled={disabled}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Retake
            </Button>
          </div>

          {value.duration && value.duration < minDuration && (
            <p className="text-sm text-destructive text-center">
              Recording must be at least {formatTime(minDuration)} long
            </p>
          )}
        </div>
      )}
    </div>
  );
}
