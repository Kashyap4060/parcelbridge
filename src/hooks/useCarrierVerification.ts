export function useCarrierVerification() {
  return {
    user: null,
    walletBalance: 0,
    lockedAmount: 0,
    isLoadingWallet: false,
    minimumCollateral: 300,
    isCarrierVerified: () => false,
    isFullyVerified: () => false,
    checkParcelAcceptanceEligibility: () => ({ canAccept: false }),
    checkWalletSufficiency: () => ({ sufficient: false }),
    getParcelAcceptanceStatus: () => ({ 
      canAccept: false, 
      reason: 'Service unavailable', 
      message: 'Migration in progress',
      action: 'upgrade-wallet',
      actionText: 'Add Funds',
      requiredAmount: 300
    }),
    getCollateralStatus: () => ({ 
      hasEnoughBalance: false, 
      availableBalance: 0, 
      totalBalance: 0, 
      lockedAmount: 0, 
      minimumRequired: 300,
      canAcceptMore: false,
      shortfall: 300
    }),
    canAcceptParcels: false,
    hasActiveJourney: false
  };
}