import m from "mithril";
import { Player, classNames } from "common";
import { state } from "../state";
import { InlineColorCircle } from "./ColorCircle";

interface ScoreboardAttrs {
	sorted?: boolean;
	onClick?: (player: Player) => void;
}

function playerName(player: Player) {
	let name = player.name;
	if (player.name === state.self.name) {
		name += " (you)";
	}

	if (player.owner) {
		name += " (owner)";
	}

	if (
		state.gameState === "active" &&
		player.name === state.gameManager.currentPlayer.name
	) {
		name += " (playing)";
	}

	if (!state.players.find(x => x.id === player.id)) {
		name += " (quit)";
	}

	return name;
}

export const Scoreboard: m.Component<ScoreboardAttrs> = {
	view({ attrs }) {
		const { sorted = true, onClick } = attrs;
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
									selected: state.gameManager.currentPlayer.id === player.id,
								}),
								m("span.players__name", playerName(player)),
							]),
							m("td", score),
						],
					),
				),
			),
		]);
	},
};
