import { query } from './db';

export async function initDatabase() {
  try {
    // Create tables
    await query(`
      -- Tenants table
      CREATE TABLE IF NOT EXISTS tenants (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          slug VARCHAR(255) UNIQUE NOT NULL,
          plan VARCHAR(50) DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await query(`
      -- Users table
      CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          role VARCHAR(50) DEFAULT 'member' CHECK (role IN ('admin', 'member')),
          tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await query(`
      -- Notes table
      CREATE TABLE IF NOT EXISTS notes (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          content TEXT,
          tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Insert initial data
    await query(`
      INSERT INTO tenants (name, slug, plan) 
      VALUES 
        ('Acme', 'acme', 'free'),
        ('Globex', 'globex', 'free')
      ON CONFLICT (slug) DO NOTHING;
    `);

    // Insert test users (with plain text passwords for demo - not for production!)
    await query(`
      INSERT INTO users (email, password, role, tenant_id) 
      VALUES 
        ('admin@acme.test', 'password', 'admin', (SELECT id FROM tenants WHERE slug = 'acme')),
        ('user@acme.test', 'password', 'member', (SELECT id FROM tenants WHERE slug = 'acme')),
        ('admin@globex.test', 'password', 'admin', (SELECT id FROM tenants WHERE slug = 'globex')),
        ('user@globex.test', 'password', 'member', (SELECT id FROM tenants WHERE slug = 'globex'))
      ON CONFLICT (email) DO NOTHING;
    `);

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}