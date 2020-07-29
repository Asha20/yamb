import "../public/index.css";
import m from "mithril";
import * as yamb from "common/yamb";
import { array } from "common/util";

const game = yamb.create();

interface CellAttrs {
	row: typeof game["rowNames"][number];
	column: typeof game["columnNames"][number];
}

interface State {
	roll: number;
	dice: yamb.DieSide[];
	frozen: boolean[];
}

const diceLook = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

const initialState = (): State => ({
	roll: 0,
	dice: array(6, () => 6),
	frozen: array(6, () => false),
});

const state = initialState();

function countDice(dice: yamb.DieSide[]): yamb.Dice {
	const result: yamb.Dice = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
	for (const die of dice) {
		result[die] += 1;
	}
	return result;
}

const Dice = {
	onDieClick(index: number) {
		if (state.roll > 0) {
			state.frozen[index] = !state.frozen[index];
		}
	},

	rollDice() {
		const allFrozen = state.frozen.every(isFrozen => isFrozen);

		if (allFrozen || state.roll >= 3) {
			return;
		}

		for (let i = 0; i < state.dice.length; i++) {
			if (!state.frozen[i]) {
				state.dice[i] = (Math.floor(Math.random() * 6) + 1) as yamb.DieSide;
			}
		}
		state.roll += 1;
	},

	view() {
		return m("section.dice", [
			m(
				"div",
				state.dice.map((die, i) =>
					m(
						"button.die",
						{
							class: state.frozen[i] ? "frozen" : "",
							onclick: () => this.onDieClick(i),
						},
						diceLook[die - 1],
					),
				),
			),
			m("button", { onclick: this.rollDice }, "Roll dice"),
			"Roll: " + state.roll,
		]);
	},
};

const Cell = {
	value: undefined as number | undefined,
	play(row: CellAttrs["row"], column: CellAttrs["column"]) {
		if (state.roll === 0 || this.value !== undefined) {
			return;
		}

		game.play(countDice(state.dice), state.roll, row, column);
		this.value = game.field(row, column);

		Object.assign(state, initialState());
	},

	cellValue(row: CellAttrs["row"], column: CellAttrs["column"]) {
		return (
			this.value ??
			game.getScore(countDice(state.dice), state.roll, row, column)
		);
	},

	view(vnode: m.Vnode<CellAttrs>) {
		const { row, column } = vnode.attrs;
		return m("td", [
			m(
				"button.cell",
				{
					class: this.value !== undefined ? "filled" : "",
					disabled: state.roll === 0 || this.value !== undefined,
					onclick: () => this.play(row, column),
				},
				this.cellValue(row, column),
			),
		]);
	},
};

const Yamb = {
	view() {
		return m("table.yamb", [
			m("thead", [
				m("tr", [
					m("th", "Blank"),
					game.columnNames.map(col => m("th", [col])),
				]),
			]),

			m("tbody", [
				game.rowNames.map(row =>
					m("tr", [
						m("td", row),
						...game.columnNames.map(column => m(Cell, { row, column })),
					]),
				),
			]),
		]);
	},
};

const App = {
	view() {
		return [
			m(Yamb),
			m(Dice),
			m("button", { onclick: () => m.redraw() }, "Redraw"),
		];
	},
};

m.mount(document.body, App);

(window as any).state = state;
