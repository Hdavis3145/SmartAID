import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Clock } from "lucide-react";

interface HistoryEntryProps {
  medicationName: string;
  dosage: string;
  scheduledTime: string;
  takenTime?: string;
  status: "taken" | "missed" | "pending";
  imageUrl: string;
}

export default function HistoryEntry({
  medicationName,
  dosage,
  scheduledTime,
  takenTime,
  status,
  imageUrl,
}: HistoryEntryProps) {
  const statusConfig = {
    taken: { 
      icon: CheckCircle2, 
      color: "text-green-600",
      bgColor: "bg-green-600",
      label: "Taken"
    },
    missed: { 
      icon: XCircle, 
      color: "text-red-600",
      bgColor: "bg-red-600",
      label: "Missed"
    },
    pending: { 
      icon: Clock, 
      color: "text-yellow-600",
      bgColor: "bg-yellow-600",
      label: "Pending"
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Card className="p-4" data-testid={`history-entry-${status}`}>
      <div className="flex gap-4 items-center">
        <div className="flex-shrink-0">
          <div className="w-16 h-16 rounded-lg bg-white border-2 border-border flex items-center justify-center overflow-hidden">
            <img src={imageUrl} alt={medicationName} className="w-full h-full object-cover" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h3 className="text-[20px] font-semibold leading-tight" data-testid={`text-medication-${medicationName.toLowerCase()}`}>
                {medicationName}
              </h3>
              <p className="text-[18px] text-muted-foreground">{dosage}</p>
            </div>
            <Icon className={`w-10 h-10 ${config.color} flex-shrink-0`} />
          </div>

          <div className="mt-2 flex items-center gap-3 text-[18px]">
            <span className="text-muted-foreground">Scheduled: {scheduledTime}</span>
            {takenTime && status === "taken" && (
              <span className="text-green-600">• Taken: {takenTime}</span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
