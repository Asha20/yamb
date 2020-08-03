export function array<T>(length: number, fn: (index: number) => T) {
	return Array.from({ length }, (_, index) => fn(index));
}
