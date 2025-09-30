import { useState, useEffect, useCallback, useRef } from 'react';
import { CreditService, CreditDeductionResult } from '../services/creditService';

export interface CreditState {
  credits: number;
  loading: boolean;
  error: string | null;
  threshold: 'healthy' | 'warning' | 'critical' | 'depleted';
}

/**
 * Hook for managing credit state with real-time updates
 */
export const useCredits = () => {
  const [state, setState] = useState<CreditState>({
    credits: 0,
    loading: true,
    error: null,
    threshold: 'healthy'
  });

  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Fetch current credits
  const fetchCredits = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const credits = await CreditService.getCurrentCredits();
      const threshold = CreditService.getCreditThreshold(credits);
      
      setState({
        credits,
        loading: false,
        error: null,
        threshold
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch credits'
      }));
    }
  }, []);

  // Refresh credits manually
  const refreshCredits = useCallback(() => {
    fetchCredits();
  }, [fetchCredits]);

  // Set up real-time subscription
  useEffect(() => {
    // Initial fetch
    fetchCredits();

    // Set up real-time subscription
    unsubscribeRef.current = CreditService.subscribeToCredits((credits) => {
      const threshold = CreditService.getCreditThreshold(credits);
      setState(prev => ({
        ...prev,
        credits,
        threshold,
        error: null
      }));
    });

    // Cleanup subscription on unmount
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [fetchCredits]);

  return {
    ...state,
    refreshCredits,
    hasCredits: state.credits > 0
  };
};

/**
 * Hook for managing credit deduction operations
 */
export const useCreditDeduction = () => {
  const [isDeducting, setIsDeducting] = useState(false);
  const [lastDeductionResult, setLastDeductionResult] = useState<CreditDeductionResult | null>(null);

  const deductCredit = useCallback(async (
    userId: string,
    imageDetails?: Record<string, unknown>
  ): Promise<CreditDeductionResult> => {
    setIsDeducting(true);
    try {
      const result = await CreditService.deductCredit(userId, imageDetails);
      setLastDeductionResult(result);
      return result;
    } catch (error) {
      const errorResult: CreditDeductionResult = {
        success: false,
        remainingCredits: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      setLastDeductionResult(errorResult);
      return errorResult;
    } finally {
      setIsDeducting(false);
    }
  }, []);

  const refundCredit = useCallback(async (
    usageRecordId: string,
    reason?: string
  ): Promise<boolean> => {
    try {
      const success = await CreditService.refundCredit(usageRecordId, reason);
      return success;
    } catch (error) {
      console.error('Error refunding credit:', error);
      return false;
    }
  }, []);

  return {
    deductCredit,
    refundCredit,
    isDeducting,
    lastDeductionResult
  };
};

/**
 * Hook for fetching credit usage analytics
 */
export const useCreditAnalytics = (timeframe: 'day' | 'week' | 'month' = 'week') => {
  const [analytics, setAnalytics] = useState<{
    totalOperations: number;
    successfulOperations: number;
    failedOperations: number;
    totalCreditsUsed: number;
    successRate: number;
    userUsage: Array<{
      userId: string;
      operations: number;
      creditsUsed: number;
      successfulOps: number;
    }>;
    avgProcessingTime: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await CreditService.getCreditAnalytics(timeframe);
      setAnalytics(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  }, [timeframe]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    analytics,
    loading,
    error,
    refreshAnalytics: fetchAnalytics
  };
};

/**
 * Hook for credit-aware image processing
 * Combines credit checking, deduction, and refund logic
 */
export const useCreditAwareProcessing = (userId: string) => {
  const { credits, hasCredits, threshold, refreshCredits } = useCredits();
  const { deductCredit, refundCredit, isDeducting } = useCreditDeduction();
  const [isProcessing, setIsProcessing] = useState(false);

  const processWithCredits = useCallback(async <T>(
    processingFunction: () => Promise<T>,
    imageDetails?: Record<string, unknown>
  ): Promise<{ success: boolean; result?: T; error?: string }> => {
    // Check if credits are available
    if (!hasCredits) {
      return {
        success: false,
        error: 'No credits available for processing'
      };
    }

    setIsProcessing(true);
    let usageRecordId: string | undefined;

    try {
      // Deduct credit before processing
      const deductionResult = await deductCredit(userId, imageDetails);
      
      if (!deductionResult.success) {
        return {
          success: false,
          error: deductionResult.error || 'Failed to deduct credit'
        };
      }

      usageRecordId = deductionResult.usageRecordId;

      // Execute the processing function
      const result = await processingFunction();

      return {
        success: true,
        result
      };

    } catch (error) {
      // If processing failed, refund the credit
      if (usageRecordId) {
        await refundCredit(
          usageRecordId, 
          error instanceof Error ? error.message : 'Processing failed'
        );
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Processing failed'
      };
    } finally {
      setIsProcessing(false);
    }
  }, [hasCredits, deductCredit, refundCredit, userId]);

  return {
  credits,
  hasCredits,
  threshold,
  isProcessing: isProcessing || isDeducting,
  processWithCredits,
  canProcess: hasCredits && !isProcessing && !isDeducting,
  refreshCredits
  };
};