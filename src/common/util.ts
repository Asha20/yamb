import { DieSide, Dice } from "./yamb";

export function array<T>(length: number, fn: (index: number) => T) {
	return Array.from({ length }, (_, index) => fn(index));
}

export function countDice(dice: DieSide[]): Dice {
	const result: Dice = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
	for (const die of dice) {
		result[die] += 1;
	}
	return result;
}
