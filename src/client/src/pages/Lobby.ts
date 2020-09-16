import m from "mithril";
import * as socket from "../socket";
import { state, actions, init as initState } from "../state";
import { PlayerList, Chat } from "../components";

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
	unsubscribe: null as null | (() => void),

	oninit() {
		socket.open();
		initState();

		this.unsubscribe = socket.onMessage(message => {
			switch (message.type) {
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
		});
	},

	onremove() {
		this.unsubscribe?.();
	},

	startGame() {
		socket.send({ type: "startGame" });
	},

	view() {
		return m(".lobby", [
			m(".members", [
				m(Members),
				!state.self.name && m(NamePrompt, { status: this.status }),
				state.self.owner &&
					m("button", { onclick: this.startGame }, "Start the game"),
			]),
			m("aside", [m(Chat, { canSend: !!state.self.name })]),
		]);
	},
};
