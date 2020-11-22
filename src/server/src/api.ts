import * as express from "express";
import { API } from "common";
import { getRoomManager } from "./wss";
import { nanoid } from "nanoid";

export const router = express.Router();

router.get("/create-game", (_, res) => {
	const response: API.CreateGame = { id: nanoid(12) };
	res.json(response);
});

router.get("/room-full/:id", (req, res) => {
	const roomManager = getRoomManager();
	if (roomManager) {
		const response: API.RoomFull = {
			isFull: roomManager.roomIsFull(req.params.id),
		};
		res.json(response);
	}
});

router.get("/check-name/:id", (req, res) => {
	const roomManager = getRoomManager();
	const nameRegex = /^[\w\s]+$/;
	const name = req.query.name;
	let response: API.CheckName;

	if (typeof name !== "string") {
		return;
	}

	if (name.length === 0) {
		response = { status: "name-missing" };
	} else if (name.length > 16) {
		response = { status: "too-long" };
	} else if (!nameRegex.test(name)) {
		response = { status: "invalid" };
	} else if (roomManager && !roomManager.nameAvailable(req.params.id, name)) {
		response = { status: "unavailable" };
	} else {
		response = { status: "ok" };
	}
	res.json(response);
});
