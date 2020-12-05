import m from "mithril";
import { GameManager, Player, ChatMessage, PlayerColor } from "common";
import * as socket from "./socket";
import { COLUMNS } from "common/yamb";

export type GameState = "inactive" | "active" | "finished";

interface State {
	self: Player;
	viewingPlayer: Player;
	gameManager: GameManager;
	initialPlayers: Player[];
	players: Player[];
	gameState: GameState;
	readonly ownTurn: boolean;
	chat: ChatMessage[];
}

const emptyPlayer = (): Player => ({
	id: "",
	name: "",
	owner: false,
	color: "red",
});

const initialState = (): State => ({
	self: emptyPlayer(),
	viewingPlayer: emptyPlayer(),
	initialPlayers: [],
	players: [],
	gameManager: new GameManager([], [], []),
	gameState: "inactive",
	chat: [],

	get ownTurn() {
		return this.self.name === this.gameManager.currentPlayer.name;
	},
});

export const state = initialState();

export const actions = {
	startGame(players: Player[], columns: string[]): void {
		state.initialPlayers = players;
		state.players = players;
		state.gameManager = new GameManager(
			players,
			COLUMNS.filter(x => columns.includes(x.name)),
		);
		state.gameState = "active";
		state.viewingPlayer = state.gameManager.currentPlayer;
	},

	changeColor(playerId: Player["id"], color: PlayerColor): void {
		const player = state.players.find(x => x.id === playerId);
		if (player) {
			player.color = color;
		}
	},

	endGame(): void {
		state.gameState = "finished";
	},

	sendMessage(content: string): void {
		const message: ChatMessage = {
			sender: { id: state.self.id, name: state.self.name },
			sent: Date.now(),
			content,
		};
		socket.send({ type: "chatMessage", message });
	},

	call(row: string): void {
		socket.send({ type: "requestCall", row });
	},
};

export function init(): void {
	socket.onMessage(message => {
		switch (message.type) {
			case "players": {
				state.players = message.players;
				const newSelf = message.players.find(x => x.id === state.self.id);
				if (newSelf) {
					state.self = newSelf;
				}
				break;
			}
			case "chatSync":
				state.chat = message.messages;
				break;
			case "receiveChatMessage":
				state.chat.push(message.message);
				break;
			case "confirmCall":
				state.gameManager.call(message.row);
				break;
			case "ping":
				socket.send({ type: "pong" });
		}
		m.redraw();
	});
}
