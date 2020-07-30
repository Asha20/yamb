import "../public/index.css";
import m from "mithril";
import { App } from "./App";
import { state } from "./state";

m.mount(document.body, App);

(window as any).state = state;
