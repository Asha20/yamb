import * as WebSocket from "ws";
import { Server } from "http";
import { gameManager, GameManager, ChatMessage, ServerMessage } from "common";
import { Room, RoomManager } from "./roomManager";

const nameRegex = /^[\w\s]+$/;

let wss: WebSocket.Server;

export function listen(server: Server) {
	wss = new WebSocket.Server({ server });

	const games = new Map<Room, GameManager>();
	const chatLogs = new Map<Room, ChatMessage[]>();

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

		const chatLog = chatLogs.get(room)!;
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
			const chatLog = chatLogs.get(room)!;
			chatLog.push(msg.message);
			broadcast({ type: "receiveChatMessage", message: msg.message });
		},

		startGame({ msg, room, broadcast }) {
			if (games.has(room)) {
				return;
			}

			const player = room.players.find(x => x.id === msg.sender);
			if (player && player.owner) {
				games.set(room, gameManager(room.players));
				broadcast({ type: "gameStarted" });
				serverMessage(room, broadcast, "Game has started.");
			}
		},

		toggleFreeze({ msg, room, broadcast }) {
			if (games.get(room)?.currentPlayer.id === msg.sender) {
				games.get(room)?.toggleFreeze(msg.index);
				broadcast({ type: "toggleFreezeResponse", index: msg.index });
			}
		},

		rollDice({ msg, room, broadcast }) {
			const game = games.get(room)!;
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
			const game = games.get(room)!;
			const player = game.currentPlayer;
			if (game.currentPlayer.id !== sender || game.roll === 0) {
				return;
			}

			if (!game.rowNames.includes(row) || !game.columnNames.includes(column)) {
				return;
			}

			try {
				game.play(row, column, room.players); // TODO: Check for throw
				broadcast({ type: "moveResponse", player, row, column });

				if (!game.active(room.players)) {
					broadcast({ type: "gameEnded" });
				}
			} catch (e) {}
		},
	});
}

export function close() {
	wss?.close();
}
