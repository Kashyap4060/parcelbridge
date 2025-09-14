/**
 * Collateral management utilities for carrier system
 * Handles locking/unlocking of ?300 minimum collateral for parcel acceptance
 * Full Supabase implementation
 */

import { supabase } from './supabase';

export const MINIMUM_COLLATERAL = 300;

export interface CollateralTransaction {
  id: string;
  type: 'LOCK' | 'UNLOCK';
  amount: number;
  parcelRequestId: string;
  description: string;
  timestamp: Date;
}

/**
 * Accept parcel with collateral locking
 * Locks ?300 from carrier's available balance as collateral
 */
export async function acceptParcelWithCollateral(
  carrierUid: string,
  parcelRequestId: string,
  currentBalance?: number,
  currentLockedAmount?: number
): Promise<{ success: boolean; error?: string; message?: string }> {
  try {
    // Get current user wallet data if not provided
    let walletBalance: number = currentBalance || 0;
    let lockedAmount: number = currentLockedAmount || 0;

    if (currentBalance === undefined || currentLockedAmount === undefined) {
      const { data: userProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('wallet_balance, locked_amount')
        .eq('id', carrierUid)
        .single();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        return { success: false, error: 'Failed to fetch user profile' };
      }

      walletBalance = userProfile.wallet_balance || 0;
      lockedAmount = userProfile.locked_amount || 0;
    }

    const availableBalance = walletBalance - lockedAmount;
    
    if (availableBalance < MINIMUM_COLLATERAL) {
      return {
        success: false,
        error: `Insufficient balance. Need ?${MINIMUM_COLLATERAL}, but only ?${availableBalance} available.`
      };
    }

    const newLockedAmount = lockedAmount + MINIMUM_COLLATERAL;

    // Start a transaction
    const { error: updateError } = await supabase.rpc('lock_collateral_for_parcel', {
      p_carrier_id: carrierUid,
      p_parcel_request_id: parcelRequestId,
      p_amount: MINIMUM_COLLATERAL
    });

    if (updateError) {
      console.error('Error locking collateral:', updateError);
      
      // Fallback to manual transaction
      const { error: walletError } = await supabase
        .from('user_profiles')
        .update({ locked_amount: newLockedAmount })
        .eq('id', carrierUid);

      if (walletError) {
        console.error('Error updating wallet:', walletError);
        return { success: false, error: 'Failed to lock collateral' };
      }

      // Create transaction record
      const { error: transactionError } = await supabase
        .from('collateral_transactions')
        .insert([{
          user_id: carrierUid,
          parcel_request_id: parcelRequestId,
          type: 'LOCK',
          amount: MINIMUM_COLLATERAL,
          description: `Collateral locked for parcel request ${parcelRequestId}`
        }]);

      if (transactionError) {
        console.error('Error creating transaction record:', transactionError);
        // Rollback wallet update
        await supabase
          .from('user_profiles')
          .update({ locked_amount: lockedAmount })
          .eq('id', carrierUid);
        
        return { success: false, error: 'Failed to record transaction' };
      }
    }

    return {
      success: true,
      message: `Collateral of ?${MINIMUM_COLLATERAL} locked successfully. Parcel accepted.`
    };
  } catch (error) {
    console.error('Error accepting parcel with collateral:', error);
    return { success: false, error: 'Failed to accept parcel' };
  }
}

/**
 * Lock collateral for a parcel acceptance
 */
