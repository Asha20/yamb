import m from "mithril";
import { state } from "../state";
import * as socket from "../socket";

const diceLook = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

function onDieClick(index: number) {
	socket.send({ type: "toggleFreeze", index });
}

function rollDice() {
	socket.send({ type: "rollDice" });
}

export const Dice: m.Component = {
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

	view() {
		return m("section.dice", [
			m(
				"div.dice__container",
				state.gameManager.diceValues.map((die, i) =>
					m(
						"button.dice__die",
						{
							key: i,
							class: state.gameManager.frozen[i] ? "frozen" : "",
							disabled: !state.ownTurn,
							onclick: () => onDieClick(i),
						},
						diceLook[die - 1],
					),
				),
			),
			m("span.dice__roll", "Roll: " + state.gameManager.roll),
			m(
				"button.dice__roll-dice",
				{
					disabled:
						!state.ownTurn ||
						state.gameManager.roll >= 3 ||
						state.gameManager.mustCall(),
					onclick: rollDice,
				},
				"Roll dice",
			),
		]);
	},
};
