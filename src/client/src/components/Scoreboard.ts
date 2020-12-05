import m from "mithril";
import { Player, classNames, comparePlayers } from "common";
import { state } from "../state";
import { InlineColorCircle } from "./ColorCircle";

interface ScoreboardAttrs {
	sorted?: boolean;
	onClick?: (player: Player) => void;
}

function playerName(player: Player) {
	let name = player.name;
	if (comparePlayers(player, state.self)) {
		name += " (you)";
	}

	if (player.owner) {
		name += " (owner)";
	}

	if (
		state.gameState === "active" &&
		comparePlayers(player, state.gameManager.currentPlayer)
	) {
		name += " (playing)";
	}

	if (!state.players.find(x => comparePlayers(x, player))) {
		name += " (quit)";
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
			m("thead", m("tr", [m("th", "Player"), m("th", "Score")])),
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
