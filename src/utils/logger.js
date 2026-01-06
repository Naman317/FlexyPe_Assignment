/**
 * Logger utility for consistent logging
 */

const LogLevel = {
  INFO: 'INFO',
  ERROR: 'ERROR',
  WARN: 'WARN',
  DEBUG: 'DEBUG',
};

const formatLog = (level, message, data = null) => {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] [${level}] ${message}`;
  
  if (data) {
    console.log(logEntry, JSON.stringify(data, null, 2));
  } else {
    console.log(logEntry);
  }
};

const logger = {
  info: (message, data) => formatLog(LogLevel.INFO, message, data),
  error: (message, data) => formatLog(LogLevel.ERROR, message, data),
  warn: (message, data) => formatLog(LogLevel.WARN, message, data),
  debug: (message, data) => formatLog(LogLevel.DEBUG, message, data),
};

module.exports = logger;
