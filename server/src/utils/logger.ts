import winston from 'winston';

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.colorize(),
  winston.format.printf(({ level, message, timestamp }) => {
    return `${timestamp} [${level}]: ${message}`;
  })
);

// Create the logger
const logger = winston.createLogger({
  format: logFormat,
  transports: [
    // Console output
    new winston.transports.Console(),
    // File output - for errors
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
    // File output - for all logs
    new winston.transports.File({ 
      filename: 'logs/combined.log' 
    })
  ]
});

export default logger;