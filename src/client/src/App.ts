import m from "mithril";
import { Yamb } from "./Yamb";
import { Dice } from "./Dice";

export const App = {
	view() {
		return [
			m(Yamb),
			m(Dice),
			m("button", { onclick: () => m.redraw() }, "Redraw"),
		];
	},
};
