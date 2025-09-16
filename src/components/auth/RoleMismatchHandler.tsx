/**
 * Role Mismatch Handler Component
 * Handles scenarios where authenticated users access features requiring different roles
 * Provides contextual options instead of generic redirects
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ExclamationTriangleIcon, 
  ArrowRightIcon,
  UserIcon,
  TruckIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';

interface RoleMismatchHandlerProps {
  requiredRole: 'sender' | 'carrier';
  currentRole: string;
  requestedUrl: string;
  featureName?: string;
}

const roleInfo = {
  sender: {
    name: 'Sender',
    description: 'Send parcels through train passengers',
    icon: PaperAirplaneIcon,
    color: 'blue',
    features: ['Create parcel requests', 'Track deliveries', 'Manage payments']
  },
  carrier: {
    name: 'Carrier', 
    description: 'Deliver parcels during train journeys',
    icon: TruckIcon,
    color: 'green',
    features: ['Add journeys', 'Accept delivery requests', 'Earn money']
  },
  admin: {
    name: 'Admin',
    description: 'Manage platform and users',
    icon: UserIcon,
    color: 'purple',
    features: ['User verification', 'Platform oversight', 'System management']
  }
};

export function RoleMismatchHandler({ 
  requiredRole, 
  currentRole, 
  requestedUrl,
  featureName 
}: RoleMismatchHandlerProps) {
  const router = useRouter();
  const { updateUserRole } = useSimpleAuth();
  const [switching, setSwitching] = useState(false);
  
  const required = roleInfo[requiredRole];
  const current = roleInfo[currentRole as keyof typeof roleInfo];
  
  const handleRoleSwitch = async () => {
    setSwitching(true);
    try {
      const result = await updateUserRole(requiredRole);
      if (!result.error) {
        // Successfully switched, redirect to original URL
        console.log(`[RoleMismatch] Switched to ${requiredRole}, redirecting to: ${requestedUrl}`);
        router.push(requestedUrl);
      } else {
        console.error('Role switch failed:', result.error);
        // Show error message
      }
    } catch (error) {
      console.error('Role switch error:', error);
    } finally {
      setSwitching(false);
    }
  };

  const handleGoToDashboard = () => {
    router.push(`/dashboard/${currentRole}`);
  };

  const handleLearnMore = () => {
    // Could open a modal or go to info page
    router.push(`/about/roles#${requiredRole}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <Card className="max-w-lg w-full">
        <CardHeader className="text-center">
          <div className={`mx-auto w-16 h-16 bg-${required.color}-100 rounded-full flex items-center justify-center mb-4`}>
            <required.icon className={`w-8 h-8 text-${required.color}-600`} />
          </div>
          <CardTitle className="text-2xl">
            {required.name} Access Required
          </CardTitle>
          <CardDescription>
            {featureName ? `"${featureName}"` : 'This feature'} requires {required.name.toLowerCase()} role access
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Feature explanation */}
          <div className={`p-4 bg-${required.color}-50 rounded-lg border border-${required.color}-200`}>
            <h3 className={`font-semibold text-${required.color}-900 mb-2`}>
              What {required.name}s can do:
            </h3>
            <ul className={`text-sm text-${required.color}-700 space-y-1`}>
              {required.features.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <div className={`w-1.5 h-1.5 bg-${required.color}-500 rounded-full mr-2`} />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Current role info */}
          <div className="text-center text-sm text-gray-600">
            You're currently signed in as a <span className="font-semibold">{current?.name}</span>
          </div>

          {/* Action buttons */}
          <div className="space-y-3">
            {/* Primary: Switch role */}
            <Button 
              onClick={handleRoleSwitch}
              disabled={switching}
              className="w-full"
              size="lg"
            >
              {switching ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Switching to {required.name}...
                </>
              ) : (
                <>
                  Switch to {required.name} Role
                  <ArrowRightIcon className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>

            {/* Secondary options */}
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                onClick={handleGoToDashboard}
                className="w-full"
              >
                My {current?.name} Dashboard
              </Button>
              <Button 
                variant="outline" 
                onClick={handleLearnMore}
                className="w-full"
              >
                Learn More
              </Button>
            </div>
          </div>

          {/* Additional info */}
          <div className="text-xs text-gray-500 text-center">
            You can switch between roles anytime in your profile settings
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default RoleMismatchHandler;