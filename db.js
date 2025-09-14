import { sql } from '@vercel/postgres';

// Query function
export const query = async (text, params) => {
  try {
    const result = await sql.query(text, params);
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

// Initialize database with test data
export const initDb = async () => {
  try {
    console.log('Initializing database...');

    // Create tables if they don't exist
    await sql`
      CREATE TABLE IF NOT EXISTS tenants (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        plan VARCHAR(50) DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'member' CHECK (role IN ('admin', 'member')),
        tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS notes (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT,
        tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Create index for better performance
    await sql`
      CREATE INDEX IF NOT EXISTS idx_notes_tenant_id ON notes(tenant_id);
    `;
    
    await sql`
      CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
    `;
    
    await sql`
      CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users(tenant_id);
    `;

    // Insert test tenants if they don't exist
    const tenants = [
      { name: 'Acme', slug: 'acme' },
      { name: 'Globex', slug: 'globex' }
    ];

    for (const tenant of tenants) {
      const existingTenant = await sql`
        SELECT id FROM tenants WHERE slug = ${tenant.slug}
      `;
      
      if (existingTenant.rows.length === 0) {
        await sql`
          INSERT INTO tenants (name, slug) VALUES (${tenant.name}, ${tenant.slug})
        `;
        console.log(`Created tenant: ${tenant.name}`);
      }
    }

    // Insert test users if they don't exist
    const testUsers = [
      { email: 'admin@acme.test', password: 'password', role: 'admin', tenantSlug: 'acme' },
      { email: 'user@acme.test', password: 'password', role: 'member', tenantSlug: 'acme' },
      { email: 'admin@globex.test', password: 'password', role: 'admin', tenantSlug: 'globex' },
      { email: 'user@globex.test', password: 'password', role: 'member', tenantSlug: 'globex' }
    ];

    for (const user of testUsers) {
      const existingUser = await sql`
        SELECT id FROM users WHERE email = ${user.email}
      `;
      
      if (existingUser.rows.length === 0) {
        const tenantResult = await sql`
          SELECT id FROM tenants WHERE slug = ${user.tenantSlug}
        `;
        
        if (tenantResult.rows.length > 0) {
          await sql`
            INSERT INTO users (email, password, role, tenant_id) 
            VALUES (${user.email}, ${user.password}, ${user.role}, ${tenantResult.rows[0].id})
          `;
          console.log(`Created user: ${user.email}`);
        } else {
          console.warn(`Tenant not found for user: ${user.email}`);
        }
      }
    }

    console.log('Database initialized successfully');
    
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

// Health check function
export const checkDatabaseHealth = async () => {
  try {
    const result = await sql`SELECT NOW() as current_time`;
    return { healthy: true, timestamp: result.rows[0].current_time };
  } catch (error) {
    console.error('Database health check failed:', error);
    return { healthy: false, error: error.message };
  }
};
