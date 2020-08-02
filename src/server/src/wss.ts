import * as WebSocket from "ws";
import { nanoid } from "nanoid";
import { SocketMessage } from "common/ws";

interface Room<T> {
	members: T[];
	addMember(member: T): void;
	removeMember(member: T): void;
}

interface SocketInfo {
	id: string;
	socket: WebSocket;
	name: string;
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

function sendMessage(client: WebSocket, msg: SocketMessage) {
	if (client.readyState === WebSocket.OPEN) {
		client.send(JSON.stringify(msg));
	}
}

function broadcast(wss: WebSocket.Server, msg: SocketMessage) {
	wss.clients.forEach(ws => sendMessage(ws, msg));
}

export function listen(port: number) {
	const wss = new WebSocket.Server({ port });

	const rooms = new Map<string, Room<SocketInfo>>();
	const ids = new Map<string, SocketInfo>();

	const lobbyRegex = /^\/lobby\/(\d+)$/;

	wss.on("connection", (ws, req) => {
		console.log("Got a connection:", req.url);
		const self: SocketInfo = { id: nanoid(10), socket: ws, name: "" };
		ids.set(self.id, { id: self.id, socket: ws, name: "" });

		ws.on("close", () => {
			ids.delete(self.id);
		});

		const lobbyMatch = req.url?.match(lobbyRegex);
		if (lobbyMatch) {
			const roomId = lobbyMatch[1];

			const room = rooms.get(roomId) ?? createRoom();
			rooms.set(roomId, room);
			room.addMember(self);

			broadcast(wss, {
				type: "members",
				members: room.members.map(x => x.name),
			});

			ws.on("message", data => {
				const message = JSON.parse(data.toString()) as SocketMessage;
				switch (message.type) {
					case "setName":
						if (room.members.some(x => x.name === message.name)) {
							sendMessage(ws, { type: "nameResponse", available: false });
						} else {
							sendMessage(ws, {
								type: "nameResponse",
								available: true,
								name: message.name,
							});
							self.name = message.name;
						}
						break;
				}

				broadcast(wss, {
					type: "members",
					members: room.members.map(x => x.name),
				});
			});

			ws.on("close", () => {
				rooms.get(roomId)?.removeMember(self);
				broadcast(wss, {
					type: "members",
					members: room.members.map(x => x.name),
				});
			});
		}
	});
}
