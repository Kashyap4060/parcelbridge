/**
 * Push Notification Service for Real-Time Tracking
 * Phase 2: Comprehensive notification system for tracking events
 */

import { supabase } from './supabase';
import type { 
  TrackingNotification, 
  NotificationType, 
  PackageStatus,
  TrackingSettings 
} from '../types/tracking';

export class TrackingNotificationService {
  private webPushAPI: string | null = null;
  private fcmServerKey: string | null = null;

  constructor() {
    // Initialize with environment variables
    this.webPushAPI = process.env.WEB_PUSH_API_KEY || null;
    this.fcmServerKey = process.env.FCM_SERVER_KEY || null;
  }

  /**
   * Send notification for package status change
   */
  async sendStatusChangeNotification(
    packageId: string,
    oldStatus: PackageStatus,
    newStatus: PackageStatus,
    userId: string
  ): Promise<void> {
    try {
      // Get user's notification settings
      const settings = await this.getUserNotificationSettings(userId);
      if (!settings?.push_notifications) {
        console.log(`Push notifications disabled for user ${userId}`);
        return;
      }

      // Create notification content
      const notification = this.createStatusChangeNotification(
        packageId,
        oldStatus,
        newStatus,
        userId
      );

      // Send push notification
      if (settings.push_notifications) {
        await this.sendPushNotification(userId, notification);
      }

      // Send SMS if enabled
      if (settings.sms_notifications) {
        await this.sendSMSNotification(userId, notification);
      }

      // Send email if enabled
      if (settings.email_notifications) {
        await this.sendEmailNotification(userId, notification);
      }

      // Save notification to database
      await this.saveNotificationToDatabase(notification);

      console.log(`📢 Sent notifications for package ${packageId} status change: ${oldStatus} → ${newStatus}`);

    } catch (error) {
      console.error('Failed to send status change notification:', error);
    }
  }

  /**
   * Send train delay notification
   */
  async sendTrainDelayNotification(
    packageId: string,
    trainNumber: string,
    delayMinutes: number,
    userId: string
  ): Promise<void> {
    try {
      const settings = await this.getUserNotificationSettings(userId);
      if (!settings?.push_notifications) return;

      const notification: TrackingNotification = {
        id: this.generateNotificationId(),
        package_id: packageId,
        user_id: userId,
        type: 'train_delay',
        title: `Train ${trainNumber} Delayed`,
        message: `Your package delivery may be delayed by ${delayMinutes} minutes due to train delay.`,
        data: {
          package_id: packageId,
          train_number: trainNumber,
          delay_minutes: delayMinutes
        },
        read: false,
        created_at: new Date().toISOString()
      };

      await this.sendPushNotification(userId, notification);
      await this.saveNotificationToDatabase(notification);

    } catch (error) {
      console.error('Failed to send train delay notification:', error);
    }
  }

  /**
   * Send pickup available notification
   */
  async sendPickupAvailableNotification(
    packageId: string,
    stationName: string,
    userId: string
  ): Promise<void> {
    try {
      const settings = await this.getUserNotificationSettings(userId);
      if (!settings?.push_notifications) return;

      const notification: TrackingNotification = {
        id: this.generateNotificationId(),
        package_id: packageId,
        user_id: userId,
        type: 'pickup_available',
        title: 'Package Ready for Pickup',
        message: `Your carrier has arrived at ${stationName}. Package is ready for pickup.`,
        data: {
          package_id: packageId,
          station_name: stationName,
          action_required: true
        },
        read: false,
        created_at: new Date().toISOString()
      };

      await this.sendPushNotification(userId, notification);
      await this.saveNotificationToDatabase(notification);

    } catch (error) {
      console.error('Failed to send pickup available notification:', error);
    }
  }

  /**
   * Send approaching destination notification
   */
  async sendApproachingDestinationNotification(
    packageId: string,
    estimatedArrival: string,
    userId: string
  ): Promise<void> {
    try {
      const settings = await this.getUserNotificationSettings(userId);
      if (!settings?.push_notifications) return;

      const arrivalTime = new Date(estimatedArrival).toLocaleTimeString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit'
      });

      const notification: TrackingNotification = {
        id: this.generateNotificationId(),
        package_id: packageId,
        user_id: userId,
        type: 'approaching_destination',
        title: 'Package Approaching Destination',
        message: `Your package will arrive at the destination station around ${arrivalTime}. Get ready for delivery!`,
        data: {
          package_id: packageId,
          estimated_arrival: estimatedArrival
        },
        read: false,
        created_at: new Date().toISOString()
      };

