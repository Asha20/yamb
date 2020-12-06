import { DiceCount, DiceContext, DieSide } from "./dice";
import {
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
} from "./rowsAndColumns";

function d(strs: TemplateStringsArray): DiceContext;
function d(str: string, roll: number): DiceContext;
function d(strs: TemplateStringsArray | string, roll = 1): DiceContext {
	const str = arguments.length === 1 ? strs[0] : (strs as string);
	const count: DiceCount = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
	for (const char of str) {
		count[(char as unknown) as keyof DiceCount] += 1;
	}
	return {
		roll,
		values: str.split("").map(Number) as DieSide[],
		count,
	};
}

describe("Rows", () => {
	describe("Numbers", () => {
		test("one", () => {
			expect(one.score(d`123456`)).toBe(1);
			expect(one.score(d`1111`)).toBe(4);
		});

		test("two", () => {
			expect(two.score(d`123456`)).toBe(2);
			expect(two.score(d`2222`)).toBe(8);
		});

		test("three", () => {
			expect(three.score(d`123456`)).toBe(3);
			expect(three.score(d`3333`)).toBe(12);
		});

		test("four", () => {
			expect(four.score(d`123456`)).toBe(4);
			expect(four.score(d`4444`)).toBe(16);
		});

		test("five", () => {
			expect(five.score(d`123456`)).toBe(5);
			expect(five.score(d`5555`)).toBe(20);
		});

		test("six", () => {
			expect(six.score(d`123456`)).toBe(6);
			expect(six.score(d`6666`)).toBe(24);
		});
	});

	describe("Maximum and minimum", () => {
		test("max", () => {
			expect(max.score(d`123456`)).toBe(21);
			expect(max.score(d`112233`)).toBe(12);
		});

		test("min", () => {
			expect(min.score(d`123456`)).toBe(21);
			expect(min.score(d`112233`)).toBe(12);
		});
	});

	describe("Special", () => {
		test("straight", () => {
			expect(straight.score(d`11111`)).toBe(0);
			expect(straight.score(d`12346`)).toBe(0);

			expect(straight.score(d("12345", 1))).toBe(66);
			expect(straight.score(d("12345", 2))).toBe(56);
			expect(straight.score(d("12345", 3))).toBe(46);

			expect(straight.score(d("23456", 1))).toBe(66);
			expect(straight.score(d("23456", 2))).toBe(56);
			expect(straight.score(d("23456", 3))).toBe(46);
		});

		test("three of a kind", () => {
			expect(threeOfAKind.score(d`112233`)).toBe(0);
			expect(threeOfAKind.score(d`123456`)).toBe(0);

			expect(threeOfAKind.score(d`111234`)).toBe(33);
			expect(threeOfAKind.score(d`111666`)).toBe(48); // Prefer larger score
			expect(threeOfAKind.score(d`555555`)).toBe(45);
		});

		test("straight house", () => {
			expect(fullHouse.score(d`112233`)).toBe(0);
			expect(fullHouse.score(d`666666`)).toBe(0); // No overlapping
			expect(fullHouse.score(d`123456`)).toBe(0);

			expect(fullHouse.score(d`112223`)).toBe(48);
			expect(fullHouse.score(d`555666`)).toBe(68); // Prefer larger score
		});

		test("four of a kind", () => {
			expect(fourOfAKind.score(d`112333`)).toBe(0);
			expect(fourOfAKind.score(d`123456`)).toBe(0);

			expect(fourOfAKind.score(d`111156`)).toBe(54);
			expect(fourOfAKind.score(d`11116666`)).toBe(74); // Prefer larger score
			expect(fourOfAKind.score(d`66666666`)).toBe(74);
		});

		test("yahtzee", () => {
			expect(yahtzee.score(d`111156`)).toBe(0);
			expect(yahtzee.score(d`123456`)).toBe(0);

			expect(yahtzee.score(d`555556`)).toBe(75);
			expect(yahtzee.score(d`1111166666`)).toBe(80); // Prefer larger score
			expect(yahtzee.score(d`555555`)).toBe(75);
		});
	});
});
