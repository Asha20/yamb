import m from "mithril";
import { Player, classNames, comparePlayers } from "common";
import { state } from "../state";
import { InlineColorCircle } from "./ColorCircle";
import { i18n } from "../i18n";

interface ScoreboardAttrs {
	sorted?: boolean;
	onClick?: (player: Player) => void;
}

function playerName(player: Player) {
	let name = player.name;
	if (comparePlayers(player, state.self)) {
		name += " (" + i18n("you") + ")";
	}

	if (player.owner) {
		name += " (" + i18n("owner") + ")";
	}

	if (
		state.gameState === "active" &&
		comparePlayers(player, state.gameManager.currentPlayer)
	) {
		name += " (" + i18n("playing") + ")";
	}

	if (!state.players.find(x => comparePlayers(x, player))) {
		name += " (" + i18n("quit") + ")";
	}

	return name;
}

export const Scoreboard: m.Component<ScoreboardAttrs> = {
	view({ attrs }) {
		const { sorted = false, onClick } = attrs;
		const players = [...state.initialPlayers].map(x => ({
			player: x,
			score: state.gameManager.score(x),
		}));
		if (sorted) {
			players.sort((a, b) => b.score - a.score);
		}

		const trClass = classNames({ "scoreboard__tr--focusable": !!onClick });

		return m("table.scoreboard", [
			m("thead", m("tr", [m("th", i18n("Player")), m("th", i18n("Score"))])),
			m(
				"tbody",
				players.map(({ player, score }) =>
					m(
						"tr",
						{
							key: player.id,
							class: trClass,
							onclick: () => onClick?.(player),
						},
						[
							m("td", [
								m(InlineColorCircle, {
									color: player.color,
									selected: comparePlayers(
										state.gameManager.currentPlayer,
										player,
									),
								}),
								m("span.players__name", playerName(player)),
							]),
							m("td.text-center", score),
						],
					),
				),
			),
		]);
	},
};
