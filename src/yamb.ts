export interface Dice {
	1: number;
	2: number;
	3: number;
	4: number;
	5: number;
	6: number;
}

interface Row {
	name: string;
	score(dice: Dice, roll: number): number | undefined;
}

function findDie(
	obj: Dice,
	predicate: (value: Dice[keyof Dice], key: keyof Dice) => boolean,
) {
	for (const key of [6, 5, 4, 3, 2, 1] as const) {
		if (predicate(obj[key], key)) {
			return key;
		}
	}
	return undefined;
}

function sumDice(dice: Dice) {
	return (
		1 * dice[1] +
		2 * dice[2] +
		3 * dice[3] +
		4 * dice[4] +
		5 * dice[5] +
		6 * dice[6]
	);
}

function row(name: Row["name"], score: Row["score"]): Row {
	return { name, score };
}

export const one = row("one", dice => 1 * dice[1]);
export const two = row("two", dice => 2 * dice[2]);
export const three = row("three", dice => 3 * dice[3]);
export const four = row("four", dice => 4 * dice[4]);
export const five = row("five", dice => 5 * dice[5]);
export const six = row("six", dice => 6 * dice[6]);

export const max = row("max", sumDice);
export const min = row("min", dice => -sumDice(dice));

export const straight = row("straight", (dice, roll) => {
	const oneToFive = dice[1] && dice[2] && dice[3] && dice[4] && dice[5];
	const twoToSix = dice[2] && dice[3] && dice[4] && dice[5] && dice[6];
	if (!oneToFive && !twoToSix) {
		return undefined;
	}

	if (roll === 1) return 66;
	if (roll === 2) return 56;
	if (roll === 3) return 46;
	throw new Error("Unreachable code");
});

function findFullHouse(dice: Dice) {
	const threeOfAKind = findDie(dice, amount => amount >= 3);

	if (!threeOfAKind) {
		return undefined;
	}

	const twoOfAKind = findDie(
		dice,
		(amount, key) => amount >= 2 && key !== threeOfAKind,
	);

	if (!twoOfAKind) {
		return undefined;
	}

	return [threeOfAKind, twoOfAKind];
}

export const threeOfAKind = row("three of a kind", dice => {
	const threeOfAKind = findDie(dice, amount => amount >= 3);
	return threeOfAKind && 30 + 3 * threeOfAKind;
});

export const fullHouse = row("full house", dice => {
	const fullHouse = findFullHouse(dice);

	if (!fullHouse) {
		return undefined;
	}

	const [threeOfAKind, twoOfAKind] = fullHouse;
	return 40 + 3 * threeOfAKind + 2 * twoOfAKind;
});

export const fourOfAKind = row("four of a kind", dice => {
	const fourOfAKind = findDie(dice, amount => amount >= 4);
	return fourOfAKind && 50 + 4 * fourOfAKind;
});

export const yahtzee = row("yahtzee", dice => {
	const fiveOfAKind = findDie(dice, amount => amount >= 5);
	return fiveOfAKind && 50 + 5 * fiveOfAKind;
});
