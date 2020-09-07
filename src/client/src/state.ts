import { GameManager, gameManager, Player } from "common";

export type GameState = "inactive" | "active" | "finished";

interface State {
	self: Player;
	gameManager: GameManager;
	initialPlayers: Player[];
	players: Player[];
	gameState: GameState;
	ownTurn: boolean;
}

const initialState = (): State => ({
	self: { id: "", name: "", owner: false },
	initialPlayers: [],
	players: [],
	gameManager: gameManager([]),
	gameState: "inactive",

	get ownTurn() {
		return this.self.name === this.gameManager.currentPlayer.name;
	},
});

export const state = initialState();

export const actions = {
	startGame(players: Player[]) {
		state.initialPlayers = players;
		state.players = players;
		state.gameManager = gameManager(players);
		state.gameState = "active";
	},

	endGame() {
		state.gameState = "finished";
	},
};
