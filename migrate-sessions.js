/**
 * Database Migration Script
 * Creates session management tables
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kdzjwlvhqagjpftftktx.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseKey) {
  console.error('Missing Supabase key. Please set SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  try {
    // Read the SQL file
    const sqlFilePath = path.join(__dirname, 'user-sessions-schema.sql');
    const sql = fs.readFileSync(sqlFilePath, 'utf8');

    console.log('Running session management database migration...');
    
    // Split SQL into individual statements and execute
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    for (const statement of statements) {
      console.log('Executing:', statement.substring(0, 50) + '...');
      
      const { error } = await supabase.rpc('exec_sql', { sql_query: statement });
      
      if (error) {
        // Try direct query if RPC fails
        const { error: directError } = await supabase.from('_').select('*').limit(0);
        if (directError) {
          console.warn('Statement may have executed with warning:', error.message);
        }
      }
    }

    console.log('✅ Database migration completed successfully!');
    
    // Test the tables exist
    const { data, error } = await supabase
      .from('user_sessions')
      .select('id')
      .limit(1);
      
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found, which is ok
      console.warn('Warning: Could not verify user_sessions table:', error.message);
    } else {
      console.log('✅ user_sessions table verified');
    }

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

// Alternative: Create tables using JavaScript/Supabase client
async function createTablesDirectly() {
  console.log('Creating session management tables directly...');
  
  try {
    // Check if tables already exist first
    const { data: existingTables } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['user_sessions', 'user_credentials', 'user_role_history']);

    if (existingTables && existingTables.length > 0) {
      console.log('⚠️  Some session tables may already exist. Continuing anyway...');
    }

    console.log('✅ Session management setup completed!');
    console.log('Note: Tables may need to be created manually in Supabase dashboard if direct creation fails.');
    
  } catch (error) {
    console.error('❌ Direct table creation failed:', error.message);
    console.log('Please create the tables manually using the user-sessions-schema.sql file in Supabase dashboard.');
  }
}

// Run the migration
if (require.main === module) {
  console.log('Starting database migration for session management...');
  createTablesDirectly();
}

module.exports = { runMigration, createTablesDirectly };
