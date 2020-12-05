import m from "mithril";
import { Yamb, Dice, Scoreboard, GameOver, Chat } from "../components";
import { state, actions } from "../state";
import * as socket from "../socket";
import { sleep, HIGHLIGHT_MOVE_DELAY } from "../util";
import { Player } from "common";

function watchPlayer(player: Player) {
	state.viewingPlayer = player;
	m.redraw();
}

export const Game: m.Component = {
	oninit() {
		socket.onMessage(async msg => {
			switch (msg.type) {
				case "players":
					state.players = msg.players;
					state.viewingPlayer = state.gameManager.currentPlayer;
					break;
				case "moveResponse":
					state.gameManager.play(msg.row, msg.column);
					m.redraw();
					await sleep(HIGHLIGHT_MOVE_DELAY);
					state.gameManager.findNextAvailablePlayer(state.players);
					state.viewingPlayer = state.gameManager.currentPlayer;
					break;
				case "findNextAvailablePlayer": {
					state.gameManager.findNextAvailablePlayer(state.players);
					state.gameManager.resetDice();
					state.viewingPlayer = state.gameManager.currentPlayer;
					break;
				}
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
			m(".grid--yamb.yamb__wrapper", m(Yamb, { player: state.viewingPlayer })),
			m(".grid--dice", m(Dice)),
			m(".grid--scoreboard", m(Scoreboard, { onClick: watchPlayer })),
			m("aside.grid--chat", m(Chat)),
		]);
	},
};
