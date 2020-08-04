import m from "mithril";
import { Yamb } from "../components/Yamb";
import { Dice } from "../components/Dice";
import { PlayerList } from "../components/PlayerList";
import { state } from "../state";
import * as socket from "../socket";

const Aside = {
	view() {
		return m("aside", [
			m(PlayerList, {
				players: state.players,
				currentPlayer: state.gameManager.currentPlayer,
				gameStarted: true,
			}),
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
