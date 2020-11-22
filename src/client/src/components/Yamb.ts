import m from "mithril";
import { state } from "../state";
import { Player } from "common";
import { Tooltip } from "./Tooltip";
import { YambCell } from "./YambCell";

interface YambAttrs {
	player: Player;
}

export const Yamb: m.Component<YambAttrs> = {
	view({ attrs }) {
		const { player } = attrs;
		const { rows, columns, currentPlayer } = state.gameManager;

		const colorClass = "yamb--" + currentPlayer.color;

		return m("table.yamb", { class: colorClass }, [
			m("colgroup", [
				m("col.rows"),
				m("col.columns", { span: columns.length }),
			]),

			m("thead", [
				m("tr", [
					m("th", currentPlayer.name),
					columns.map(col =>
						m("th", { key: col.name }, m(Tooltip, { tip: col.tip }, col.name)),
					),
				]),
			]),

			m("tbody", [
				rows.map(row =>
					m("tr", { key: row.name }, [
						m("th", m(Tooltip, { tip: row.tip }, row.name)),
						columns.map(col =>
							m(YambCell, {
								key: col.name,
								filled: state.gameManager.filled(player, row.name, col.name),
								row: row.name,
								column: col.name,
								player,
								sum: row.sum,
							}),
						),
					]),
				),
				m("tr", [
					m("th", "Total"),
					m(
						"td..yamb-cell__td.yamb-cell__td--sum",
						{ colspan: columns.length },
						m(".yamb-cell", state.gameManager.score(player)),
					),
				]),
			]),
		]);
	},
};
