import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Camera, CheckCircle2, Clock, TrendingUp, AlertCircle, Calendar, AlertTriangle, Package } from "lucide-react";
import StatCard from "@/components/StatCard";
import MedicationCard from "@/components/MedicationCard";
import BottomNav from "@/components/BottomNav";
import { useLocation } from "wouter";
import type { Medication, MedicationLog } from "@shared/schema";
import { calculateRefillStatus, getMedicationsNeedingRefill } from "@/lib/refillUtils";

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

  // Get today's medications with their status (all doses for today)
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
        // Show all medications scheduled for today
        const log = todayLogs.find(
          l => l.medicationId === med.id && l.scheduledTime === time
        );
        
        // Status is derived from logs only - backend determines missed status
        let status: "taken" | "missed" | "pending" = "pending";
        if (log) {
          status = log.status as any;
        }

        todayMeds.push({
          medication: med,
          time,
          status,
        });
      });
    });

    return todayMeds.sort((a, b) => a.time.localeCompare(b.time));
  };

  const todayMeds = getTodayMedications();
  
  // Calculate daily summary metrics
  const getTodaysSummary = () => {
    // Use authoritative backend stats for accurate counts
    const takenCount = stats?.takenCount || 0;
    const missedCount = stats?.missedCount || 0;
    const pendingCount = stats?.pendingCount || 0;
    const totalScheduled = stats?.totalScheduledToday || 0;
    const upcomingCount = Math.max(0, totalScheduled - takenCount - missedCount - pendingCount);
    
    const completionRate = totalScheduled > 0 
      ? Math.round((takenCount / totalScheduled) * 100) 
      : 0;
    
    let message = "";
    let messageVariant: "default" | "success" | "warning" = "default";
    
    if (completionRate === 100) {
      message = "Perfect! All medications taken today";
      messageVariant = "success";
    } else if (completionRate >= 80) {
      message = "Great job! Keep up the good work";
      messageVariant = "success";
    } else if (completionRate >= 50) {
      message = "You're doing well, stay on track";
      messageVariant = "default";
    } else if (missedCount > 0) {
      message = "Don't forget your medications";
      messageVariant = "warning";
    } else {
      message = "Start your day by taking your medications";
      messageVariant = "default";
    }
    
    return {
      takenCount,
      missedCount,
      pendingCount,
      upcomingCount,
      completionRate,
      message,
      messageVariant,
    };
  };

  const summary = getTodaysSummary();

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

          {/* Daily Summary */}
          <Card data-testid="card-daily-summary">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-[28px]">Daily Summary</CardTitle>
                  <CardDescription className="text-[18px] mt-1">
                    {new Date().toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </CardDescription>
                </div>
                <Calendar className="w-8 h-8 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Progress Bar */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[20px] font-medium">
                    Daily Progress
                  </span>
                  <span className="text-[20px] font-bold text-primary">
                    {summary.completionRate}%
                  </span>
                </div>
                <Progress 
                  value={summary.completionRate} 
                  className="h-3"
                  data-testid="progress-daily"
                />
                <p className={`text-[18px] ${
                  summary.messageVariant === "success" 
                    ? "text-green-600 dark:text-green-400" 
                    : summary.messageVariant === "warning"
                    ? "text-orange-600 dark:text-orange-400"
                    : "text-muted-foreground"
                }`}>
                  {summary.message}
                </p>
              </div>

              <Separator />

              {/* Status Breakdown */}
              <div className="space-y-4">
                <h3 className="text-[22px] font-semibold">Status Breakdown</h3>
                <div className="grid gap-3">
                  {/* Taken */}
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                      <span className="text-[20px]">Taken</span>
                    </div>
                    <Badge 
                      variant="outline" 
                      className="text-[18px] px-3 py-1 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800"
                      data-testid="badge-taken-count"
                    >
                      {summary.takenCount}
                    </Badge>
                  </div>

                  {/* Missed */}
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                      <span className="text-[20px]">Missed</span>
                    </div>
                    <Badge 
                      variant="outline" 
                      className="text-[18px] px-3 py-1 bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800"
                      data-testid="badge-missed-count"
                    >
                      {summary.missedCount}
                    </Badge>
                  </div>

                  {/* Pending */}
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                      <span className="text-[20px]">Pending</span>
                    </div>
                    <Badge 
                      variant="outline" 
                      className="text-[18px] px-3 py-1 bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800"
                      data-testid="badge-pending-count"
                    >
                      {summary.pendingCount}
                    </Badge>
                  </div>

                  {/* Upcoming (future doses not yet due) */}
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      <span className="text-[20px]">Upcoming</span>
                    </div>
                    <Badge 
                      variant="outline" 
                      className="text-[18px] px-3 py-1 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800"
                      data-testid="badge-upcoming-count"
                    >
                      {summary.upcomingCount}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Refill Alerts */}
          {(() => {
            const refillNeeded = getMedicationsNeedingRefill(medications);
            if (refillNeeded.length === 0) return null;

            return (
              <Card className="!border-2 border-orange-500 dark:border-orange-400 bg-orange-50 dark:bg-orange-950/40" data-testid="card-refill-alerts">
                <CardHeader className="gap-1 space-y-0 pb-4">
                  <CardTitle className="flex items-center gap-3 text-[28px]">
                    <AlertTriangle className="w-10 h-10 text-orange-600 dark:text-orange-400" />
                    Refill Reminders
                  </CardTitle>
                  <CardDescription className="text-[20px] font-medium">
                    {refillNeeded.length} medication{refillNeeded.length > 1 ? 's' : ''} need{refillNeeded.length === 1 ? 's' : ''} refilling
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {refillNeeded.map((med) => {
                    const refillStatus = calculateRefillStatus(med);
                    return (
                      <div
                        key={med.id}
                        className="flex items-start gap-4 p-5 rounded-md bg-background border-2 border-border"
                        data-testid={`refill-alert-${med.name.toLowerCase()}`}
                      >
                        <div className="flex-shrink-0">
                          <div className="w-20 h-20 rounded-md bg-white border-2 border-border flex items-center justify-center overflow-hidden">
                            <img src={med.imageUrl} alt={med.name} className="w-full h-full object-cover" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="text-[24px] font-bold">{med.name}</h3>
                              <p className="text-[20px] text-muted-foreground">{med.dosage}</p>
                            </div>
                            {refillStatus.urgent && (
                              <Badge className="bg-red-600 dark:bg-red-700 text-white min-h-[48px] px-4 text-[20px] font-bold border-2 border-red-700 dark:border-red-500">
                                Urgent
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <Package className="w-6 h-6 text-muted-foreground" />
                            <span className="text-[20px] font-semibold" data-testid={`refill-status-${med.name.toLowerCase()}`}>
                              {refillStatus.message}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <Button
                    variant="outline"
                    className="w-full min-h-[64px] text-[22px] mt-2"
                    onClick={() => setLocation("/settings")}
                    data-testid="button-manage-refills"
                  >
                    Manage Notifications
                  </Button>
                </CardContent>
              </Card>
            );
          })()}

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

          {/* Today's Schedule Timeline */}
          <Card data-testid="card-schedule-timeline">
            <CardHeader>
              <CardTitle className="text-[28px]">Today's Schedule</CardTitle>
              <CardDescription className="text-[18px]">
                Visual timeline of your medication schedule
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {todayMeds.length === 0 ? (
                <div className="space-y-6 py-4">
                  <p className="text-[18px] text-muted-foreground text-center">
                    {medications.length === 0 ? "Example schedule shown below" : "No medications scheduled for display"}
                  </p>
                  {/* Mock Schedule */}
                  {[
                    { time: "08:00", name: "Morning Vitamins", dosage: "1 tablet", status: "pending" },
                    { time: "12:00", name: "Lunch Medication", dosage: "2 tablets", status: "pending" },
                    { time: "18:00", name: "Evening Dose", dosage: "1 tablet", status: "pending" },
                    { time: "22:00", name: "Bedtime Pills", dosage: "1 capsule", status: "pending" },
                  ].map((item, index) => (
                    <div 
                      key={index}
                      className="flex items-center gap-4 p-4 rounded-lg bg-muted/30"
                      data-testid={`mock-schedule-${index}`}
                    >
                      <div className="flex-shrink-0 w-24 text-center">
                        <div className="text-[24px] font-bold">{item.time}</div>
                        <div className="w-3 h-3 rounded-full bg-primary mx-auto mt-2" />
                      </div>
                      <Separator orientation="vertical" className="h-16" />
                      <div className="flex-1">
                        <div className="text-[22px] font-semibold">{item.name}</div>
                        <div className="text-[18px] text-muted-foreground">{item.dosage}</div>
                      </div>
                      <Clock className="w-6 h-6 text-muted-foreground" />
                    </div>
                  ))}
                  {medications.length === 0 && (
                    <Button
                      variant="default"
                      className="w-full min-h-[64px] text-[22px]"
                      onClick={() => setLocation("/scan")}
                      data-testid="button-add-first-medication"
                    >
                      <Camera className="w-6 h-6 mr-2" />
                      Add Your First Medication
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Real Schedule */}
                  {todayMeds.slice(0, 5).map((item, index) => (
                    <div 
                      key={`${item.medication.id}-${item.time}`}
                      className="flex items-center gap-4 p-4 rounded-lg bg-muted/30"
                      data-testid={`schedule-item-${index}`}
                    >
                      <div className="flex-shrink-0 w-24 text-center">
                        <div className="text-[24px] font-bold">{item.time}</div>
                        <div className={`w-3 h-3 rounded-full mx-auto mt-2 ${
                          item.status === "taken" 
                            ? "bg-green-600 dark:bg-green-400" 
                            : item.status === "missed" 
                            ? "bg-red-600 dark:bg-red-400" 
                            : "bg-primary"
                        }`} />
                      </div>
                      <Separator orientation="vertical" className="h-16" />
                      <div className="flex-1 min-w-0">
                        <div className="text-[22px] font-semibold truncate">{item.medication.name}</div>
                        <div className="text-[18px] text-muted-foreground">{item.medication.dosage}</div>
                      </div>
                      {item.status === "taken" && (
                        <CheckCircle2 className="w-7 h-7 text-green-600 dark:text-green-400 flex-shrink-0" />
                      )}
                      {item.status === "missed" && (
                        <AlertCircle className="w-7 h-7 text-red-600 dark:text-red-400 flex-shrink-0" />
                      )}
                      {item.status === "pending" && (
                        <Clock className="w-7 h-7 text-primary flex-shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Medications */}
          {medications.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-[24px] font-semibold">Next Medications</h2>
              {todayMeds.length === 0 ? (
                <p className="text-[20px] text-muted-foreground text-center py-8">
                  No medications pending
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
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
