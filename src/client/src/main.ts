import "../public/index.css";
import m from "mithril";
import { Main } from "./pages/Main";
import { Game } from "./pages/Game";
import { state } from "./state";

m.route.prefix = "";
m.route(document.body, "/", {
	"/": Main,
	"/game/:id": Game,
});

(window as any).state = state;
