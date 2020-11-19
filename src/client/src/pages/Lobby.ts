import m from "mithril";
import * as socket from "../socket";
import { state, actions, init as initState } from "../state";
import { PlayersList, Chat, Settings } from "../components";
import { NameStatus } from "common";

const qs = document.querySelector.bind(document);

function NamePrompt(): m.Component {
	let status: NameStatus = "ok";
	let unsubscribe: null | (() => void) = null;

	const errorMessages: Record<NameStatus, string> = {
		ok: "",
		unavailable: "Name has already been taken.",
		invalid: "Name cannot contain special characters.",
		"name-missing": "You must enter a name.",
		"too-long": "Maximum name length is 16 characters.",
	};

	function submitName() {
		const name = qs<HTMLInputElement>("#player-name")?.value ?? "";
		socket.send({ type: "setName", name });
	}

	return {
		oninit() {
			unsubscribe = socket.onMessage(msg => {
				if (msg.type === "nameResponse") {
					status = msg.status;
					if (msg.status === "ok") {
						state.self = msg.player;
					}
				}
			});
		},

		onremove() {
			unsubscribe?.();
		},

		view() {
			const error = errorMessages[status];
			return m(
				".center-child.expand",
				m("section.name", [
					m("label.name__label[for=player-name]", "Enter a name:"),
					m("input.name__input#player-name[type=text]"),
					m("button.name__submit", { onclick: submitName }, "Submit"),
					m("p.name__error", {}, error),
				]),
			);
		},
	};
}

export function Lobby(): m.Component {
	let unsubscribe: null | (() => void) = null;

	return {
		oninit() {
			socket.open();
			initState();

			unsubscribe = socket.onMessage(message => {
				if (message.type === "gameStarted") {
					actions.startGame(state.players, message.columns);
					if (state.self.name) {
						m.route.set("/game/:id", { id: m.route.param("id") });
					} else {
						m.route.set("/");
					}
				}
			});
		},

		onremove() {
			unsubscribe?.();
		},

		view() {
			if (!state.self.name) {
				return m(NamePrompt);
			}

			return m(".lobby.expand", [
				m(".grid--players", [
					m("h1.text-center", "Lobby"),
					m(PlayersList, { players: state.players.filter(x => x.name) }),
				]),
				m(".grid--settings", m(Settings, { owner: state.self.owner })),
				m("aside.grid--chat", m(Chat, { canSend: !!state.self.name })),
			]);
		},
	};
}
