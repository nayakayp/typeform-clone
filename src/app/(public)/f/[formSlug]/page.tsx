"use client";

import { useEffect, useState } from "react";
import { FormRenderer } from "@/components/form-renderer";
import { Loader2, AlertCircle } from "lucide-react";

interface FormPageProps {
  params: Promise<{
    formSlug: string;
  }>;
}

interface FormData {
  id: string;
  title: string;
  description?: string | null;
  settings?: Record<string, unknown>;
  customTheme?: Record<string, unknown>;
  theme?: Record<string, unknown>;
  questions: Array<{
    id: string;
    type: string;
    title: string;
    description?: string | null;
    placeholder?: string | null;
    order: number;
    required: boolean;
    validations?: Record<string, unknown>;
    settings?: Record<string, unknown>;
    image?: string | null;
    video?: string | null;
    options?: Array<{
      id: string;
      label: string;
      value: string;
      image?: string | null;
      order: number;
    }>;
  }>;
}

export default function FormPage({ params }: FormPageProps) {
  const [formSlug, setFormSlug] = useState<string | null>(null);
  const [form, setForm] = useState<FormData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params.then((p) => setFormSlug(p.formSlug));
  }, [params]);

  useEffect(() => {
    if (!formSlug) return;

    async function fetchForm() {
      try {
        const res = await fetch(`/api/public/forms/${formSlug}`);
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Form not found");
        }
        const data = await res.json();
        setForm(data.form);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load form");
      } finally {
        setLoading(false);
      }
    }

    fetchForm();
  }, [formSlug]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
          <h1 className="text-2xl font-bold">Form not available</h1>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  if (!form || !formSlug) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Form not found</p>
      </div>
    );
  }

  return <FormRenderer form={form} slug={formSlug} />;
}
