import { array } from "./util";
import { DiceCount, DieSide, Dice, DiceContext } from "./dice";

interface RowContext extends DiceContext {
	row: Row;
	column: Column;
	game: Yamb;
}

interface ColumnContext extends DiceContext {
	row: Row;
	column: Column;
	game: Yamb;
}

export interface Row<T extends string = string> {
	name: T;
	tip: string;
	score(context: RowContext): number | undefined;
}

export interface Column<T extends string = string> {
	name: T;
	tip: string;
	score(context: ColumnContext): number | undefined;
}

function findDie(
	obj: DiceCount,
	predicate: (value: DiceCount[DieSide], key: DieSide) => boolean,
) {
	for (const key of [6, 5, 4, 3, 2, 1] as const) {
		if (predicate(obj[key], key)) {
			return key;
		}
	}
	return undefined;
}

function sumDice(dice: DiceCount) {
	return (
		1 * dice[1] +
		2 * dice[2] +
		3 * dice[3] +
		4 * dice[4] +
		5 * dice[5] +
		6 * dice[6]
	);
}

function row<T extends string>(
	name: Row<T>["name"],
	tip: string,
	score: Row<T>["score"],
): Row<T> {
	return { name, tip, score };
}

function column<T extends string>(
	name: Column<T>["name"],
	tip: string,
	score: Column<T>["score"],
): Column<T> {
	return { name, tip, score };
}

export const one = row("1", "Sum of ones", ({ count }) => 1 * count[1]);
export const two = row("2", "Sum of twos", ({ count }) => 2 * count[2]);
export const three = row("3", "Sum of threes", ({ count }) => 3 * count[3]);
export const four = row("4", "Sum of fours", ({ count }) => 4 * count[4]);
export const five = row("5", "Sum of fives", ({ count }) => 5 * count[5]);
export const six = row("6", "Sum of sixes", ({ count }) => 6 * count[6]);

export const max = row("Max", "Sum of all dice", ({ count, column, game }) => {
	const sum = sumDice(count);
	const multiplier = game.field(one.name, column.name) ?? 1;
	return multiplier * sum;
});
export const min = row(
	"Min",
	"Negative sum of all dice",
	({ count, column, game }) => {
		const sum = -sumDice(count);
		const multiplier = game.field(one.name, column.name) ?? 1;
		return multiplier * sum;
	},
);

export const straight = row(
	"Straight",
	"1-2-3-4-5 or 2-3-4-5-6",
	({ count, roll }) => {
		const oneToFive = count[1] && count[2] && count[3] && count[4] && count[5];
		const twoToSix = count[2] && count[3] && count[4] && count[5] && count[6];
		if (!oneToFive && !twoToSix) {
			return 0;
		}

		if (roll === 1) return 66;
		if (roll === 2) return 56;
		if (roll === 3) return 46;
		throw new Error("Unreachable code");
	},
);

function findFullHouse(dice: DiceCount) {
	const threeOfAKind = findDie(dice, amount => amount >= 3);

	if (!threeOfAKind) {
		return undefined;
	}

	const twoOfAKind = findDie(
		dice,
		(amount, key) => amount >= 2 && key !== threeOfAKind,
	);

	return twoOfAKind && ([threeOfAKind, twoOfAKind] as const);
}

export const threeOfAKind = row(
	"Three of a Kind",
	"Three same dice",
	({ count }) => {
		const threeOfAKind = findDie(count, amount => amount >= 3);
		return threeOfAKind ? 30 + 3 * threeOfAKind : 0;
	},
);

export const fullHouse = row(
	"Full House",
	"Three of a Kind + Two of a Kind",
	({ count }) => {
		const fullHouse = findFullHouse(count);

		if (!fullHouse) {
			return 0;
		}

		const [threeOfAKind, twoOfAKind] = fullHouse;
		return 40 + 3 * threeOfAKind + 2 * twoOfAKind;
	},
);

export const fourOfAKind = row(
	"Four of a Kind",
	"Four same dice",
	({ count }) => {
		const fourOfAKind = findDie(count, amount => amount >= 4);
		return fourOfAKind ? 50 + 4 * fourOfAKind : 0;
	},
);

export const yahtzee = row("Yahtzee", "Five same dice", ({ count }) => {
	const fiveOfAKind = findDie(count, amount => amount >= 5);
	return fiveOfAKind ? 50 + 5 * fiveOfAKind : 0;
});

// Columns

function findRow(rows: readonly Row[], start: Row, delta: number): Row | null {
	const rowIndex = rows.findIndex(x => x === start);
	if (rowIndex === -1) {
		throw new Error("Could not find row.");
	}

	const wantedRowIndex = rowIndex + delta;
	if (wantedRowIndex >= 0 && wantedRowIndex < rows.length) {
		return rows[wantedRowIndex];
	}
	return null;
}

export const topDown = column("↓", "Top-down", ({ row, column, game }) => {
	const prevRow = findRow(game.rows, row, -1);
	if (prevRow) {
		return game.filled(prevRow.name, column.name) ? 0 : undefined;
	}
	return 0;
});

export const free = column("↓↑", "Free", () => 0);

export const bottomUp = column("↑", "Bottom-up", ({ row, column, game }) => {
	const nextRow = findRow(game.rows, row, 1);
	if (nextRow) {
		return game.filled(nextRow.name, column.name) ? 0 : undefined;
	}
	return 0;
});

