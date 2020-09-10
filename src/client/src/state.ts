import { GameManager, gameManager, Player, ChatMessage } from "common";
import * as socket from "./socket";

export type GameState = "inactive" | "active" | "finished";

interface State {
	self: Player;
	gameManager: GameManager;
	initialPlayers: Player[];
	players: Player[];
	gameState: GameState;
	ownTurn: boolean;
	chat: ChatMessage[];
}

const initialState = (): State => ({
	self: { id: "", name: "", owner: false },
	initialPlayers: [],
	players: [],
	gameManager: gameManager([]),
	gameState: "inactive",
	chat: [],

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

	sendMessage(content: string) {
		const message: ChatMessage = {
			sender: state.self.id,
			sent: Date.now(),
			content,
		};
		socket.send({ type: "chatMessage", message });
	},
};
