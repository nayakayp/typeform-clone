interface FormPageProps {
  params: Promise<{
    formSlug: string;
  }>;
}

export default async function FormPage({ params }: FormPageProps) {
  const { formSlug } = await params;

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <p className="text-muted-foreground">Loading form: {formSlug}</p>
        {/* Form view will be implemented in the form taking issue */}
      </div>
    </div>
  );
}
