import { NextResponse } from 'next/server';
import { getLogs, clearLogs } from '@/lib/utils/logger';

export async function GET() {
  return NextResponse.json({ logs: getLogs() });
}

export async function DELETE() {
  clearLogs();
  return NextResponse.json({ message: 'Logs cleared' });
}