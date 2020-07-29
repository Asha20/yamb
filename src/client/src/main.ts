import "../public/index.css";
import m from "mithril";
import * as yamb from "common/yamb";

const game = yamb.create();

interface CellAttrs {
	row: typeof game["rowNames"][number];
	column: typeof game["columnNames"][number];
}

const Cell: m.Component<CellAttrs> = {
	view(vnode) {
		const { row, column } = vnode.attrs;
		return m("td", [m("button.cell", game.field(row, column))]);
	},
};

const Yamb: m.Component = {
	view() {
		return m("table.yamb", [
			m("thead", [
				m("tr", [
					m("th", "Blank"),
					game.columnNames.map(col => m("th", [col])),
				]),
			]),

			m("tbody", [
				game.rowNames.map(row =>
					m("tr", [
						m("td", row),
						...game.columnNames.map(column => m(Cell, { row, column })),
					]),
				),
			]),
		]);
	},
};

m.mount(document.body, Yamb);
