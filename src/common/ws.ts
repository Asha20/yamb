import { DieSide } from "./dice";
import { Player } from "./gameManager";

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

export type ClientMessage =
	| SetName
	| StartGame
	| Move
	| ToggleFreeze
	| RollDice;

export type ServerMessage =
	| { type: "players"; players: Player[] }
	| { type: "nameResponse"; available: false }
	| { type: "nameResponse"; available: true; player: Player }
	| { type: "gameStarted" }
	| { type: "moveResponse"; player: Player; row: string; column: string }
	| { type: "toggleFreezeResponse"; index: number }
	| { type: "rollDiceResponse"; roll: number; dice: DieSide[] };
