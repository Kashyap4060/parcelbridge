'use client';

import { useState, useEffect } from 'react';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { useRequireRole } from '@/hooks/useRequireRole';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  UserIcon,
  IdentificationIcon,
  CalendarIcon,
  MapPinIcon,
  FunnelIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

interface AadhaarVerificationRecord {
  id: string;
  userId: string;
  userName: string;
  userRole: 'sender' | 'carrier';
  aadhaarNumber: string;
  fullName: string;
  dateOfBirth: string;
  address: string;
  status: 'pending' | 'verified' | 'rejected';
  verificationDate: string;
  createdAt: string;
}

export default function AadhaarVerificationsPage() {
  const { user, isAuthenticated } = useSimpleAuth();
  const { isLoading, isAuthorized } = useRequireRole('admin');
  const [verifications, setVerifications] = useState<AadhaarVerificationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'verified' | 'rejected'>('all');

  useEffect(() => {
    if (isLoading || !isAuthorized) return;
    loadVerifications();
  }, [isLoading, isAuthorized]);

  const loadVerifications = async () => {
    try {
      setLoading(true);
      // TODO: Implement actual API call to fetch Aadhaar verifications
      // const data = await getAadhaarVerifications();
      
      // Mock data for now
      const mockData: AadhaarVerificationRecord[] = [
        {
          id: '1',
          userId: 'user1',
          userName: 'John Doe',
          userRole: 'carrier',
          aadhaarNumber: '1234 5678 9012',
          fullName: 'JOHN DOE',
          dateOfBirth: '1990-01-15',
          address: 'Mumbai, Maharashtra, India',
          status: 'pending',
          verificationDate: '',
          createdAt: new Date().toISOString(),
        },
      ];
      
      setVerifications(mockData);
    } catch (error) {
      console.error('Error loading verifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: 'verified' | 'rejected') => {
    try {
      // TODO: Implement actual API call to update verification status
      // await updateAadhaarVerificationStatus(id, newStatus);
      
      setVerifications(prev =>
        prev.map(v =>
          v.id === id
            ? { ...v, status: newStatus, verificationDate: new Date().toISOString() }
            : v
        )
      );
    } catch (error) {
      console.error('Error updating verification status:', error);
    }
  };

  const filteredVerifications = verifications.filter(v => 
    filter === 'all' || v.status === filter
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case 'rejected':
        return <ExclamationCircleIcon className="h-5 w-5 text-red-600" />;
      default:
        return <ExclamationCircleIcon className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getStatusVariant = (status: string): "success" | "warning" | "error" => {
    switch (status) {
      case 'verified':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'warning';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!isAuthenticated || !user || !isAuthorized) {
    return <div>Access denied</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl">Aadhaar Verifications</CardTitle>
              <CardDescription>
                Manage user identity verification requests
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <FunnelIcon className="h-4 w-4 text-muted-foreground" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="border border-input rounded-md px-3 py-1 text-sm bg-background"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="verified">Verified</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">Loading verifications...</p>
            </div>
          ) : filteredVerifications.length === 0 ? (
            <div className="text-center py-8">
              <IdentificationIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                No {filter !== 'all' ? filter : ''} verifications found
              </h3>
              <p className="text-muted-foreground">
                {filter === 'all' 
                  ? 'No Aadhaar verifications have been submitted yet.'
                  : `No ${filter} verifications at this time.`
                }
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Aadhaar Number</TableHead>
                    <TableHead>Full Name</TableHead>
                    <TableHead>Date of Birth</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead className="w-[200px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVerifications.map((verification) => (
                    <TableRow key={verification.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <UserIcon className="h-4 w-4 text-muted-foreground" />
                          {verification.userName}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {verification.userRole}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {verification.aadhaarNumber}
                      </TableCell>
                      <TableCell>{verification.fullName}</TableCell>
                      <TableCell>{formatDate(verification.dateOfBirth)}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(verification.status)}>
                          {verification.status.charAt(0).toUpperCase() + verification.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(verification.createdAt)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <EyeIcon className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          {verification.status === 'pending' && (
                            <>
                              <Button 
                                size="sm" 
                                variant="default"
                                onClick={() => handleStatusUpdate(verification.id, 'verified')}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircleIcon className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => handleStatusUpdate(verification.id, 'rejected')}
                              >
                                <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}




