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
	const response: API.RoomFull = {
		isFull: !!roomManager && roomManager.roomIsFull(req.params.id),
	};
	res.json(response);
});
