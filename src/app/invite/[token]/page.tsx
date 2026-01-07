"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";

interface InvitationDetails {
  email: string;
  role: string;
  workspace: {
    id: string;
    name: string;
    slug: string;
    logo: string | null;
  };
  invitedBy: {
    id: string;
    name: string | null;
    email: string;
  };
  expiresAt: string;
}

export default function InvitePage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();

  const [invitation, setInvitation] = useState<InvitationDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);

  useEffect(() => {
    async function fetchInvitation() {
      try {
        const response = await fetch(`/api/invitations/${token}/accept`);
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to fetch invitation");
        }
        const data = await response.json();
        setInvitation(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load invitation");
      } finally {
        setIsLoading(false);
      }
    }

    if (token) {
      fetchInvitation();
    }
  }, [token]);

  const handleAccept = async () => {
    if (!isAuthenticated) {
      // Redirect to login with return URL
      router.push(`/login?redirect=/invite/${token}`);
      return;
    }

    setIsAccepting(true);
    try {
      const response = await fetch(`/api/invitations/${token}/accept`, {
        method: "POST",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to accept invitation");
      }

      const data = await response.json();
      router.push(`/forms?workspace=${data.workspaceId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to accept invitation");
      setIsAccepting(false);
    }
  };

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <X className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle>Invalid Invitation</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button variant="outline" onClick={() => router.push("/")}>
              Go to homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!invitation) {
    return null;
  }

  const emailMismatch = isAuthenticated && user?.email !== invitation.email;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={invitation.workspace.logo || undefined} />
              <AvatarFallback className="text-xl">
                {invitation.workspace.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
          <CardTitle>Join {invitation.workspace.name}</CardTitle>
          <CardDescription>
            {invitation.invitedBy.name || invitation.invitedBy.email} has invited
            you to join their workspace as a{" "}
            <span className="font-medium capitalize">{invitation.role}</span>.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {emailMismatch && (
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
              <p className="font-medium">Email mismatch</p>
              <p className="mt-1">
                This invitation was sent to{" "}
                <span className="font-medium">{invitation.email}</span>, but
                you're logged in as{" "}
                <span className="font-medium">{user?.email}</span>.
              </p>
              <p className="mt-2">
                Please log in with the correct email address to accept this
                invitation.
              </p>
            </div>
          )}

          {!isAuthenticated && (
            <div className="rounded-lg border bg-muted/50 p-4 text-sm">
              <p className="text-muted-foreground">
                You'll need to sign in or create an account to accept this
                invitation.
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => router.push("/")}
            >
              Decline
            </Button>
            <Button
              className="flex-1"
              onClick={handleAccept}
              disabled={isAccepting || emailMismatch}
            >
              {isAccepting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Accepting...
                </>
              ) : isAuthenticated ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Accept invitation
                </>
              ) : (
                "Sign in to accept"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
