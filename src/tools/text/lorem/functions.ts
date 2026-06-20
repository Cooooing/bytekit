const EN_WORDS = ['lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit', 'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore', 'magna', 'aliqua', 'ut', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud', 'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo', 'consequat'];

const ZH_WORDS = ['天地', '玄黄', '宇宙', '洪荒', '日月', '盈昃', '辰宿', '列张', '寒来', '暑往', '秋收', '冬藏', '闰余', '成岁', '律吕', '调阳', '云腾', '致雨', '露结', '为霜', '金生', '丽水', '玉出', '昆冈', '剑号', '巨阙', '珠称', '夜光', '果珍', '李柰', '菜重', '芥姜', '海咸', '河淡', '鳞潜', '羽翔', '龙师', '火帝'];

function pickRandom<T>(arr: T[]): T {
	return arr[Math.floor(Math.random() * arr.length)];
}

function generateSentence(wordPool: string[], minWords: number = 5, maxWords: number = 15): string {
	const len = minWords + Math.floor(Math.random() * (maxWords - minWords));
	const words = Array.from({ length: len }, () => pickRandom(wordPool));
	words[0] = words[0][0].toUpperCase() + words[0].slice(1);
	return words.join(' ') + '.';
}

function generateParagraph(wordPool: string[], minSentences: number = 3, maxSentences: number = 7): string {
	const len = minSentences + Math.floor(Math.random() * (maxSentences - minSentences));
	return Array.from({ length: len }, () => generateSentence(wordPool)).join(' ');
}

export function generateLorem(paragraphs: number = 3, language: 'en' | 'zh' = 'zh'): string {
	const pool = language === 'zh' ? ZH_WORDS : EN_WORDS;
	return Array.from({ length: paragraphs }, () => generateParagraph(pool)).join('\n\n');
}
