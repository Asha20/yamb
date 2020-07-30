import { DieSide, Yamb, create as createGame } from "common/yamb";
import { array, countDice } from "common/util";

interface State {
	roll: number;
	dice: DieSide[];
	frozen: boolean[];
	game: Yamb<any, any>;
}

const initialState = (): State => ({
	roll: 0,
	dice: array(6, () => 6),
	frozen: array(6, () => false),
	game: createGame(),
});

export const actions = {
	toggleFreeze(index: number) {
		state.frozen[index] = !state.frozen[index];
	},

	rollDice() {
		for (let i = 0; i < state.dice.length; i++) {
			if (!state.frozen[i]) {
				state.dice[i] = (Math.floor(Math.random() * 6) + 1) as DieSide;
			}
		}
		state.roll += 1;
	},

	play(row: string, column: string) {
		state.game.play(countDice(state.dice), state.roll, row, column);

		const { roll, dice, frozen } = initialState();
		Object.assign(state, { roll, dice, frozen });
	},
};

export const state = initialState();
