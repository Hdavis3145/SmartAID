import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Pill } from "lucide-react";

interface MedicationCardProps {
  name: string;
  dosage: string;
  time: string;
  imageUrl: string;
  status: "taken" | "missed" | "pending";
  onMarkTaken?: () => void;
}

export default function MedicationCard({
  name,
  dosage,
  time,
  imageUrl,
  status,
  onMarkTaken,
}: MedicationCardProps) {
  const statusConfig = {
    taken: { label: "Taken", color: "bg-green-600 text-white" },
    missed: { label: "Missed", color: "bg-red-600 text-white" },
    pending: { label: "Pending", color: "bg-yellow-600 text-white" },
  };

  const config = statusConfig[status];

  return (
    <Card className="p-6 space-y-4" data-testid={`card-medication-${name.toLowerCase()}`}>
      <div className="flex gap-6 items-start">
        <div className="flex-shrink-0">
          <div className="w-20 h-20 rounded-lg bg-white border-2 border-border flex items-center justify-center overflow-hidden">
            <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
          </div>
        </div>
        
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h3 className="text-[24px] font-bold leading-tight" data-testid={`text-medication-name-${name.toLowerCase()}`}>
                {name}
              </h3>
              <p className="text-[20px] text-muted-foreground mt-1" data-testid={`text-dosage-${name.toLowerCase()}`}>
                {dosage}
              </p>
            </div>
            <Badge className={`${config.color} min-h-[48px] px-4 text-[18px] font-semibold`} data-testid={`badge-status-${status}`}>
              {config.label}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2 text-[22px] font-medium">
            <Clock className="w-6 h-6 text-muted-foreground" />
            <span data-testid={`text-time-${time}`}>{time}</span>
          </div>
        </div>
      </div>

      {status === "pending" && onMarkTaken && (
        <Button
          onClick={onMarkTaken}
          className="w-full min-h-[56px] text-[22px]"
          data-testid={`button-mark-taken-${name.toLowerCase()}`}
        >
          <Pill className="w-6 h-6 mr-2" />
          Mark as Taken
        </Button>
      )}
    </Card>
  );
}
