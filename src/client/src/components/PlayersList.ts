import m from "mithril";
import { Player } from "common";
import { state } from "../state";
import { InlineColorCircle } from "./ColorCircle";

interface PlayerListAttrs {
	players: Player[];
}

function playerName(player: Player) {
	let name = player.name;
	if (player.name === state.self.name) {
		name += " (you)";
	}

	if (player.owner) {
		name += " (owner)";
	}

	return name;
}

export const PlayersList: m.Component<PlayerListAttrs> = {
	view({ attrs }) {
		const { players } = attrs;

		return m("section.players", [
			m("h2.text-center", "Players"),
			m(
				"ul.players__ul",
				players.map(player =>
					m("li.players__li", { key: player.id }, [
						m(InlineColorCircle, { color: player.color }),
						m("span.players__name", playerName(player)),
					]),
				),
			),
		]);
	},
};
