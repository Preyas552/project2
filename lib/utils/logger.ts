let logs: string[] = [];

export function addLog(message: string) {
  const timestamp = new Date().toISOString();
  logs.push(`${timestamp}: ${message}`);
  if (logs.length > 100) {
    logs = logs.slice(-100);
  }
  console.log(`${timestamp}: ${message}`); // Also log to server console
}

export function getLogs() {
  return logs;
}

export function clearLogs() {
  logs = [];
}