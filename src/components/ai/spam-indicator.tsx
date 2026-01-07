import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertTriangle, ShieldAlert, ShieldCheck } from "lucide-react";

interface SpamIndicatorProps {
  isSpam: boolean;
  confidence: number;
  reasons: string[];
}

export function SpamIndicator({ isSpam, confidence, reasons }: SpamIndicatorProps) {
  if (!isSpam && confidence < 0.3) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
              <ShieldCheck className="h-3 w-3 mr-1" />
              Verified
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>This response appears to be legitimate</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (isSpam) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="destructive" className="cursor-help">
              <ShieldAlert className="h-3 w-3 mr-1" />
              Spam ({Math.round(confidence * 100)}%)
            </Badge>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <div className="space-y-1">
              <p className="font-medium">Spam indicators:</p>
              <ul className="text-xs space-y-0.5">
                {reasons.map((reason, i) => (
                  <li key={i}>• {reason}</li>
                ))}
              </ul>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Suspicious but not confirmed spam
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" className="text-yellow-600 border-yellow-200 bg-yellow-50 cursor-help">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Review ({Math.round(confidence * 100)}%)
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="space-y-1">
            <p className="font-medium">Potential issues:</p>
            <ul className="text-xs space-y-0.5">
              {reasons.map((reason, i) => (
                <li key={i}>• {reason}</li>
              ))}
            </ul>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
