import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import HistoryEntry from "@/components/HistoryEntry";
import BottomNav from "@/components/BottomNav";
import { Download, TrendingUp } from "lucide-react";
import type { MedicationLog, Medication } from "@shared/schema";

export default function History() {
  const { data: logs = [], isLoading: logsLoading } = useQuery<MedicationLog[]>({
    queryKey: ["/api/logs"],
  });

  const { data: medications = [] } = useQuery<Medication[]>({
    queryKey: ["/api/medications"],
  });

  const { data: stats } = useQuery<{
    adherenceRate: number;
  }>({
    queryKey: ["/api/stats"],
  });

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString("en-US", { 
      weekday: "long",
      month: "long", 
      day: "numeric" 
    });
  };

  const formatTime = (date: Date | string | null) => {
    if (!date) return undefined;
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleTimeString("en-US", { 
      hour: "numeric",
      minute: "2-digit",
      hour12: true 
    });
  };

  const getMedImage = (medId: string) => {
    const med = medications.find(m => m.id === medId);
    return med?.imageUrl || "";
  };

  const getMedDosage = (medId: string) => {
    const med = medications.find(m => m.id === medId);
    return med?.dosage || "";
  };

  const handleExport = () => {
    const csvContent = logs.map(log => 
      `${log.medicationName},${log.scheduledTime},${log.takenTime ? formatTime(log.takenTime) : 'Not taken'},${log.status}`
    ).join('\n');
    
    const blob = new Blob([`Medication,Scheduled,Taken,Status\n${csvContent}`], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medication-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (logsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pb-24">
        <p className="text-[24px] text-muted-foreground">Loading...</p>
      </div>
    );
  }

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
                  {stats?.adherenceRate || 100}%
                </p>
              </div>
            </div>
          </Card>

          {/* Export Button */}
          <Button
            variant="outline"
            className="w-full min-h-[56px] text-[22px] gap-2"
            onClick={handleExport}
            data-testid="button-export"
          >
            <Download className="w-6 h-6" />
            Share with Caregiver
          </Button>

          {/* History Log */}
          {logs.length === 0 ? (
            <p className="text-[20px] text-muted-foreground text-center py-8">
              No medication history yet
            </p>
          ) : (
            <div className="space-y-4">
              <h2 className="text-[24px] font-semibold sticky top-0 bg-background py-2 z-10">
                {formatDate(new Date())}
              </h2>
              
              <div className="space-y-3">
                {logs.map((log) => (
                  <HistoryEntry
                    key={log.id}
                    medicationName={log.medicationName}
                    dosage={getMedDosage(log.medicationId)}
                    scheduledTime={log.scheduledTime}
                    takenTime={log.takenTime ? formatTime(log.takenTime) : undefined}
                    status={log.status as any}
                    imageUrl={getMedImage(log.medicationId)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
