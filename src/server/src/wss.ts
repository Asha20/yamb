import * as WebSocket from "ws";
import { gameManager, GameManager } from "common";
import { Room, RoomManager } from "./roomManager";

export function listen(port: number) {
	const wss = new WebSocket.Server({ port });

	const games = new Map<Room, GameManager>();

	const roomManager = new RoomManager(wss, url => {
		const lobbyRegex = /^\/lobby\/(\d+)$/;
		const lobbyMatch = url.match(lobbyRegex);
		return lobbyMatch && lobbyMatch[1];
	});

	roomManager.onJoin(({ member, room, broadcast }) => {
		console.log(`Player ${member.id} joined room ${room.id}`);
		if (room.members.size === 1) {
			member.player.owner = true;
		}
		broadcast({
			type: "members",
			members: room.players,
		});
	});

	roomManager.onLeave(({ room, broadcast }) => {
		broadcast({
			type: "members",
			members: room.players,
		});
	});

	roomManager.onMessage({
		setName({ msg, member, room, reply, broadcast }) {
			if (room.players.some(x => x.name === msg.name)) {
				reply({ type: "nameResponse", available: false });
			} else {
				member.player.name = msg.name;
				reply({
					type: "nameResponse",
					available: true,
					name: member.player.name,
					owner: member.player.owner,
				});
			}
			broadcast({
				type: "members",
				members: room.players,
			});
		},

		startGame({ room, broadcast }) {
			broadcast({ type: "gameStarted" });
			games.set(room, gameManager(room.players));
		},

		toggleFreeze({ msg, room, broadcast }) {
			games.get(room)?.toggleFreeze(msg.index);
			broadcast({
				type: "toggleFreezeResponse",
				index: msg.index,
			});
		},

		rollDice({ room, broadcast }) {
			const game = games.get(room)!;
			game.rollDice();
			broadcast({
				type: "rollDiceResponse",
				roll: game.roll,
				dice: game.diceValues,
			});
		},

		move({ msg, room, broadcast }) {
			const { row, column } = msg;
			const game = games.get(room)!;
			const player = game.currentPlayer;
			game.play(row, column); // TODO: Check for throw
			broadcast({
				type: "moveResponse",
				player,
				row,
				column,
			});
		},
	});
}
