export interface TextStats {
	characters: number;
	charactersNoSpaces: number;
	words: number;
	lines: number;
	paragraphs: number;
	bytes: number;
	chinese: number;
	sentences: number;
}

export function computeStats(text: string): TextStats {
	const characters = text.length;
	const charactersNoSpaces = text.replace(/\s/g, '').length;
	const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
	const lines = text === '' ? 0 : text.split('\n').length;
	const paragraphs = text.trim() === '' ? 0 : text.trim().split(/\n\s*\n/).length;
	const bytes = new TextEncoder().encode(text).length;
	const chinese = (text.match(/[一-鿿]/g) || []).length;
	const sentences = text.trim() === '' ? 0 : text.trim().split(/[.!?。！？]+/).filter(s => s.trim()).length;
	return { characters, charactersNoSpaces, words, lines, paragraphs, bytes, chinese, sentences };
}
