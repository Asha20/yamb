import type { Translation } from "./en";

export const translation: Translation = Object.freeze({
	"Create a game": "Kreiraj igru",

	"Name has already been taken.": "Ime je već uzeto.",
	"Name cannot contain special characters.":
		"Ime ne sme da sadrži specijalne karaktere.",
	"You must enter a name.": "Ime je obavezno.",
	"Maximum name length is 16 characters.":
		"Maksimalna dužina imena je 16 karaktera.",
	"Enter a name:": "Unesi ime:",
	Submit: "Potvrdi",

	Lobby: "Lobi",
	"At least one column must be selected.":
		"Barem jedna kolona mora biti izabrana.",

	"Change color": "Promeni boju",
	you: "ti",
	owner: "vlasnik",
	Columns: "Kolone",
	Players: "Igrači",
	Settings: "Podešavanja",
	"Start the game": "Započni igru",
	Send: "Pošalji",

	"Top-down": "Nadole",
	Free: "Slobodna",
	"Bottom-up": "Nagore",
	Call: "Najava",
	Hand: "Ručna",
	Medial: "Medijalna",
	"Anti-Medial": "Anti-medijalna",

	Sum: "Zbir",
	Max: "Max",
	Min: "Min",
	Straight: "Kenta",
	"3 of a kind": "Triling",
	"Full House": "Ful",
	"4 of a kind": "Kare",
	Yamb: "Jamb",
	Total: "Ukupno",

	C: "N",
	H: "R",
	M: "M",
	AM: "AM",

	playing: "igra",
	quit: "izašli",

	"Must fill downwards from the top": "Mora da se popunjava odozgo nadole",
	"Fill any field": "Popunjava se bilo kojim redosledom",
	"Must fill upwards from the bottom": "Mora da se popunjava odozdo nagore",
	"Must call a field before playing": "Potrebno najavljivanje pre popunjavanja",
	"Must play after the first roll": "Mora da se popuni posle prvog bacanja",
	"Fill towards the center": "Popunjavanje prema sredini",
	"Fill away from the center": "Popunjavanje od sredine",
	"Sum of ones": "Zbir jedinica",
	"Sum of twos": "Zbir dvojki",
	"Sum of threes": "Zbir trojki",
	"Sum of fours": "Zbir četvorki",
	"Sum of fives": "Zbir petica",
	"Sum of sixes": "Zbir šestica",
	"Sum from Ones to Sixes": "Zbir redova od jedinica do šestica",
	"Sum of all dice": "Zbir svih kockica",
	"Ones * (Max - Min)": "Jedinice * (Max - Min)",
	"1-2-3-4-5 or 2-3-4-5-6": "1-2-3-4-5 ili 2-3-4-5-6",
	"Three same dice": "Tri iste kockice",
	"3 of a kind + 2 of a kind": "Tri iste + dve iste kockice",
	"Four same dice": "Četiri iste kockice",
	"Five same dice": "Pet iste kockice",
	"Sum from Straight to Yamb": "Zbir redova od kente do jamba",

	Player: "Igrač",
	Score: "Rezultat",

	"Game Over": "Kraj igre",
	"Roll dice": "Baci kockice",

	"Rolled $roll times.": (rolls: number) => {
		let amount = String(rolls);
		if (rolls === 0) amount = "nijednom";
		if (rolls === 1) amount = "jedanput";
		if (rolls === 2) amount = "dvaput";
		if (rolls === 3) amount = "triput";
		return `Bačeno ${amount}.`;
	},
});
