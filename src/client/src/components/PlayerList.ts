import m from "mithril";
import { Player } from "common/gameManager";
import { state } from "../state";

type PlayerListAttrs =
	| {
			players: Player[];
			currentPlayer: Player;
			gameStarted: true;
	  }
	| {
			players: Player[];
			gameStarted: false;
	  };

export const PlayerList = {
	playerName(attrs: PlayerListAttrs, player: Player) {
		let name = player.name;
		if (player.name === state.self.name) {
			name += " (you)";
		}

		if (player.owner) {
			name += " (owner)";
		}

		if (attrs.gameStarted && player.name === attrs.currentPlayer.name) {
			name += " (playing)";
		}

		return name;
	},

	view(vnode: m.Vnode<PlayerListAttrs>) {
		return m("section.players", [
			m("h2", "Players"),
			m(
				"ul.players__ul",
				vnode.attrs.players.map(player =>
					m("li", this.playerName(vnode.attrs, player)),
				),
			),
		]);
	},
};
