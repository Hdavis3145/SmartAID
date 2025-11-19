import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import HistoryEntry from "@/components/HistoryEntry";
import BottomNav from "@/components/BottomNav";
import { mockLogs, mockMedications } from "@/lib/mockData";
import { Download, TrendingUp } from "lucide-react";

export default function History() {
  const [logs] = useState(mockLogs);

  // Mock adherence calculation - todo: remove mock functionality
  const adherenceRate = 95;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", { 
      weekday: "long",
      month: "long", 
      day: "numeric" 
    });
  };

  const formatTime = (date: Date | null) => {
    if (!date) return undefined;
    return date.toLocaleTimeString("en-US", { 
      hour: "numeric",
      minute: "2-digit",
      hour12: true 
    });
  };

  const getMedImage = (medId: string) => {
    const med = mockMedications.find(m => m.id === medId);
    return med?.imageUrl || "";
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="p-6 space-y-6">
          <div>
            <h1 className="text-[32px] font-bold" data-testid="text-page-title">
              History
            </h1>
            <p className="text-[20px] text-muted-foreground mt-1">
              Your medication log
            </p>
          </div>

          {/* Adherence Stats */}
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="text-green-600">
                <TrendingUp className="w-12 h-12" />
              </div>
              <div className="flex-1">
                <p className="text-[18px] text-muted-foreground font-medium">
                  7-Day Adherence Rate
                </p>
                <p className="text-[32px] font-bold text-green-600 leading-tight mt-1" data-testid="text-adherence-rate">
                  {adherenceRate}%
                </p>
              </div>
            </div>
          </Card>

          {/* Export Button */}
          <Button
            variant="outline"
            className="w-full min-h-[56px] text-[22px] gap-2"
            onClick={() => console.log("Export history")}
            data-testid="button-export"
          >
            <Download className="w-6 h-6" />
            Share with Caregiver
          </Button>

          {/* History Log */}
          <div className="space-y-4">
            <h2 className="text-[24px] font-semibold sticky top-0 bg-background py-2 z-10">
              {formatDate(new Date())}
            </h2>
            
            <div className="space-y-3">
              {logs.map((log) => (
                <HistoryEntry
                  key={log.id}
                  medicationName={log.medicationName}
                  dosage="10mg"
                  scheduledTime={log.scheduledTime}
                  takenTime={log.takenTime ? formatTime(log.takenTime) : undefined}
                  status={log.status as any}
                  imageUrl={getMedImage(log.medicationId)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
