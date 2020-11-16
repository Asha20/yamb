import * as express from "express";
import { API } from "common";
import { getRoomManager } from "./wss";

export const router = express.Router();

router.get("/create-game", (_, res) => {
	const response: API.CreateGame = { id: 123 };
	res.json(response);
});

router.get("/room-full/:id", (req, res) => {
	const roomManager = getRoomManager();
	const response: API.RoomFull = {
		isFull: !!roomManager && roomManager.roomIsFull(req.params.id),
	};
	res.json(response);
});
