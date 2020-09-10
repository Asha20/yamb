import m from "mithril";
import { state, actions } from "../state";
import { ChatMessage } from "common";

interface ChatAttrs {
	canSend: boolean;
}

function formatMessage(msg: ChatMessage) {
	const date = new Date(msg.sent);
	const h = String(date.getHours()).padStart(2, "0");
	const m = String(date.getMinutes()).padStart(2, "0");
	const s = String(date.getSeconds()).padStart(2, "0");
	const timestamp = `[${h}:${m}:${s}]`;

	const name = state.players.find(x => x.id === msg.sender)!.name;

	return `${timestamp} ${name}: ${msg.content}`;
}

export const Chat = {
	inputField: null as HTMLInputElement | null,
	content: "",

	onInput(e: InputEvent) {
		this.content = this.inputField?.value ?? "";
	},

	sendMessage() {
		if (!this.content.trim().length) {
			return;
		}

		actions.sendMessage(this.content);
		this.content = "";
		if (this.inputField) {
			this.inputField.value = "";
		}
	},

	view(vnode: m.Vnode<ChatAttrs>) {
		const { canSend = true } = vnode.attrs;
		return m("section.chat", [
			m(
				"ul.chat__log",
				state.chat.map(msg => m("li.chat__message", formatMessage(msg))),
			),
			m("section.chat__send", [
				m("input[type=text].chat__input", {
					oncreate: ({ dom }) => (this.inputField = dom as HTMLInputElement),
					oninput: (e: InputEvent) => this.onInput(e),
					disabled: !canSend,
					readonly: !canSend,
				}),
				m(
					"button.chat__send",
					{ onclick: () => this.sendMessage(), disabled: !canSend },
					"Send",
				),
			]),
		]);
	},
};
