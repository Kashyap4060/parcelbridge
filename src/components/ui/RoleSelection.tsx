'use client';

import { useState } from 'react';
import { UserRole } from '@/types';
import { Button } from './Button';

interface RoleSelectionProps {
  onRoleSelect: (role: UserRole) => Promise<void>;
  isLoading?: boolean;
}

export function RoleSelection({ onRoleSelect, isLoading = false }: RoleSelectionProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  const roles = [
    {
      value: 'sender' as UserRole,
      title: 'Sender',
      description: 'Send parcels through train passengers',
      features: [
        'Post parcel delivery requests',
        'Track your parcels in real-time',
        'Secure payment through escrow',
        'Rate and review carriers'
      ],
      icon: '📦'
    },
    {
      value: 'carrier' as UserRole,
      title: 'Carrier',
      description: 'Earn money by delivering parcels during your train journeys',
      features: [
        'Add your train journeys',
        'Accept parcel requests',
        'Earn delivery fees',
        'Build your reputation'
      ],
      icon: '🚆'
    }
  ];

  const handleSubmit = async () => {
    if (selectedRole) {
      await onRoleSelect(selectedRole);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Choose Your Role
          </h1>
          <p className="text-gray-600">
            Select how you want to use Parcel Bridge. You can change this later in your profile.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {roles.map((role) => (
            <div
              key={role.value}
              className={`
                border-2 rounded-lg p-6 cursor-pointer transition-all
                ${selectedRole === role.value
                  ? 'border-primary-600 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
                }
              `}
              onClick={() => setSelectedRole(role.value)}
            >
              <div className="text-center mb-4">
                <div className="text-4xl mb-2">{role.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {role.title}
                </h3>
                <p className="text-gray-600 mt-1">
                  {role.description}
                </p>
              </div>

              <ul className="space-y-2">
                {role.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-sm text-gray-700">
                    <svg
                      className="w-4 h-4 text-green-500 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              {selectedRole === role.value && (
                <div className="mt-4 text-center">
                  <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                    Selected
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="text-center">
          <Button
            onClick={handleSubmit}
            disabled={!selectedRole || isLoading}
            className="px-8 py-3"
          >
            {isLoading ? 'Setting up your account...' : 'Continue'}
          </Button>
        </div>
      </div>
    </div>
  );
}
