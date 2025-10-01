import { supabase } from '../../lib/supabaseClient';
import { exemptAdminUUIDs } from '../config/adminList';

export interface CreditUsageRecord {
  id: string;
  user_id: string;
  credits_used: number;
  operation_type: string;
  image_details: Record<string, unknown>;
  processing_time_ms?: number;
  success: boolean;
  error_details?: string;
  timestamp: string;
}

export interface CreditDeductionResult {
  success: boolean;
  remainingCredits: number;
  usageRecordId?: string;
  error?: string;
}

export interface CreditBalance {
  total_credits: number;
  used_credits: number;
  remaining_credits: number;
  last_updated: string;
}

export class CreditService {
  /**
   * Get current credit balance
   * @returns Current number of remaining credits
   */
  static async getCurrentCredits(): Promise<number> {
    try {
      console.log('Fetching credits from admin_credits table...');
      
      const { data, error } = await supabase
        .from('admin_credits')
        .select('remaining_credits')
        .order('id', { ascending: false })
        .limit(1)
        .single();

      console.log('Supabase query result:', { data, error });

      if (error) {
        console.error('Supabase error details:', error);
        throw new Error(`Failed to fetch credits: ${error.message || JSON.stringify(error)}`);
      }

      if (!data) {
        console.warn('No credit data found, returning 0');
        return 0;
      }

      console.log('Successfully fetched credits:', data.remaining_credits);
      return data?.remaining_credits || 0;
    } catch (error) {
      console.error('Credit fetch error:', error);
      // Return 0 instead of throwing to prevent UI crashes
      return 0;
    }
  }

  /**
   * Get full credit balance details
   * @returns Complete credit balance information
   */
  static async getCreditBalance(): Promise<CreditBalance | null> {
    try {
      const { data, error } = await supabase
        .from('admin_credits')
        .select('total_credits, used_credits, remaining_credits, last_updated')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error('Error fetching credit balance:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Credit balance fetch error:', error);
      return null;
    }
  }

