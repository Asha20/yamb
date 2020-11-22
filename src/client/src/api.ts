import m from "mithril";
import { API } from "common";

export function createGame(): Promise<API.CreateGame> {
	return m.request({
		method: "GET",
		url: "/api/create-game",
	});
}

export function checkFull(roomId: string): Promise<API.RoomFull> {
	return m.request({
		method: "GET",
		url: `/api/room-full/${roomId}`,
	});
}

export function nameAvailable(
	gameId: string,
	name: string,
): Promise<API.CheckName> {
	return m.request({
		method: "GET",
		url: `/api/check-name/${gameId}?name=${name}`,
	});
}
