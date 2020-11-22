import m from "mithril";
import { state, actions } from "../state";
import * as socket from "../socket";
import { Player, classNames, call } from "common";

interface YambCellAttrs {
	filled: boolean;
	player: Player;
	row: string;
	column: string;
	sum: boolean;
}

function play(row: YambCellAttrs["row"], column: YambCellAttrs["column"]) {
	socket.send({ type: "move", row, column });
}

function cellValue(
	filled: boolean,
	player: Player,
	row: YambCellAttrs["row"],
	column: YambCellAttrs["column"],
) {
	const score = state.gameManager.getScore(player, row, column);
	return filled || state.gameManager.roll > 0 ? score : undefined;
}

export const YambCell: m.Component<YambCellAttrs> = {
	view({ attrs }) {
		const { filled, row, column, player, sum } = attrs;

		if (sum) {
			return m(
				"td.yamb-cell__td",
				{
					class: classNames({
						"yamb-cell__td--sum": sum,
					}),
				},
				m(".yamb-cell.filled", cellValue(true, player, row, column)),
			);
		}

		const showCallButton =
			!filled &&
			column === call.name &&
			!state.gameManager.calling() &&
			state.gameManager.roll === 1;

		if (showCallButton) {
			return m(
				"td",
				m(
					"button.yamb-cell.legal",
					{
						disabled: !state.ownTurn,
						onclick: () => {
							actions.call(row);
							if (document.activeElement instanceof HTMLElement) {
								document.activeElement.blur();
							}
						},
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
			"td.yamb-cell__td",
			{
				class: classNames({
					"yamb-cell__td--sum": sum,
				}),
			},
			m(
				"button.yamb-cell",
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
