/**
 * ESLint Custom Rules for Auth Patterns
 * Prevents anti-patterns and enforces best practices
 * Add to .eslintrc.js rules section
 */

module.exports = {
  rules: {
    // Prevent hardcoded access denied messages
    'no-hardcoded-access-denied': {
      create(context) {
        return {
          Literal(node) {
            if (typeof node.value === 'string' && 
                (node.value.includes('Access denied') || 
                 node.value.includes('access denied'))) {
              context.report({
                node,
                message: 'Hardcoded "Access denied" message detected. Use AuthErrorBoundary or withAuthProtection instead.',
                fix(fixer) {
                  return fixer.replaceText(node, '"REPLACE_WITH_AUTH_BOUNDARY"');
                }
              });
            }
          }
        };
      }
    },

    // Prevent manual auth checks in components
    'no-manual-auth-checks': {
      create(context) {
        return {
          IfStatement(node) {
            const sourceCode = context.getSourceCode();
            const text = sourceCode.getText(node.test);
            
            if (text.includes('!isAuthenticated') && text.includes('user?.role')) {
              context.report({
                node,
                message: 'Manual authentication check detected. Use withAuthProtection HOC instead.',
                suggest: [{
                  desc: 'Replace with HOC pattern',
                  fix(fixer) {
                    return fixer.insertTextBefore(node, '// TODO: Replace with withAuthProtection HOC\n');
                  }
                }]
              });
            }
          }
        };
      }
    },

    // Enforce consistent auth import patterns
    'consistent-auth-imports': {
      create(context) {
        const authImports = new Set();
        
        return {
          ImportDeclaration(node) {
            if (node.source.value.includes('auth') || 
                node.source.value.includes('Auth')) {
              authImports.add(node.source.value);
            }
          },
          
          'Program:exit'() {
            if (authImports.size > 2) {
              context.report({
                message: `Too many auth-related imports (${authImports.size}). Consider consolidating auth logic.`,
                loc: { line: 1, column: 0 }
              });
            }
          }
        };
      }
    }
  }
};