import { DieSide } from "./dice";
import { Player } from "./gameManager";
import { ChatMessage } from "./chat";

export type SetName = { type: "setName"; sender: string; name: string };
export type StartGame = { type: "startGame"; sender: string };
export type Move = {
	type: "move";
	sender: string;
	row: string;
	column: string;
};
export type ToggleFreeze = {
	type: "toggleFreeze";
	sender: string;
	index: number;
};
export type RollDice = { type: "rollDice"; sender: string };
export type SendChatMessage = {
	type: "chatMessage";
	sender: string;
	message: ChatMessage;
};

export type ClientMessage =
	| SetName
	| StartGame
	| Move
	| ToggleFreeze
	| RollDice
	| SendChatMessage;

export type ServerMessage =
	| { type: "players"; players: Player[] }
	| {
			type: "nameResponse";
			status: "unavailable" | "invalid" | "name-missing" | "too-long";
	  }
	| { type: "nameResponse"; status: "ok"; player: Player }
	| { type: "gameStarted" }
	| { type: "moveResponse"; player: Player; row: string; column: string }
	| { type: "toggleFreezeResponse"; index: number }
	| { type: "rollDiceResponse"; roll: number; dice: DieSide[] }
	| { type: "findNextAvailablePlayer" }
	| { type: "gameEnded" }
	| { type: "chatSync"; messages: ChatMessage[] }
	| { type: "receiveChatMessage"; message: ChatMessage };
