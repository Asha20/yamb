import m from "mithril";
import { Scoreboard } from "./Scoreboard";

export const GameOver: m.Component = {
	view() {
		return m("section.game-over", [m("h2", "Game Over"), m(Scoreboard)]);
	},
};
