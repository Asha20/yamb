import * as WebSocket from "ws";
import { nanoid } from "nanoid";
import {
	ClientMessage,
	ServerMessage,
	Player,
	jsonParse,
	isClientMessage,
	codes,
	PlayerColor,
	playerColors,
} from "common";
import { URLSearchParams } from "url";

interface SocketInfo {
	id: string;
	socket: WebSocket;
	player: Player;
}

type OnMessageParams<T extends ClientMessage> = {
	msg: T;
	member: SocketInfo;
	room: Room;
	reply(msg: ServerMessage): void;
	broadcast(msg: ServerMessage): void;
};

type OnJoinLeaveParams = Omit<OnMessageParams<ClientMessage>, "msg">;

type MessageHandlerFunction<T extends ClientMessage> = (
	params: OnMessageParams<T>,
) => void;
type MessageHandlerObject = {
	[P in ClientMessage["type"]]?: MessageHandlerFunction<
		Extract<ClientMessage, { type: P }>
	>;
};

type MessageHandler =
	| MessageHandlerFunction<ClientMessage>
	| MessageHandlerObject;

type RoomJoinLeaveHandler = (params: OnJoinLeaveParams) => void;

export interface Room {
	id: string;
	members: Set<SocketInfo>;
	owner: Player | null;
	players: Player[];
	memberToColor: Map<SocketInfo["id"], PlayerColor>;
	colorToMember: Map<PlayerColor, SocketInfo["id"]>;
}

function sendMessage(client: WebSocket, msg: ServerMessage) {
	if (client.readyState === WebSocket.OPEN) {
		client.send(JSON.stringify(msg));
	}
}

export class RoomManager {
	wss: WebSocket.Server | null = null;
	private rooms = new Map<string, Room>();
	private maxSize: number;
	private getId: (url: string) => string | null;

	private handlers = {
		join: [] as Array<RoomJoinLeaveHandler>,
		leave: [] as Array<RoomJoinLeaveHandler>,
		message: [] as MessageHandler[],
	};

	private getRoom(id: string, createIfMissing = true) {
		const existingRoom = this.rooms.get(id);
		if (existingRoom) {
			return existingRoom;
		}

		const room: Room = {
			id,
			members: new Set(),
			owner: null,
			get players() {
				return [...this.members].map(x => x.player);
			},
			memberToColor: new Map(),
			colorToMember: new Map(),
		};
		if (createIfMissing) {
			this.rooms.set(id, room);
		}
		return room;
	}

	constructor(maxSize: number, getId: (url: string) => string | null) {
		this.maxSize = maxSize;
		this.getId = getId;
	}

	attach(wss: WebSocket.Server): void {
		this.wss = wss;
		wss.on("connection", (ws, req) => {
			const url = req.url ?? "";
			const roomId = this.getId(url);

			if (roomId === null) {
				return;
			}

			const searchParams = new URLSearchParams(url.split("?")[1]);
			const name = searchParams.get("name");
			if (!name) {
				throw new Error("Missing socket name.");
			}

			const room = this.getRoom(roomId);

			const availableColors = playerColors.filter(
				x => !room.colorToMember.has(x),
			);

			const id = nanoid();
			const newPlayerColor = availableColors[0];
			room.colorToMember.set(newPlayerColor, id);
			room.memberToColor.set(id, newPlayerColor);
			const socketInfo: SocketInfo = {
				id,
				socket: ws,
				player: { id, name, owner: false, color: availableColors[0] },
			};

			const reply = sendMessage.bind(null, ws);
			const broadcast = this.broadcast.bind(this, roomId);

			if (room.members.size === this.maxSize) {
				ws.close(codes.ROOM_FULL);
				return;
			}

			const params: OnJoinLeaveParams = {
				member: socketInfo,
				room,
				reply,
				broadcast,
			};

			room.members.add(socketInfo);
			this.handlers.join.forEach(handler => handler(params));

			ws.on("message", data => {
				const msg = jsonParse(data.toString(), {}) as ClientMessage;

				if (!isClientMessage(msg)) {
					return;
				}

				this.handlers.message.forEach(handler => {
					if (typeof handler === "function") {
						handler({ ...params, msg });
					} else {
						handler[msg.type]?.({ ...params, msg: msg as never });
					}
				});
			});

			ws.on("close", () => {
				room.members.delete(socketInfo);
				const ownColor = room.memberToColor.get(socketInfo.id);
				room.memberToColor.delete(socketInfo.id);
				if (ownColor) {
					room.colorToMember.delete(ownColor);
				}
				this.handlers.leave.forEach(handler => handler(params));
			});
		});
	}

	roomIsFull(roomId: string): boolean {
		const room = this.getRoom(roomId, false);
		return room.members.size === this.maxSize;
	}

	nameAvailable(roomId: string, name: string): boolean {
		const room = this.getRoom(roomId, false);
		return room.players.every(player => player.name !== name);
	}

	deleteRoom(id: string): boolean {
		return this.rooms.delete(id);
	}

	onJoin(handler: RoomManager["handlers"]["join"][number]): void {
		this.handlers.join.push(handler);
	}

	onLeave(handler: RoomManager["handlers"]["leave"][number]): void {
		this.handlers.leave.push(handler);
	}

	onMessage(handler: MessageHandler): void {
		this.handlers.message.push(handler);
	}

	broadcast(id: string, msg: ServerMessage): void {
		for (const member of this.getRoom(id, false).members) {
			sendMessage(member.socket, msg);
		}
	}
}

const MAX_ROOM_SIZE = playerColors.length;
export const gameRoomManager = new RoomManager(MAX_ROOM_SIZE, url => {
	const lobbyRegex = /^\/lobby\/([a-z0-9_-]+)/i;
	const lobbyMatch = url.match(lobbyRegex);
	return lobbyMatch && lobbyMatch[1];
});