export const call = column("C", "Call", ({ game }) => {
	if (game.calling()) {
		return 0;
	}
	return undefined;
});

export const ROWS = [
	one,
	two,
	three,
	four,
	five,
	six,

	max,
	min,

	straight,
	threeOfAKind,
	fullHouse,
	fourOfAKind,
	yahtzee,
] as const;

export const COLUMNS = [topDown, free, bottomUp, call] as const;

class Yamb<
	TRows extends readonly Row<string>[] = readonly Row<string>[],
	TColumns extends readonly Column<string>[] = readonly Column<string>[],
	// These last two arguments shouldn't be provided; they're just a hack
	// because TypeScript doesn't support writing type aliases inside a class body.
	_RowName extends TRows[number]["name"] = TRows[number]["name"],
	_ColName extends TColumns[number]["name"] = TColumns[number]["name"]
> {
	private turnsLeft: number;
	private callRow: null | _RowName;
	private cellFilled: boolean[][];
	private matrix: Array<Array<number | undefined>>;

	public readonly rows: TRows;
	public readonly columns: TColumns;

	constructor(rows: TRows, columns: TColumns) {
		this.turnsLeft = rows.length * columns.length;
		this.rows = rows;
		this.columns = columns;
		this.callRow = null;
		this.cellFilled = array(rows.length, () =>
			array(columns.length, () => false),
		);
		this.matrix = array(rows.length, () =>
			array(columns.length, () => undefined),
		);
	}

	calling(): null | _RowName {
		return this.callRow;
	}

	active(): boolean {
		return this.turnsLeft > 0;
	}

	score(): number {
		let score = 0;
		for (const row of this.matrix) {
			for (const val of row) {
				if (val !== undefined) {
					score += val;
				}
			}
		}

		return score;
	}

	getPos(row: _RowName, column: _ColName): [number, number] {
		const rowIndex = this.rows.findIndex(x => x.name === row);
		const columnIndex = this.columns.findIndex(x => x.name === column);

		if (rowIndex === -1 || columnIndex === -1) {
			throw new Error(`Field (${row}, ${column}) is invalid.`);
		}

		return [rowIndex, columnIndex];
	}

	scoreContext(
		row: Row,
		column: Column,
		diceContext: DiceContext,
	): ColumnContext {
		return { ...diceContext, row, column, game: this };
	}

	getScore(dice: Dice, row: _RowName, column: _ColName): undefined | number {
		const [rowIndex, columnIndex] = this.getPos(row, column);

		if (this.matrix[rowIndex][columnIndex] !== undefined) {
			return this.matrix[rowIndex][columnIndex];
		}

		if (this.callRow && (column !== call.name || row !== this.callRow)) {
			return undefined;
		}

		const rowScore = this.rows[rowIndex].score(
			this.scoreContext(this.rows[rowIndex], this.columns[columnIndex], dice),
		);
		const columnScore = this.columns[columnIndex].score(
			this.scoreContext(this.rows[rowIndex], this.columns[columnIndex], dice),
		);
		if (rowScore === undefined || columnScore === undefined) {
			return undefined;
		}
		return rowScore + columnScore;
	}

	call(dice: Dice, row: _RowName): boolean {
		if (
			dice.roll !== 1 ||
			this.callRow ||
			this.filled(row, call.name as _ColName)
		) {
			return false;
		}

		this.callRow = row;
		return true;
	}

	field(row: _RowName, column: _ColName): undefined | number {
		const [rowIndex, columnIndex] = this.getPos(row, column);
		return this.matrix[rowIndex][columnIndex];
	}

	filled(row: _RowName, column: _ColName): boolean {
		const [rowIndex, columnIndex] = this.getPos(row, column);
		return this.cellFilled[rowIndex][columnIndex];
	}

	canPlay(dice: Dice, row: _RowName, column: _ColName): boolean {
		if (this.callRow) {
			return row === this.callRow && column === call.name;
		}

		return (
			!this.filled(row, column) &&
			this.getScore(dice, row, column) !== undefined
		);
	}

	play(dice: Dice, row: _RowName, column: _ColName): void {
		if (!this.canPlay(dice, row, column)) {
			throw new Error("Invalid move");
		}

		const score = this.getScore(dice, row, column);
		if (score === undefined) {
			throw new Error("Score should be defined.");
		}
		const [rowIndex, columnIndex] = this.getPos(row, column);
		this.matrix[rowIndex][columnIndex] = score;
		this.cellFilled[rowIndex][columnIndex] = true;
		this.turnsLeft -= 1;

		if (this.callRow && this.callRow === row) {
			this.callRow = null;
		}

		if (row !== one.name) {
			return;
		}

		// Hack: Ideally there should be a check whether the two
		// rows are actually used in the game first.
		const maxName = max.name as _RowName;
		const minName = min.name as _RowName;

		if (this.filled(maxName, column)) {
			const [maxRow, maxColumn] = this.getPos(maxName, column);
			const oldMax = this.matrix[maxRow][maxColumn];
			if (oldMax) {
				this.matrix[maxRow][maxColumn] = score * oldMax;
			}
		}
		if (this.filled(minName, column)) {
			const [minRow, minColumn] = this.getPos(minName, column);
			const oldMin = this.matrix[minRow][minColumn];
			if (oldMin) {
				this.matrix[minRow][minColumn] = score * oldMin;
			}
		}
	}
}

export type { Yamb };

export function create(rows: readonly Row[], columns: readonly Column[]): Yamb {
	return new Yamb(rows, columns);
}
