import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Camera, CheckCircle2, Clock, TrendingUp } from "lucide-react";
import StatCard from "@/components/StatCard";
import MedicationCard from "@/components/MedicationCard";
import BottomNav from "@/components/BottomNav";
import { useLocation } from "wouter";
import type { Medication, MedicationLog } from "@shared/schema";

export default function Home() {
  const [, setLocation] = useLocation();
  
  const { data: medications = [], isLoading: medsLoading } = useQuery<Medication[]>({
    queryKey: ["/api/medications"],
  });

  const { data: todayLogs = [] } = useQuery<MedicationLog[]>({
    queryKey: ["/api/logs/today"],
  });

  const { data: stats } = useQuery<{
    totalScheduledToday: number;
    takenCount: number;
    missedCount: number;
    pendingCount: number;
    adherenceRate: number;
  }>({
    queryKey: ["/api/stats"],
  });

  // Get today's medications with their status
  const getTodayMedications = () => {
    const today = new Date();
    const currentHour = today.getHours();
    const currentMinute = today.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinute;

    const todayMeds: Array<{
      medication: Medication;
      time: string;
      status: "taken" | "missed" | "pending";
    }> = [];

    medications.forEach(med => {
      med.times.forEach(time => {
        const [hour, minute] = time.split(':').map(Number);
        const scheduleTimeInMinutes = hour * 60 + minute;
        
        if (scheduleTimeInMinutes <= currentTimeInMinutes + 60) {
          const log = todayLogs.find(
            l => l.medicationId === med.id && l.scheduledTime === time
          );
          
          let status: "taken" | "missed" | "pending" = "pending";
          if (log) {
            status = log.status as any;
          } else if (scheduleTimeInMinutes < currentTimeInMinutes - 30) {
            status = "missed";
          }

          todayMeds.push({
            medication: med,
            time,
            status,
          });
        }
      });
    });

    return todayMeds.sort((a, b) => a.time.localeCompare(b.time));
  };

  const todayMeds = getTodayMedications();

  if (medsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
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
              SmartAid
            </h1>
            <p className="text-[20px] text-muted-foreground mt-1">
              Medication Tracker
            </p>
          </div>

          {/* Primary Action */}
          <Button
            onClick={() => setLocation("/scan")}
            className="w-full min-h-[80px] text-[24px] gap-3"
            data-testid="button-scan-pill"
          >
            <Camera className="w-8 h-8" />
            Scan Pill Now
          </Button>

          {/* Stats */}
          <div className="space-y-3">
            <h2 className="text-[24px] font-semibold">Today's Progress</h2>
            <StatCard
              label="Medications Taken"
              value={`${stats?.takenCount || 0} of ${stats?.totalScheduledToday || 0}`}
              icon={CheckCircle2}
              variant="success"
            />
            <StatCard
              label="Pending Doses"
              value={stats?.pendingCount || 0}
              icon={Clock}
              variant="warning"
            />
            <StatCard
              label="Weekly Adherence"
              value={`${stats?.adherenceRate || 100}%`}
              icon={TrendingUp}
              variant="success"
            />
          </div>

          {/* Upcoming Medications */}
          <div className="space-y-4">
            <h2 className="text-[24px] font-semibold">Upcoming Today</h2>
            {todayMeds.length === 0 ? (
              <p className="text-[20px] text-muted-foreground text-center py-8">
                No medications scheduled
              </p>
            ) : (
              <div className="space-y-3">
                {todayMeds.slice(0, 3).map((item) => (
                  <MedicationCard
                    key={`${item.medication.id}-${item.time}`}
                    name={item.medication.name}
                    dosage={item.medication.dosage}
                    time={item.time}
                    imageUrl={item.medication.imageUrl}
                    status={item.status}
                    onMarkTaken={item.status === "pending" ? () => setLocation("/scan") : undefined}
                  />
                ))}
              </div>
            )}
            
            <Button
              variant="outline"
              className="w-full min-h-[56px] text-[22px]"
              onClick={() => setLocation("/schedule")}
              data-testid="button-view-full-schedule"
            >
              View Full Schedule
            </Button>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
