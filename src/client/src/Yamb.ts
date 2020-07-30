import m from "mithril";
import { state, actions } from "./state";
import { countDice } from "common/util";

interface CellAttrs {
	row: typeof state.game["rowNames"][number];
	column: typeof state.game["columnNames"][number];
}

const Cell = {
	value: undefined as number | undefined,
	play(row: CellAttrs["row"], column: CellAttrs["column"]) {
		if (state.roll === 0 || this.value !== undefined) {
			return;
		}

		actions.play(row, column);
		this.value = state.game.field(row, column);
	},

	cellValue(row: CellAttrs["row"], column: CellAttrs["column"]) {
		return (
			this.value ??
			state.game.getScore(countDice(state.dice), state.roll, row, column)
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

export const Yamb = {
	view() {
		return m("table.yamb", [
			m("thead", [
				m("tr", [
					m("th", "Blank"),
					state.game.columnNames.map(col => m("th", [col])),
				]),
			]),

			m("tbody", [
				state.game.rowNames.map(row =>
					m("tr", [
						m("td", row),
						...state.game.columnNames.map(column => m(Cell, { row, column })),
					]),
				),
			]),
		]);
	},
};
