'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SimpleTestPage() {
  React.useEffect(() => {
    console.log('Page loaded');
    
    // Check if CSS variables are loaded
    const root = document.documentElement;
    const primaryColor = getComputedStyle(root).getPropertyValue('--primary');
    console.log('CSS Primary color:', primaryColor);
    
    // Check if Tailwind is working
    const testDiv = document.createElement('div');
    testDiv.className = 'bg-blue-500 text-white p-4';
    document.body.appendChild(testDiv);
    testDiv.textContent = 'Tailwind test div';
    
    const computedStyle = getComputedStyle(testDiv);
    console.log('Tailwind test - background:', computedStyle.backgroundColor);
    console.log('Tailwind test - color:', computedStyle.color);
    console.log('Tailwind test - padding:', computedStyle.padding);
    
    // Remove test div after 2 seconds
    setTimeout(() => {
      document.body.removeChild(testDiv);
    }, 2000);
    
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Simple UI Debug Page
        </h1>

        {/* Basic Tailwind Test */}
        <div className="bg-blue-500 text-white p-4 rounded-lg">
          <h2 className="text-xl font-semibold">Tailwind CSS Test</h2>
          <p>If you can see this styled correctly, Tailwind is working.</p>
        </div>

        {/* Button Test */}
        <Card>
          <CardHeader>
            <CardTitle>Button Component Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4 flex-wrap">
              <Button>Default Button</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
            </div>
          </CardContent>
        </Card>

        {/* Badge Test */}
        <Card>
          <CardHeader>
            <CardTitle>Badge Component Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="destructive">Destructive</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="error">Error</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Card Test */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Sample Card 1</CardTitle>
            </CardHeader>
            <CardContent>
              <p>This is a sample card to test the card component styling.</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Sample Card 2</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Another sample card to verify consistent styling.</p>
            </CardContent>
          </Card>
        </div>

        {/* CSS Variables Debug */}
        <Card>
          <CardHeader>
            <CardTitle>CSS Variables Debug</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm font-mono">
              <div>Check browser console for CSS variable values</div>
              <div style={{ color: 'hsl(var(--primary))' }}>
                Primary color test (should be blue)
              </div>
              <div style={{ backgroundColor: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))', padding: '8px', borderRadius: '4px' }}>
                Primary background test
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
