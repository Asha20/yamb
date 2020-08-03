import m from "mithril";
import { state, actions } from "../state";

interface CellAttrs {
	player: number;
	row: typeof state.games[0]["rowNames"][number];
	column: typeof state.games[0]["columnNames"][number];
}

const Cell = {
	value: undefined as number | undefined,
	play(player: number, row: CellAttrs["row"], column: CellAttrs["column"]) {
		const game = state.games[player];

		if (state.dice.roll === 0 || this.value !== undefined) {
			return;
		}

		if (game.getScore(state.dice, row, column) === undefined) {
			return;
		}

		actions.play(player, row, column);
		this.value = game.field(row, column);
	},

	cellValue(
		player: number,
		row: CellAttrs["row"],
		column: CellAttrs["column"],
	) {
		return this.value ?? state.games[player].getScore(state.dice, row, column);
	},

	view(vnode: m.Vnode<CellAttrs>) {
		const { row, column, player } = vnode.attrs;
		return m("td", [
			m(
				"button.cell",
				{
					class: this.value !== undefined ? "filled" : "",
					disabled: state.dice.roll === 0 || this.value !== undefined,
					onclick: () => this.play(player, row, column),
				},
				this.cellValue(player, row, column),
			),
		]);
	},
};

export const Yamb: m.Component<{ player: number }> = {
	view(vnode) {
		const { player } = vnode.attrs;
		const game = state.games[player];

		return m("table.yamb", [
			m("thead", [
				m("tr", [
					m("th", state.players[player].name),
					game.columnNames.map(col => m("th", [col])),
				]),
			]),

			m("tbody", [
				game.rowNames.map(row =>
					m("tr", [
						m("td", row),
						...game.columnNames.map(column => m(Cell, { row, column, player })),
					]),
				),
			]),
		]);
	},
};
