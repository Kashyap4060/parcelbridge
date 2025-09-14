/**
 * Responsive Design Validation Script
 * This utility helps validate responsive breakpoints and component behavior
 */

export const ResponsiveBreakpoints = {
  sm: 640,   // @media (min-width: 640px)
  md: 768,   // @media (min-width: 768px)
  lg: 1024,  // @media (min-width: 1024px)
  xl: 1280,  // @media (min-width: 1280px)
  '2xl': 1536 // @media (min-width: 1536px)
} as const;

export const validateResponsiveLayout = () => {
  const currentWidth = window.innerWidth;
  
  console.log('🔍 Responsive Design Validation');
  console.log('Current viewport width:', currentWidth);
  
  Object.entries(ResponsiveBreakpoints).forEach(([key, value]) => {
    const isActive = currentWidth >= value;
    console.log(`${key} (${value}px): ${isActive ? '✅ Active' : '❌ Inactive'}`);
  });
  
  // Test table responsiveness
  const tables = document.querySelectorAll('table');
  tables.forEach((table, index) => {
    const container = table.closest('.rounded-md.border');
    const isScrollable = container ? container.scrollWidth > container.clientWidth : false;
    console.log(`Table ${index + 1}: ${isScrollable ? '📱 Scrollable' : '💻 Fits'}`);
  });
  
  // Test dialog responsiveness
  const dialogs = document.querySelectorAll('[role="dialog"]');
  console.log(`Found ${dialogs.length} dialog(s)`);
  
  return {
    currentWidth,
    activeBreakpoints: Object.entries(ResponsiveBreakpoints)
      .filter(([, value]) => currentWidth >= value)
      .map(([key]) => key),
    tableCount: tables.length,
    dialogCount: dialogs.length
  };
};

// Accessibility testing utilities
export const validateAccessibility = () => {
  console.log('♿ Accessibility Validation');
  
  // Check for proper heading hierarchy
  const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
  const headingLevels = headings.map(h => parseInt(h.tagName.charAt(1)));
  console.log('Heading structure:', headingLevels);
  
  // Check for alt text on images
  const images = document.querySelectorAll('img');
  const imagesWithoutAlt = Array.from(images).filter(img => !img.alt);
  console.log(`Images without alt text: ${imagesWithoutAlt.length}/${images.length}`);
  
  // Check for proper button labels
  const buttons = document.querySelectorAll('button');
  const buttonsWithoutText = Array.from(buttons).filter(btn => 
    !btn.textContent?.trim() && !btn.getAttribute('aria-label')
  );
  console.log(`Buttons without labels: ${buttonsWithoutText.length}/${buttons.length}`);
  
  // Check for proper form labels
  const inputs = document.querySelectorAll('input, select, textarea');
  const inputsWithoutLabels = Array.from(inputs).filter(input => {
    const id = input.id;
    const hasLabel = id && document.querySelector(`label[for="${id}"]`);
    const hasAriaLabel = input.getAttribute('aria-label');
    const hasAriaLabelledBy = input.getAttribute('aria-labelledby');
    return !hasLabel && !hasAriaLabel && !hasAriaLabelledBy;
  });
  console.log(`Form inputs without labels: ${inputsWithoutLabels.length}/${inputs.length}`);
  
  return {
    headingCount: headings.length,
    imagesWithoutAlt: imagesWithoutAlt.length,
    buttonsWithoutLabels: buttonsWithoutText.length,
    inputsWithoutLabels: inputsWithoutLabels.length
  };
};

// Performance testing utilities
export const validatePerformance = () => {
  console.log('⚡ Performance Validation');
  
  // Check for performance metrics if available
  if ('performance' in window) {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const paint = performance.getEntriesByType('paint');
    
    console.log('Load time:', Math.round(navigation.loadEventEnd - navigation.fetchStart), 'ms');
    console.log('DOM ready:', Math.round(navigation.domContentLoadedEventEnd - navigation.fetchStart), 'ms');
    
    paint.forEach(entry => {
      console.log(`${entry.name}:`, Math.round(entry.startTime), 'ms');
    });
  }
  
  // Check for large images
  const images = Array.from(document.querySelectorAll('img'));
  images.forEach((img, index) => {
    const size = img.naturalWidth * img.naturalHeight;
    if (size > 1000000) { // > 1MP
      console.warn(`Large image ${index + 1}:`, img.src, `${img.naturalWidth}x${img.naturalHeight}`);
    }
  });
  
  // Check for unused CSS (basic check)
  const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
  console.log(`Stylesheets loaded: ${stylesheets.length}`);
  
  return {
    loadTime: 'performance' in window ? Math.round((performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming).loadEventEnd - (performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming).fetchStart) : null,
    stylesheetCount: stylesheets.length,
    imageCount: images.length
  };
};

// Component validation utilities
export const validateShadCNComponents = () => {
  console.log('🎨 ShadCN Component Validation');
  
  // Check for Badge components
  const badges = document.querySelectorAll('[class*="badge"]');
  console.log(`Badge components: ${badges.length}`);
  
  // Check for Card components
  const cards = document.querySelectorAll('[class*="bg-card"], [class*="border"]');
  console.log(`Card-like components: ${cards.length}`);
  
  // Check for Table components
  const tables = document.querySelectorAll('table');
  console.log(`Table components: ${tables.length}`);
  
  // Check for Dialog components
  const dialogs = document.querySelectorAll('[role="dialog"]');
  console.log(`Dialog components: ${dialogs.length}`);
  
  // Check for Button components
  const buttons = document.querySelectorAll('button');
  console.log(`Button components: ${buttons.length}`);
  
  return {
    badges: badges.length,
    cards: cards.length,
    tables: tables.length,
    dialogs: dialogs.length,
    buttons: buttons.length
  };
};

// Master validation function
export const runComprehensiveValidation = () => {
  console.log('🚀 Starting Comprehensive Validation');
  console.log('=====================================');
  
  const responsive = validateResponsiveLayout();
  const accessibility = validateAccessibility();
  const performance = validatePerformance();
  const components = validateShadCNComponents();
  
  console.log('=====================================');
  console.log('✅ Validation Complete');
  
  return {
    responsive,
    accessibility,
    performance,
    components,
    timestamp: new Date().toISOString()
  };
};

// Make functions available globally for browser console testing
if (typeof window !== 'undefined') {
  (window as any).validateResponsiveLayout = validateResponsiveLayout;
  (window as any).validateAccessibility = validateAccessibility;
  (window as any).validatePerformance = validatePerformance;
  (window as any).validateShadCNComponents = validateShadCNComponents;
  (window as any).runComprehensiveValidation = runComprehensiveValidation;
}
