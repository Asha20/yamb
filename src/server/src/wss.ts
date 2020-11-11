import * as WebSocket from "ws";
import { Server } from "http";
import { GameManager, ChatMessage, ServerMessage, COLUMNS } from "common";
import { Room, RoomManager } from "./roomManager";

const nameRegex = /^[\w\s]+$/;

let wss: WebSocket.Server;

export const gamesSet = new Set<string>();
export const games = new Map<Room, GameManager>();
export const chatLogs = new Map<Room, ChatMessage[]>();

export function listen(server: Server): void {
	wss = new WebSocket.Server({ server });

	const roomManager = new RoomManager(wss, url => {
		const lobbyRegex = /^\/lobby\/(\d+)$/;
		const lobbyMatch = url.match(lobbyRegex);
		return lobbyMatch && lobbyMatch[1];
	});

	function serverMessage(
		room: Room,
		broadcast: (msg: ServerMessage) => void,
		content: string,
	) {
		const chatLog = chatLogs.get(room);
		const message: ChatMessage = {
			sender: "Server",
			sent: Date.now(),
			content,
		};
		if (chatLog) {
			chatLog.push(message);
			broadcast({ type: "receiveChatMessage", message });
		}
	}

	function getChatLog(room: Room) {
		const chatLog = chatLogs.get(room);
		if (chatLog) {
			return chatLog;
		} else {
			throw new Error("Missing chat log.");
		}
	}

	function getGame(room: Room) {
		const game = games.get(room);
		if (game) {
			return game;
		} else {
			throw new Error("Missing chat log.");
		}
	}

	roomManager.onJoin(({ member, room, reply, broadcast }) => {
		if (games.has(room)) {
			member.socket.close();
			return;
		}

		console.log(`Player ${member.id} joined room ${room.id}`);
		broadcast({ type: "players", players: room.players });

		if (!chatLogs.has(room)) {
			chatLogs.set(room, []);
		}

		const chatLog = getChatLog(room);
		reply({ type: "chatSync", messages: chatLog });
	});

	roomManager.onLeave(({ room, member, broadcast }) => {
		if (member.player.owner && room.players.length) {
			const nextOwner = room.players[0];
			room.owner = nextOwner;
			nextOwner.owner = true;
		}

		broadcast({ type: "players", players: room.players });

		const game = games.get(room);

		if (game?.currentPlayer.id === member.id) {
			game?.findNextAvailablePlayer(room.players);
			game?.resetDice();
			broadcast({ type: "findNextAvailablePlayer" });
		}

		if (!room.players.length) {
			roomManager.deleteRoom(room.id);
			games.delete(room);
			chatLogs.delete(room);
			gamesSet.delete(room.id);
		}

		serverMessage(room, broadcast, `${member.player.name} left.`);
	});

	roomManager.onMessage({
		setName({ msg, member, room, reply, broadcast }) {
			const name = msg.name.trim();

			if (msg.name.length === 0) {
				reply({ type: "nameResponse", status: "name-missing" });
				return;
			}
			if (msg.name.length > 16) {
				reply({ type: "nameResponse", status: "too-long" });
				return;
			}
			if (name.length === 0 || !nameRegex.test(msg.name)) {
				reply({ type: "nameResponse", status: "invalid" });
				return;
			}
			if (room.players.some(x => x.name === name)) {
				reply({ type: "nameResponse", status: "unavailable" });
				return;
			}

			if (!room.owner) {
				room.owner = member.player;
				member.player.owner = true;
			}

			member.player.name = name;
			reply({ type: "nameResponse", status: "ok", player: member.player });
			broadcast({ type: "players", players: room.players });
			serverMessage(room, broadcast, `${name} joined.`);
		},

		chatMessage({ msg, room, broadcast }) {
			const chatLog = getChatLog(room);
			chatLog.push(msg.message);
			broadcast({ type: "receiveChatMessage", message: msg.message });
		},

		startGame({ msg, room, broadcast }) {
			if (games.has(room)) {
				return;
			}

			const player = room.players.find(x => x.id === msg.sender);
			if (player && player.owner) {
				const columns = COLUMNS.filter(x => msg.columns.includes(x.name));
				games.set(room, new GameManager(room.players, columns));
				broadcast({
					type: "gameStarted",
					columns: msg.columns,
				});
				serverMessage(room, broadcast, "Game has started.");
				gamesSet.add(room.id);
			}
		},

		toggleFreeze({ msg, room, broadcast }) {
			if (games.get(room)?.currentPlayer.id === msg.sender) {
				games.get(room)?.toggleFreeze(msg.index);
				broadcast({ type: "toggleFreezeResponse", index: msg.index });
			}
		},

		rollDice({ msg, room, broadcast }) {
			const game = getGame(room);
			if (game.currentPlayer.id === msg.sender) {
				game.rollDice();
				broadcast({
					type: "rollDiceResponse",
					roll: game.roll,
					dice: game.diceValues,
				});
			}
		},

		move({ msg, room, broadcast }) {
			const { row, column, sender } = msg;
			const game = getGame(room);
			const player = game.currentPlayer;
			if (game.currentPlayer.id !== sender || game.roll === 0) {
				return;
			}

			if (
				!game.rows.some(x => x.name === row) ||
				!game.columns.some(x => x.name === column)
			) {
				return;
			}

			try {
				game.play(row, column);
				game.findNextAvailablePlayer(room.players);
				broadcast({ type: "moveResponse", player, row, column });

				if (!game.active(room.players)) {
					broadcast({ type: "gameEnded" });
				}
			} catch (e) {
				// Empty block
			}
		},

		requestCall({ msg, room, broadcast }) {
			const game = getGame(room);

			if (game.currentPlayer.id !== msg.sender || game.roll !== 1) {
				return;
			}

			try {
				const success = game.call(msg.row);
				if (success) {
					broadcast({ type: "confirmCall", row: msg.row });
				}
			} catch (e) {
				// Empty block
			}
		},
	});
}

export function close(): void {
	wss?.close();
}
