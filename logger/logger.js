const { createLogger, transports, format } = require("winston");

const logger = createLogger({
  transports: [
    new transports.Console({
      level: "info",
      format: format.combine(
        format.colorize(),
        format.simple(),
        format.printf((info) => `${info.level}: ${info.message}`)
      ),
    }),
    new transports.File({
      maxsize: 5120000,
      maxFiles: 5,
      filename: "log_files.log",
      level: "warn",
      format: format.combine(
        format.timestamp(),
        format.simple(),
        format.printf(
          (info) => `[${info.timestamp}] ${info.level}: ${info.message}`
        )
      ),
    }),
  ],
});

module.exports = logger;
