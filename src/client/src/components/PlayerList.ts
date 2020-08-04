import m from "mithril";
import { Player } from "common/ws";
import { state } from "../state";

type PlayerListAttrs =
	| {
			players: Player[];
			currentPlayer: number;
			gameStarted: true;
	  }
	| {
			players: Player[];
			gameStarted: false;
	  };

export const PlayerList = {
	playerName(attrs: PlayerListAttrs, player: Player, index: number) {
		let name = player.name;
		if (player.name === state.self.name) {
			name += " (you)";
		}

		if (player.owner) {
			name += " (owner)";
		}

		if (attrs.gameStarted && index === attrs.currentPlayer) {
			name += " (playing)";
		}

		return name;
	},

	view(vnode: m.Vnode<PlayerListAttrs>) {
		return m("section.players", [
			m("h2", "Players"),
			m(
				"ul.players__ul",
				vnode.attrs.players.map((player, i) =>
					m("li", this.playerName(vnode.attrs, player, i)),
				),
			),
		]);
	},
};
