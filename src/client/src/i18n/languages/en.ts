import { Compute } from "common";

const terms = [
	"Create a game",
	"Name has already been taken.",
	"Name cannot contain special characters.",
	"You must enter a name.",
	"Maximum name length is 16 characters.",
	"Enter a name:",
	"Submit",
	"Lobby",
	"At least one column must be selected.",
	"Change color",
	"you",
	"owner",
	"Columns",
	"Players",
	"Settings",
	"Start the game",
	"Send",
	"Top-down",
	"Free",
	"Bottom-up",
	"Call",
	"Hand",
	"Medial",
	"Anti-Medial",
	"Sum",
	"Max",
	"Min",
	"Straight",
	"3 of a kind",
	"Full House",
	"4 of a kind",
	"Yamb",
	"Total",
	"C",
	"H",
	"M",
	"AM",
	"playing",
	"quit",
	"Must fill downwards from the top",
	"Fill any field",
	"Must fill upwards from the bottom",
	"Must call a field before playing",
	"Must play after the first roll",
	"Fill towards the center",
	"Fill away from the center",
	"Sum of ones",
	"Sum of twos",
	"Sum of threes",
	"Sum of fours",
	"Sum of fives",
	"Sum of sixes",
	"Sum from Ones to Sixes",
	"Sum of all dice",
	"Ones * (Max - Min)",
	"1-2-3-4-5 or 2-3-4-5-6",
	"Three same dice",
	"3 of a kind + 2 of a kind",
	"Four same dice",
	"Five same dice",
	"Sum from Straight to Yamb",
	"Player",
	"Score",
	"Game Over",
	"Roll dice",
] as const;

export type Translation = Compute<
	Record<typeof terms[number], string> & typeof withParameters
>;

const withParameters = {
	"Rolled $roll times.": (rolls: number) => {
		let amount = String(rolls);
		if (rolls === 0) amount = "zero";
		if (rolls === 1) amount = "one";
		if (rolls === 2) amount = "two";
		if (rolls === 3) amount = "three";
		const times = rolls === 1 ? "time" : "times";
		return `Rolled ${amount} ${times}.`;
	},
};

const termMap = { ...withParameters } as Translation;
for (const term of terms) {
	termMap[term] = term;
}

export const translation = Object.freeze(termMap);
