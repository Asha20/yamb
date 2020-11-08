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

export const Main: m.Component = {
	view() {
		return [
			m("h1", "Yamb"),
			m("button", { onclick: createGame }, "Create a game"),
		];
	},
};