export async function lockCollateral(
  carrierUid: string,
  parcelRequestId: string,
  currentBalance: number,
  currentLockedAmount: number
): Promise<{ success: boolean; error?: string; newBalance?: number; newLockedAmount?: number }> {
  try {
    const availableBalance = currentBalance - currentLockedAmount;
    
    if (availableBalance < MINIMUM_COLLATERAL) {
      return {
        success: false,
        error: `Insufficient balance. Need ?${MINIMUM_COLLATERAL}, but only ?${availableBalance} available.`
      };
    }

    const newLockedAmount = currentLockedAmount + MINIMUM_COLLATERAL;

    // Update user wallet
    const { error: walletError } = await supabase
      .from('user_profiles')
      .update({ locked_amount: newLockedAmount })
      .eq('id', carrierUid);

    if (walletError) {
      console.error('Error updating wallet:', walletError);
      return { success: false, error: 'Failed to lock collateral' };
    }

    // Create transaction record
    const { error: transactionError } = await supabase
      .from('collateral_transactions')
      .insert([{
        user_id: carrierUid,
        parcel_request_id: parcelRequestId,
        type: 'LOCK',
        amount: MINIMUM_COLLATERAL,
        description: `Collateral locked for parcel request ${parcelRequestId}`
      }]);

    if (transactionError) {
      console.error('Error creating transaction record:', transactionError);
      // Rollback wallet update
      await supabase
        .from('user_profiles')
        .update({ locked_amount: currentLockedAmount })
        .eq('id', carrierUid);
      
      return { success: false, error: 'Failed to record transaction' };
    }

    return {
      success: true,
      newBalance: currentBalance,
      newLockedAmount
    };
  } catch (error) {
    console.error('Error locking collateral:', error);
    return { success: false, error: 'Failed to lock collateral' };
  }
}

/**
 * Unlock collateral after successful parcel delivery
 */
export async function unlockCollateral(
  carrierUid: string,
  parcelRequestId: string,
  currentBalance: number,
  currentLockedAmount: number
): Promise<{ success: boolean; error?: string; newBalance?: number; newLockedAmount?: number }> {
  try {
    if (currentLockedAmount < MINIMUM_COLLATERAL) {
      return {
        success: false,
        error: 'Insufficient locked amount to unlock collateral'
      };
    }

    const newLockedAmount = currentLockedAmount - MINIMUM_COLLATERAL;

    // Update user wallet
    const { error: walletError } = await supabase
      .from('user_profiles')
      .update({ locked_amount: newLockedAmount })
      .eq('id', carrierUid);

    if (walletError) {
      console.error('Error updating wallet:', walletError);
      return { success: false, error: 'Failed to unlock collateral' };
    }

    // Create transaction record
    const { error: transactionError } = await supabase
      .from('collateral_transactions')
      .insert([{
        user_id: carrierUid,
        parcel_request_id: parcelRequestId,
        type: 'UNLOCK',
        amount: MINIMUM_COLLATERAL,
        description: `Collateral unlocked for parcel request ${parcelRequestId}`
      }]);

    if (transactionError) {
      console.error('Error creating transaction record:', transactionError);
      // Rollback wallet update
      await supabase
        .from('user_profiles')
        .update({ locked_amount: currentLockedAmount })
        .eq('id', carrierUid);
      
      return { success: false, error: 'Failed to record transaction' };
    }

    return {
      success: true,
      newBalance: currentBalance,
      newLockedAmount
    };
  } catch (error) {
    console.error('Error unlocking collateral:', error);
    return { success: false, error: 'Failed to unlock collateral' };
  }
}

/**
 * Check if carrier has sufficient collateral available
 */
export async function checkCollateralAvailability(
  carrierUid: string,
  requiredAmount: number = MINIMUM_COLLATERAL
): Promise<{ available: boolean; availableAmount: number; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('wallet_balance, locked_amount')
      .eq('id', carrierUid)
      .single();

    if (error) {
      console.error('Error checking collateral availability:', error);
      return { available: false, availableAmount: 0, error: 'Failed to check balance' };
    }

    const availableAmount = (data.wallet_balance || 0) - (data.locked_amount || 0);
    
    return {
      available: availableAmount >= requiredAmount,
      availableAmount
    };
  } catch (error) {
    console.error('Error checking collateral availability:', error);
    return { available: false, availableAmount: 0, error: 'Failed to check balance' };
  }
}




