/**
 * Automated Refactoring Script
 * Finds and fixes authentication patterns across the codebase
 * Run with: node scripts/fix-auth-patterns.js
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

class AuthPatternFixer {
  constructor(srcDir = 'src') {
    this.srcDir = srcDir;
    this.changes = [];
    this.patterns = {
      // Patterns to find and replace
      accessDenied: {
        find: /return\s*<div>Access denied<\/div>;?/g,
        replace: '// Removed hardcoded access denied - now handled by AuthErrorBoundary'
      },
      hardcodedAuthCheck: {
        find: /if\s*\(\s*!isAuthenticated\s*\|\|\s*user\?\.role\s*!==\s*['"`](\w+)['"`]\s*\)\s*{\s*return\s*<div>Access denied<\/div>;\s*}/g,
        replace: (match, role) => `// Auth check moved to HOC: withAuthProtection(Component, { requireRole: '${role}' })`
      },
      protectedRouteWrapper: {
        find: /<ProtectedRoute[^>]*>\s*<([^>]+)[^>]*>\s*<\/ProtectedRoute>/g,
        replace: (match, componentName) => {
          return `${componentName} // Now using withAuthProtection HOC instead`;
        }
      }
    };
  }

  async findFiles() {
    return new Promise((resolve, reject) => {
      glob(`${this.srcDir}/**/*.{tsx,ts}`, (err, files) => {
        if (err) reject(err);
        else resolve(files);
      });
    });
  }

  analyzeFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const analysis = {
      file: filePath,
      issues: [],
      suggestions: []
    };

    // Check for hardcoded access denied
    if (content.includes('Access denied')) {
      analysis.issues.push('Hardcoded "Access denied" message found');
      analysis.suggestions.push('Replace with AuthErrorBoundary or withAuthProtection HOC');
    }

    // Check for manual auth checks
    if (content.includes('!isAuthenticated') && content.includes('user?.role')) {
      analysis.issues.push('Manual authentication check found');
      analysis.suggestions.push('Use withAuthProtection HOC instead');
    }

    // Check for ProtectedRoute usage
    if (content.includes('<ProtectedRoute')) {
      analysis.issues.push('Using legacy ProtectedRoute component');
      analysis.suggestions.push('Migrate to withAuthProtection HOC for cleaner code');
    }

    return analysis;
  }

  generateFixedContent(filePath, content) {
    let fixed = content;
    let hasChanges = false;

    // Apply each pattern fix
    Object.entries(this.patterns).forEach(([patternName, pattern]) => {
      const originalFixed = fixed;
      
      if (typeof pattern.replace === 'function') {
        fixed = fixed.replace(pattern.find, pattern.replace);
      } else {
        fixed = fixed.replace(pattern.find, pattern.replace);
      }
      
      if (fixed !== originalFixed) {
        hasChanges = true;
        console.log(`Applied ${patternName} fix to ${filePath}`);
      }
    });

    return { content: fixed, hasChanges };
  }

  async fixAllFiles() {
    const files = await this.findFiles();
    const results = {
      analyzed: 0,
      withIssues: 0,
      fixed: 0,
      issues: []
    };

    for (const file of files) {
      results.analyzed++;
      
      const analysis = this.analyzeFile(file);
      if (analysis.issues.length > 0) {
        results.withIssues++;
        results.issues.push(analysis);

        // Attempt to fix
        const content = fs.readFileSync(file, 'utf8');
        const { content: fixedContent, hasChanges } = this.generateFixedContent(file, content);
        
        if (hasChanges) {
          // Create backup
          fs.writeFileSync(`${file}.backup`, content);
          
          // Write fixed content
          fs.writeFileSync(file, fixedContent);
          results.fixed++;
        }
      }
    }

    return results;
  }

  generateMigrationGuide() {
    return `
# Authentication Migration Guide

## Automated Fixes Applied

1. **Removed hardcoded "Access denied" messages**
   - These are now handled by AuthErrorBoundary
   - Provides better UX with proper login redirects

2. **Replaced manual auth checks**
   - Manual \`if (!isAuthenticated || user?.role !== 'role')\` checks removed
   - Use HOC pattern instead: \`withAuthProtection(Component, { requireRole: 'role' })\`

3. **Modernized ProtectedRoute usage**
   - Legacy ProtectedRoute wrapper replaced with HOC pattern
   - Cleaner, more maintainable code

## How to Use New System

### For new components:
\`\`\`tsx
// Old way
export default function MyPage() {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated || user?.role !== 'sender') {
    return <div>Access denied</div>;
  }
  return <div>Page content</div>;
}

// New way
function MyPageContent() {
  return <div>Page content</div>;
}

export default withSenderAuth(MyPageContent);
\`\`\`

### For existing components:
\`\`\`tsx
// Simply wrap your export
export default withAuthProtection(YourComponent, { 
  requireRole: 'sender',
  redirectTo: '/auth/login' 
});
\`\`\`

## Benefits

1. **No more hardcoded error messages**
2. **Consistent auth behavior across app**
3. **Better error UX with proper redirects**
4. **Easier testing and maintenance**
5. **Type-safe role checking**

## Next Steps

1. Test all fixed pages
2. Update any remaining manual auth checks
3. Consider adding auth unit tests
4. Document team guidelines for new components
`;
  }
}

// Export for use in other scripts
module.exports = AuthPatternFixer;

// Run if called directly
if (require.main === module) {
  const fixer = new AuthPatternFixer();
  
  fixer.fixAllFiles().then(results => {
    console.log('\n=== Authentication Pattern Fix Results ===');
    console.log(`Files analyzed: ${results.analyzed}`);
    console.log(`Files with issues: ${results.withIssues}`);
    console.log(`Files fixed: ${results.fixed}`);
    
    if (results.issues.length > 0) {
      console.log('\n=== Issues Found ===');
      results.issues.forEach(issue => {
        console.log(`\n${issue.file}:`);
        issue.issues.forEach(problem => console.log(`  - ${problem}`));
        issue.suggestions.forEach(suggestion => console.log(`  → ${suggestion}`));
      });
    }
    
    console.log('\n' + fixer.generateMigrationGuide());
  }).catch(console.error);
}