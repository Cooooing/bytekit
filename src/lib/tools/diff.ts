export type DiffLine = {
	type: 'equal' | 'added' | 'removed';
	content: string;
	lineNum: number;
};

export function diffLines(textA: string, textB: string): DiffLine[] {
	const linesA = textA.split('\n');
	const linesB = textB.split('\n');
	const result: DiffLine[] = [];

	const maxLen = Math.max(linesA.length, linesB.length);
	let i = 0, j = 0;

	while (i < linesA.length || j < linesB.length) {
		if (i < linesA.length && j < linesB.length && linesA[i] === linesB[j]) {
			result.push({ type: 'equal', content: linesA[i], lineNum: i + 1 });
			i++; j++;
		} else if (j < linesB.length && (i >= linesA.length || !linesA.includes(linesB[j]))) {
			result.push({ type: 'added', content: linesB[j], lineNum: j + 1 });
			j++;
		} else if (i < linesA.length) {
			result.push({ type: 'removed', content: linesA[i], lineNum: i + 1 });
			i++;
		} else {
			break;
		}
	}

	return result;
}
