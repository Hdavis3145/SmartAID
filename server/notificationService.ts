import webPush from 'web-push';
import { storage } from './storage';

// VAPID keys from environment variables
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;

if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
  console.error('VAPID keys not configured. Push notifications will not work.');
} else {
  // Configure web-push with VAPID details
  webPush.setVapidDetails(
    'mailto:smartaid@example.com',
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  );
}

export interface PushSubscription {
  endpoint: string;
  expirationTime?: number | null;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
  url?: string;
}

class NotificationService {
  private subscriptions: Map<string, PushSubscription> = new Map();
  private schedulerInterval: NodeJS.Timeout | null = null;
  private medicationReminderInterval: NodeJS.Timeout | null = null;
  private sentRemindersToday: Set<string> = new Set(); // Track sent reminders by "${userId}-${medId}-${time}"

  async loadPersistedSubscriptions(): Promise<void> {
    try {
      // Load all users' subscriptions from database
      const allSubscriptions = await storage.getAllSubscriptions();
      for (const subscription of allSubscriptions) {
        const pushSubscription: PushSubscription = {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.p256dh,
            auth: subscription.auth,
          },
          expirationTime: subscription.expirationTime?.getTime() || null,
        };
        this.subscriptions.set(subscription.userId, pushSubscription);
        console.log(`Loaded persisted subscription for user: ${subscription.userId}`);
      }
    } catch (error) {
      console.error('Failed to load persisted subscriptions:', error);
    }
  }

  async checkAndSendRefillReminders(): Promise<void> {
    try {
      // Check refill reminders for all users with active subscriptions
      const userIds = Array.from(this.subscriptions.keys());
      for (const userId of userIds) {
        try {
          const medications = await storage.getMedications(userId);

          for (const med of medications) {
            const pillsRemaining = med.pillsRemaining ?? 0;
            const refillThreshold = med.refillThreshold ?? 7;

            // Send notification if medication needs refilling
            if (pillsRemaining > 0 && pillsRemaining <= refillThreshold) {
              console.log(`Sending refill reminder for ${med.name}: ${pillsRemaining} pills remaining`);
              await this.sendRefillReminder(userId, med.name, pillsRemaining);
            }
          }
        } catch (error) {
          console.error(`Failed to check refill reminders for user ${userId}:`, error);
        }
      }
    } catch (error) {
      console.error('Failed to check and send refill reminders:', error);
    }
  }

  startRefillReminderScheduler(intervalHours: number = 24): void {
    // Clear existing interval if any
    if (this.schedulerInterval) {
      clearInterval(this.schedulerInterval);
    }

    // Run immediately on start
    this.checkAndSendRefillReminders();

    // Then run periodically
    const intervalMs = intervalHours * 60 * 60 * 1000;
    this.schedulerInterval = setInterval(() => {
      this.checkAndSendRefillReminders();
    }, intervalMs);

    console.log(`Refill reminder scheduler started (checking every ${intervalHours} hours)`);
  }

  stopRefillReminderScheduler(): void {
    if (this.schedulerInterval) {
      clearInterval(this.schedulerInterval);
      this.schedulerInterval = null;
      console.log('Refill reminder scheduler stopped');
    }
  }

  async checkAndSendMedicationReminders(): Promise<void> {
    try {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentDate = now.toISOString().split('T')[0]; // YYYY-MM-DD
      
      // Reset sent reminders if we've entered a new day (date-based, not time-based)
      const lastResetDate = (this as any).lastResetDate;
      if (lastResetDate !== currentDate) {
        this.sentRemindersToday.clear();
        (this as any).lastResetDate = currentDate;
        console.log(`🔄 Reset sent reminders for new day: ${currentDate}`);
      }

      // Get ALL users from storage, not just those with active subscriptions
      const allUsers = await storage.getAllUsers();
      
      for (const user of allUsers) {
        try {
          const medications = await storage.getMedications(user.id);

          for (const med of medications) {
            for (const scheduledTime of med.times) {
              // Parse scheduled time (format: "HH:MM")
              const [schedHour, schedMin] = scheduledTime.split(':').map(Number);
              
              // Send reminder 15 minutes before scheduled time
              const reminderHour = schedHour;
              const reminderMin = schedMin - 15;
              
              // Adjust for negative minutes (e.g., 00:10 → 23:55 previous hour)
              let adjustedHour = reminderHour;
              let adjustedMin = reminderMin;
              
              if (adjustedMin < 0) {
                adjustedMin += 60;
                adjustedHour -= 1;
                if (adjustedHour < 0) adjustedHour += 24;
              }

              // Check if it's time to send reminder
              if (currentHour === adjustedHour && currentMinute === adjustedMin) {
                // Use date-based key to allow re-sending if schedule changes
                const reminderKey = `${currentDate}-${user.id}-${med.id}-${scheduledTime}`;
                
                // Only send once per day per medication time
                if (!this.sentRemindersToday.has(reminderKey)) {
                  // Check if user has an active push subscription
                  const hasSubscription = this.subscriptions.has(user.id);
                  
                  if (hasSubscription) {
                    console.log(`⏰ Sending medication reminder for ${med.name} at ${scheduledTime}`);
                    await this.sendMedicationReminder(user.id, med.name, scheduledTime);
                    this.sentRemindersToday.add(reminderKey);
                  } else {
                    console.log(`⚠️  Skipping reminder for ${med.name} at ${scheduledTime} - no push subscription for user ${user.id}`);
                  }
                }
              }
            }
          }
        } catch (error) {
          console.error(`Failed to check medication reminders for user ${user.id}:`, error);
        }
      }
    } catch (error) {
      console.error('Failed to check and send medication reminders:', error);
    }
  }

  startMedicationReminderScheduler(): void {
    // Clear existing interval if any
    if (this.medicationReminderInterval) {
      clearInterval(this.medicationReminderInterval);
    }

    // Run immediately on start
    this.checkAndSendMedicationReminders();

    // Check every minute for upcoming medication times
    this.medicationReminderInterval = setInterval(() => {
      this.checkAndSendMedicationReminders();
    }, 60 * 1000); // 1 minute

    console.log('⏰ Medication reminder scheduler started (checking every minute)');
  }

  stopMedicationReminderScheduler(): void {
    if (this.medicationReminderInterval) {
      clearInterval(this.medicationReminderInterval);
      this.medicationReminderInterval = null;
      console.log('Medication reminder scheduler stopped');
    }
  }

  getVapidPublicKey(): string {
    return VAPID_PUBLIC_KEY || '';
  }

  addSubscription(userId: string, subscription: PushSubscription): void {
    this.subscriptions.set(userId, subscription);
    console.log('Subscription added for user:', userId);
  }

  removeSubscription(userId: string): void {
    this.subscriptions.delete(userId);
    console.log('Subscription removed for user:', userId);
  }

  async sendNotification(userId: string, payload: NotificationPayload): Promise<boolean> {
    const subscription = this.subscriptions.get(userId);
    
    if (!subscription) {
      console.warn('No subscription found for user:', userId);
      return false;
    }

    try {
      const notificationPayload = JSON.stringify(payload);
      
      await webPush.sendNotification(
        subscription,
        notificationPayload,
        {
          TTL: 60 * 60 * 24, // 24 hours
        }
      );
      
      console.log('Notification sent successfully to:', userId);
      return true;
    } catch (error: any) {
      console.error('Failed to send notification:', error);
      
      // Remove subscription if it's invalid (410 Gone)
      if (error.statusCode === 410) {
        this.removeSubscription(userId);
      }
      
      return false;
    }
  }

  async sendRefillReminder(
    userId: string,
    medicationName: string,
    pillsRemaining: number
  ): Promise<boolean> {
    const payload: NotificationPayload = {
      title: 'Medication Refill Reminder',
      body: `${medicationName} is running low (${pillsRemaining} pills remaining). Time to refill!`,
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      tag: `refill-${medicationName}`,
      data: {
        type: 'refill-reminder',
        medicationName,
        pillsRemaining,
      },
      url: '/schedule',
    };

    return this.sendNotification(userId, payload);
  }

  async sendMedicationReminder(
    userId: string,
    medicationName: string,
    scheduledTime: string
  ): Promise<boolean> {
    const payload: NotificationPayload = {
      title: 'Time for Your Medication',
      body: `Don't forget to take ${medicationName} at ${scheduledTime}`,
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      tag: `medication-${medicationName}`,
      data: {
        type: 'medication-reminder',
        medicationName,
        scheduledTime,
      },
      url: '/scan',
    };

    return this.sendNotification(userId, payload);
  }

  getSubscriptionCount(): number {
    return this.subscriptions.size;
  }
}

export const notificationService = new NotificationService();
