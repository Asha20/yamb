import { GameManager, gameManager } from "common/gameManager";
import { SocketMetadata } from "common/ws";

interface State {
	gameManager: GameManager;
	players: SocketMetadata[];
}

const initialState = (): State => ({
	players: [],
	gameManager: gameManager(0),
});

export const state = initialState();

export const actions = {
	startGame(players: SocketMetadata[]) {
		state.players = players;
		state.gameManager = gameManager(players.length);
	},
};
