import "../public/index.css";
import m from "mithril";
import { Main } from "./pages/Main";
import { Lobby } from "./pages/Lobby";
import { Game } from "./pages/Game";
import { state } from "./state";

m.route.prefix = "";
m.route(document.body, "/", {
	"/": Main,
	"/lobby/:id": Lobby,
	"/game/:id": Game,
});

(window as any).state = state;
