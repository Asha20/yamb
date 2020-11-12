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

export class Dice {
	private amount: number;
	values: DieSide[];
	frozen: boolean[];
	roll = 0;

	constructor(amount: number) {
		this.amount = amount;
		this.values = array(amount, () => 6);
		this.frozen = array(amount, () => false);
	}

	context(): DiceContext {
		const count: DiceCount = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
		for (const die of this.values) {
			count[die] += 1;
		}
		return { roll: this.roll, values: this.values, count };
	}

	toggleFreeze(index: number): void {
		if (this.roll > 0) {
			this.frozen[index] = !this.frozen[index];
		}
	}

	rollDice(): void {
		for (let i = 0; i < this.values.length; i++) {
			if (!this.frozen[i]) {
				this.values[i] = (Math.floor(Math.random() * 6) + 1) as DieSide;
			}
		}
		this.roll += 1;
	}

	loadDice(dice: DieSide[]): void {
		this.values = dice;
		this.roll += 1;
	}

	reset(): void {
		this.values = array(this.amount, () => 6);
		this.frozen = array(this.amount, () => false);
		this.roll = 0;
	}
}
