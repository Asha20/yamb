import m from "mithril";
import * as socket from "../socket";
import { state, actions, init as initState } from "../state";
import { PlayerList, Chat } from "../components";
import { COLUMNS } from "common/yamb";
import { NameStatus } from "common/ws";

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
			return m(".name__wrapper", [
				m("section.name", [
					m("label.name__label[for=player-name]", "Enter a name:"),
					m("input.name__input#player-name[type=text]"),
					m("button.name__submit", { onclick: submitName }, "Submit"),
					m("p.name__error", {}, error),
				]),
			]);
		},
	};
}

const colsEnabled = COLUMNS.reduce((acc, x) => {
	acc[x.tip] = true;
	return acc;
}, {} as Record<typeof COLUMNS[number]["tip"], boolean>);

const Settings: m.Component = {
	view() {
		return m("section.settings", [
			m("h2", "Columns"),
			COLUMNS.map(x =>
				m("label", { key: x.tip }, [
					m("input[type=checkbox]", {
						checked: colsEnabled[x.tip],
						onclick: () => (colsEnabled[x.tip] = !colsEnabled[x.tip]),
					}),
					x.tip,
				]),
			),
		]);
	},
};

export function Lobby(): m.Component {
	let unsubscribe: null | (() => void) = null;
	let rowColumnError = "";

	function startGame() {
		const columns = COLUMNS.filter(x => colsEnabled[x.tip]).map(x => x.name);
		if (columns.length) {
			socket.send({ type: "startGame", columns });
			rowColumnError = "";
		} else {
			rowColumnError = "At least one column must be selected.";
		}
	}

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

			return m(".lobby", [
				m(".members", [
					m("h1", "Lobby"),
					m(PlayerList, {
						players: state.players.filter(x => x.name),
						gameStarted: false,
					}),
					state.self.owner && [
						m(Settings),
						rowColumnError,
						m("button", { onclick: startGame }, "Start the game"),
					],
				]),
				m("aside", [m(Chat, { canSend: !!state.self.name })]),
			]);
		},
	};
}
