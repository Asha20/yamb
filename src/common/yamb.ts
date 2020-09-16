import { array } from "./util";
import { DiceCount, DieSide, Dice, DiceContext } from "./dice";

type RowContext = DiceContext;

interface ColumnContext<R extends string = string, C extends string = string>
	extends DiceContext {
	row: string;
	column: string;
	game: Yamb;
}

interface Row<T extends string> {
	name: T;
	tip: string;
	score(context: RowContext): number | undefined;
}

interface Column<T extends string> {
	name: T;
	tip: string;
	score(context: ColumnContext): number | undefined;
}

type Name<
	T extends readonly Row<string>[] | Column<string>[]
> = T[number]["name"];

export interface Yamb<
	TRows extends readonly Row<string>[] = readonly Row<string>[],
	TColumns extends readonly Column<string>[] = readonly Column<string>[]
> {
	readonly rows: TRows;
	readonly columns: TColumns;
	active(): boolean;
	score(): number;
	canPlay(dice: DiceContext, row: Name<TRows>, column: Name<TColumns>): boolean;
	play(dice: DiceContext, row: Name<TRows>, column: Name<TColumns>): void;
	getScore(
		dice: DiceContext,
		row: Name<TRows>,
		column: Name<TColumns>,
	): number | undefined;
	filled(row: Name<TRows>, column: Name<TColumns>): boolean;
	field(row: Name<TRows>, column: Name<TColumns>): number | undefined;
	getField(row: Name<TRows>, column: Name<TColumns>): [number, number];
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

export const max = row("Max", "Sum of all dice", ({ count }) => sumDice(count));
export const min = row(
	"Min",
	"Negative sum of all dice",
	({ count }) => -sumDice(count),
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

const topDown = column("↓", "Top-down", ({ row, column, game }) => {
	const rowIndex = game.rows.findIndex(x => x.name === row);
	if (rowIndex > 0) {
		const prevRowName = game.rows[rowIndex - 1].name;
		return game.filled(prevRowName, column) ? 0 : undefined;
	}
	return 0;
});

const free = column("↓↑", "Free", () => 0);

const bottomUp = column("↑", "Bottom-up", ({ row, column, game }) => {
	const rowIndex = game.rows.findIndex(x => x.name === row);
	if (rowIndex < game.rows.length - 1) {
		const nextRowName = game.rows[rowIndex + 1].name;
		return game.filled(nextRowName, column) ? 0 : undefined;
	}
	return 0;
});

const ROWS = [
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

const COLUMNS = [topDown, free, bottomUp] as const;

function yamb<
	TRows extends readonly Row<string>[],
	TColumns extends readonly Column<string>[]
>(rows: TRows, columns: TColumns): Yamb<TRows, TColumns> {
	type RowName = TRows[number]["name"];
	type ColName = TColumns[number]["name"];

	let turnsLeft = rows.length * columns.length;

	const cellFilled = array(rows.length, () =>
		array(columns.length, () => false),
	);

	const matrix: (number | undefined)[][] = array(rows.length, () =>
		array(columns.length, () => undefined),
	);

	const game = {} as Yamb<TRows, TColumns>;

	function getField(row: RowName, column: ColName) {
		const rowIndex = rows.findIndex(x => x.name === row);
		const columnIndex = columns.findIndex(x => x.name === column);

		if (rowIndex === -1 || columnIndex === -1) {
			throw new Error(`Field (${row}, ${column}) is invalid.`);
		}

		return [rowIndex, columnIndex];
	}

	function scoreContext(
		row: string,
		column: string,
		diceContext: DiceContext,
	): ColumnContext {
		return { ...diceContext, row, column, game };
	}

	function getScore(dice: Dice, row: RowName, column: ColName) {
		const [rowIndex, columnIndex] = getField(row, column);

		if (matrix[rowIndex][columnIndex] !== undefined) {
			return matrix[rowIndex][columnIndex];
		}

		const rowScore = rows[rowIndex].score(scoreContext(row, column, dice));
		const columnScore = columns[columnIndex].score(
			scoreContext(row, column, dice),
		);
		if (rowScore === undefined || columnScore === undefined) {
			return undefined;
		}
		return rowScore + columnScore;
	}

	function field(row: RowName, column: ColName) {
		const [rowIndex, columnIndex] = getField(row, column);
		return matrix[rowIndex][columnIndex];
	}

	function filled(row: RowName, column: ColName) {
		const [rowIndex, columnIndex] = getField(row, column);
		return cellFilled[rowIndex][columnIndex];
	}

	function canPlay(dice: Dice, row: RowName, column: ColName) {
		return !filled(row, column) && getScore(dice, row, column) !== undefined;
	}

	function play(dice: Dice, row: RowName, column: ColName) {
		if (!canPlay(dice, row, column)) {
			throw new Error("Invalid move");
		}

		const score = getScore(dice, row, column)!;
		const [rowIndex, columnIndex] = getField(row, column);
		matrix[rowIndex][columnIndex] = score;
		cellFilled[rowIndex][columnIndex] = true;
		turnsLeft -= 1;
	}

	return Object.assign(game, {
		rows,
		columns,
		canPlay,
		play,
		field,
		filled,
		getScore,
		getField,
		active() {
			return turnsLeft > 0;
		},
		score() {
			let score = 0;
			for (const row of matrix) {
				for (const val of row) {
					if (val !== undefined) {
						score += val;
					}
				}
			}

			return score;
		},
	});
}

export function create() {
	return yamb(ROWS, COLUMNS);
}
