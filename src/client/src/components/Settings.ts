import m from "mithril";
import {
	COLUMNS,
	PlayerColor,
	playerColors,
	topDown,
	free,
	bottomUp,
	call,
} from "common";
import * as socket from "../socket";
import { ColorCircle } from "./ColorCircle";
import { actions, state } from "../state";
import { i18n, i18nVar } from "../i18n";

interface SettingsAttrs {
	owner: boolean;
}

function changeColor(color: PlayerColor) {
	socket.send({ type: "changeColor", color });
}

const defaultColumns = new Set<string>([
	topDown.name,
	free.name,
	bottomUp.name,
	call.name,
]);

export function Settings(): m.Component<SettingsAttrs> {
	let unsubscribe: (() => void) | null = null;

	const colsEnabled = COLUMNS.reduce((acc, x) => {
		acc[x.name] = defaultColumns.has(x.name);
		return acc;
	}, {} as Record<typeof COLUMNS[number]["name"], boolean>);

	let noColumnsError = false;

	function startGame() {
		const columns = COLUMNS.filter(x => colsEnabled[x.name]).map(x => x.name);
		if (columns.length) {
			socket.send({ type: "startGame", columns });
			noColumnsError = false;
		} else {
			noColumnsError = true;
		}
	}

	return {
		oninit() {
			unsubscribe = socket.onMessage(msg => {
				if (msg.type === "changeColorResponse") {
					actions.changeColor(msg.player, msg.color);
					m.redraw();
				}
			});
		},

		onremove() {
			unsubscribe?.();
		},

		view({ attrs }) {
			const selectedColors = new Set(state.players.map(x => x.color));

			const ColumnSelection = [
				m("h3.text-center", i18n("Columns")),
				m(
					".settings__column-selection",
					COLUMNS.map(x =>
						m(
							"label.settings__label",
							{ key: x.name },
							m("input.settings__checkbox[type=checkbox]", {
								checked: colsEnabled[x.name],
								onclick: () => {
									colsEnabled[x.name] = !colsEnabled[x.name];
								},
							}),
							i18nVar(x.display.longName),
						),
					),
				),
				m(
					"p.settings__error",
					noColumnsError && i18n("At least one column must be selected."),
				),
			];

			const ColorSelection = (selectedColors: Set<PlayerColor>) => [
				m("h3.text-center", i18n("Change color")),
				m(
					".settings__color-selection",
					playerColors.map(color =>
						m(
							"button.settings__color-button",
							{
								disabled: selectedColors.has(color),
								onclick: () => changeColor(color),
							},
							m(ColorCircle, { color, selected: selectedColors.has(color) }),
						),
					),
				),
			];

			const { owner } = attrs;
			return m("section.settings", [
				m("h2.text-center", i18n("Settings")),
				ColorSelection(selectedColors),
				owner && [
					ColumnSelection,
					m(
						"button.settings__start",
						{ onclick: startGame },
						i18n("Start the game"),
					),
				],
			]);
		},
	};
}
