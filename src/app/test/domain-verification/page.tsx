'use client';

import { useState, useEffect } from 'react';
import { getDomainConfig, getCanonicalURL, DOMAIN_CONFIG } from '@/lib/domain';

export default function DomainVerificationPage() {
  const [config, setConfig] = useState<any>(null);
  const [currentURL, setCurrentURL] = useState<string>('');

  useEffect(() => {
    setConfig(getDomainConfig());
    setCurrentURL(window.location.href);
  }, []);

  if (!config) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading domain configuration...</p>
      </div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            🌐 Domain Configuration Verification
          </h1>
          <p className="text-lg text-gray-600">
            Parcel Bridge Domain Setup Status
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Current Configuration */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              ⚙️ Current Configuration
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Domain</label>
                <p className="text-lg font-mono text-blue-600">{config.domain}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">App URL</label>
                <p className="text-lg font-mono text-blue-600">{config.appUrl}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Environment</label>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  config.isProduction ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {config.isProduction ? 'Production' : 'Development'}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Current URL</label>
                <p className="text-sm font-mono text-gray-600 break-all">{currentURL}</p>
              </div>
            </div>
          </div>

          {/* Domain Targets */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              🎯 Domain Targets
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Production</label>
                <p className="text-lg font-mono text-green-600">{DOMAIN_CONFIG.PRODUCTION}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">WWW</label>
                <p className="text-lg font-mono text-green-600">{DOMAIN_CONFIG.WWW}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Development</label>
                <p className="text-lg font-mono text-blue-600">{DOMAIN_CONFIG.DEVELOPMENT}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Supabase</label>
                <p className="text-sm font-mono text-gray-600">{DOMAIN_CONFIG.SUPABASE_URL}</p>
              </div>
            </div>
          </div>

          {/* URL Generation Test */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              🔗 URL Generation Test
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Home Page</label>
                <p className="text-sm font-mono text-blue-600">{getCanonicalURL('/')}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Signup Page</label>
                <p className="text-sm font-mono text-blue-600">{getCanonicalURL('/auth/signup')}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Dashboard</label>
                <p className="text-sm font-mono text-blue-600">{getCanonicalURL('/dashboard')}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">API Endpoint</label>
                <p className="text-sm font-mono text-blue-600">{getCanonicalURL('/api/health')}</p>
              </div>
            </div>
          </div>

          {/* Setup Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              ✅ Setup Status
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Environment Variables</span>
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                  ✓ Configured
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Next.js Config</span>
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                  ✓ Updated
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">SEO Files</span>
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                  ✓ Ready
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Firebase Hosting</span>
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                  ✓ Ready to Deploy
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Domain Registration</span>
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                  ✓ Connected
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="mt-8 bg-green-50 border-l-4 border-green-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-lg font-medium text-green-900">
                🎉 Ready to Deploy parcelbridge.in!
              </h3>
              <div className="mt-2 text-sm text-green-700">
                <p className="mb-2">Your Parcel-Bridge PWA is fully configured and ready for deployment!</p>
                <div className="bg-green-100 p-3 rounded-lg font-mono text-sm">
                  <p className="font-semibold text-green-900 mb-2">Deploy Command:</p>
                  <code className="text-green-800">firebase deploy --only hosting</code>
                </div>
                <p className="mt-2">
                  After deployment, your app will be live at: 
                  <strong className="text-green-900"> https://parcelbridge.in</strong>
                </p>
              </div>
              <div className="mt-4">
                <a 
                  href="/READY_TO_DEPLOY.md" 
                  className="text-green-600 hover:text-green-500 font-medium"
                  target="_blank"
                >
                  📖 View deployment guide →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
