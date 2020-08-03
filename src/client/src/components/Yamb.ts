import m from "mithril";
import { state } from "../state";
import * as socket from "../socket";
import { classNames } from "common/util";

interface CellAttrs {
	filled: boolean;
	player: number;
	row: string;
	column: string;
	active: boolean;
}

interface YambAttrs {
	player: number;
	active: boolean;
}

const Cell = {
	play(row: CellAttrs["row"], column: CellAttrs["column"]) {
		socket.send({ type: "move", row, column });
	},

	cellValue(
		filled: boolean,
		player: number,
		row: CellAttrs["row"],
		column: CellAttrs["column"],
	) {
		const score = state.gameManager.getScore(player, row, column);

		if (state.gameManager.currentPlayer !== player) {
			return filled ? score : undefined;
		}

		return filled || state.gameManager.roll > 0 ? score : undefined;
	},

	view(vnode: m.Vnode<CellAttrs>) {
		const { filled, row, column, player, active } = vnode.attrs;

		const potentialScore = state.gameManager.getScore(player, row, column);
		const canPlay = active && !filled;
		const legalMove =
			potentialScore !== undefined && state.gameManager.roll > 0;

		return m("td", [
			m(
				"button.cell",
				{
					class: classNames({
						filled,
						illegal: canPlay && !legalMove,
						legal: canPlay && legalMove,
					}),
					disabled: !active || !legalMove,
					onclick: () => this.play(row, column),
				},
				this.cellValue(filled, player, row, column),
			),
		]);
	},
};

export const Yamb = {
	view(vnode: m.Vnode<YambAttrs>) {
		const { player, active } = vnode.attrs;
		const { rowNames, columnNames } = state.gameManager;

		return m("table.yamb", { class: classNames({ active }) }, [
			m("thead", [
				m("tr", [
					m("th", state.players[player].name),
					columnNames.map(col => m("th", [col])),
				]),
			]),

			m("tbody", [
				rowNames.map(row =>
					m("tr", [
						m("td", row),
						...columnNames.map(column =>
							m(Cell, {
								filled: state.gameManager.filled(player, row, column),
								row,
								column,
								player,
								active,
							}),
						),
					]),
				),
			]),
		]);
	},
};
