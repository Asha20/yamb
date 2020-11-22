export function sleep(ms: number): Promise<void> {
	return new Promise(resolve => setTimeout(resolve, ms));
}

export const HIGHLIGHT_MOVE_DELAY = 1500;
