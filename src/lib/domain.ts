/**
 * Domain Configuration Utility
 * Helper functions for parcelbridge.in domain setup
 */

export const DOMAIN_CONFIG = {
  PRODUCTION: 'parcelbridge.in',
  WWW: 'www.parcelbridge.in',
  DEVELOPMENT: 'localhost:3001',
  SUPABASE_URL: 'https://your-project-id.supabase.co'
};

export const getBaseURL = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  
  // Server-side rendering
  if (process.env.NODE_ENV === 'production') {
    return `https://${DOMAIN_CONFIG.PRODUCTION}`;
  }
  
  return `http://${DOMAIN_CONFIG.DEVELOPMENT}`;
};

export const getCanonicalURL = (path: string = '') => {
  const baseURL = process.env.NODE_ENV === 'production' 
    ? `https://${DOMAIN_CONFIG.PRODUCTION}`
    : `http://${DOMAIN_CONFIG.DEVELOPMENT}`;
    
  return `${baseURL}${path.startsWith('/') ? path : `/${path}`}`;
};

export const isProductionDomain = (hostname: string) => {
  return hostname === DOMAIN_CONFIG.PRODUCTION || 
         hostname === DOMAIN_CONFIG.WWW;
};

export const getDomainConfig = () => {
  return {
    domain: process.env.NEXT_PUBLIC_DOMAIN || DOMAIN_CONFIG.PRODUCTION,
    appUrl: process.env.NEXT_PUBLIC_APP_URL || `https://${DOMAIN_CONFIG.PRODUCTION}`,
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production'
  };
};

// Social Media & SEO Meta Tags
export const getMetaTags = (page: {
  title?: string;
  description?: string;
  image?: string;
  path?: string;
}) => {
  const canonical = getCanonicalURL(page.path || '');
  const domain = DOMAIN_CONFIG.PRODUCTION;
  
  return {
    title: page.title || 'Parcel Bridge - Connect Senders with Train Passengers',
    description: page.description || 'Secure parcel delivery across India through train passengers. Safe, affordable, and reliable logistics platform.',
    canonical,
    openGraph: {
      title: page.title || 'Parcel Bridge',
      description: page.description || 'Secure parcel delivery across India',
      url: canonical,
      siteName: 'Parcel Bridge',
      images: [
        {
          url: page.image || `https://${domain}/og-image.png`,
          width: 1200,
          height: 630,
          alt: 'Parcel Bridge - Secure Parcel Delivery'
        }
      ],
      type: 'website'
    },
    twitter: {
      card: 'summary_large_image',
      title: page.title || 'Parcel Bridge',
      description: page.description || 'Secure parcel delivery across India',
      images: [page.image || `https://${domain}/twitter-image.png`]
    }
  };
};
