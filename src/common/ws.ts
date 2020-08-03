export interface SocketMetadata {
	name: string;
	owner: boolean;
}

export type ClientMessage =
	| { type: "setName"; name: string }
	| { type: "startGame" };

export type ServerMessage =
	| { type: "members"; members: SocketMetadata[] }
	| { type: "nameResponse"; available: false }
	| { type: "nameResponse"; available: true; name: string; owner: boolean }
	| { type: "gameStarted" };
