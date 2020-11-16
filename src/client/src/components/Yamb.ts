import m from "mithril";
import { state, actions } from "../state";
import * as socket from "../socket";
import { classNames, Player } from "common";
import { Tooltip } from "./Tooltip";

interface CellAttrs {
	filled: boolean;
	player: Player;
	row: string;
	column: string;
}

interface YambAttrs {
	player: Player;
}

function play(row: CellAttrs["row"], column: CellAttrs["column"]) {
	socket.send({ type: "move", row, column });
}

function cellValue(
	filled: boolean,
	player: Player,
	row: CellAttrs["row"],
	column: CellAttrs["column"],
) {
	const score = state.gameManager.getScore(player, row, column);
	return filled || state.gameManager.roll > 0 ? score : undefined;
}

function call(row: string) {
	actions.call(row);
	if (document.activeElement instanceof HTMLElement) {
		document.activeElement?.blur();
	}
}

const Cell: m.Component<CellAttrs> = {
	view(vnode: m.Vnode<CellAttrs>) {
		const { filled, row, column, player } = vnode.attrs;

		if (
			!filled &&
			column === "C" &&
			!state.gameManager.calling() &&
			state.gameManager.roll === 1
		) {
			return m(
				"td",
				m(
					"button.cell.legal",
					{
						disabled: !state.ownTurn,
						onclick: () => call(row),
					},
					"Call",
				),
			);
		}

		const potentialScore = state.gameManager.getScore(player, row, column);
		const canPlay = !filled;
		const legalMove =
			potentialScore !== undefined && state.gameManager.roll > 0;

		return m(
			"td",
			m(
				"button.cell",
				{
					class: classNames({
						filled,
						illegal: canPlay && !legalMove,
						legal: canPlay && legalMove,
					}),
					disabled: filled || !legalMove || !state.ownTurn,
					onclick: () => play(row, column),
				},
				cellValue(filled, player, row, column),
			),
		);
	},
};

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

			m(
				"tbody",
				rows.map(row =>
					m("tr", { key: row.name }, [
						m("th", m(Tooltip, { tip: row.tip }, row.name)),
						columns.map(col =>
							m(Cell, {
								key: col.name,
								filled: state.gameManager.filled(player, row.name, col.name),
								row: row.name,
								column: col.name,
								player,
							}),
						),
					]),
				),
			),
		]);
	},
};
