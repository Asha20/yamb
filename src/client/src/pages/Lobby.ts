import m from "mithril";
import * as socket from "../socket";
import { state, actions, init as initState } from "../state";
import { PlayerList, Chat } from "../components";

interface NamePromptAttrs {
	status: string;
}

const qs = document.querySelector.bind(document);

function submitName() {
	const name = qs<HTMLInputElement>("#player-name")?.value ?? "";
	socket.send({ type: "setName", name });
}

const NamePrompt: m.Component<NamePromptAttrs> = {
	view({ attrs }) {
		const { status } = attrs;
		return [
			m("label[for=player-name]", "Enter a name:"),
			m("input[type=text][id=player-name]"),
			m("button", { onclick: submitName }, "Submit"),
			status === "unavailable" && m("p", "Name has already been taken."),
			status === "invalid" && m("p", "Name cannot contain special characters."),
			status === "name-missing" && m("p", "You must enter a name."),
			status === "too-long" && m("p", "Maximum name length is 16 characters."),
		];
	},
};

const Members: m.Component = {
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

export function Lobby(): m.Component {
	let status = "ok";
	let unsubscribe: null | (() => void) = null;

	function startGame() {
		socket.send({ type: "startGame" });
	}

	return {
		oninit() {
			socket.open();
			initState();

			unsubscribe = socket.onMessage(message => {
				switch (message.type) {
					case "nameResponse":
						status = message.status;
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
			unsubscribe?.();
		},

		view() {
			return m(".lobby", [
				m(".members", [
					m(Members),
					!state.self.name && m(NamePrompt, { status }),
					state.self.owner &&
						m("button", { onclick: startGame }, "Start the game"),
				]),
				m("aside", [m(Chat, { canSend: !!state.self.name })]),
			]);
		},
	};
}
