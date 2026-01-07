"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  Mic,
  MicOff,
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
import { Slider } from "@/components/ui/slider";
import type { QuestionRendererProps } from "../types";
import type { AudioRecordingSettings } from "@/lib/db/schema/files";

interface AudioValue {
  type: "recorded" | "uploaded";
  url: string;
  duration?: number;
  filename?: string;
}

export function AudioRecording({
  question,
  value,
  onChange,
  disabled,
}: QuestionRendererProps<AudioValue | null>) {
  const settings = (question.settings || {}) as AudioRecordingSettings;
  const audioRef = useRef<HTMLAudioElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>(0);

  const [status, setStatus] = useState<
    "idle" | "requesting" | "ready" | "recording" | "recorded" | "playing" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [uploading, setUploading] = useState(false);

  const maxDuration = settings.maxDuration || 120; // 2 minutes default
  const minDuration = settings.minDuration || 0;
  const showWaveform = settings.showWaveform !== false;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
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

  // Waveform visualization
  const drawWaveform = useCallback(() => {
    if (!analyserRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);

      analyser.getByteTimeDomainData(dataArray);

      ctx.fillStyle = "rgb(241, 245, 249)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.lineWidth = 2;
      ctx.strokeStyle = status === "recording" ? "rgb(239, 68, 68)" : "rgb(59, 130, 246)";

      ctx.beginPath();

      const sliceWidth = canvas.width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    };

    draw();
  }, [status]);

  const requestMicrophone = async () => {
    setStatus("requesting");
    setErrorMessage(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Set up audio analyser for waveform
      if (showWaveform) {
        const audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;
        source.connect(analyser);
        analyserRef.current = analyser;
        drawWaveform();
      }

      setStatus("ready");
    } catch (error) {
      console.error("Microphone access error:", error);
      if (error instanceof Error) {
        if (error.name === "NotAllowedError") {
          setErrorMessage(
            "Microphone access was denied. Please allow microphone access in your browser settings."
          );
        } else if (error.name === "NotFoundError") {
          setErrorMessage("No microphone found. Please connect a microphone and try again.");
        } else {
          setErrorMessage("Failed to access microphone. Please try again.");
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
      mimeType: "audio/webm;codecs=opus",
    });

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      const url = URL.createObjectURL(blob);
      onChange({
        type: "recorded",
        url,
        duration: recordingTime,
      });
      setStatus("recorded");

      // Stop microphone stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };

    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start(1000);
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
    setPlaybackTime(0);
  };

  const togglePlayback = () => {
    if (!audioRef.current) return;

    if (status === "playing") {
      audioRef.current.pause();
      setStatus("recorded");
    } else {
      audioRef.current.play();
      setStatus("playing");
    }
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
      setErrorMessage("Failed to upload audio. Please try again.");
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
          <Mic className="h-12 w-12 mx-auto text-muted-foreground" />
          <div>
            <p className="font-medium mb-2">Record an audio response</p>
            <p className="text-sm text-muted-foreground mb-4">
              Maximum {formatTime(maxDuration)}
              {minDuration > 0 && `, minimum ${formatTime(minDuration)}`}
            </p>
          </div>
          <div className="flex items-center justify-center gap-3">
            <Button onClick={requestMicrophone} disabled={disabled}>
              <Mic className="h-4 w-4 mr-2" />
              Start Recording
            </Button>
            {settings.allowUpload && (
              <>
                <span className="text-muted-foreground">or</span>
                <Button variant="outline" disabled={disabled || uploading} asChild>
                  <label className="cursor-pointer">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Audio
                    <input
                      type="file"
                      accept="audio/*"
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
          {showWaveform && (
            <div className="bg-slate-100 rounded-lg p-4">
              <canvas
                ref={canvasRef}
                width={400}
                height={100}
                className="w-full h-24"
              />
            </div>
          )}

          <div className="flex items-center justify-center gap-4">
            {status === "recording" && (
              <div className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-full">
                <Circle className="h-3 w-3 fill-red-500 text-red-500 animate-pulse" />
                <span className="font-mono font-medium">{formatTime(recordingTime)}</span>
              </div>
            )}
          </div>

          {status === "recording" && (
            <Progress value={progressPercent} className="h-2" />
          )}

          <div className="flex items-center justify-center gap-3">
            {status === "ready" && (
              <Button onClick={startRecording} size="lg" className="bg-red-500 hover:bg-red-600">
                <Circle className="h-4 w-4 mr-2 fill-white" />
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

      {(status === "recorded" || status === "playing") && value && (
        <div className="space-y-4">
          <audio
            ref={audioRef}
            src={value.url}
            onTimeUpdate={() => {
              if (audioRef.current) {
                setPlaybackTime(Math.floor(audioRef.current.currentTime));
              }
            }}
            onEnded={() => {
              setStatus("recorded");
              setPlaybackTime(0);
            }}
          />

          <div className="bg-muted rounded-lg p-6">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={togglePlayback}
                className="h-12 w-12"
              >
                {status === "playing" ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5" />
                )}
              </Button>

              <div className="flex-1">
                <Slider
                  value={[playbackTime]}
                  max={value.duration || 0}
                  step={1}
                  onValueChange={([val]) => {
                    if (audioRef.current) {
                      audioRef.current.currentTime = val;
                      setPlaybackTime(val);
                    }
                  }}
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>{formatTime(playbackTime)}</span>
                  <span>{formatTime(value.duration || 0)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <Button variant="outline" onClick={retake} disabled={disabled}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Record Again
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
