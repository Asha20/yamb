import m from "mithril";
import { state } from "../state";
import * as socket from "../socket";

const diceLook = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

export const Dice = {
	oninit() {
		socket.onMessage(msg => {
			switch (msg.type) {
				case "toggleFreezeResponse":
					state.gameManager.toggleFreeze(msg.index);
					break;
				case "rollDiceResponse":
					state.gameManager.loadDice(msg.dice);
					break;
			}
			m.redraw();
		});
	},

	onDieClick(index: number) {
		socket.send({ type: "toggleFreeze", index });
	},

	rollDice() {
		socket.send({ type: "rollDice" });
	},

	view() {
		return m("section.dice", [
			m(
				"div",
				state.gameManager.diceValues.map((die, i) =>
					m(
						"button.die",
						{
							class: state.gameManager.frozen[i] ? "frozen" : "",
							onclick: () => this.onDieClick(i),
						},
						diceLook[die - 1],
					),
				),
			),
			m(
				"button",
				{ disabled: state.gameManager.roll >= 3, onclick: this.rollDice },
				"Roll dice",
			),
			"Roll: " + state.gameManager.roll,
		]);
	},
};
