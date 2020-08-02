import m from "mithril";
import { SocketMessage } from "common/ws";

interface State {
	name: string;
	nameTaken: boolean;
	socket: WebSocket | undefined;
	members: string[];
}

const state: State = {
	name: "",
	nameTaken: false,
	socket: undefined,
	members: [],
};

const qs = document.querySelector.bind(document);

function sendMessage(socket: WebSocket, msg: SocketMessage) {
	socket.send(JSON.stringify(msg));
}

const NamePrompt = {
	submitName() {
		if (!state.socket) {
			throw new Error("Missing socket");
		}

		const name = qs<HTMLInputElement>("#player-name")?.value ?? "";

		sendMessage(state.socket, { type: "setName", name });
	},

	view() {
		return [
			m("label[for=player-name]", "Enter a name:"),
			m("input[type=text][id=player-name]"),
			m("button", { onclick: this.submitName }, "Submit"),
			state.nameTaken && m("p", "Name has already been taken."),
		];
	},
};

const Members = {
	view() {
		return [
			m("h1", "Lobby"),
			m("section", [
				m("h2", "Members:"),
				state.members.map(
					member =>
						member &&
						m("li", member === state.name ? member + " (you)" : member),
				),
			]),
		];
	},
};

export const Lobby = {
	oninit() {
		const wsUrl = location.href
			.replace(location.protocol, "ws:")
			.replace(location.port, "3001");
		const socket = new WebSocket(wsUrl);
		state.socket = socket;

		socket.onmessage = e => {
			const message = JSON.parse(e.data) as SocketMessage;
			console.log(message);

			switch (message.type) {
				case "members":
					state.members = message.members;
					break;
				case "nameResponse":
					state.nameTaken = !message.available;
					if (message.available) {
						state.name = message.name;
					}
					break;
			}
			m.redraw();
		};
	},

	view() {
		return [m(Members), !state.name && m(NamePrompt)];
	},
};
