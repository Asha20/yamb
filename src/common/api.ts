import { NameStatus } from "./ws";

export interface CreateGame {
	id: string;
}

export interface CheckName {
	status: NameStatus;
}

export interface RoomFull {
	isFull: boolean;
}
