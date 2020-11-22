import { DiceCount, DieSide, DiceContext } from "./dice";
import { Yamb } from "./yamb";

export interface Row<T extends string = string> {
	name: T;
	display: {
		longName: string;
		shortName: string;
		tip: string;
	};
	sum: boolean;
	score(context: ScoreContext): number | undefined;
}

export interface Column<T extends string = string> {
	name: T;
	display: {
		longName: string;
		shortName: string;
		tip: string;
	};
	score(context: ScoreContext): number | undefined;
}

export interface ScoreContext extends DiceContext {
	row: Row;
	column: Column;
	game: Yamb;
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
	longName: string,
	shortName: string,
	tip: string,
	score: Row<T>["score"],
	sum = false,
): Row<T> {
	return { name, display: { longName, shortName, tip }, sum, score };
}

function sumRow<T extends string>(
	name: Row<T>["name"],
	longName: string,
	shortName: string,
	tip: string,
	score: Row["score"],
): Row<T> {
	return row(name, longName, shortName, tip, score, true);
}

function column<T extends string>(
	name: Column<T>["name"],
	longName: string,
	shortName: string,
	tip: string,
	score: Column<T>["score"],
): Column<T> {
	return { name, display: { longName, shortName, tip }, score };
}

const sumUnlessAllEmpty = (rows: Row[]) => ({ game, column }: ScoreContext) => {
	let total = 0;
	let allCellsEmpty = true;

	for (const row of rows) {
		const score = game.field(row.name, column.name);
		if (score !== undefined) {
			allCellsEmpty = false;
			total += score;
		}
	}

	return allCellsEmpty ? undefined : total;
};

// First part
export const one = row(
	"one",
	"Ones",
	"1",
	"Sum of ones",
	({ count }) => 1 * count[1],
);
export const two = row(
	"two",
	"Twos",
	"2",
	"Sum of twos",
	({ count }) => 2 * count[2],
);
export const three = row(
	"three",
	"Threes",
	"3",
	"Sum of threes",
	({ count }) => 3 * count[3],
);
export const four = row(
	"four",
	"Fours",
	"4",
	"Sum of fours",
	({ count }) => 4 * count[4],
);
export const five = row(
	"five",
	"Fives",
	"5",
	"Sum of fives",
	({ count }) => 5 * count[5],
);
export const six = row(
	"six",
	"Sixes",
	"6",
	"Sum of sixes",
	({ count }) => 6 * count[6],
);

export const sumOnesToSixes = sumRow(
	"sumOnesToSixes",
	"Sum",
	"Sum",
	"Sum from Ones to Sixes",
	sumUnlessAllEmpty([one, two, three, four, five, six]),
);

// Second part
export const max = row("max", "Max", "Max", "Sum of all dice", ({ count }) =>
	sumDice(count),
);
export const min = row("min", "Min", "Min", "Sum of all dice", ({ count }) =>
	sumDice(count),
);

export const sumMaxMin = sumRow(
	"sumMaxMin",
	"Sum",
	"Sum",
	"Ones * (Max - Min)",
	ctx => {
		const { game, column } = ctx;
		const maxValue = game.field(max.name, column.name);
		const minValue = game.field(min.name, column.name);
		const multiplier = game.field(one.name, column.name) ?? 1;

		if (maxValue === undefined || minValue === undefined) {
			return undefined;
		}

		return multiplier * (maxValue - minValue);
	},
);

// Third part
export const straight = row(
	"straight",
	"Straight",
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
	"threeOfAKind",
	"Three of a kind",
	"3 of a kind",
	"Three same dice",
	({ count }) => {
		const threeOfAKind = findDie(count, amount => amount >= 3);
		return threeOfAKind ? 30 + 3 * threeOfAKind : 0;
	},
);

export const fullHouse = row(
	"fullHouse",
	"Full House",
	"Full House",
	"3 of a kind + 4 of a kind",
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
	"fourOfAKind",
	"Four of a kind",
	"4 of a kind",
	"Four same dice",
	({ count }) => {
		const fourOfAKind = findDie(count, amount => amount >= 4);
		return fourOfAKind ? 50 + 4 * fourOfAKind : 0;
	},
);

export const yahtzee = row(
	"yahtzee",
	"Yahtzee",
	"Yahtzee",
	"Five same dice",
	({ count }) => {
		const fiveOfAKind = findDie(count, amount => amount >= 5);
		return fiveOfAKind ? 50 + 5 * fiveOfAKind : 0;
	},
);

export const sumStraightToYahtzee = sumRow(
	"sumStraightToYahtzee",
	"Sum",
	"Sum",
	"Sum from Straight to Yahtzee",
	sumUnlessAllEmpty([straight, threeOfAKind, fullHouse, fourOfAKind, yahtzee]),
);

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

export const topDown = column(
	"topDown",
	"Top-down",
	"↓",
	"Must fill downwards from the top",
	({ row, column, game }) => {
		const prevRow = findRow(game.rows, row, -1);
		if (prevRow) {
			return game.filled(prevRow.name, column.name) ? 0 : undefined;
		}
		return 0;
	},
);

export const free = column("free", "Free", "↓↑", "Fill any field", () => 0);

export const bottomUp = column(
	"bottomUp",
	"Bottom-up",
	"↑",
	"Must fill upwards from the bottom",
	({ row, column, game }) => {
		const nextRow = findRow(game.rows, row, 1);
		if (nextRow) {
			return game.filled(nextRow.name, column.name) ? 0 : undefined;
		}
		return 0;
	},
);

export const call = column(
	"call",
	"Call",
	"C",
	"Must call a field before playing",
	({ game }) => {
		if (game.calling()) {
			return 0;
		}
		return undefined;
	},
);

export const ROWS = [
	one,
	two,
	three,
	four,
	five,
	six,
	sumOnesToSixes,

	max,
	min,
	sumMaxMin,

	straight,
	threeOfAKind,
	fullHouse,
	fourOfAKind,
	yahtzee,
	sumStraightToYahtzee,
] as const;

export const COLUMNS = [topDown, free, bottomUp, call] as const;
