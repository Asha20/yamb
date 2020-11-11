import m from "mithril";
import * as socket from "../socket";
import { state, actions, init as initState } from "../state";
import { PlayerList, Chat } from "../components";
import { COLUMNS } from "common/yamb";

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
	let status = "ok";
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
				switch (message.type) {
					case "nameResponse":
						status = message.status;
						if (message.status === "ok") {
							state.self = message.player;
						}
						break;
					case "gameStarted":
						actions.startGame(state.players, message.columns);
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
					m("h1", "Lobby"),
					m(PlayerList, {
						players: state.players.filter(x => x.name),
						gameStarted: false,
					}),
					!state.self.name && m(NamePrompt, { status }),
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
