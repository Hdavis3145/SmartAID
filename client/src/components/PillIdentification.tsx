import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";

interface PillIdentificationProps {
  pillName: string;
  pillImage: string;
  confidence: number;
  expectedPill?: string;
  onConfirm?: () => void;
  onRetry?: () => void;
}

export default function PillIdentification({
  pillName,
  pillImage,
  confidence,
  expectedPill,
  onConfirm,
  onRetry,
}: PillIdentificationProps) {
  const isMatch = expectedPill ? pillName === expectedPill : true;
  const confidenceColor = confidence >= 80 ? "bg-green-600" : confidence >= 60 ? "bg-yellow-600" : "bg-red-600";

  return (
    <Card className="p-8 space-y-6 max-w-2xl mx-auto" data-testid="card-pill-identification">
      <div className="flex justify-center">
        <div className="w-40 h-40 rounded-2xl bg-white border-4 border-border flex items-center justify-center overflow-hidden">
          <img src={pillImage} alt="Scanned pill" className="w-full h-full object-cover" />
        </div>
      </div>

      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          {isMatch ? (
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          ) : (
            <XCircle className="w-12 h-12 text-red-600" />
          )}
        </div>

        <div>
          <h2 className="text-[28px] font-bold mb-2" data-testid="text-pill-name">
            {pillName}
          </h2>
          
          <div className="flex items-center justify-center gap-2">
            <span className="text-[20px] text-muted-foreground">Confidence:</span>
            <Badge className={`${confidenceColor} text-white min-h-[40px] px-4 text-[18px]`} data-testid="badge-confidence">
              {confidence}%
            </Badge>
          </div>
        </div>

        {expectedPill && !isMatch && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-600 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-8 h-8 text-yellow-600 flex-shrink-0 mt-1" />
              <div className="text-left">
                <p className="text-[20px] font-semibold text-yellow-900 dark:text-yellow-100">
                  Wrong Medication
                </p>
                <p className="text-[18px] text-yellow-800 dark:text-yellow-200 mt-1">
                  Expected: {expectedPill}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {isMatch && onConfirm && (
          <Button
            onClick={onConfirm}
            className="w-full min-h-[56px] text-[22px]"
            data-testid="button-confirm"
          >
            Confirm & Log Dose
          </Button>
        )}
        
        {onRetry && (
          <Button
            onClick={onRetry}
            variant="outline"
            className="w-full min-h-[56px] text-[22px]"
            data-testid="button-retry"
          >
            Scan Again
          </Button>
        )}
      </div>
    </Card>
  );
}
