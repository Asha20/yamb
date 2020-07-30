import m from "mithril";
import * as API from "common/api";

export const Main = {
	createGame() {
		m.request<API.CreateGame>({
			method: "GET",
			url: "/api/create-game",
		}).then(response => {
			m.route.set("/game/:gameId", { gameId: response.id });
		});
	},

	view() {
		return [
			m("h1", "Yamb"),
			m("button", { onclick: this.createGame }, "Create a game"),
		];
	},
};
