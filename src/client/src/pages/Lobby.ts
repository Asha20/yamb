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

	view(vnode: m.Vnode<{ nameTaken: boolean }>) {
		return [
			m("label[for=player-name]", "Enter a name:"),
			m("input[type=text][id=player-name]"),
			m("button", { onclick: this.submitName }, "Submit"),
			vnode.attrs.nameTaken && m("p", "Name has already been taken."),
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
	nameTaken: false,

	oninit() {
		socket.open();

		socket.onMessage(message => {
			switch (message.type) {
				case "players":
					state.players = message.players;
					break;
				case "nameResponse":
					this.nameTaken = !message.available;
					if (message.available) {
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
			!state.self.name && m(NamePrompt, { nameTaken: this.nameTaken }),
			state.self.owner &&
				m("button", { onclick: this.startGame }, "Start the game"),
		];
	},
};
