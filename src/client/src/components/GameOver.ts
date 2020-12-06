import m from "mithril";
import { Scoreboard } from "./Scoreboard";
import { i18n } from "../i18n";

export const GameOver: m.Component = {
	view() {
		return m(
			".center-child.expand",
			m("section.game-over", [
				m("h2.text-center", i18n("Game Over")),
				m(Scoreboard, { sorted: true }),
			]),
		);
	},
};
