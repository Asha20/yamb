import m from "mithril";
import { Yamb } from "../components/Yamb";
import { Dice } from "../components/Dice";
import { Scoreboard } from "../components/Scoreboard";
import { GameOver } from "../components/GameOver";
import { state, actions } from "../state";
import * as socket from "../socket";

const Aside = {
	view() {
		return m("aside", [m(Scoreboard), m(Dice)]);
	},
};

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
		return state.gameState === "finished"
			? m(GameOver)
			: m(".game", [
					m(Yamb, { player: state.gameManager.currentPlayer, active: true }),
					m(Aside),
			  ]);
	},
};
