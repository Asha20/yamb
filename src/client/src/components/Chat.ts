import m from "mithril";
import { state, actions } from "../state";
import { ChatMessage } from "common";

interface ChatAttrs {
	canSend: boolean;
}

const nameMap = new Map<string, string>();

function getName(sender: ChatMessage["sender"]) {
	const cachedName = nameMap.get(sender.id);
	if (cachedName) {
		return cachedName;
	}

	const name = state.players.find(x => x.id === sender.id)?.name ?? sender.name;
	nameMap.set(sender.id, name);
	return name;
}

function formatMessage(msg: ChatMessage) {
	if (msg.sender.id === "Server") {
		return msg.content;
	}

	const name = getName(msg.sender);
	return `${name}: ${msg.content}`;
}

export function Chat(): m.Component<ChatAttrs> {
	let chatLog: Element | null = null;
	let inputField: HTMLInputElement | null = null;
	let content = "";

	function onInput() {
		content = inputField?.value ?? "";
	}

	function sendOnEnter(e: KeyboardEvent) {
		if (e.key === "Enter" || e.key === "Return") {
			sendMessage();
		}
	}

	function sendMessage() {
		if (!content.trim().length) {
			return;
		}

		actions.sendMessage(content);
		content = "";
		if (inputField) {
			inputField.value = "";
		}
	}

	return {
		onupdate() {
			if (chatLog && !content) {
				chatLog.scrollTop = chatLog.scrollHeight;
			}
		},

		view({ attrs }) {
			const { canSend = true } = attrs;
			return m("section.chat", [
				m(
					"ul.chat__log",
					{ oncreate: ({ dom }) => (chatLog = dom) },
					state.chat.map(msg =>
						m("li.chat__message", { key: msg.sent }, formatMessage(msg)),
					),
				),
				m("section.chat__write", [
					m("input[type=text].chat__input", {
						oncreate: ({ dom }) => (inputField = dom as HTMLInputElement),
						oninput: onInput,
						onkeydown: sendOnEnter,
						disabled: !canSend,
						readonly: !canSend,
					}),
					m(
						"button.chat__send",
						{ onclick: () => sendMessage(), disabled: !canSend },
						"Send",
					),
				]),
			]);
		},
	};
}
