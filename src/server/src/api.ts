import * as express from "express";
import * as API from "common/api";

export const router = express.Router();

router.get("/create-game", (_, res) => {
	const response: API.CreateGame = { id: 123 };
	res.json(response);
});
