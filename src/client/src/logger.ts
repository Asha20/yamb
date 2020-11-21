const INFO_COLOR = "blue";
const ERROR_COLOR = "red";

function color(color?: string) {
	return `color: ${color ?? "auto"}`;
}

export function info(msg: string, ...args: unknown[]): void {
	if (PRODUCTION) {
		return;
	}

	console.log("%cinfo%c:", color(INFO_COLOR), color(), msg, ...args);
}

export function error(msg: string, ...args: unknown[]): void {
	if (PRODUCTION) {
		return;
	}

	console.log("%cerror%c:", color(ERROR_COLOR), color(), msg, ...args);
}
