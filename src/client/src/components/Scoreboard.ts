import m from "mithril";
import { Player } from "common";
import { state } from "../state";
import { ColorCircle } from "./ColorCircle";

interface ScoreboardAttrs {
	sorted?: boolean;
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
		const { sorted = true } = attrs;
		const players = [...state.initialPlayers].map(x => ({
			player: x,
			score: state.gameManager.score(x),
		}));
		if (sorted) {
			players.sort((a, b) => b.score - a.score);
		}

		return m("table.scoreboard", [
			m("thead", m("tr", [m("th", "Player"), m("th", "Score")])),
			m(
				"tbody",
				players.map(({ player, score }) =>
					m("tr", { key: player.id }, [
						m("td", [
							m(ColorCircle, {
								color: player.color,
								selected: state.gameManager.currentPlayer.id === player.id,
							}),
							m("span.players__name", playerName(player)),
						]),
						m("td", score),
					]),
				),
			),
		]);
	},
};
