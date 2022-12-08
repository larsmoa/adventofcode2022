import { assert } from 'console';
import * as fs from 'fs';
import * as readline from 'readline';

function elementAt(map: number[][], i: number, j: number): number {
    return map[j][i];
}

function range(start: number, endExclusive: number): number[] { 
    return Array.from(new Array(endExclusive - start).keys()).map((_, i) => i + start);
}

function scenicScore(map: number[][], colIdx: number, rowIdx: number): number {
    const row = map[rowIdx];
    const column = range(0, map.length).map((_, j) => elementAt(map, colIdx, j));
    const cols = row.length;
    const rows = map.length;
    const treeHeight = row[colIdx];

    let visibleLeftOf = 0;
    for (let i = colIdx - 1; i >= 0; i--) {
        visibleLeftOf++;
        if (row[i] >= treeHeight) {
            break;
        }
    }
    let visibleRightOf = 0;
    for (let i = colIdx + 1; i < cols; i++) {
        visibleRightOf++;
        if (row[i] >= treeHeight) {
            break;
        }
    }
    let visibleAbove = 0;
    for (let j = rowIdx - 1; j >= 0; j--) {
        visibleAbove++;
        if (column[j] >= treeHeight) {
            break;
        }
    }
    let visibleBelow = 0;
    for (let j = rowIdx + 1; j < rows; j++) {
        visibleBelow++;
        if (column[j] >= treeHeight) {
            break;
        }
    }

    console.log(`(${colIdx},${rowIdx}):`, visibleLeftOf, visibleRightOf, visibleAbove, visibleBelow);
 
    return visibleAbove*visibleBelow*visibleLeftOf*visibleRightOf;
}

async function main() {
    const stream = fs.createReadStream('./08/input.data');
    const lineReader = readline.createInterface(stream);
    const treeMap: number[][] = [];
    for await (const line of lineReader) {
        treeMap.push(line.split('').map(x => Number.parseInt(x)));
    }
    const rows = treeMap.length;
    const cols = treeMap[0].length;
    console.log(treeMap);

    const visibilityMap: [boolean, number][][] = treeMap.map((row,rowIdx) => {
        return row.map((treeHeight, colIdx) => {
            if (colIdx === 0 || colIdx === cols - 1 || rowIdx === 0 || rowIdx === rows - 1) {
                return [true, 0]; // On edge, visible
            }
            const maxHeightLeftOf = Math.max(...row.slice(0, colIdx));
            const maxHeightRightOf = Math.max(...row.slice(colIdx + 1));
            const maxHeightAbove = Math.max(...range(0, rowIdx).map(j => elementAt(treeMap, colIdx, j)));
            const maxHeightBelow = Math.max(...range(rowIdx + 1, rows).map(j => elementAt(treeMap, colIdx, j)));

            // Check "row visibility" (part 1) and "scenic score" (part 2)
            const isVisible = Math.min(maxHeightAbove, maxHeightBelow, maxHeightLeftOf, maxHeightRightOf) < treeHeight;
            const score = scenicScore(treeMap, colIdx, rowIdx);
            return [isVisible, score];
        });
    })
    console.log(visibilityMap);

    // PART 1
    console.log(visibilityMap.flatMap(x => x).filter(x => x[0]).length, 'visible trees');

    // PART 2
    console.log(Math.max(...visibilityMap.flatMap(x => x).map(x => x[1])), 'max scenic score');

}
main();