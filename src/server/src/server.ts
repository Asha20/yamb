import * as http from "http";
import * as path from "path";
import * as express from "express";
import * as wss from "./wss";
import * as compression from "compression";
import { router as apiRouter } from "./api";
import { logger } from "./logger";

const PROJECT_SRC = path.resolve(__dirname, "..", "..");
function root(filePath: string) {
	return path.resolve(PROJECT_SRC, filePath);
}

const mithrilRoute = (_: unknown, res: express.Response<unknown>) => {
	res.sendFile(root("client/dist/index.html"));
};

const redirect = (to: string) => (
	_: unknown,
	res: express.Response<unknown>,
) => {
	res.redirect(to);
};

const app = express();

app.use(compression());

app.use("/public", express.static(root("client/dist")));

app.get("/", mithrilRoute);
app.get("/lobby/:id", (req, res) => {
	if (wss.gamesSet.has(req.params.id)) {
		return redirect("/")(req, res);
	}
	return mithrilRoute(req, res);
});
app.get("/game/:id", redirect("/"));
app.use("/api", apiRouter);

const server = http.createServer(app);
wss.listen(server);

const EXPRESS_PORT = process.env.PORT || 3000;

server.listen(EXPRESS_PORT, () => {
	logger.info(`Express server open on port: ${EXPRESS_PORT}`);
});
