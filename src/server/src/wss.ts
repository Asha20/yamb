import * as WebSocket from "ws";
import { nanoid } from "nanoid";
import { ClientMessage, ServerMessage, SocketMetadata } from "common/ws";
import { GameManager, gameManager } from "common/gameManager";

interface Room<T> {
	members: T[];
	addMember(member: T): void;
	removeMember(member: T): void;
}

interface SocketInfo {
	id: string;
	socket: WebSocket;
	data: SocketMetadata;
}

function createRoom(): Room<SocketInfo> {
	const members: SocketInfo[] = [];

	function addMember(member: SocketInfo) {
		members.push(member);
	}

	function removeMember(member: SocketInfo) {
		const index = members.findIndex(x => x.id === member.id);
		members.splice(index, 1);
	}

	return {
		members,
		addMember,
		removeMember,
	};
}

function sendMessage(client: WebSocket, msg: ServerMessage) {
	if (client.readyState === WebSocket.OPEN) {
		client.send(JSON.stringify(msg));
	}
}

function broadcast(wss: WebSocket.Server, msg: ServerMessage) {
	wss.clients.forEach(ws => sendMessage(ws, msg));
}

export function listen(port: number) {
	const wss = new WebSocket.Server({ port });

	const rooms = new Map<string, Room<SocketInfo>>();
	const games = new Map<string, GameManager>();

	const lobbyRegex = /^\/lobby\/(\d+)$/;

	wss.on("connection", (ws, req) => {
		console.log("Got a connection:", req.url);
		const self: SocketInfo = {
			id: nanoid(10),
			socket: ws,
			data: {
				name: "",
				owner: false,
			},
		};

		const lobbyMatch = req.url?.match(lobbyRegex);
		if (lobbyMatch) {
			const roomId = lobbyMatch[1];

			const room = rooms.get(roomId) ?? createRoom();
			rooms.set(roomId, room);
			room.addMember(self);

			const isOwner = room.members.length === 1;
			self.data.owner = isOwner;

			broadcast(wss, {
				type: "members",
				members: room.members.map(x => x.data),
			});

			function manager() {
				if (!games.has(roomId)) {
					throw new Error("Missing game");
				}

				return games.get(roomId)!;
			}

			ws.on("message", data => {
				const message = JSON.parse(data.toString()) as ClientMessage;
				switch (message.type) {
					case "setName":
						if (room.members.some(x => x.data.name === message.name)) {
							sendMessage(ws, { type: "nameResponse", available: false });
						} else {
							sendMessage(ws, {
								type: "nameResponse",
								available: true,
								name: message.name,
								owner: isOwner,
							});
							self.data.name = message.name;
						}
						broadcast(wss, {
							type: "members",
							members: room.members.map(x => x.data),
						});
						break;
					case "startGame":
						broadcast(wss, { type: "gameStarted" });
						games.set(roomId, gameManager(room.members.length));
						break;
					case "toggleFreeze":
						manager().toggleFreeze(message.index);
						broadcast(wss, {
							type: "toggleFreezeResponse",
							index: message.index,
						});
						break;
					case "rollDice":
						manager().rollDice();
						broadcast(wss, {
							type: "rollDiceResponse",
							roll: manager().roll,
							dice: manager().diceValues,
						});
						break;
					case "move":
						const { row, column } = message;
						const player = manager().currentPlayer;
						manager().play(0, row, column); // TODO: Check for throw
						broadcast(wss, {
							type: "moveResponse",
							player,
							row,
							column,
						});
				}
			});

			ws.on("close", () => {
				rooms.get(roomId)?.removeMember(self);
				broadcast(wss, {
					type: "members",
					members: room.members.map(x => x.data),
				});
			});
		}
	});
}
