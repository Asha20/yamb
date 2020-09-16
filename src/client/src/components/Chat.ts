import m from "mithril";
import { state, actions } from "../state";
import { ChatMessage, Player } from "common";

interface ChatAttrs {
	canSend: boolean;
}

const nameMap = new Map<string, string>();

function getName(sender: Player["id"]) {
	const cachedName = nameMap.get(sender);
	if (cachedName) {
		return cachedName;
	}

	const name = state.players.find(x => x.id === sender)!.name;
	nameMap.set(sender, name);
	return name;
}

function formatMessage(msg: ChatMessage) {
	if (msg.sender === "Server") {
		return msg.content;
	}

	const name = getName(msg.sender);
	return `${name}: ${msg.content}`;
}

export const Chat = {
	chatLog: null as Element | null,
	inputField: null as HTMLInputElement | null,
	content: "",

	onupdate() {
		if (this.chatLog && !this.content) {
			this.chatLog.scrollTop = this.chatLog.scrollHeight;
		}
	},

	onInput(e: InputEvent) {
		this.content = this.inputField?.value ?? "";
	},

	sendOnEnter(e: KeyboardEvent) {
		if (e.key === "Enter" || e.key === "Return") {
			this.sendMessage();
		}
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
				{ oncreate: ({ dom }) => (this.chatLog = dom) },
				state.chat.map(msg =>
					m("li.chat__message", { key: msg.sent }, formatMessage(msg)),
				),
			),
			m("section.chat__write", [
				m("input[type=text].chat__input", {
					oncreate: ({ dom }) => (this.inputField = dom as HTMLInputElement),
					oninput: (e: InputEvent) => this.onInput(e),
					onkeydown: (e: KeyboardEvent) => this.sendOnEnter(e),
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
