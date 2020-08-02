export type SocketMessage =
	| { type: "members"; members: string[] }
	| { type: "setName"; name: string }
	| { type: "nameResponse"; available: false }
	| { type: "nameResponse"; available: true; name: string };
