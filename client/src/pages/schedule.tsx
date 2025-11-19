import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import MedicationCard from "@/components/MedicationCard";
import BottomNav from "@/components/BottomNav";
import { useLocation } from "wouter";
import type { Medication, MedicationLog } from "@shared/schema";

export default function Schedule() {
  const [activeTab, setActiveTab] = useState("today");
  const [, setLocation] = useLocation();

  const { data: medications = [], isLoading } = useQuery<Medication[]>({
    queryKey: ["/api/medications"],
  });

  const { data: todayLogs = [] } = useQuery<MedicationLog[]>({
    queryKey: ["/api/logs/today"],
  });

  const getMedicationStatus = (medId: string, time: string): "taken" | "missed" | "pending" => {
    if (activeTab === "tomorrow") return "pending";

    const log = todayLogs.find(l => l.medicationId === medId && l.scheduledTime === time);
    if (log) return log.status as any;

    const now = new Date();
    const [hour, minute] = time.split(':').map(Number);
    const scheduleTime = new Date();
    scheduleTime.setHours(hour, minute, 0, 0);

    if (scheduleTime.getTime() < now.getTime() - 30 * 60 * 1000) {
      return "missed";
    }

    return "pending";
  };

  const getAllScheduledMeds = () => {
    const result: Array<{
      medication: Medication;
      time: string;
      status: "taken" | "missed" | "pending";
    }> = [];

    medications.forEach(med => {
      med.times.forEach(time => {
        result.push({
          medication: med,
          time,
          status: getMedicationStatus(med.id, time),
        });
      });
    });

    return result.sort((a, b) => a.time.localeCompare(b.time));
  };

  const scheduledMeds = getAllScheduledMeds();

  if (isLoading) {
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
        <div className="p-6 pb-4">
          <h1 className="text-[32px] font-bold" data-testid="text-page-title">
            Schedule
          </h1>
          <p className="text-[20px] text-muted-foreground mt-1">
            Your medication timeline
          </p>
        </div>

        {/* Day Selector */}
        <div className="px-6 pb-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full h-14 grid grid-cols-2 p-1" data-testid="tabs-day-selector">
              <TabsTrigger value="today" className="text-[20px] min-h-[48px]" data-testid="tab-today">
                Today
              </TabsTrigger>
              <TabsTrigger value="tomorrow" className="text-[20px] min-h-[48px]" data-testid="tab-tomorrow">
                Tomorrow
              </TabsTrigger>
            </TabsList>

            <TabsContent value="today" className="mt-6 space-y-3">
              {scheduledMeds.length === 0 ? (
                <p className="text-[20px] text-muted-foreground text-center py-8">
                  No medications scheduled
                </p>
              ) : (
                scheduledMeds.map((item, idx) => (
                  <MedicationCard
                    key={`${item.medication.id}-${item.time}-${idx}`}
                    name={item.medication.name}
                    dosage={item.medication.dosage}
                    time={item.time}
                    imageUrl={item.medication.imageUrl}
                    status={item.status}
                    onMarkTaken={item.status === "pending" ? () => setLocation("/scan") : undefined}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="tomorrow" className="mt-6 space-y-3">
              {scheduledMeds.map((item, idx) => (
                <MedicationCard
                  key={`${item.medication.id}-${item.time}-tomorrow-${idx}`}
                  name={item.medication.name}
                  dosage={item.medication.dosage}
                  time={item.time}
                  imageUrl={item.medication.imageUrl}
                  status="pending"
                />
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
