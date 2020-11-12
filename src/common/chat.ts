export interface ChatMessage {
	sender: { id: string; name: string };
	sent: number;
	content: string;
}
