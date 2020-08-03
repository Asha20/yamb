export interface SocketMetadata {
	name: string;
	owner: boolean;
}

export type SocketMessage =
	| { type: "members"; members: SocketMetadata[] }
	| { type: "setName"; name: string }
	| { type: "nameResponse"; available: false }
	| { type: "nameResponse"; available: true; name: string; owner: boolean }
	| { type: "startGame" }
	| { type: "gameStarted" };
