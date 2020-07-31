import * as WebSocket from "ws";
import { nanoid } from "nanoid";

interface Room<T> {
	members: T[];
	addMember(member: T): void;
	removeMember(member: T): void;
}

function createRoom(): Room<string> {
	const members: string[] = [];

	function addMember(member: string) {
		members.push(member);
	}

	function removeMember(member: string) {
		const index = members.indexOf(member);
		members.splice(index, 1);
	}

	return {
		members,
		addMember,
		removeMember,
	};
}

export function listen(port: number) {
	const wss = new WebSocket.Server({ port });

	const rooms = new Map<string, Room<string>>();
	const ids = new Map<string, WebSocket>();

	const lobbyRegex = /^\/lobby\/(\d+)$/;

	wss.on("connection", (ws, req) => {
		console.log("Got a connection:", req.url);
		const id = nanoid(10);
		ids.set(id, ws);

		ws.on("close", () => {
			ids.delete(id);
		});

		const lobbyMatch = req.url?.match(lobbyRegex);
		if (lobbyMatch) {
			const roomId = lobbyMatch[1];

			const room = rooms.get(roomId) ?? createRoom();
			rooms.set(roomId, room);
			room.addMember(id);

			wss.clients.forEach(client => {
				if (client.readyState === WebSocket.OPEN) {
					client.send(JSON.stringify({ members: room.members }));
				}
			});

			ws.on("close", () => {
				rooms.get(roomId)?.removeMember(id);
				wss.clients.forEach(client => {
					if (client.readyState === WebSocket.OPEN) {
						client.send(JSON.stringify({ members: room.members }));
					}
				});
			});
		}
	});
}
