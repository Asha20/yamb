import { GameManager, gameManager } from "common/gameManager";
import { Player } from "common/ws";

interface State {
	self: Player;
	gameManager: GameManager;
	players: Player[];
	ownTurn: boolean;
}

const initialState = (): State => ({
	self: { id: "", name: "", owner: false },
	players: [],
	gameManager: gameManager([]),

	get ownTurn() {
		return this.self.name === this.gameManager.currentPlayer.name;
	},
});

export const state = initialState();

export const actions = {
	startGame(players: Player[]) {
		state.players = players;
		state.gameManager = gameManager(players);
	},
};
