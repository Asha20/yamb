import m from "mithril";
import { Yamb, Dice, Scoreboard, GameOver, Chat } from "../components";
import { state, actions } from "../state";
import * as socket from "../socket";

export const Game = {
	oninit() {
		socket.onMessage(msg => {
			switch (msg.type) {
				case "players":
					state.players = msg.players;
					break;
				case "moveResponse":
					state.gameManager.play(msg.row, msg.column, state.players);
					break;
				case "findNextAvailablePlayer":
					state.gameManager.findNextAvailablePlayer(state.players);
					state.gameManager.resetDice();
					break;
				case "gameEnded":
					actions.endGame();
					break;
			}
			m.redraw();
		});
	},

	view() {
		if (state.gameState === "finished") {
			return m(GameOver);
		}

		return m(".game", [
			m(".yamb-wrapper", [
				m(Yamb, { player: state.gameManager.currentPlayer }),
				m(Dice),
				m(Scoreboard),
			]),
			m("aside", [m(Chat)]),
		]);
	},
};
