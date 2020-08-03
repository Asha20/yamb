import { ClientMessage, ServerMessage } from "common/ws";

let socket: WebSocket | undefined;

export function send(msg: ClientMessage) {
	if (!socket || socket.readyState !== WebSocket.OPEN) {
		throw new Error("Socket not ready");
	}

	console.log("Sending %o", msg);
	socket.send(JSON.stringify(msg));
}

export function open() {
	const wsUrl = location.href
		.replace(location.protocol, "ws:")
		.replace(location.port, "3001");
	socket = new WebSocket(wsUrl);

	onMessage(msg => {
		console.log("Received: %o", msg);
	});
}

export function get() {
	if (!socket) {
		throw new Error("Missing socket");
	}

	return socket;
}

export function onMessage(handler: (msg: ServerMessage) => void) {
	get().addEventListener("message", e => {
		const message = JSON.parse(e.data) as ServerMessage;
		handler(message);
	});
}
