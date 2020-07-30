import m from "mithril";
import { state, actions } from "../state";

const diceLook = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

export const Dice = {
	onDieClick(index: number) {
		if (state.roll > 0) {
			actions.toggleFreeze(index);
		}
	},

	rollDice() {
		const allFrozen = state.frozen.every(isFrozen => isFrozen);
		if (allFrozen || state.roll >= 3) {
			return;
		}

		actions.rollDice();
	},

	view() {
		return m("section.dice", [
			m(
				"div",
				state.dice.map((die, i) =>
					m(
						"button.die",
						{
							class: state.frozen[i] ? "frozen" : "",
							onclick: () => this.onDieClick(i),
						},
						diceLook[die - 1],
					),
				),
			),
			m(
				"button",
				{ disabled: state.roll >= 3, onclick: this.rollDice },
				"Roll dice",
			),
			"Roll: " + state.roll,
		]);
	},
};
