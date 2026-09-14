import { connectToDatabase } from './db';
import AuditLog from '@/models/AuditLog';

export interface LogAuditParams {
  adminId: string;
  adminEmail: string;
  action: string;
  targetResource?: string;
  targetUserId?: string;
  beforeState?: Record<string, unknown> | null;
  afterState?: Record<string, unknown> | null;
  reason?: string;
  ipAddress?: string;
}

export async function createAuditLog(params: LogAuditParams): Promise<void> {
  try {
    await connectToDatabase();
    await AuditLog.create({
      adminId: params.adminId,
      adminEmail: params.adminEmail,
      action: params.action,
      targetResource: params.targetResource || 'N/A',
      targetUserId: params.targetUserId,
      beforeState: params.beforeState ? JSON.parse(JSON.stringify(params.beforeState)) : undefined,
      afterState: params.afterState ? JSON.parse(JSON.stringify(params.afterState)) : undefined,
      reason: params.reason || '',
      ipAddress: params.ipAddress || '127.0.0.1',
      createdAt: new Date(),
    });
  } catch (error) {
    console.error('Audit Log recording failed:', error);
  }
}
