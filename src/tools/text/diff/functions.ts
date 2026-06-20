export type DiffCell = {
	type: 'equal' | 'added' | 'removed' | 'empty';
	content: string;
	lineNum: number | null;
};

export type DiffRow = {
	left: DiffCell;
	right: DiffCell;
};

function emptyCell(): DiffCell {
	return { type: 'empty', content: '', lineNum: null };
}

export function diffLines(textA: string, textB: string): DiffRow[] {
	const linesA = textA.split('\n');
	const linesB = textB.split('\n');
	const dp = Array.from({ length: linesA.length + 1 }, () => Array(linesB.length + 1).fill(0) as number[]);

	for (let i = linesA.length - 1; i >= 0; i--) {
		for (let j = linesB.length - 1; j >= 0; j--) {
			dp[i][j] = linesA[i] === linesB[j]
				? dp[i + 1][j + 1] + 1
				: Math.max(dp[i + 1][j], dp[i][j + 1]);
		}
	}

	const rows: DiffRow[] = [];
	let i = 0;
	let j = 0;

	while (i < linesA.length || j < linesB.length) {
		if (i < linesA.length && j < linesB.length && linesA[i] === linesB[j]) {
			rows.push({
				left: { type: 'equal', content: linesA[i], lineNum: i + 1 },
				right: { type: 'equal', content: linesB[j], lineNum: j + 1 },
			});
			i++;
			j++;
		} else if (j < linesB.length && (i >= linesA.length || dp[i][j + 1] >= dp[i + 1][j])) {
			rows.push({
				left: emptyCell(),
				right: { type: 'added', content: linesB[j], lineNum: j + 1 },
			});
			j++;
		} else if (i < linesA.length) {
			rows.push({
				left: { type: 'removed', content: linesA[i], lineNum: i + 1 },
				right: emptyCell(),
			});
			i++;
		}
	}

	return rows;
}
