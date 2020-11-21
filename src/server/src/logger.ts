import { createLogger, format, transports } from "winston";

const logger = createLogger({
	level: "info",
	format: format.combine(
		format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
		format.errors({ stack: true }),
		format.splat(),
		format.json(),
	),
	transports: [
		new transports.Console({
			format: format.combine(format.colorize(), format.simple()),
		}),
	],
});

if (process.env.NODE_ENV !== "production") {
	logger.add(
		new transports.File({ filename: "quick-start-error.log", level: "error" }),
	);
	logger.add(new transports.File({ filename: "quick-start-combined.log" }));
}

export { logger };
