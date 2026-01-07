import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Zap,
  BarChart3,
  Share2,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <FileText className="h-4 w-4 text-primary-foreground" />
            </div>
            FormFlow
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/templates"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Templates
            </Link>
            <Link
              href="/login"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Sign In
            </Link>
            <Button asChild>
              <Link href="/register">Get Started</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="container py-24 md:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Build beautiful forms
            <span className="text-primary"> in minutes</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            Create engaging forms, surveys, and quizzes with our drag-and-drop
            builder. Get more responses with beautiful, conversational forms.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/register">
                Start for free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/templates">Browse templates</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container py-24 border-t">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            Everything you need to collect data
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Zap className="h-6 w-6" />}
              title="Drag & Drop Builder"
              description="Create forms quickly with our intuitive drag-and-drop interface. No coding required."
            />
            <FeatureCard
              icon={<FileText className="h-6 w-6" />}
              title="20+ Question Types"
              description="From multiple choice to file uploads, we have all the question types you need."
            />
            <FeatureCard
              icon={<BarChart3 className="h-6 w-6" />}
              title="Real-time Analytics"
              description="Track responses, completion rates, and response trends in real-time."
            />
            <FeatureCard
              icon={<Share2 className="h-6 w-6" />}
              title="Easy Sharing"
              description="Share your forms via link, embed on your website, or send via email."
            />
            <FeatureCard
              icon={<CheckCircle2 className="h-6 w-6" />}
              title="Logic Jumps"
              description="Create dynamic forms that adapt based on user responses."
            />
            <FeatureCard
              icon={<Zap className="h-6 w-6" />}
              title="Integrations"
              description="Connect with Slack, Google Sheets, Zapier, and more."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container py-24 border-t">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to create your first form?
          </h2>
          <p className="text-muted-foreground mb-8">
            Join thousands of users who trust FormFlow for their data collection
            needs.
          </p>
          <Button size="lg" asChild>
            <Link href="/register">
              Get started for free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-bold">
            <div className="h-6 w-6 rounded bg-primary flex items-center justify-center">
              <FileText className="h-3 w-3 text-primary-foreground" />
            </div>
            FormFlow
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} FormFlow. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-start p-6 rounded-lg border bg-card">
      <div className="p-2 rounded-lg bg-primary/10 text-primary mb-4">{icon}</div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
