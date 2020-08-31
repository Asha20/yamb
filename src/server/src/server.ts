import * as path from "path";
import * as express from "express";
import * as wss from "./wss";
import { router as apiRouter } from "./api";

const PROJECT_SRC = path.resolve(__dirname, "..", "..");
function root(filePath: string) {
	return path.resolve(PROJECT_SRC, filePath);
}

const mithrilRoute = (_: any, res: express.Response<any>) => {
	res.sendFile(root("client/dist/index.html"));
};

const redirect = (to: string) => (_: any, res: express.Response<any>) => {
	res.redirect(to);
};

const app = express();

app.use("/public", express.static(root("client/dist")));

app.get("/", mithrilRoute);
app.get("/lobby/:id", mithrilRoute);
app.get("/game/:id", redirect("/"));
app.use("/api", apiRouter);

const EXPRESS_PORT = 3000;
const WS_PORT = 3001;

app.listen(EXPRESS_PORT, () => {
	console.log("Express server open on port:", EXPRESS_PORT);
});

wss.listen(WS_PORT);
console.log("WebSocket server open on port:", WS_PORT);
