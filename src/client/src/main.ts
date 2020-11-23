import "../public/style/index.scss";
import m from "mithril";
import { Home } from "./pages/Home";
import { Lobby } from "./pages/Lobby";
import { Game } from "./pages/Game";
import * as api from "./api";
import { state } from "./state";
import { send } from "./socket";

/** Workaround because Mithril typings are missing the m.route.SKIP property. */
/* eslint-disable-next-line @typescript-eslint/ban-types */
const SKIP = ((m.route as unknown) as { SKIP: m.Component }).SKIP;

m.route.prefix = "";

const app = document.querySelector("#app");

if (!app) {
	throw new Error("Missing app div.");
}

m.route(app, "/", {
	"/": Home,
	"/lobby/:id": {
		async onmatch(args) {
			return (await api.checkFull(args.id)).isFull ? SKIP : Lobby;
		},
	},
	"/game/:id": Game,
});

if (!PRODUCTION) {
	Object.defineProperty(window, "state", { value: state });
	Object.defineProperty(window, "send", { value: send });
}
