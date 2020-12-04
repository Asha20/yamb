import { ClientMessage, ServerMessage, DistributeOmit } from "common";
import { state } from "./state";
import * as logger from "./logger";

let socket: WebSocket | undefined;

export function send(msg: DistributeOmit<ClientMessage, "sender">): void {
	if (!socket || socket.readyState !== WebSocket.OPEN) {
		throw new Error("Socket not ready");
	}

	const msgWithSender = { ...msg, sender: state.self.id };
	logger.info("Sending", msgWithSender);
	socket.send(JSON.stringify(msgWithSender));
}

export function open(name: string): Promise<WebSocket> {
	return new Promise(resolve => {
		const protocol =
			!PRODUCTION || location.hostname === "localhost" ? "ws:" : "wss:";
		const wsUrl = location.href.replace(location.protocol, protocol);
		socket = new WebSocket(wsUrl + "?name=" + encodeURIComponent(name));

		logger.info("Socket opened");

		socket.addEventListener("open", () => resolve(socket), { once: true });

		onMessage(msg => {
			logger.info("Received", msg);
		});
	});
}

export function get(): WebSocket {
	if (!socket) {
		throw new Error("Missing socket");
	}

	return socket;
}

export function onOpen(fn: (e: Event) => void): () => void {
	get().addEventListener("open", fn);
	return () => get().removeEventListener("open", fn);
}

export function onMessage(fn: (msg: ServerMessage) => void): () => void {
	const handler = (e: MessageEvent) => {
		const message = JSON.parse(e.data) as ServerMessage;
		fn(message);
	};
	get().addEventListener("message", handler);

	return () => get().removeEventListener("message", handler);
}

export function onClose(fn: (e: CloseEvent) => void): () => void {
	get().addEventListener("close", fn);
	return () => get().removeEventListener("close", fn);
}
