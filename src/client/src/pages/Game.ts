import m from "mithril";
import { Yamb } from "../components/Yamb";
import { Dice } from "../components/Dice";
import { state } from "../state";

export const Game = {
	view() {
		return [
			state.games.map((_, id) => m(Yamb, { player: id })),
			m(Dice),
			m("button", { onclick: () => m.redraw() }, "Redraw"),
		];
	},
};
