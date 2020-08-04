import m from "mithril";
import { Yamb } from "../components/Yamb";
import { Dice } from "../components/Dice";
import { state } from "../state";
import { array } from "common/util";
import * as socket from "../socket";

const Aside = {
	view() {
		return m("aside", [
			m("section.players", [
				m("h2", "Players"),
				m(
					"ul.players__ul",
					state.players.map((player, i) =>
						m(
							"li",
							i === state.gameManager.currentPlayer
								? player.name + " (playing)"
								: player.name,
						),
					),
				),
			]),

			m(Dice),
		]);
	},
};

export const Game = {
	oninit() {
		socket.onMessage(msg => {
			switch (msg.type) {
				case "moveResponse":
					state.gameManager.play(msg.player, msg.row, msg.column);
					break;
			}
			m.redraw();
		});
	},

	view() {
		return m(".game", [
			m(Yamb, { player: state.gameManager.currentPlayer, active: true }),
			m(Aside),
		]);
	},
};
