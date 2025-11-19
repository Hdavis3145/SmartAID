import StatCard from "../StatCard";
import { CheckCircle2, AlertCircle, Clock } from "lucide-react";

export default function StatCardExample() {
  return (
    <div className="p-6 space-y-4 max-w-2xl">
      <StatCard label="Taken Today" value="3 of 4" icon={CheckCircle2} variant="success" />
      <StatCard label="Pending" value="1" icon={Clock} variant="warning" />
      <StatCard label="Weekly Streak" value="7 days" icon={AlertCircle} variant="default" />
    </div>
  );
}
