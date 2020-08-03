import m from "mithril";
import { SocketMetadata } from "common/ws";
import * as socket from "../socket";
import { actions } from "../state";

socket.open();

interface State {
	name: string;
	nameTaken: boolean;
	owner: boolean;
	members: SocketMetadata[];
}

const state: State = {
	name: "",
	nameTaken: false,
	owner: false,
	members: [],
};

const qs = document.querySelector.bind(document);

const NamePrompt = {
	submitName() {
		const name = qs<HTMLInputElement>("#player-name")?.value ?? "";
		socket.send({ type: "setName", name });
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
				m("ul", [
					state.members.map(({ name, owner }) => {
						if (!name) {
							return undefined;
						}

						let displayName = name;
						if (name === state.name) {
							displayName += " (you)";
						}
						if (owner) {
							displayName += " (owner)";
						}

						return m("li", displayName);
					}),
				]),
			]),
		];
	},
};

export const Lobby = {
	oninit() {
		socket.onMessage(message => {
			switch (message.type) {
				case "members":
					state.members = message.members;
					break;
				case "nameResponse":
					state.nameTaken = !message.available;
					if (message.available) {
						state.name = message.name;
						state.owner = message.owner;
					}
					break;
				case "gameStarted":
					actions.startGame(state.members);
					if (state.name) {
						m.route.set("/game/:id", { id: m.route.param("id") });
					} else {
						m.route.set("/");
					}
					break;
			}
			m.redraw();
		});
	},

	startGame() {
		socket.send({ type: "startGame" });
	},

	view() {
		return [
			m(Members),
			!state.name && m(NamePrompt),
			state.owner && m("button", { onclick: this.startGame }, "Start the game"),
		];
	},
};
