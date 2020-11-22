import m from "mithril";
import { Yamb, Dice, Scoreboard, GameOver, Chat } from "../components";
import { state, actions } from "../state";
import * as socket from "../socket";
import { sleep, HIGHLIGHT_MOVE_DELAY } from "../util";

export const Game: m.Component = {
	oninit() {
		socket.onMessage(async msg => {
			switch (msg.type) {
				case "players":
					state.players = msg.players;
					break;
				case "moveResponse":
					state.gameManager.play(msg.row, msg.column);
					m.redraw();
					await sleep(HIGHLIGHT_MOVE_DELAY);
					state.gameManager.findNextAvailablePlayer(state.players);
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

		return m(".game.expand", [
			m(
				".grid--yamb.yamb__wrapper",
				m(Yamb, { player: state.gameManager.currentPlayer }),
			),
			m(".grid--dice", m(Dice)),
			m(".grid--scoreboard", m(Scoreboard)),
			m("aside.grid--chat", m(Chat)),
		]);
	},
};
