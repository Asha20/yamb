import m from "mithril";
import { state } from "../state";
import * as socket from "../socket";
import { classNames, Player } from "common";

interface CellAttrs {
	filled: boolean;
	player: Player;
	row: string;
	column: string;
	active: boolean;
}

interface YambAttrs {
	player: Player;
	active: boolean;
}

const Cell = {
	play(row: CellAttrs["row"], column: CellAttrs["column"]) {
		socket.send({ type: "move", row, column });
	},

	cellValue(
		filled: boolean,
		player: Player,
		row: CellAttrs["row"],
		column: CellAttrs["column"],
	) {
		const score = state.gameManager.getScore(player, row, column);
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
			m("colgroup", [
				m("col.rows"),
				m("col.columns", { span: columnNames.length }),
			]),

			m("thead", [
				m("tr", [
					m("th"),
					columnNames.map(col => m("th", { key: col }, [col])),
				]),
			]),

			m("tbody", [
				rowNames.map(row =>
					m("tr", { key: row }, [
						m("th", row),
						...columnNames.map(column =>
							m(Cell, {
								key: column,
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
