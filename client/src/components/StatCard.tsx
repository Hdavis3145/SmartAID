import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  variant?: "default" | "success" | "warning" | "danger";
}

export default function StatCard({ label, value, icon: Icon, variant = "default" }: StatCardProps) {
  const variantColors = {
    default: "text-primary",
    success: "text-green-600",
    warning: "text-yellow-600",
    danger: "text-red-600",
  };

  return (
    <Card className="p-6" data-testid={`stat-card-${label.toLowerCase().replace(/\s+/g, "-")}`}>
      <div className="flex items-center gap-4">
        <div className={`${variantColors[variant]}`}>
          <Icon className="w-12 h-12" strokeWidth={2} />
        </div>
        <div className="flex-1">
          <p className="text-[18px] text-muted-foreground font-medium">{label}</p>
          <p className="text-[32px] font-bold leading-tight mt-1" data-testid={`stat-value-${label.toLowerCase().replace(/\s+/g, "-")}`}>
            {value}
          </p>
        </div>
      </div>
    </Card>
  );
}
