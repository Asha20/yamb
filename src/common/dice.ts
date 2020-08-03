import { array } from "./util";

export type DieSide = 1 | 2 | 3 | 4 | 5 | 6;

export interface DiceCount {
	1: number;
	2: number;
	3: number;
	4: number;
	5: number;
	6: number;
}

export interface DiceContext {
	roll: number;
	count: DiceCount;
	values: DieSide[];
}

export interface Dice extends DiceContext {
	turn: number;
	frozen: boolean[];
	toggleFreeze(index: number): void;
	rollDice(): void;
	reset(): void;
}

export function dice(amount: number, players: number): Dice {
	let turn = 0;
	let roll = 0;

	let values = array(amount, (): DieSide => 6);
	let frozen = array(amount, () => false);

	function toggleFreeze(index: number) {
		frozen[index] = !frozen[index];
	}

	function rollDice() {
		for (let i = 0; i < values.length; i++) {
			if (!frozen[i]) {
				values[i] = (Math.floor(Math.random() * 6) + 1) as DieSide;
			}
		}
		roll += 1;
	}

	function reset() {
		values = array(amount, () => 6);
		frozen = array(amount, () => false);
		roll = 0;
		turn = (turn + 1) % players;
	}

	return {
		get turn() {
			return turn;
		},

		get roll() {
			return roll;
		},

		get count() {
			const result: DiceCount = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
			for (const die of values) {
				result[die] += 1;
			}
			return result;
		},

		get values() {
			return [...values];
		},

		get frozen() {
			return [...frozen];
		},

		toggleFreeze,
		rollDice,
		reset,
	};
}
