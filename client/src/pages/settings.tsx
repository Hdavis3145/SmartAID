import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import BottomNav from "@/components/BottomNav";
import { Bell, Moon, Volume2, Users, HelpCircle, LogOut } from "lucide-react";

export default function Settings() {
  const [notifications, setNotifications] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const settingItems = [
    {
      icon: Bell,
      label: "Medication Reminders",
      description: "Get notified when it's time to take medication",
      value: notifications,
      onChange: setNotifications,
      testId: "switch-notifications",
    },
    {
      icon: Volume2,
      label: "Sound Alerts",
      description: "Play sound with notifications",
      value: soundEnabled,
      onChange: setSoundEnabled,
      testId: "switch-sound",
    },
    {
      icon: Moon,
      label: "Dark Mode",
      description: "Use dark color theme",
      value: darkMode,
      onChange: setDarkMode,
      testId: "switch-dark-mode",
    },
  ];

  const actionItems = [
    {
      icon: Users,
      label: "Manage Caregivers",
      description: "Add or remove caregiver contacts",
      testId: "button-caregivers",
    },
    {
      icon: HelpCircle,
      label: "Help & Support",
      description: "Get help using SmartAid",
      testId: "button-help",
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="p-6 pb-4">
          <h1 className="text-[32px] font-bold" data-testid="text-page-title">
            Settings
          </h1>
          <p className="text-[20px] text-muted-foreground mt-1">
            Customize your experience
          </p>
        </div>

        <div className="px-6 space-y-6">
          {/* Toggle Settings */}
          <div className="space-y-3">
            {settingItems.map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.label} className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="text-primary mt-1">
                      <Icon className="w-10 h-10" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Label htmlFor={item.testId} className="text-[20px] font-semibold cursor-pointer">
                        {item.label}
                      </Label>
                      <p className="text-[18px] text-muted-foreground mt-1">
                        {item.description}
                      </p>
                    </div>
                    <Switch
                      id={item.testId}
                      checked={item.value}
                      onCheckedChange={item.onChange}
                      className="scale-150 mt-2"
                      data-testid={item.testId}
                    />
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Action Items */}
          <div className="space-y-3">
            {actionItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.label}
                  variant="outline"
                  className="w-full min-h-[80px] justify-start p-6 hover-elevate"
                  onClick={() => console.log(item.label)}
                  data-testid={item.testId}
                >
                  <div className="flex items-center gap-4 text-left w-full">
                    <div className="text-primary">
                      <Icon className="w-10 h-10" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[20px] font-semibold">{item.label}</p>
                      <p className="text-[18px] text-muted-foreground font-normal mt-1">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </Button>
              );
            })}
          </div>

          {/* App Info */}
          <Card className="p-6 text-center">
            <p className="text-[18px] text-muted-foreground">
              SmartAid Medication Tracker
            </p>
            <p className="text-[16px] text-muted-foreground mt-1">
              Version 1.0.0
            </p>
          </Card>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
