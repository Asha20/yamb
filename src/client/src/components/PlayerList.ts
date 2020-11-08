import m from "mithril";
import { Player } from "common";
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

function playerName(attrs: PlayerListAttrs, player: Player) {
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
}

export const PlayerList: m.Component<PlayerListAttrs> = {
	view(vnode: m.Vnode<PlayerListAttrs>) {
		return m("section.players", [
			m("h2", "Players"),
			m(
				"ul.players__ul",
				vnode.attrs.players.map(player =>
					m("li", { key: player.id }, playerName(vnode.attrs, player)),
				),
			),
		]);
	},
};
