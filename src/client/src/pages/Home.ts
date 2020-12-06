import m from "mithril";
import * as api from "../api";
import { i18n, availableLanguages, setLanguage } from "../i18n";

async function createGame() {
	const response = await api.createGame();
	m.route.set("/lobby/:id", { id: response.id });
}

export const Home: m.Component = {
	view() {
		return m(
			".center-child.expand",
			m(".home", [
				m("h1.text-center", i18n("Yamb")),
				m("button", { onclick: createGame }, i18n("Create a game")),

				availableLanguages().map(lang =>
					m(
						"button",
						{
							onclick: () => {
								setLanguage(lang);
							},
						},
						lang,
					),
				),
			]),
		);
	},
};
