interface LogEntry {
  timestamp: string;
  message: string;
  level: 'info' | 'error' | 'warn';
}

let logs: LogEntry[] = [];
const MAX_LOGS = 1000; // Prevent memory issues by limiting log entries

export function addLog(message: string, level: LogEntry['level'] = 'info'): void {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    message,
    level
  };
  
  logs.unshift(entry); // Add to beginning for most recent first
  
  if (logs.length > MAX_LOGS) {
    logs = logs.slice(0, MAX_LOGS);
  }
}

export function getLogs(): LogEntry[] {
  return [...logs]; // Return a copy to prevent external modification
}

export function clearLogs(): void {
  logs = [];
}

export function addErrorLog(error: unknown): void {
  const message = error instanceof Error 
    ? `${error.name}: ${error.message}`
    : String(error);
    
  addLog(message, 'error');
}