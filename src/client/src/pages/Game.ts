import m from "mithril";
import { Yamb } from "../components/Yamb";
import { Dice } from "../components/Dice";

export const Game = {
	view() {
		return [
			m(Yamb),
			m(Dice),
			m("button", { onclick: () => m.redraw() }, "Redraw"),
		];
	},
};
