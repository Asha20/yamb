import * as WebSocket from "ws";
import { Server } from "http";
import { GameManager, ChatMessage, ServerMessage, COLUMNS } from "common";
import { Room, gameRoomManager } from "./roomManager";
import { logger } from "./logger";

const nameRegex = /^[\w\s]+$/;

let wss: WebSocket.Server | null = null;

export const gamesSet = new Set<string>();
export const games = new Map<Room, GameManager>();
export const chatLogs = new Map<Room, ChatMessage[]>();

export function listen(server: Server): void {
	wss = new WebSocket.Server({ server });
	gameRoomManager.attach(wss);

	function serverMessage(
		room: Room,
		broadcast: (msg: ServerMessage) => void,
		content: string,
	) {
		const chatLog = chatLogs.get(room);
		const message: ChatMessage = {
			sender: { id: "Server", name: "Server" },
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
			throw new Error("Missing game.");
		}
	}

	gameRoomManager.onJoin(({ member, room, reply, broadcast }) => {
		if (games.has(room)) {
			member.socket.close();
			logger.info(
				`Player ${member.id} tried joining room ${room.id} but it was full.`,
			);
			return;
		}

		broadcast({ type: "players", players: room.players });

		if (!chatLogs.has(room)) {
			chatLogs.set(room, []);
		}

		const chatLog = getChatLog(room);
		reply({ type: "chatSync", messages: chatLog });
		logger.info(`Player ${member.id} joined room ${room.id}`);
	});

	gameRoomManager.onLeave(({ room, member, broadcast }) => {
		if (member.player.owner && room.players.length) {
			const nextOwner = room.players[0];
			room.owner = nextOwner;
			nextOwner.owner = true;
			logger.info(`Player ${nextOwner.id} became owner of room ${room.id}`);
		}

		broadcast({ type: "players", players: room.players });

		const game = games.get(room);

		if (game?.currentPlayer.id === member.id) {
			game?.findNextAvailablePlayer(room.players);
			game?.resetDice();
			broadcast({ type: "findNextAvailablePlayer" });
		}

		if (!room.players.length) {
			gameRoomManager.deleteRoom(room.id);
			games.delete(room);
			chatLogs.delete(room);
			gamesSet.delete(room.id);
		}

		if (member.player.name) {
			serverMessage(room, broadcast, `${member.player.name} left.`);
			logger.info(`Player ${member.id} left room ${room.id}`);
		}
	});

	gameRoomManager.onMessage(({ msg }) => {
		logger.info("Received message", { msg });
	});

	gameRoomManager.onMessage({
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

		changeColor({ msg, member, room, broadcast }) {
			if (room.colorToMember.has(msg.color)) {
				return;
			}

			const oldColor = room.memberToColor.get(msg.sender);
			if (oldColor) {
				room.memberToColor.delete(msg.sender);
				room.colorToMember.delete(oldColor);
			}

			room.colorToMember.set(msg.color, msg.sender);
			room.memberToColor.set(msg.sender, msg.color);

			member.player.color = msg.color;

			broadcast({
				type: "changeColorResponse",
				player: msg.sender,
				color: msg.color,
			});
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
			const game = getGame(room);
			if (game.currentPlayer.id === msg.sender) {
				game.toggleFreeze(msg.index);
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
				broadcast({ type: "moveResponse", row, column });

				if (!game.active(room.players)) {
					broadcast({ type: "gameEnded" });
				}
			} catch (e) {
				logger.error(e);
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
				logger.error(e);
			}
		},
	});
}

export function close(): void {
	wss?.close();
}
