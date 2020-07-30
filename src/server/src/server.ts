import * as path from "path";
import * as express from "express";
import { router as apiRouter } from "./api";

const PROJECT_SRC = path.resolve(__dirname, "..", "..");
function root(filePath: string) {
	return path.resolve(PROJECT_SRC, filePath);
}

const app = express();

app.use(express.static(root("client/dist")));

app.get("/", (_, res) => {
	res.sendFile(root("client/dist/index.html"));
});

app.get("/game/:gameId", (_, res) => {
	console.log("Opening game");
	res.sendFile(root("client/dist/index.html"));
});

app.use("/api", apiRouter);

app.listen(3000, () => {
	console.log("Listening");
});
