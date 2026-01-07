"use client";

import { FormsList } from "@/components/forms";

export default function FormsPage() {
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">My Forms</h1>
        <p className="text-muted-foreground">
          Create, manage, and analyze your forms
        </p>
      </div>
      <FormsList />
    </div>
  );
}
