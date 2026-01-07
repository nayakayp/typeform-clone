"use client";

import { CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SettingsLayout, SettingsSidebar } from "@/components/settings";

export default function BillingSettingsPage() {
  return (
    <SettingsLayout sidebar={<SettingsSidebar />}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Billing & Subscription</h1>
          <p className="text-muted-foreground">
            Manage your subscription plan and billing information
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
            <CardDescription>
              You are currently on the Free plan
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="text-lg font-semibold">Free Plan</p>
                <p className="text-muted-foreground text-sm">
                  3 forms, 100 responses per month
                </p>
              </div>
              <Button>Upgrade to Pro</Button>
            </div>

            <div className="rounded-lg border p-4">
              <h3 className="mb-2 font-medium">Plan Features</h3>
              <ul className="text-muted-foreground space-y-1 text-sm">
                <li>- Up to 3 active forms</li>
                <li>- 100 responses per month</li>
                <li>- Basic analytics</li>
                <li>- Email notifications</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Method</CardTitle>
            <CardDescription>
              Add a payment method to upgrade your plan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between rounded-lg border border-dashed p-6">
              <div className="flex items-center gap-4">
                <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-full">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">No payment method</p>
                  <p className="text-muted-foreground text-sm">
                    Add a payment method to upgrade your plan
                  </p>
                </div>
              </div>
              <Button variant="outline">Add Payment Method</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Billing History</CardTitle>
            <CardDescription>
              View your past invoices and billing history
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-muted-foreground py-8 text-center">
              <p>No billing history available</p>
              <p className="text-sm">
                Your invoices will appear here once you upgrade to a paid plan
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </SettingsLayout>
  );
}
