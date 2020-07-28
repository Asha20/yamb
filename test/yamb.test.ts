import * as yamb from "../src/yamb";

function dice(strs: TemplateStringsArray): yamb.Dice {
	const str = strs[0];
	const result: yamb.Dice = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
	for (const char of str) {
		result[(char as unknown) as keyof yamb.Dice] += 1;
	}
	return result;
}

describe("Rows", () => {
	describe("Numbers", () => {
		test("one", () => {
			expect(yamb.one.score(dice`123456`, 1)).toBe(1);
			expect(yamb.one.score(dice`1111`, 1)).toBe(4);
		});

		test("two", () => {
			expect(yamb.two.score(dice`123456`, 1)).toBe(2);
			expect(yamb.two.score(dice`2222`, 1)).toBe(8);
		});

		test("three", () => {
			expect(yamb.three.score(dice`123456`, 1)).toBe(3);
			expect(yamb.three.score(dice`3333`, 1)).toBe(12);
		});

		test("four", () => {
			expect(yamb.four.score(dice`123456`, 1)).toBe(4);
			expect(yamb.four.score(dice`4444`, 1)).toBe(16);
		});

		test("five", () => {
			expect(yamb.five.score(dice`123456`, 1)).toBe(5);
			expect(yamb.five.score(dice`5555`, 1)).toBe(20);
		});

		test("six", () => {
			expect(yamb.six.score(dice`123456`, 1)).toBe(6);
			expect(yamb.six.score(dice`6666`, 1)).toBe(24);
		});
	});

	describe("Maximum and minimum", () => {
		test("max", () => {
			expect(yamb.max.score(dice`123456`, 1)).toBe(21);
			expect(yamb.max.score(dice`112233`, 1)).toBe(12);
		});

		test("min", () => {
			expect(yamb.min.score(dice`123456`, 1)).toBe(-21);
			expect(yamb.min.score(dice`112233`, 1)).toBe(-12);
		});
	});

	describe("Special", () => {
		test("straight", () => {
			expect(yamb.straight.score(dice`11111`, 1)).toBeUndefined();
			expect(yamb.straight.score(dice`12346`, 1)).toBeUndefined();

			expect(yamb.straight.score(dice`12345`, 1)).toBe(66);
			expect(yamb.straight.score(dice`12345`, 2)).toBe(56);
			expect(yamb.straight.score(dice`12345`, 3)).toBe(46);

			expect(yamb.straight.score(dice`23456`, 1)).toBe(66);
			expect(yamb.straight.score(dice`23456`, 2)).toBe(56);
			expect(yamb.straight.score(dice`23456`, 3)).toBe(46);
		});

		test("three of a kind", () => {
			expect(yamb.threeOfAKind.score(dice`112233`, 1)).toBeUndefined();
			expect(yamb.threeOfAKind.score(dice`123456`, 1)).toBeUndefined();

			expect(yamb.threeOfAKind.score(dice`111234`, 1)).toBe(33);
			expect(yamb.threeOfAKind.score(dice`111666`, 1)).toBe(48); // Prefer larger score
			expect(yamb.threeOfAKind.score(dice`555555`, 1)).toBe(45);
		});

		test("straight house", () => {
			expect(yamb.fullHouse.score(dice`112233`, 1)).toBeUndefined();
			expect(yamb.fullHouse.score(dice`666666`, 1)).toBeUndefined(); // No overlapping
			expect(yamb.fullHouse.score(dice`123456`, 1)).toBeUndefined();

			expect(yamb.fullHouse.score(dice`112223`, 1)).toBe(48);
			expect(yamb.fullHouse.score(dice`555666`, 1)).toBe(68); // Prefer larger score
		});

		test("four of a kind", () => {
			expect(yamb.fourOfAKind.score(dice`112333`, 1)).toBeUndefined();
			expect(yamb.fourOfAKind.score(dice`123456`, 1)).toBeUndefined();

			expect(yamb.fourOfAKind.score(dice`111156`, 1)).toBe(54);
			expect(yamb.fourOfAKind.score(dice`11116666`, 1)).toBe(74); // Prefer larger score
			expect(yamb.fourOfAKind.score(dice`66666666`, 1)).toBe(74);
		});

		test("yahtzee", () => {
			expect(yamb.yahtzee.score(dice`111156`, 1)).toBeUndefined();
			expect(yamb.yahtzee.score(dice`123456`, 1)).toBeUndefined();

			expect(yamb.yahtzee.score(dice`555556`, 1)).toBe(75);
			expect(yamb.yahtzee.score(dice`1111166666`, 1)).toBe(80); // Prefer larger score
			expect(yamb.yahtzee.score(dice`555555`, 1)).toBe(75);
		});
	});
});

describe("Game logic", () => {
	test("initialization", () => {
		const game = yamb.create();

		expect(game.score).toBe(0);
		expect(game.active).toBeTruthy();
	});

	test("checking move validity", () => {
		const game = yamb.create();

		expect(game.canPlay(dice`111111`, 1, "one", "free")).toBeTruthy();
		expect(game.canPlay(dice`123456`, 1, "max", "free")).toBeTruthy();
		expect(game.canPlay(dice`111111`, 1, "straight", "free")).toBeFalsy();
		expect(() =>
			game.canPlay(dice`123456`, 1, "foo" as any, "foo" as any),
		).toThrow();
	});

	test("scoring", () => {
		const game = yamb.create();

		game.play(dice`222333`, 1, "one", "free");
		game.play(dice`223344`, 1, "two", "free");
		game.play(dice`123456`, 1, "straight", "free");

		expect(game.field("one", "free")).toBe(0);
		expect(game.field("two", "free")).toBe(4);
		expect(game.field("straight", "free")).toBe(66);

		expect(game.score).toBe(70);
	});
});
