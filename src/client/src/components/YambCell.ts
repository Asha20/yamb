import m from "mithril";
import { state, actions } from "../state";
import * as socket from "../socket";
import { Player, classNames, call } from "common";
import { sleep, HIGHLIGHT_MOVE_DELAY } from "../util";

interface YambCellAttrs {
	filled: boolean;
	player: Player;
	row: string;
	column: string;
	sum: boolean;
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

export const YambCell: m.FactoryComponent<YambCellAttrs> = ({ attrs }) => {
	let highlighted = false;
	let unsubscribe: (() => void) | null = null;

	function play(row: string, column: string) {
		socket.send({ type: "move", row, column });
		m.redraw();
	}

	return {
		oninit() {
			unsubscribe = socket.onMessage(async msg => {
				if (msg.type === "moveResponse") {
					if (attrs.row === msg.row && attrs.column === msg.column) {
						state.viewingPlayer = state.gameManager.currentPlayer;
						highlighted = true;
						m.redraw();
						await sleep(HIGHLIGHT_MOVE_DELAY);
						highlighted = false;
						m.redraw();
					}
				}
			});
		},

		onremove() {
			unsubscribe?.();
		},

		view({ attrs }) {
			const { filled, row, column, player, sum } = attrs;

			const viewingOwnTable =
				player.name === state.gameManager.currentPlayer.name;

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

			if (viewingOwnTable && showCallButton) {
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

			const value = viewingOwnTable
				? cellValue(filled, player, row, column)
				: filled
				? cellValue(filled, player, row, column)
				: undefined;

			return m(
				"td.yamb-cell__td",
				{
					class: classNames({
						"yamb-cell__td--sum": sum,
						"yamb-cell__td--highlighted": highlighted,
					}),
				},
				m(
					"button.yamb-cell",
					{
						class: classNames({
							filled,
							illegal: viewingOwnTable && canPlay && !legalMove,
							legal: viewingOwnTable && canPlay && legalMove,
						}),
						disabled:
							!viewingOwnTable || filled || !legalMove || !state.ownTurn,
						onclick: () => play(row, column),
					},
					value,
				),
			);
		},
	};
};
