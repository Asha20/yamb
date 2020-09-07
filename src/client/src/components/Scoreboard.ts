import m from "mithril";
import { Player } from "common";
import { state } from "../state";

export const Scoreboard = {
	playerName(player: Player) {
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
	},

	view() {
		return m("table.scoreboard", [
			m("thead", [m("tr", [m("th", "Player"), m("th", "Score")])]),
			m(
				"tbody",
				state.initialPlayers.map(player =>
					m("tr", [
						m("td", this.playerName(player)),
						m("td", state.gameManager.score(player)),
					]),
				),
			),
		]);
	},
};
