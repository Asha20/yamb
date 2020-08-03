export function array<T>(length: number, fn: (index: number) => T) {
	return Array.from({ length }, (_, index) => fn(index));
}

export function classNames(obj: Record<string, boolean>) {
	const classes: string[] = [];
	for (const key of Object.keys(obj)) {
		if (obj[key]) {
			classes.push(key);
		}
	}
	return classes.join(" ");
}