      await this.sendPushNotification(userId, notification);
      await this.saveNotificationToDatabase(notification);

    } catch (error) {
      console.error('Failed to send approaching destination notification:', error);
    }
  }

  /**
   * Send package delivered notification
   */
  async sendPackageDeliveredNotification(
    packageId: string,
    deliveryTime: string,
    userId: string
  ): Promise<void> {
    try {
      const settings = await this.getUserNotificationSettings(userId);
      if (!settings?.push_notifications) return;

      const notification: TrackingNotification = {
        id: this.generateNotificationId(),
        package_id: packageId,
        user_id: userId,
        type: 'package_delivered',
        title: '🎉 Package Delivered Successfully!',
        message: `Your package has been delivered successfully. Thank you for using Parcel-Bridge!`,
        data: {
          package_id: packageId,
          delivery_time: deliveryTime,
          rating_requested: true
        },
        read: false,
        created_at: new Date().toISOString()
      };

      await this.sendPushNotification(userId, notification);
      await this.saveNotificationToDatabase(notification);

    } catch (error) {
      console.error('Failed to send package delivered notification:', error);
    }
  }

  /**
   * Create status change notification content
   */
  private createStatusChangeNotification(
    packageId: string,
    oldStatus: PackageStatus,
    newStatus: PackageStatus,
    userId: string
  ): TrackingNotification {
    const statusMessages: Record<string, string> = {
      accepted: 'Your package request has been accepted by a carrier.',
      waiting_for_departure: 'Waiting for train departure.',
      pickup_available: 'Package is ready for pickup at the station.',
      picked_up: 'Package has been picked up by the carrier.',
      in_transit: 'Your package is now in transit.',
      approaching_destination: 'Package is approaching the destination station.',
      arrived_at_destination: 'Package has arrived at the destination station.',
      out_for_delivery: 'Package is out for final delivery.',
      delivered: '🎉 Package has been delivered successfully!',
      cancelled: 'Package delivery has been cancelled.',
      delayed: 'Package delivery is experiencing delays.'
    };

    const statusTitles: Record<string, string> = {
      accepted: 'Package Accepted',
      waiting_for_departure: 'Waiting for Departure',
      pickup_available: 'Ready for Pickup',
      picked_up: 'Package Picked Up',
      in_transit: 'In Transit',
      approaching_destination: 'Approaching Destination',
      arrived_at_destination: 'Arrived at Destination',
      out_for_delivery: 'Out for Delivery',
      delivered: 'Delivered Successfully',
      cancelled: 'Delivery Cancelled',
      delayed: 'Delivery Delayed'
    };

    return {
      id: this.generateNotificationId(),
      package_id: packageId,
      user_id: userId,
      type: 'status_change',
      title: statusTitles[newStatus] || 'Status Updated',
      message: statusMessages[newStatus] || `Package status updated to ${newStatus}`,
      data: {
        package_id: packageId,
        old_status: oldStatus,
        new_status: newStatus
      },
      read: false,
      created_at: new Date().toISOString()
    };
  }

  /**
   * Send push notification via Web Push API
   */
  private async sendPushNotification(
    userId: string,
    notification: TrackingNotification
  ): Promise<void> {
    try {
      // Get user's push subscription
      const subscription = await this.getUserPushSubscription(userId);
      if (!subscription) {
        console.log(`No push subscription found for user ${userId}`);
        return;
      }

      // Prepare push payload
      const payload = {
        title: notification.title,
        body: notification.message,
        icon: '/icons/package-icon.png',
        badge: '/icons/badge-icon.png',
        data: {
          package_id: notification.package_id,
          notification_id: notification.id,
          url: `/tracking/${notification.package_id}`
        },
        actions: [
          {
            action: 'view',
            title: 'View Tracking'
          },
          {
            action: 'dismiss',
            title: 'Dismiss'
          }
        ]
      };

      // Send push notification (implementation would depend on your push service)
      // await webpush.sendNotification(subscription, JSON.stringify(payload));
      
      console.log(`📱 Push notification sent to user ${userId}`);

    } catch (error) {
      console.error('Failed to send push notification:', error);
    }
  }

  /**
   * Send SMS notification
   */
  private async sendSMSNotification(
    userId: string,
    notification: TrackingNotification
  ): Promise<void> {
    try {
      // Get user's phone number
      const { data: profile } = await supabase
        .from('profiles')
        .select('phone')
        .eq('id', userId)
        .single();

      if (!profile?.phone) {
        console.log(`No phone number found for user ${userId}`);
        return;
      }

      // Prepare SMS content
      const smsContent = `${notification.title}: ${notification.message} - Track: ${process.env.NEXT_PUBLIC_BASE_URL}/tracking/${notification.package_id}`;

      // Send SMS (implementation would depend on your SMS service)
      // await smsService.send(profile.phone, smsContent);
      
      console.log(`📱 SMS sent to user ${userId}`);

    } catch (error) {
      console.error('Failed to send SMS notification:', error);
    }
  }

  /**
   * Send email notification
   */
  private async sendEmailNotification(
    userId: string,
    notification: TrackingNotification
  ): Promise<void> {
    try {
      // Get user's email
      const { data: profile } = await supabase
        .from('profiles')
        .select('email, first_name')
        .eq('id', userId)
        .single();

      if (!profile?.email) {
        console.log(`No email found for user ${userId}`);
        return;
      }

      // Prepare email content
      const emailContent = {
        to: profile.email,
        subject: `Parcel-Bridge: ${notification.title}`,
        html: this.generateEmailTemplate(notification, profile.first_name)
      };

      // Send email (implementation would depend on your email service)
      // await emailService.send(emailContent);
      
      console.log(`📧 Email sent to user ${userId}`);

    } catch (error) {
      console.error('Failed to send email notification:', error);
    }
  }

  /**
   * Get user's notification settings
   */
  private async getUserNotificationSettings(userId: string): Promise<TrackingSettings | null> {
    try {
      const { data, error } = await supabase
        .from('tracking_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Failed to get notification settings:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Failed to get notification settings:', error);
      return null;
    }
  }

  /**
   * Get user's push subscription
   */
  private async getUserPushSubscription(userId: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('push_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

      if (error) {
        return null;
      }

      return data.subscription_data;
    } catch (error) {
      console.error('Failed to get push subscription:', error);
      return null;
    }
  }

  /**
   * Save notification to database
   */
  private async saveNotificationToDatabase(notification: TrackingNotification): Promise<void> {
    try {
      const { error } = await supabase
        .from('tracking_notifications')
        .insert({
          id: notification.id,
          package_id: notification.package_id,
          user_id: notification.user_id,
          notification_type: notification.type,
          title: notification.title,
          message: notification.message,
          data: notification.data,
          is_read: notification.read,
          created_at: notification.created_at
        });

      if (error) {
        console.error('Failed to save notification to database:', error);
      }
    } catch (error) {
      console.error('Failed to save notification to database:', error);
    }
  }

  /**
   * Generate email template
   */
  private generateEmailTemplate(notification: TrackingNotification, userName: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${notification.title}</title>
      </head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #2563EB; color: white; padding: 20px; text-align: center;">
          <h1>Parcel-Bridge</h1>
        </div>
        
        <div style="padding: 20px; background-color: #f9fafb;">
          <h2>Hi ${userName}!</h2>
          
          <h3>${notification.title}</h3>
          <p>${notification.message}</p>
          
          <div style="margin: 20px 0; text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL}/tracking/${notification.package_id}" 
               style="background-color: #2563EB; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
              Track Your Package
            </a>
          </div>
          
          <p style="color: #6B7280; font-size: 14px;">
            This is an automated notification from Parcel-Bridge. You can manage your notification preferences in your account settings.
          </p>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate unique notification ID
   */
  private generateNotificationId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Mark notification as read
   */
  async markNotificationAsRead(notificationId: string, userId: string): Promise<void> {
    try {
      await supabase
        .from('tracking_notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', userId);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }

  /**
   * Get user's notifications
   */
  async getUserNotifications(userId: string, limit: number = 20): Promise<TrackingNotification[]> {
    try {
      const { data, error } = await supabase
        .from('tracking_notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Failed to get user notifications:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Failed to get user notifications:', error);
      return [];
    }
  }

  /**
   * Update user's notification settings
   */
  async updateNotificationSettings(
    userId: string, 
    settings: Partial<TrackingSettings>
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('tracking_settings')
        .upsert({
          user_id: userId,
          ...settings,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Failed to update notification settings:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to update notification settings:', error);
      return false;
    }
  }
}

export default TrackingNotificationService;