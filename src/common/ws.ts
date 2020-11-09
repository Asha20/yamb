import { DieSide } from "./dice";
import { Player } from "./gameManager";
import { ChatMessage } from "./chat";

export type SetName = { type: "setName"; name: string };
export type StartGame = {
	type: "startGame";
	rows: string[];
	columns: string[];
};
export type Move = { type: "move"; row: string; column: string };
export type ToggleFreeze = { type: "toggleFreeze"; index: number };
export type RollDice = { type: "rollDice" };
export type SendChatMessage = { type: "chatMessage"; message: ChatMessage };
export type RequestCall = { type: "requestCall"; row: string };

type WithSender<T> = T & { sender: string };
type UnknownObject = Record<string, unknown>;

export type ClientMessage = WithSender<
	| SetName
	| StartGame
	| Move
	| ToggleFreeze
	| RollDice
	| SendChatMessage
	| RequestCall
>;

interface Message {
	type: string;
	[key: string]: unknown;
}

function message(x: unknown): x is Message {
	return (
		x !== null &&
		typeof x === "object" &&
		typeof (x as UnknownObject).type === "string"
	);
}

function setName(x: Message): x is SetName {
	return x.type === "setName" && typeof x.name === "string";
}

function startGame(x: Message): x is StartGame {
	return (
		x.type === "startGame" && Array.isArray(x.rows) && Array.isArray(x.columns)
	);
}

function move(x: Message): x is Move {
	return (
		x.type === "move" &&
		typeof x.row === "string" &&
		typeof x.column === "string"
	);
}

function toggleFreeze(x: Message): x is ToggleFreeze {
	return x.type === "toggleFreeze" && typeof x.index === "number";
}

function rollDice(x: Message): x is RollDice {
	return x.type === "rollDice";
}

function chatMessage(x: Message): x is SendChatMessage {
	if (!(x.type === "chatMessage")) {
		return false;
	}
	const msg = x.message as UnknownObject;
	if (typeof msg !== "object" || msg === null) {
		return false;
	}
	return (
		typeof msg.sender === "string" &&
		typeof msg.sent === "number" &&
		typeof msg.content === "string"
	);
}

function requestCall(x: Message): x is RequestCall {
	return x.type === "requestCall" && typeof x.row === "string";
}

export function isClientMessage(x: unknown): x is ClientMessage {
	if (!message(x)) {
		return false;
	}

	if (typeof x.sender !== "string") {
		return false;
	}

	return (
		setName(x) ||
		startGame(x) ||
		move(x) ||
		toggleFreeze(x) ||
		rollDice(x) ||
		chatMessage(x) ||
		requestCall(x)
	);
}

export type ServerMessage =
	| { type: "players"; players: Player[] }
	| {
			type: "nameResponse";
			status: "unavailable" | "invalid" | "name-missing" | "too-long";
	  }
	| { type: "nameResponse"; status: "ok"; player: Player }
	| { type: "gameStarted"; rows: string[]; columns: string[] }
	| { type: "moveResponse"; player: Player; row: string; column: string }
	| { type: "toggleFreezeResponse"; index: number }
	| { type: "rollDiceResponse"; roll: number; dice: DieSide[] }
	| { type: "findNextAvailablePlayer" }
	| { type: "gameEnded" }
	| { type: "chatSync"; messages: ChatMessage[] }
	| { type: "receiveChatMessage"; message: ChatMessage }
	| { type: "confirmCall"; row: string };
