import { GameManager, gameManager } from "common/gameManager";
import { Player } from "common/ws";

interface State {
	self: Player;
	gameManager: GameManager;
	players: Player[];
}

const initialState = (): State => ({
	self: { name: "", owner: false },
	players: [],
	gameManager: gameManager(0),
});

export const state = initialState();

export const actions = {
	startGame(players: Player[]) {
		state.players = players;
		state.gameManager = gameManager(players.length);
	},
};
