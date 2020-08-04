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
				"div.dice__container",
				state.gameManager.diceValues.map((die, i) =>
					m(
						"button.dice__die",
						{
							class: state.gameManager.frozen[i] ? "frozen" : "",
							disabled: !state.ownTurn,
							onclick: () => this.onDieClick(i),
						},
						diceLook[die - 1],
					),
				),
			),
			m("span.dice__roll", "Roll: " + state.gameManager.roll),
			m(
				"button.dice__roll-dice",
				{
					disabled: !state.ownTurn || state.gameManager.roll >= 3,
					onclick: this.rollDice,
				},
				"Roll dice",
			),
		]);
	},
};
