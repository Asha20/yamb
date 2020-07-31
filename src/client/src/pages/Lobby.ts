import m from "mithril";

let members: string[] = [];

export const Lobby = {
	oninit() {
		const wsUrl = location.href
			.replace(location.protocol, "ws:")
			.replace(location.port, "3001");
		const socket = new WebSocket(wsUrl);
		socket.onmessage = e => {
			const data = JSON.parse(e.data);
			console.log(data);
			members = data.members;
			m.redraw();
		};
	},

	view() {
		return [
			m("h1", "Lobby"),
			m("section", [
				m("h2", "Members:"),
				members.map(member => m("li", member)),
			]),
		];
	},
};
