import "../public/index.css";
import m from "mithril";
import { Home } from "./pages/Home";
import { Lobby } from "./pages/Lobby";
import { Game } from "./pages/Game";

m.route.prefix = "";
m.route(document.body, "/", {
	"/": Home,
	"/lobby/:id": Lobby,
	"/game/:id": Game,
});
