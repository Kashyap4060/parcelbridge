'use client';

import DashboardContent from './dashboard-content';

// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic';

export default function Dashboard() {
  return <DashboardContent />;
}



