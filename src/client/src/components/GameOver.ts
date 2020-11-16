import m from "mithril";
import { Scoreboard } from "./Scoreboard";

export const GameOver: m.Component = {
	view() {
		return m(
			".center-child.expand",
			m("section.game-over", [
				m("h2.text-center", "Game Over"),
				m(Scoreboard, { sorted: true }),
			]),
		);
	},
};
