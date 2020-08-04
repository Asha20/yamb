import * as express from "express";
import { API } from "common";

export const router = express.Router();

router.get("/create-game", (_, res) => {
	const response: API.CreateGame = { id: 123 };
	res.json(response);
});
