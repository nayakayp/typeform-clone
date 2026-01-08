"use client";

import { useState } from "react";
import { CreditCard, Lock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { QuestionRendererProps } from "../types";

interface PaymentSettings {
  amount?: number;
  currency?: string;
  productName?: string;
  productDescription?: string;
  collectBillingAddress?: boolean;
  stripePublishableKey?: string;
}

interface PaymentValue {
  completed: boolean;
  paymentIntentId?: string;
  amount?: number;
  currency?: string;
  cardLast4?: string;
  billingAddress?: {
    name: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

export function Payment({
  question,
  value,
  onChange,
  disabled,
  error,
}: QuestionRendererProps<PaymentValue | null>) {
  const settings = (question.settings || {}) as PaymentSettings;
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [name, setName] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const amount = settings.amount || 0;
  const currency = settings.currency || "USD";
  const productName = settings.productName || "Payment";

  const formatCardNumber = (input: string) => {
    const digits = input.replace(/\D/g, "").slice(0, 16);
    const groups = digits.match(/.{1,4}/g);
    return groups ? groups.join(" ") : digits;
  };

  const formatExpiry = (input: string) => {
    const digits = input.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 2) {
      return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    }
    return digits;
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount / 100);
  };

  const handleSubmitPayment = async () => {
    if (!cardNumber || !expiry || !cvc || !name) return;

    setIsProcessing(true);

    // Simulate payment processing
    // In a real implementation, this would integrate with Stripe Elements
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const paymentValue: PaymentValue = {
      completed: true,
      paymentIntentId: `pi_${Date.now()}`,
      amount,
      currency,
      cardLast4: cardNumber.replace(/\s/g, "").slice(-4),
    };

    onChange(paymentValue);
    setIsProcessing(false);
  };

  if (value?.completed) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center dark:border-green-800 dark:bg-green-950">
        <CheckCircle className="mx-auto h-12 w-12 text-green-600 dark:text-green-400" />
        <h3 className="mt-4 text-lg font-semibold text-green-900 dark:text-green-100">
          Payment Successful
        </h3>
        <p className="mt-2 text-sm text-green-700 dark:text-green-300">
          Thank you for your payment of {formatCurrency(amount, currency)}
        </p>
        {value.cardLast4 && (
          <p className="mt-1 text-xs text-green-600 dark:text-green-400">
            Card ending in {value.cardLast4}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Product Info */}
      <div className="rounded-lg border bg-muted/50 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">{productName}</h3>
            {settings.productDescription && (
              <p className="text-sm text-muted-foreground">
                {settings.productDescription}
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">
              {formatCurrency(amount, currency)}
            </p>
          </div>
        </div>
      </div>

      {/* Card Form */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="card-name">Name on card</Label>
          <Input
            id="card-name"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={disabled || isProcessing}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="card-number">Card number</Label>
          <div className="relative">
            <CreditCard className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="card-number"
              placeholder="4242 4242 4242 4242"
              value={cardNumber}
              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
              className="pl-10"
              disabled={disabled || isProcessing}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="card-expiry">Expiry date</Label>
            <Input
              id="card-expiry"
              placeholder="MM/YY"
              value={expiry}
              onChange={(e) => setExpiry(formatExpiry(e.target.value))}
              disabled={disabled || isProcessing}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="card-cvc">CVC</Label>
            <Input
              id="card-cvc"
              placeholder="123"
              value={cvc}
              onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
              disabled={disabled || isProcessing}
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        onClick={handleSubmitPayment}
        disabled={disabled || isProcessing || !cardNumber || !expiry || !cvc || !name}
        className="w-full gap-2"
        size="lg"
      >
        {isProcessing ? (
          <>
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Processing...
          </>
        ) : (
          <>
            <Lock className="h-4 w-4" />
            Pay {formatCurrency(amount, currency)}
          </>
        )}
      </Button>

      {/* Security Note */}
      <p className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
        <Lock className="h-3 w-3" />
        Payments are secure and encrypted
      </p>

      {error && <p className="text-destructive text-sm text-center">{error}</p>}
    </div>
  );
}
