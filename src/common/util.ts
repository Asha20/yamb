export type DistributeOmit<T, K extends keyof T> = T extends unknown
	? Omit<T, K>
	: never;

export function array<T>(length: number, fn: (index: number) => T): T[] {
	return Array.from({ length }, (_, index) => fn(index));
}

export function classNames(obj: Record<string, boolean>): string {
	const classes: string[] = [];
	for (const key of Object.keys(obj)) {
		if (obj[key]) {
			classes.push(key);
		}
	}
	return classes.join(" ");
}

export function jsonParse<T>(str: string, fallback: T): T {
	try {
		return JSON.parse(str) as T;
	} catch (e) {
		return fallback;
	}
}
