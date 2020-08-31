import m from "mithril";
import * as socket from "../socket";
import { state, actions } from "../state";
import { PlayerList } from "../components/PlayerList";

const qs = document.querySelector.bind(document);

const NamePrompt = {
	submitName() {
		const name = qs<HTMLInputElement>("#player-name")?.value ?? "";
		socket.send({ type: "setName", name });
	},

	view(vnode: m.Vnode<{ status: string }>) {
		const { status } = vnode.attrs;

		return [
			m("label[for=player-name]", "Enter a name:"),
			m("input[type=text][id=player-name]"),
			m("button", { onclick: this.submitName }, "Submit"),
			status === "unavailable" && m("p", "Name has already been taken."),
			status === "invalid" && m("p", "Name cannot contain special characters."),
			status === "name-missing" && m("p", "You must enter a name."),
			status === "too-long" && m("p", "Maximum name length is 16 characters."),
		];
	},
};

const Members = {
	view() {
		return [
			m("h1", "Lobby"),
			m(PlayerList, {
				players: state.players.filter(x => x.name),
				gameStarted: false,
			}),
		];
	},
};

export const Lobby = {
	status: "ok",

	oninit() {
		socket.open();

		socket.onMessage(message => {
			switch (message.type) {
				case "players":
					state.players = message.players;
					const newSelf = message.players.find(x => x.id === state.self.id);
					if (newSelf) {
						state.self = newSelf;
					}
					break;
				case "nameResponse":
					this.status = message.status;
					if (message.status === "ok") {
						state.self = message.player;
					}
					break;
				case "gameStarted":
					actions.startGame(state.players);
					if (state.self.name) {
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
			!state.self.name && m(NamePrompt, { status: this.status }),
			state.self.owner &&
				m("button", { onclick: this.startGame }, "Start the game"),
		];
	},
};
