import m from "mithril";
import { COLUMNS, playerColors } from "common";
import * as socket from "../socket";
import { ColorCircle } from "./ColorCircle";
import { state } from "../state";

interface SettingsAttrs {
	owner: boolean;
}

export function Settings(): m.Component<SettingsAttrs> {
	const colsEnabled = COLUMNS.reduce((acc, x) => {
		acc[x.tip] = true;
		return acc;
	}, {} as Record<typeof COLUMNS[number]["tip"], boolean>);

	let noColumnsError = "";

	function startGame() {
		const columns = COLUMNS.filter(x => colsEnabled[x.tip]).map(x => x.name);
		if (columns.length) {
			socket.send({ type: "startGame", columns });
			noColumnsError = "";
		} else {
			noColumnsError = "At least one column must be selected.";
		}
	}

	const ColumnSelection: m.Component = {
		view() {
			return [
				m("h3.text-center", "Columns"),
				m(
					".settings__column-selection",
					COLUMNS.map(x =>
						m(
							"label.settings__label",
							{ key: x.tip },
							m("input.settings__checkbox[type=checkbox]", {
								checked: colsEnabled[x.tip],
								onclick: () => (colsEnabled[x.tip] = !colsEnabled[x.tip]),
							}),
							x.tip,
						),
					),
				),
				m("p.settings__error", noColumnsError),
			];
		},
	};

	const ColorSelection: m.Component = {
		view() {
			return [
				m("h3.text-center", "Change color"),
				m(
					".settings__color-selection",
					playerColors.map(color =>
						m(
							"button.settings__color-button",
							{ disabled: state.self.color === color },
							m(ColorCircle, { color, selected: state.self.color === color }),
						),
					),
				),
			];
		},
	};

	return {
		view({ attrs }) {
			const { owner } = attrs;
			return m("section.settings", [
				m("h2.text-center", "Settings"),
				m(ColorSelection),
				owner && [
					m(ColumnSelection),
					m("button.settings__start", { onclick: startGame }, "Start the game"),
				],
			]);
		},
	};
}
