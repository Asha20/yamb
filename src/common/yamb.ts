import { array } from "./util";
import { DiceCount, DieSide, Dice, DiceContext } from "./dice";

interface Row<T extends string> {
	name: T;
	score(context: DiceContext): number | undefined;
}

interface Column<T extends string> {
	name: T;
	score(context: DiceContext): number | undefined;
}

export interface Yamb<
	TRows extends readonly Row<string>[],
	TColumns extends readonly Column<string>[]
> {
	readonly rowNames: Readonly<Array<TRows[number]["name"]>>;
	readonly columnNames: Readonly<Array<TColumns[number]["name"]>>;
	active: boolean;
	score: number;
	canPlay(
		dice: DiceContext,
		row: TRows[number]["name"],
		column: TColumns[number]["name"],
	): boolean;
	play(
		dice: DiceContext,
		row: TRows[number]["name"],
		column: TColumns[number]["name"],
	): void;
	getScore(
		dice: DiceContext,
		row: TRows[number]["name"],
		column: TColumns[number]["name"],
	): number | undefined;
	field(
		row: TRows[number]["name"],
		column: TColumns[number]["name"],
	): number | undefined;
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
	score: Row<T>["score"],
): Row<T> {
	return { name, score };
}

function column<T extends string>(
	name: Column<T>["name"],
	score: Column<T>["score"],
): Column<T> {
	return { name, score };
}

export const one = row("one", ({ count }) => 1 * count[1]);
export const two = row("two", ({ count }) => 2 * count[2]);
export const three = row("three", ({ count }) => 3 * count[3]);
export const four = row("four", ({ count }) => 4 * count[4]);
export const five = row("five", ({ count }) => 5 * count[5]);
export const six = row("six", ({ count }) => 6 * count[6]);

export const max = row("max", ({ count }) => sumDice(count));
export const min = row("min", ({ count }) => -sumDice(count));

export const straight = row("straight", ({ count, roll }) => {
	const oneToFive = count[1] && count[2] && count[3] && count[4] && count[5];
	const twoToSix = count[2] && count[3] && count[4] && count[5] && count[6];
	if (!oneToFive && !twoToSix) {
		return undefined;
	}

	if (roll === 1) return 66;
	if (roll === 2) return 56;
	if (roll === 3) return 46;
	throw new Error("Unreachable code");
});

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

export const threeOfAKind = row("three of a kind", ({ count }) => {
	const threeOfAKind = findDie(count, amount => amount >= 3);
	return threeOfAKind && 30 + 3 * threeOfAKind;
});

export const fullHouse = row("full house", ({ count }) => {
	const fullHouse = findFullHouse(count);

	if (!fullHouse) {
		return undefined;
	}

	const [threeOfAKind, twoOfAKind] = fullHouse;
	return 40 + 3 * threeOfAKind + 2 * twoOfAKind;
});

export const fourOfAKind = row("four of a kind", ({ count }) => {
	const fourOfAKind = findDie(count, amount => amount >= 4);
	return fourOfAKind && 50 + 4 * fourOfAKind;
});

export const yahtzee = row("yahtzee", ({ count }) => {
	const fiveOfAKind = findDie(count, amount => amount >= 5);
	return fiveOfAKind && 50 + 5 * fiveOfAKind;
});

const topDown = column("top down", () => 0);
const free = column("free", () => 0);

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

const COLUMNS = [topDown, free] as const;

function yamb<
	TRows extends readonly Row<string>[],
	TColumns extends readonly Column<string>[]
>(rows: TRows, columns: TColumns): Yamb<TRows, TColumns> {
	type RowName = TRows[number]["name"];
	type ColName = TColumns[number]["name"];

	let turnsLeft = rows.length * columns.length;
	const rowNames = Object.freeze(rows.map(x => x.name));
	const columnNames = Object.freeze(columns.map(x => x.name));

	const matrix: (number | undefined)[][] = array(rows.length, () =>
		array(columns.length, () => undefined),
	);

	function getField(row: RowName, column: ColName) {
		const rowIndex = rowNames.findIndex(x => x === row);
		const columnIndex = columnNames.findIndex(x => x === column);

		if (rowIndex === -1 || columnIndex === -1) {
			throw new Error(`Field (${row}, ${column}) is invalid.`);
		}

		return [rowIndex, columnIndex];
	}

	function getScore(dice: Dice, row: RowName, column: ColName) {
		if (dice.roll === 0) {
			return undefined;
		}

		const [rowIndex, columnIndex] = getField(row, column);

		if (matrix[rowIndex][columnIndex] !== undefined) {
			return matrix[rowIndex][columnIndex];
		}

		const rowScore = rows[rowIndex].score(dice);
		const columnScore = columns[columnIndex].score(dice);
		if (rowScore === undefined || columnScore === undefined) {
			return undefined;
		}
		return rowScore + columnScore;
	}

	function field(row: RowName, column: ColName) {
		const [rowIndex, columnIndex] = getField(row, column);
		return matrix[rowIndex][columnIndex];
	}

	function canPlay(dice: Dice, row: RowName, column: ColName) {
		return getScore(dice, row, column) !== undefined;
	}

	function play(dice: Dice, row: RowName, column: ColName) {
		if (!canPlay(dice, row, column)) {
			return;
		}

		const score = getScore(dice, row, column)!;
		const [rowIndex, columnIndex] = getField(row, column);
		matrix[rowIndex][columnIndex] = score;
		turnsLeft -= 1;
	}

	return {
		rowNames,
		columnNames,
		canPlay,
		play,
		field,
		getScore,
		get active() {
			return turnsLeft > 0;
		},
		get score() {
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
	};
}

export function create() {
	return yamb(ROWS, COLUMNS);
}