  /**
   * Attempt to deduct credit before processing (atomic operation)
   * @param userId - ID of the user requesting credit deduction
   * @param imageDetails - Optional details about the image processing operation
   * @returns Result object with success status and remaining credits
   */
  static async deductCredit(
    userId: string,
    imageDetails?: Record<string, unknown>
  ): Promise<CreditDeductionResult> {
    // Exempt certain admin UUIDs from credit deduction
    if (exemptAdminUUIDs.includes(userId)) {
      return {
        success: true,
        remainingCredits: Number.POSITIVE_INFINITY,
        usageRecordId: undefined,
        error: undefined
      };
    }
    try {
      // Call the atomic credit deduction function
      const { data, error } = await supabase.rpc('deduct_admin_credit', {
        user_uuid: userId, // Now accepts both UUID and email strings
        operation_details: imageDetails || {}
      });

      if (error) {
        console.error('Error deducting credit:', error);
        return {
          success: false,
          remainingCredits: 0,
          error: error.message
        };
      }

      // The function returns a table, so we get the first row
      const result = data?.[0];
      
      if (!result) {
        return {
          success: false,
          remainingCredits: 0,
          error: 'No result returned from credit deduction'
        };
      }

      // If successful, get the usage record ID for potential refund
      let usageRecordId: string | undefined;
      if (result.success) {
        const { data: usageData } = await supabase
          .from('admin_credit_usage')
          .select('id')
          .eq('user_id', userId)
          .order('timestamp', { ascending: false })
          .limit(1)
          .single();
        
        usageRecordId = usageData?.id;
      }

      return {
        success: result.success,
        remainingCredits: result.remaining_credits,
        usageRecordId
      };
    } catch (error) {
      console.error('Credit deduction error:', error);
      return {
        success: false,
        remainingCredits: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Refund credit if processing fails
   * @param usageRecordId - ID of the usage record to refund
   * @param reason - Reason for the refund
   * @returns Success status of refund operation
   */
  static async refundCredit(
    usageRecordId: string,
    reason: string = 'processing_failed'
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('refund_admin_credit', {
        usage_record_id: usageRecordId,
        reason
      });

      if (error) {
        console.error('Error refunding credit:', error);
        return false;
      }

      return data === true;
    } catch (error) {
      console.error('Credit refund error:', error);
      return false;
    }
  }

  /**
   * Get credit usage history
   * @param timeframe - Time period to fetch usage for
   * @returns Array of usage records
   */
  static async getCreditUsage(
    timeframe: 'day' | 'week' | 'month' = 'week'
  ): Promise<CreditUsageRecord[]> {
    try {
      let interval = '7 days';
      switch (timeframe) {
        case 'day':
          interval = '1 day';
          break;
        case 'month':
          interval = '30 days';
          break;
        default:
          interval = '7 days';
      }

      const { data, error } = await supabase
        .from('admin_credit_usage')
        .select('*')
        .gte('timestamp', `now() - interval '${interval}'`)
        .order('timestamp', { ascending: false });

      if (error) {
        console.error('Error fetching credit usage:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Credit usage fetch error:', error);
      return [];
    }
  }

  /**
   * Get credit usage analytics
   * @param timeframe - Time period for analytics
   * @returns Usage analytics data
   */
  static async getCreditAnalytics(timeframe: 'day' | 'week' | 'month' = 'week') {
    try {
      const usage = await this.getCreditUsage(timeframe);
      
      const totalOperations = usage.length;
      const successfulOperations = usage.filter(u => u.success).length;
      const failedOperations = totalOperations - successfulOperations;
      const totalCreditsUsed = usage.reduce((sum, u) => sum + u.credits_used, 0);
      const successRate = totalOperations > 0 ? (successfulOperations / totalOperations) * 100 : 0;
      
      // Group by user
        const userUsage = usage.reduce((acc, record) => {
        if (!acc[record.user_id]) {
          acc[record.user_id] = {
            userId: record.user_id,
            operations: 0,
            creditsUsed: 0,
            successfulOps: 0
          };
        }
        acc[record.user_id].operations += 1;
        acc[record.user_id].creditsUsed += record.credits_used;
        if (record.success) {
          acc[record.user_id].successfulOps += 1;
        }
        return acc;
      }, {} as Record<string, {
        userId: string;
        operations: number;
        creditsUsed: number;
        successfulOps: number;
      }>);      return {
        totalOperations,
        successfulOperations,
        failedOperations,
        totalCreditsUsed,
        successRate: Math.round(successRate * 100) / 100,
        userUsage: Object.values(userUsage),
        avgProcessingTime: usage.length > 0 
          ? Math.round(usage.reduce((sum, u) => sum + (u.processing_time_ms || 0), 0) / usage.length)
          : 0
      };
    } catch (error) {
      console.error('Error fetching credit analytics:', error);
      return null;
    }
  }

  /**
   * Subscribe to real-time credit updates
   * @param callback - Function to call when credits change
   * @returns Unsubscribe function
   */
  static subscribeToCredits(callback: (credits: number) => void): () => void {
    const subscription = supabase
      .channel('admin_credits_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'admin_credits'
        },
        (payload: { new?: { remaining_credits?: number } }) => {
          const newCredits = payload.new?.remaining_credits;
          if (typeof newCredits === 'number') {
            callback(newCredits);
          }
        }
      )
      .subscribe();

    // Return unsubscribe function
    return () => {
      supabase.removeChannel(subscription);
    };
  }

  /**
   * Check if credits are available for processing
   * @returns Boolean indicating if processing can proceed
   */
  static async hasCreditsAvailable(): Promise<boolean> {
    try {
      const credits = await this.getCurrentCredits();
      return credits > 0;
    } catch (error) {
      console.error('Error checking credit availability:', error);
      return false;
    }
  }

  /**
   * Get credit threshold status for UI styling
   * @param credits - Current credit count
   * @param total - Total credits (default 100)
   * @returns Threshold status for styling
   */
  static getCreditThreshold(credits: number, total: number = 100): 'healthy' | 'warning' | 'critical' | 'depleted' {
    const percentage = (credits / total) * 100;
    
    if (credits === 0) return 'depleted';
    if (percentage <= 5) return 'critical';
    if (percentage <= 20) return 'warning';
    return 'healthy';
  }
}