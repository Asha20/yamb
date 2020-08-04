import { DieSide } from "./dice";

export interface Player {
	name: string;
	owner: boolean;
}

export type ClientMessage =
	| { type: "setName"; name: string }
	| { type: "startGame" }
	| { type: "move"; row: string; column: string }
	| { type: "toggleFreeze"; index: number }
	| { type: "rollDice" };

export type ServerMessage =
	| { type: "members"; members: Player[] }
	| { type: "nameResponse"; available: false }
	| { type: "nameResponse"; available: true; name: string; owner: boolean }
	| { type: "gameStarted" }
	| { type: "moveResponse"; player: number; row: string; column: string }
	| { type: "toggleFreezeResponse"; index: number }
	| { type: "rollDiceResponse"; roll: number; dice: DieSide[] };
