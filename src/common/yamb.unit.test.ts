import * as yamb from "./yamb";
import { DiceCount, DiceContext, DieSide } from "./dice";

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
			expect(yamb.one.score(d`123456`)).toBe(1);
			expect(yamb.one.score(d`1111`)).toBe(4);
		});

		test("two", () => {
			expect(yamb.two.score(d`123456`)).toBe(2);
			expect(yamb.two.score(d`2222`)).toBe(8);
		});

		test("three", () => {
			expect(yamb.three.score(d`123456`)).toBe(3);
			expect(yamb.three.score(d`3333`)).toBe(12);
		});

		test("four", () => {
			expect(yamb.four.score(d`123456`)).toBe(4);
			expect(yamb.four.score(d`4444`)).toBe(16);
		});

		test("five", () => {
			expect(yamb.five.score(d`123456`)).toBe(5);
			expect(yamb.five.score(d`5555`)).toBe(20);
		});

		test("six", () => {
			expect(yamb.six.score(d`123456`)).toBe(6);
			expect(yamb.six.score(d`6666`)).toBe(24);
		});
	});

	describe("Maximum and minimum", () => {
		test("max", () => {
			expect(yamb.max.score(d`123456`)).toBe(21);
			expect(yamb.max.score(d`112233`)).toBe(12);
		});

		test("min", () => {
			expect(yamb.min.score(d`123456`)).toBe(-21);
			expect(yamb.min.score(d`112233`)).toBe(-12);
		});
	});

	describe("Special", () => {
		test("straight", () => {
			expect(yamb.straight.score(d`11111`)).toBe(0);
			expect(yamb.straight.score(d`12346`)).toBe(0);

			expect(yamb.straight.score(d("12345", 1))).toBe(66);
			expect(yamb.straight.score(d("12345", 2))).toBe(56);
			expect(yamb.straight.score(d("12345", 3))).toBe(46);

			expect(yamb.straight.score(d("23456", 1))).toBe(66);
			expect(yamb.straight.score(d("23456", 2))).toBe(56);
			expect(yamb.straight.score(d("23456", 3))).toBe(46);
		});

		test("three of a kind", () => {
			expect(yamb.threeOfAKind.score(d`112233`)).toBe(0);
			expect(yamb.threeOfAKind.score(d`123456`)).toBe(0);

			expect(yamb.threeOfAKind.score(d`111234`)).toBe(33);
			expect(yamb.threeOfAKind.score(d`111666`)).toBe(48); // Prefer larger score
			expect(yamb.threeOfAKind.score(d`555555`)).toBe(45);
		});

		test("straight house", () => {
			expect(yamb.fullHouse.score(d`112233`)).toBe(0);
			expect(yamb.fullHouse.score(d`666666`)).toBe(0); // No overlapping
			expect(yamb.fullHouse.score(d`123456`)).toBe(0);

			expect(yamb.fullHouse.score(d`112223`)).toBe(48);
			expect(yamb.fullHouse.score(d`555666`)).toBe(68); // Prefer larger score
		});

		test("four of a kind", () => {
			expect(yamb.fourOfAKind.score(d`112333`)).toBe(0);
			expect(yamb.fourOfAKind.score(d`123456`)).toBe(0);

			expect(yamb.fourOfAKind.score(d`111156`)).toBe(54);
			expect(yamb.fourOfAKind.score(d`11116666`)).toBe(74); // Prefer larger score
			expect(yamb.fourOfAKind.score(d`66666666`)).toBe(74);
		});

		test("yahtzee", () => {
			expect(yamb.yahtzee.score(d`111156`)).toBe(0);
			expect(yamb.yahtzee.score(d`123456`)).toBe(0);

			expect(yamb.yahtzee.score(d`555556`)).toBe(75);
			expect(yamb.yahtzee.score(d`1111166666`)).toBe(80); // Prefer larger score
			expect(yamb.yahtzee.score(d`555555`)).toBe(75);
		});
	});
});
