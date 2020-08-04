import m from "mithril";
import { API } from "common";

export const Main = {
	createGame() {
		m.request<API.CreateGame>({
			method: "GET",
			url: "/api/create-game",
		}).then(response => {
			m.route.set("/lobby/:id", { id: response.id });
		});
	},

	view() {
		return [
			m("h1", "Yamb"),
			m("button", { onclick: this.createGame }, "Create a game"),
		];
	},
};
