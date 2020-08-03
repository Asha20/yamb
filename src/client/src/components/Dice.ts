import m from "mithril";
import { state, actions } from "../state";

const diceLook = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

export const Dice = {
	onDieClick(index: number) {
		if (state.dice.roll > 0) {
			actions.toggleFreeze(index);
		}
	},

	rollDice() {
		const allFrozen = state.dice.frozen.every(isFrozen => isFrozen);
		if (allFrozen || state.dice.roll >= 3) {
			return;
		}

		actions.rollDice();
	},

	view() {
		return m("section.dice", [
			m(
				"div",
				state.dice.values.map((die, i) =>
					m(
						"button.die",
						{
							class: state.dice.frozen[i] ? "frozen" : "",
							onclick: () => this.onDieClick(i),
						},
						diceLook[die - 1],
					),
				),
			),
			m(
				"button",
				{ disabled: state.dice.roll >= 3, onclick: this.rollDice },
				"Roll dice",
			),
			"Roll: " + state.dice.roll,
		]);
	},
};
