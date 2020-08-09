import {
	SetName,
	StartGame,
	Move,
	ToggleFreeze,
	RollDice,
	ClientMessage,
} from "common";

interface Message<T extends string> {
	type: T;
	sender: string;
	[key: string]: unknown;
}

function message<T extends string>(x: unknown, type: T): x is Message<T> {
	return (
		x !== null &&
		typeof x === "object" &&
		(x as any).type === type &&
		typeof (x as any).sender === "string"
	);
}

function setName(x: unknown): x is SetName {
	return message(x, "setName") && typeof x.name === "string";
}

function startGame(x: unknown): x is StartGame {
	return message(x, "startGame");
}

function move(x: unknown): x is Move {
	return (
		message(x, "move") &&
		typeof x.row === "string" &&
		typeof x.column === "string"
	);
}

function toggleFreeze(x: unknown): x is ToggleFreeze {
	return message(x, "toggleFreeze") && typeof x.index === "number";
}

function rollDice(x: unknown): x is RollDice {
	return message(x, "rollDice");
}

export function isClientMessage(x: unknown): x is ClientMessage {
	return (
		setName(x) || startGame(x) || move(x) || toggleFreeze(x) || rollDice(x)
	);
}
