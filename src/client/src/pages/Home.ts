import m from "mithril";
import { API } from "common";

function createGame() {
	m.request<API.CreateGame>({
		method: "GET",
		url: "/api/create-game",
	}).then(response => {
		m.route.set("/lobby/:id", { id: response.id });
	});
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
