const { pool } = require('../config/db');

async function writeAudit({ adminId, entityType, entityId, action, metadata = null }) {
  try {
    await pool.execute(
      `INSERT INTO audit_logs (admin_id, entity_type, entity_id, action, metadata)
       VALUES (?, ?, ?, ?, ?)`,
      [adminId || null, entityType, entityId || null, action, metadata ? JSON.stringify(metadata) : null]
    );
  } catch (error) {
    // Audit logging should not break the primary request.
    console.error('Audit log failed:', error.message);
  }
}

module.exports = { writeAudit };
