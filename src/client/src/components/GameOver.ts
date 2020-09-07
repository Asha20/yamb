import m from "mithril";
import { Scoreboard } from "./Scoreboard";
import { state } from "../state";

export const GameOver = {
	view() {
		return m("section.game-over", [
			m("h2", "Game Over"),
			m(Scoreboard, { initialPlayers: state.initialPlayers }),
		]);
	},
};
