import m from "mithril";
import * as socket from "../socket";
import { state, actions, init as initState } from "../state";
import { PlayersList, Chat, Settings } from "../components";
import { NameStatus } from "common";
import * as api from "../api";
import { i18n } from "../i18n";

const qs = document.querySelector.bind(document);

export function Lobby(): m.Component {
	let unsubscribe: null | (() => void) = null;

	function NamePrompt(): m.Component {
		let status: NameStatus = "ok";

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
				let error = "";
				if (status === "unavailable") {
					error = i18n("Name has already been taken.");
				} else if (status === "invalid") {
					error = i18n("Name cannot contain special characters.");
				} else if (status === "name-missing") {
					error = i18n("You must enter a name.");
				} else if (status === "too-long") {
					error = i18n("Maximum name length is 16 characters.");
				}

				return m(
					".center-child.expand",
					m("section.name", [
						m("label.name__label[for=player-name]", i18n("Enter a name:")),
						m("input.name__input#player-name[type=text][autocomplete=off]"),
						m("button.name__submit", { onclick: submitName }, i18n("Submit")),
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
					m("h1.text-center", i18n("Lobby")),
					m(PlayersList, { players: state.players }),
				]),
				m(".grid--settings", m(Settings, { owner: state.self.owner })),
				m("aside.grid--chat", m(Chat, { canSend: !!state.self.name })),
			]);
		},
	};
}
