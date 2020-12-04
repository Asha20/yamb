import m from "mithril";
import * as socket from "../socket";
import { state, actions, init as initState } from "../state";
import { PlayersList, Chat, Settings } from "../components";
import { NameStatus } from "common";
import * as api from "../api";

const qs = document.querySelector.bind(document);

export function Lobby(): m.Component {
	let unsubscribe: null | (() => void) = null;

	function NamePrompt(): m.Component {
		let status: NameStatus = "ok";

		const errorMessages: Record<NameStatus, string> = {
			ok: "",
			unavailable: "Name has already been taken.",
			invalid: "Name cannot contain special characters.",
			"name-missing": "You must enter a name.",
			"too-long": "Maximum name length is 16 characters.",
		};

		async function submitName() {
			const name = qs<HTMLInputElement>("#player-name")?.value ?? "";
			const response = await api.nameAvailable(m.route.param("id"), name);
			status = response.status;
			if (response.status === "ok") {
				await socket.open(name);
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

					if (message.type === "playerJoined") {
						state.self = message.player;
					}
				});
			}
		}

		return {
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

	return {
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
					m(PlayersList, { players: state.players }),
				]),
				m(".grid--settings", m(Settings, { owner: state.self.owner })),
				m("aside.grid--chat", m(Chat, { canSend: !!state.self.name })),
			]);
		},
	};
}
