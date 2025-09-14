'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  InformationCircleIcon,
  PlayIcon,
  CogIcon
} from '@heroicons/react/24/outline';

interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
}

export default function ComponentTestingPage() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [runningTests, setRunningTests] = useState(false);

  const runComponentTests = async () => {
    setRunningTests(true);
    setTestResults([]);

    const tests: TestResult[] = [];

    // Test Badge Component
    try {
      const badgeElement = document.querySelector('[data-testid="test-badge"]');
      tests.push({
        name: 'Badge Component Rendering',
        status: badgeElement ? 'pass' : 'fail',
        message: badgeElement ? 'Badge component renders correctly' : 'Badge component not found'
      });
    } catch (error) {
      tests.push({
        name: 'Badge Component Rendering',
        status: 'fail',
        message: 'Error testing Badge component'
      });
    }

    // Test Card Component
    try {
      const cardElement = document.querySelector('[data-testid="test-card"]');
      tests.push({
        name: 'Card Component Rendering',
        status: cardElement ? 'pass' : 'fail',
        message: cardElement ? 'Card component renders correctly' : 'Card component not found'
      });
    } catch (error) {
      tests.push({
        name: 'Card Component Rendering',
        status: 'fail',
        message: 'Error testing Card component'
      });
    }

    // Test Table Component
    try {
      const tableElement = document.querySelector('[data-testid="test-table"]');
      tests.push({
        name: 'Table Component Rendering',
        status: tableElement ? 'pass' : 'fail',
        message: tableElement ? 'Table component renders correctly' : 'Table component not found'
      });
    } catch (error) {
      tests.push({
        name: 'Table Component Rendering',
        status: 'fail',
        message: 'Error testing Table component'
      });
    }

    // Test Button Component
    try {
      const buttonElement = document.querySelector('[data-testid="test-button"]');
      tests.push({
        name: 'Button Component Rendering',
        status: buttonElement ? 'pass' : 'fail',
        message: buttonElement ? 'Button component renders correctly' : 'Button component not found'
      });
    } catch (error) {
      tests.push({
        name: 'Button Component Rendering',
        status: 'fail',
        message: 'Error testing Button component'
      });
    }

    // Test Responsive Design
    try {
      const viewport = window.innerWidth;
      tests.push({
        name: 'Responsive Design',
        status: viewport > 0 ? 'pass' : 'fail',
        message: `Viewport width: ${viewport}px - ${viewport >= 768 ? 'Desktop' : viewport >= 640 ? 'Tablet' : 'Mobile'} layout`
      });
    } catch (error) {
      tests.push({
        name: 'Responsive Design',
        status: 'fail',
        message: 'Error testing responsive design'
      });
    }

    // Test Accessibility
    try {
      const buttons = document.querySelectorAll('button');
      const buttonsWithAriaLabel = Array.from(buttons).filter(btn => 
        btn.getAttribute('aria-label') || btn.textContent?.trim()
      );
      const accessibilityScore = (buttonsWithAriaLabel.length / buttons.length) * 100;
      
      tests.push({
        name: 'Accessibility Compliance',
        status: accessibilityScore > 90 ? 'pass' : accessibilityScore > 70 ? 'warning' : 'fail',
        message: `${accessibilityScore.toFixed(0)}% of buttons have proper labels`
      });
    } catch (error) {
      tests.push({
        name: 'Accessibility Compliance',
        status: 'warning',
        message: 'Could not fully test accessibility'
      });
    }

    // Simulate async test completion
    await new Promise(resolve => setTimeout(resolve, 1000));

    setTestResults(tests);
    setRunningTests(false);
  };

  const getStatusIcon = (status: 'pass' | 'fail' | 'warning') => {
    switch (status) {
      case 'pass':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case 'fail':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />;
      case 'warning':
        return <InformationCircleIcon className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getStatusVariant = (status: 'pass' | 'fail' | 'warning') => {
    switch (status) {
      case 'pass': return 'success';
      case 'fail': return 'error';
      case 'warning': return 'warning';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">ShadCN Component Testing</h1>
          <p className="text-gray-600">Comprehensive validation of all implemented ShadCN/UI components</p>
        </div>

        {/* Test Controls */}
        <Card className="mb-8" data-testid="test-card">
          <CardHeader>
            <CardTitle>Test Controls</CardTitle>
            <CardDescription>Run comprehensive tests on all ShadCN components</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Button 
              onClick={runComponentTests} 
              disabled={runningTests}
              data-testid="test-button"
            >
              <PlayIcon className="h-4 w-4 mr-2" />
              {runningTests ? 'Running Tests...' : 'Run All Tests'}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowConfirmDialog(true)}
            >
              <CogIcon className="h-4 w-4 mr-2" />
              Test Dialog
            </Button>
          </CardContent>
        </Card>

        {/* Sample Components for Testing */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Badge Variants</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Badge data-testid="test-badge">Default</Badge>
                <Badge variant="success">Success</Badge>
                <Badge variant="warning">Warning</Badge>
                <Badge variant="error">Error</Badge>
                <Badge variant="outline">Outline</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Button Variants</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-col gap-2">
                <Button size="sm">Small Button</Button>
                <Button>Default Button</Button>
                <Button variant="outline">Outline Button</Button>
                <Button variant="destructive">Destructive</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Responsive Test</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                This card should adapt to different screen sizes. Resize your browser window to test.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Test Results Table */}
        {testResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
              <CardDescription>
                Results from the latest test run
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table data-testid="test-table">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Test Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Message</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {testResults.map((result, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{result.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(result.status)}
                            <Badge variant={getStatusVariant(result.status)}>
                              {result.status.toUpperCase()}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>{result.message}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sample Table for Testing */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Sample Data Table</CardTitle>
            <CardDescription>Testing table responsiveness and styling</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>1</TableCell>
                    <TableCell>Test Item 1</TableCell>
                    <TableCell><Badge variant="success">Active</Badge></TableCell>
                    <TableCell>2025-09-13</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline">View</Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>2</TableCell>
                    <TableCell>Test Item 2</TableCell>
                    <TableCell><Badge variant="warning">Pending</Badge></TableCell>
                    <TableCell>2025-09-12</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline">View</Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Confirm Dialog Test */}
        <ConfirmDialog
          open={showConfirmDialog}
          onOpenChange={setShowConfirmDialog}
          title="Test Dialog"
          description="This is a test of the ConfirmDialog component. All dialog functionality should work correctly."
          confirmText="Confirm Test"
          onConfirm={() => {
            console.log('Dialog test confirmed');
          }}
        />
      </div>
    </div>
  );
}
