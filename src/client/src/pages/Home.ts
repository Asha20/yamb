import m from "mithril";
import * as api from "../api";

async function createGame() {
	const response = await api.createGame();
	m.route.set("/lobby/:id", { id: response.id });
}

export const Home: m.Component = {
	view() {
		return m(
			".center-child.expand",
			m(".home", [
				m("h1.text-center", "Yamb"),
				m("button", { onclick: createGame }, "Create a game"),
			]),
		);
	},
};
