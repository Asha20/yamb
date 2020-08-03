import m from "mithril";
import { Yamb } from "../components/Yamb";
import { Dice } from "../components/Dice";
import { state } from "../state";
import { array } from "common/util";
import * as socket from "../socket";

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
		return [
			...array(state.gameManager.players, id =>
				m(Yamb, { player: id, active: state.gameManager.currentPlayer === id }),
			),
			m(Dice),
			m("button", { onclick: () => m.redraw() }, "Redraw"),
		];
	},
};
