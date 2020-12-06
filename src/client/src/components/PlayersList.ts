import m from "mithril";
import { Player, comparePlayers } from "common";
import { state } from "../state";
import { InlineColorCircle } from "./ColorCircle";
import { i18n } from "../i18n";

interface PlayerListAttrs {
	players: Player[];
}

function playerName(player: Player) {
	let name = player.name;
	if (comparePlayers(player, state.self)) {
		name += " (" + i18n("you") + ")";
	}

	if (player.owner) {
		name += " (" + i18n("owner") + ")";
	}

	return name;
}

export const PlayersList: m.Component<PlayerListAttrs> = {
	view({ attrs }) {
		const { players } = attrs;

		return m("section.players", [
			m("h2.text-center", i18n("Players")),
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
