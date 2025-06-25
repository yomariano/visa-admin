'use server';

import { PermitRule, RequiredDocument } from './types';

const DB_CONFIG = {
  host: process.env.POSTGRES_HOST || 'localhost',
  port: process.env.POSTGRES_PORT || '5432',
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || '',
  database: process.env.POSTGRES_DB || 'postgres',
};

// Helper function to execute SQL queries via psql command
async function executeQuery(query: string): Promise<unknown> {
  const { exec } = await import('child_process');
  const { promisify } = await import('util');
  const execAsync = promisify(exec);
  
  const psqlCommand = `PGPASSWORD="${DB_CONFIG.password}" psql -h "${DB_CONFIG.host}" -p "${DB_CONFIG.port}" -U "${DB_CONFIG.user}" -d "${DB_CONFIG.database}" -t -c "${query.replace(/"/g, '\\"')}"`;
  
  try {
    const { stdout } = await execAsync(psqlCommand);
    return stdout.trim();
  } catch (error) {
    console.error('💥 Database query error:', error);
    throw error;
  }
}

// Permit Rules Actions
export async function getPermitRules(): Promise<PermitRule[]> {
  try {
    const result = await executeQuery('SELECT row_to_json(t) FROM (SELECT * FROM permit_rules ORDER BY id DESC) t');
    const lines = (result as string).split('\n').filter(line => line.trim());
    return lines.map(line => JSON.parse(line.trim()));
  } catch (error) {
    console.error('Error fetching permit rules:', error);
    return [];
  }
}

export async function createPermitRule(data: Omit<PermitRule, 'id' | 'updated_at'>): Promise<PermitRule | null> {
  try {
    const query = `INSERT INTO permit_rules (permit_type, title, rule, category, is_required) VALUES ('${data.permit_type}', '${data.title.replace(/'/g, "''")}', '${data.rule.replace(/'/g, "''")}', '${data.category}', ${data.is_required}) RETURNING row_to_json(permit_rules)`;
    const result = await executeQuery(query);
    const lines = (result as string).split('\n').filter(line => line.trim());
    return lines.length > 0 ? JSON.parse(lines[0].trim()) : null;
  } catch (error) {
    console.error('Error creating permit rule:', error);
    return null;
  }
}

export async function updatePermitRule(id: number, data: Partial<Omit<PermitRule, 'id' | 'updated_at'>>): Promise<PermitRule | null> {
  try {
    const updates = Object.entries(data).map(([key, value]) => {
      if (typeof value === 'string') {
        return `${key} = '${value.replace(/'/g, "''")}'`;
      }
      return `${key} = ${value}`;
    }).join(', ');
    
    const query = `UPDATE permit_rules SET ${updates} WHERE id = ${id} RETURNING row_to_json(permit_rules)`;
    const result = await executeQuery(query);
    const lines = (result as string).split('\n').filter(line => line.trim());
    return lines.length > 0 ? JSON.parse(lines[0].trim()) : null;
  } catch (error) {
    console.error('Error updating permit rule:', error);
    return null;
  }
}

export async function deletePermitRule(id: number): Promise<boolean> {
  try {
    await executeQuery(`DELETE FROM permit_rules WHERE id = ${id}`);
    return true;
  } catch (error) {
    console.error('Error deleting permit rule:', error);
    return false;
  }
}

// Required Documents Actions
export async function getRequiredDocuments(): Promise<RequiredDocument[]> {
  try {
    const result = await executeQuery('SELECT row_to_json(t) FROM (SELECT * FROM required_documents ORDER BY sort_order, id DESC) t');
    const lines = (result as string).split('\n').filter(line => line.trim());
    return lines.map(line => JSON.parse(line.trim()));
  } catch (error) {
    console.error('Error fetching required documents:', error);
    return [];
  }
}

export async function createRequiredDocument(data: Omit<RequiredDocument, 'id' | 'updated_at'>): Promise<RequiredDocument | null> {
  try {
    const validationRules = JSON.stringify(data.validation_rules).replace(/'/g, "''");
    const query = `INSERT INTO required_documents (permit_type, document_name, required_for, is_mandatory, condition, description, sort_order, is_active, validation_rules) VALUES ('${data.permit_type}', '${data.document_name.replace(/'/g, "''")}', '${data.required_for}', ${data.is_mandatory}, ${data.condition ? `'${data.condition.replace(/'/g, "''")}'` : 'NULL'}, ${data.description ? `'${data.description.replace(/'/g, "''")}'` : 'NULL'}, ${data.sort_order}, ${data.is_active}, '${validationRules}') RETURNING row_to_json(required_documents)`;
    const result = await executeQuery(query);
    const lines = (result as string).split('\n').filter(line => line.trim());
    return lines.length > 0 ? JSON.parse(lines[0].trim()) : null;
  } catch (error) {
    console.error('Error creating required document:', error);
    return null;
  }
}

export async function updateRequiredDocument(id: number, data: Partial<Omit<RequiredDocument, 'id' | 'updated_at'>>): Promise<RequiredDocument | null> {
  try {
    const updates = Object.entries(data).map(([key, value]) => {
      if (value === null || value === undefined) {
        return `${key} = NULL`;
      }
      if (typeof value === 'string') {
        return `${key} = '${value.replace(/'/g, "''")}'`;
      }
      if (typeof value === 'object') {
        return `${key} = '${JSON.stringify(value).replace(/'/g, "''")}'`;
      }
      return `${key} = ${value}`;
    }).join(', ');
    
    const query = `UPDATE required_documents SET ${updates} WHERE id = ${id} RETURNING row_to_json(required_documents)`;
    const result = await executeQuery(query);
    const lines = (result as string).split('\n').filter(line => line.trim());
    return lines.length > 0 ? JSON.parse(lines[0].trim()) : null;
  } catch (error) {
    console.error('Error updating required document:', error);
    return null;
  }
}

export async function deleteRequiredDocument(id: number): Promise<boolean> {
  try {
    await executeQuery(`DELETE FROM required_documents WHERE id = ${id}`);
    return true;
  } catch (error) {
    console.error('Error deleting required document:', error);
    return false;
  }
} 