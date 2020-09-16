import * as m from "mithril";
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

	call(row: string) {
		socket.send({ type: "requestCall", row });
	},
};

export function init() {
	socket.onMessage(message => {
		switch (message.type) {
			case "players":
				state.players = message.players;
				const newSelf = message.players.find(x => x.id === state.self.id);
				if (newSelf) {
					state.self = newSelf;
				}
				break;
			case "chatSync":
				state.chat = message.messages;
				break;
			case "receiveChatMessage":
				state.chat.push(message.message);
				break;
			case "confirmCall":
				state.gameManager.call(message.row);
				break;
		}
		m.redraw();
	});
}
