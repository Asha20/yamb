import * as WebSocket from "ws";
import { nanoid } from "nanoid";
import { ClientMessage, ServerMessage, Player, jsonParse } from "common";
import { isClientMessage } from "./validate";

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

type OnJoinLeaveParams = Omit<OnMessageParams<any>, "msg">;

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
	players: Player[];
}

function sendMessage(client: WebSocket, msg: ServerMessage) {
	if (client.readyState === WebSocket.OPEN) {
		client.send(JSON.stringify(msg));
	}
}

export class RoomManager {
	wss: WebSocket.Server;
	rooms = new Map<string, Room>();

	handlers = {
		join: [] as Array<RoomJoinLeaveHandler>,
		leave: [] as Array<RoomJoinLeaveHandler>,
		message: [] as MessageHandler[],
	};

	private getRoom(id: string, createIfMissing = true) {
		if (this.rooms.has(id)) {
			return this.rooms.get(id)!;
		}

		const room: Room = {
			id,
			members: new Set(),
			get players() {
				return [...this.members].map(x => x.player);
			},
		};
		if (createIfMissing) {
			this.rooms.set(id, room);
		}
		return room;
	}

	constructor(wss: WebSocket.Server, getId: (url: string) => string | null) {
		this.wss = wss;
		wss.on("connection", (ws, req) => {
			const roomId = getId(req.url ?? "");

			if (roomId === null) {
				return;
			}

			const room = this.getRoom(roomId);

			const id = nanoid(10);
			const socketInfo: SocketInfo = {
				id,
				socket: ws,
				player: { id, name: "", owner: false },
			};

			const reply = sendMessage.bind(null, ws);
			const broadcast = this.broadcast.bind(this, roomId);

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
				this.handlers.leave.forEach(handler => handler(params));
			});
		});
	}

	onJoin(handler: RoomManager["handlers"]["join"][number]) {
		this.handlers.join.push(handler);
	}

	onLeave(handler: RoomManager["handlers"]["leave"][number]) {
		this.handlers.leave.push(handler);
	}

	onMessage(handler: MessageHandler) {
		this.handlers.message.push(handler);
	}

	broadcast(id: string, msg: ServerMessage) {
		for (const member of this.getRoom(id, false).members) {
			sendMessage(member.socket, msg);
		}
	}
}
