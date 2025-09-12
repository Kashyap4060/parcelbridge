import { supabase } from '@/lib/supabase';

export interface Notification {
  id: string;
  userId: string;
  type: 'parcel_accepted' | 'parcel_delivered' | 'journey_verified' | 'system_message';
  title: string;
  message: string;
  data?: {
    parcelId?: string;
    carrierId?: string;
    journeyId?: string;
    actionUrl?: string;
  };
  isRead: boolean;
  createdAt: Date;
}

export interface CreateNotificationData {
  userId: string;
  type: Notification['type'];
  title: string;
  message: string;
  data?: Notification['data'];
}

class NotificationService {
  /**
   * Create a new notification
   */
  async createNotification(data: CreateNotificationData): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: data.userId,
          type: data.type,
          title: data.title,
          message: data.message,
          data: data.data || {},
          is_read: false,
          created_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Create parcel acceptance notification for sender
   */
  async notifyParcelAccepted(parcelId: string, senderId: string, carrierId: string, journeyId: string): Promise<void> {
    try {
      // Get carrier details
      const { data: carrier, error: carrierError } = await supabase
        .from('user_profiles')
        .select('first_name, last_name, phone')
        .eq('id', carrierId)
        .single();

      if (carrierError) throw carrierError;

      // Get journey details
      const { data: journey, error: journeyError } = await supabase
        .from('train_journeys')
        .select('train_number, train_name, source_station, destination_station, journey_date')
        .eq('id', journeyId)
        .single();

      if (journeyError) throw journeyError;

      const carrierName = `${carrier.first_name} ${carrier.last_name}`.trim();
      const journeyDate = new Date(journey.journey_date).toLocaleDateString();

      await this.createNotification({
        userId: senderId,
        type: 'parcel_accepted',
        title: 'Your parcel has been accepted!',
        message: `${carrierName} has accepted your parcel delivery request. They will be traveling on ${journey.train_name} (${journey.train_number}) on ${journeyDate}.`,
        data: {
          parcelId,
          carrierId,
          journeyId,
          actionUrl: `/dashboard/journey-details/${journeyId}?parcelId=${parcelId}`
        }
      });

      // Optionally send email/SMS notifications
      await this.sendEmailNotification(senderId, {
        subject: 'Parcel Accepted - Parcel Bridge',
        template: 'parcel_accepted',
        data: {
          carrierName,
          trainName: journey.train_name,
          trainNumber: journey.train_number,
          journeyDate,
          parcelId
        }
      });

    } catch (error) {
      console.error('Error notifying parcel acceptance:', error);
      // Don't throw error as this is not critical for the main flow
    }
  }

  /**
   * Get notifications for a user
   */
  async getUserNotifications(userId: string, limit = 20): Promise<Notification[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (data || []).map(n => ({
        id: n.id,
        userId: n.user_id,
        type: n.type,
        title: n.title,
        message: n.message,
        data: n.data || {},
        isRead: n.is_read,
        createdAt: new Date(n.created_at)
      }));
    } catch (error) {
      console.error('Error getting notifications:', error);
      return [];
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  /**
   * Send email notification (placeholder implementation)
   */
  private async sendEmailNotification(userId: string, emailData: {
    subject: string;
    template: string;
    data: any;
  }): Promise<void> {
    try {
      // Get user email
      const { data: user, error } = await supabase
        .from('user_profiles')
        .select('email')
        .eq('id', userId)
        .single();

      if (error || !user.email) return;

      // TODO: Integrate with email service (SendGrid, AWS SES, etc.)
      console.log('Email notification would be sent:', {
        to: user.email,
        subject: emailData.subject,
        template: emailData.template,
        data: emailData.data
      });

      // Example API call to email service:
      // await fetch('/api/send-email', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     to: user.email,
      //     subject: emailData.subject,
      //     template: emailData.template,
      //     data: emailData.data
      //   })
      // });

    } catch (error) {
      console.error('Error sending email notification:', error);
    }
  }

  /**
   * Send SMS notification (placeholder implementation)
   */
  private async sendSMSNotification(userId: string, message: string): Promise<void> {
    try {
      // Get user phone
      const { data: user, error } = await supabase
        .from('user_profiles')
        .select('phone')
        .eq('id', userId)
        .single();

      if (error || !user.phone) return;

      // TODO: Integrate with SMS service (Twilio, AWS SNS, etc.)
      console.log('SMS notification would be sent:', {
        to: user.phone,
        message
      });

    } catch (error) {
      console.error('Error sending SMS notification:', error);
    }
  }

  /**
   * Subscribe to real-time notifications for a user
   */
  subscribeToNotifications(userId: string, callback: (notification: Notification) => void) {
    const subscription = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          const notification: Notification = {
            id: payload.new.id,
            userId: payload.new.user_id,
            type: payload.new.type,
            title: payload.new.title,
            message: payload.new.message,
            data: payload.new.data || {},
            isRead: payload.new.is_read,
            createdAt: new Date(payload.new.created_at)
          };
          callback(notification);
        }
      )
      .subscribe();

    return subscription;
  }
}

export const notificationService = new NotificationService();
export default notificationService;