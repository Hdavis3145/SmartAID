import { useState, useEffect } from "react";
import { Bell, BellOff, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  registerServiceWorker,
  requestNotificationPermission,
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
  isSubscribedToPush,
  getNotificationPermission,
  sendTestNotification,
} from "@/lib/notificationUtils";

export function NotificationSettings() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [permission, setPermission] = useState(getNotificationPermission());
  const { toast } = useToast();

  useEffect(() => {
    checkSubscriptionStatus();
  }, []);

  const checkSubscriptionStatus = async () => {
    const subscribed = await isSubscribedToPush();
    setIsSubscribed(subscribed);
    setPermission(getNotificationPermission());
  };

  const handleEnableNotifications = async () => {
    setIsLoading(true);

    try {
      // Request notification permission
      const permissionGranted = await requestNotificationPermission();
      
      if (!permissionGranted) {
        toast({
          title: "Permission Denied",
          description: "Please enable notifications in your browser settings to receive refill reminders.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Register service worker
      const registration = await registerServiceWorker();
      
      if (!registration) {
        toast({
          title: "Setup Failed",
          description: "Unable to register service worker. Please try again.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Subscribe to push notifications
      const subscribed = await subscribeToPushNotifications();
      
      if (subscribed) {
        setIsSubscribed(true);
        toast({
          title: "Notifications Enabled",
          description: "You will now receive medication refill reminders.",
        });
      } else {
        toast({
          title: "Subscription Failed",
          description: "Unable to enable notifications. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to enable notifications:", error);
      toast({
        title: "Error",
        description: "An error occurred while enabling notifications.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      checkSubscriptionStatus();
    }
  };

  const handleDisableNotifications = async () => {
    setIsLoading(true);

    try {
      const success = await unsubscribeFromPushNotifications();
      
      if (success) {
        setIsSubscribed(false);
        toast({
          title: "Notifications Disabled",
          description: "You will no longer receive refill reminders.",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to disable notifications.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to disable notifications:", error);
      toast({
        title: "Error",
        description: "An error occurred while disabling notifications.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      checkSubscriptionStatus();
    }
  };

  const handleTestNotification = async () => {
    setIsLoading(true);

    try {
      const success = await sendTestNotification();
      
      if (success) {
        toast({
          title: "Test Sent",
          description: "A test notification has been sent. Check your device!",
        });
      } else {
        toast({
          title: "Test Failed",
          description: "Unable to send test notification. Make sure notifications are enabled.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to send test notification:", error);
      toast({
        title: "Error",
        description: "An error occurred while sending the test notification.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="gap-1 space-y-0 pb-4">
        <CardTitle className="flex items-center gap-3 text-[28px]">
          <Bell className="h-10 w-10 text-primary" />
          Smart Notifications
        </CardTitle>
        <CardDescription className="text-[20px]">
          Get notified when your medications need refilling
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {permission.denied && (
          <div className="flex items-start gap-3 p-4 rounded-md bg-destructive/10 border-2 border-destructive/30">
            <AlertCircle className="h-8 w-8 text-destructive flex-shrink-0 mt-0.5" />
            <div className="flex-1 space-y-2">
              <p className="text-[22px] font-semibold text-destructive">
                Notifications Blocked
              </p>
              <p className="text-[20px] text-muted-foreground">
                Please enable notifications in your browser settings to receive refill reminders.
              </p>
            </div>
          </div>
        )}

        {isSubscribed ? (
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-5 rounded-md bg-primary/10 border-2 border-primary/30">
              <CheckCircle2 className="h-8 w-8 text-primary flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-[22px] font-semibold text-primary">
                  Notifications Active
                </p>
                <p className="text-[20px] text-muted-foreground mt-1">
                  You will receive alerts when medications are running low.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Button
                variant="outline"
                onClick={handleTestNotification}
                disabled={isLoading}
                className="w-full min-h-[64px] text-[22px]"
                data-testid="button-test-notification"
              >
                <Bell className="h-6 w-6 mr-2" />
                Send Test Notification
              </Button>

              <Button
                variant="outline"
                onClick={handleDisableNotifications}
                disabled={isLoading}
                className="w-full min-h-[64px] text-[22px]"
                data-testid="button-disable-notifications"
              >
                <BellOff className="h-6 w-6 mr-2" />
                Disable Notifications
              </Button>
            </div>
          </div>
        ) : (
          <Button
            onClick={handleEnableNotifications}
            disabled={isLoading || permission.denied}
            className="w-full min-h-[64px] text-[22px]"
            data-testid="button-enable-notifications"
          >
            <Bell className="h-6 w-6 mr-2" />
            {isLoading ? "Setting up..." : "Enable Smart Reminders"}
          </Button>
        )}

        <div className="pt-4 border-t space-y-3">
          <h3 className="font-semibold text-[22px]">How It Works</h3>
          <ul className="space-y-3 text-[20px] text-muted-foreground">
            <li className="flex items-start gap-3">
              <span className="text-primary mt-1 text-[24px] font-bold">•</span>
              <span>Automatically tracks your medication inventory</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary mt-1 text-[24px] font-bold">•</span>
              <span>Sends alerts when pills are running low</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary mt-1 text-[24px] font-bold">•</span>
              <span>Helps you refill on time, every time</span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
