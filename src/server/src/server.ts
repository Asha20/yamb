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

const app = express();

app.use("/public", express.static(root("client/dist")));

app.get("/", mithrilRoute);
app.get("/lobby/:id", mithrilRoute);
app.get("/game/:id", mithrilRoute);
app.use("/api", apiRouter);

app.listen(3000, () => {
	console.log("Listening");
});

wss.listen(3001);
