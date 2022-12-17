import { assert } from 'console';
import * as fs from 'fs';
import { parse } from 'path';

type Packet = (number | Packet)[];

function isPacket(p: number | Packet): p is Packet {
    return Array.isArray(p);
}

function stringify(p: Packet) {
    return JSON.stringify(p, null, 0).replace('\n','')
}



function parsePacket(s: string): Packet {
    const parsed = JSON.parse(s) as Packet;
    return parsed;
}

function isCorrectlyOrderedRecurse(left: Packet, right: Packet, leftIdx: number, rightIdx: number, recurseDepth: number): 'correct' | 'incorrect' | 'unknown' {
    // const indent = '\t'.repeat(recurseDepth);
    // console.log(indent, left, right, leftIdx, rightIdx);
    // console.log(`isCorrectlyOrderedRecurse[${recurseDepth}]: ${stringify(left)}[${leftIdx}] vs ${stringify(right)}[${rightIdx}])`);
    if (left.length === leftIdx && right.length > rightIdx) return 'correct';
    if (left.length > leftIdx && right.length === rightIdx) return 'incorrect';
    if (left.length === leftIdx && right.length === rightIdx) {
        // console.log(indent, 'unknown A');
        return 'unknown';
    }

    const l = left[leftIdx];
    const r = right[rightIdx];
    // console.log(indent, 'l:', l, 'r:', r);
    // If both values are integers, the lower integer should come first. If the left integer is lower than the right integer, the inputs are in the right order. If the left integer is higher than the right integer, the inputs are not in the right order. Otherwise, the inputs are the same integer; continue checking the next part of the input.
    if (!isPacket(l) && !isPacket(r)) {
        // console.log('-> both numbers')
        // console.log(indent, `!isPacket(${l}) && !isPacket(${r})`);
        if (l < r) return 'correct';
        if (l > r) return 'incorrect';
        return isCorrectlyOrderedRecurse(left, right, leftIdx + 1, rightIdx + 1, recurseDepth + 1);
    } 
    // If both values are lists, compare the first value of each list, then the second value, and so on. If the left list runs out of items first, the inputs are in the right order. If the right list runs out of items first, the inputs are not in the right order. If the lists are the same length and no comparison makes a decision about the order, continue checking the next part of the input.
    else if (isPacket(l) && isPacket(r)) {
        // console.log(indent, `isPacket(l) && isPacket(r)`);
        // console.log('-> both lists')
        const result = isCorrectlyOrderedRecurse(l, r, 0, 0, recurseDepth + 1);
        if (result !== 'unknown') {
            // console.log(indent, result, 'B');
            return result;
        }
        // console.log('UNKNOWN 1');
        return isCorrectlyOrderedRecurse(left, right, leftIdx + 1, rightIdx + 1, recurseDepth + 1);
    }
    // If exactly one value is an integer, convert the integer to a list which contains that integer as its only value, then retry the comparison. For example, if comparing [0,0,0] and 2, convert the right value to [2] (a list containing 2); the result is then found by instead comparing [0,0,0] and [2].
    else if (isPacket(l) && !isPacket(r)) {
        // console.log(indent, `isPacket(l) && !isPacket(r)`);
        // console.log('-> left list')
        const result = isCorrectlyOrderedRecurse(l, [r], 0, 0, recurseDepth + 1);
        if (result !== 'unknown') {
            // console.log(indent, result, 'C');
            return result;
        }
        // console.log('UNKNOWN 2');
        return isCorrectlyOrderedRecurse(left, right, leftIdx + 1, rightIdx + 1, recurseDepth + 1);

    } else if (!isPacket(l) && isPacket(r)) {
        // console.log(indent, `!isPacket(l) && isPacket(r)`);

        // console.log('-> right list')
        const result = isCorrectlyOrderedRecurse([l], r, 0, 0, recurseDepth + 1);
        if (result !== 'unknown') {
            // console.log(indent, result, 'D');
            return result;
        }
        return isCorrectlyOrderedRecurse(left, right, leftIdx + 1, rightIdx + 1, recurseDepth + 1);

        // console.log('UNKNOWN 3');
    }
    else {
        assert(false, 'UNEXPE');
    }
}

function isCorrectlyOrdered(leftPacket: Packet, rightPacket: Packet): boolean {
    const result = isCorrectlyOrderedRecurse(leftPacket, rightPacket, 0, 0, 0);
    // console.log('result:', result);
    // console.log();

    switch (result) {
        case 'correct':
            return true;
        case 'incorrect':
            return false;
        default:
            assert(false, 'Unexpected result for "%s" and "%s"', stringify(leftPacket), stringify(rightPacket));
    }
}

let testIndex = 0;
function test(actual: boolean, expected: boolean) {
    testIndex++;
    if (actual !== expected) {
        console.error(`[Test case #${testIndex}: Expected: ${expected}, but got ${actual}`);
    } else {
        console.error(`[Test case #${testIndex}: success`);
    }
}

// function testPrint(left: Packet, right: Packet) {
//     const [correct, leftUnrolled, rightUnrolled, index] = isCorrectlyOrdered(left, right);
//     function stringify(p: Packet) {
//         return JSON.stringify(p, null, 0).replace('\n','')
//     }
//     console.log('ORDERED CORRECTLY?', correct);
//     console.log('Left:', stringify(left));
//     console.log('Right:', stringify(right));
//     console.log('Unrolled left:', stringify(leftUnrolled));
//     console.log('Unrolled right:', stringify(rightUnrolled));
//     console.log('End index:', index);

// }

async function main() {
    test(isCorrectlyOrdered([1,1,3,1,1], [[1],[2,3,4]]), true);

    // test(isCorrectlyOrdered([[1]], [[]]), false);
    // test(isCorrectlyOrdered([1], []), false);
    // test(isCorrectlyOrdered([], [1]),  true);
    // test(isCorrectlyOrdered([1,1,3,1,1], [1,1,5,1,1]),  true);
    // test(isCorrectlyOrdered([[1],[2,3,4]], [[1],4]),  true);
    // test(isCorrectlyOrdered([9], [[8,7,6]]), false);
    // test(isCorrectlyOrdered([[8,7,6]], [9]), true);
    // test(isCorrectlyOrdered([[4,4],4,4], [[4,4],4,4,4]), true);
    // test(isCorrectlyOrdered([7,7,7,7], [7,7,7]),  false);
    // test(isCorrectlyOrdered([[1],[2,3,4]], [[1],4]),  true);
    // test(isCorrectlyOrdered([], [3]),  true);
    // test(isCorrectlyOrdered([3], []),  false);
    // test(isCorrectlyOrdered([[1],[2,3,4]], [[1],4]),  true);
    // test(isCorrectlyOrdered([[[]]], [[]]),  false);
    // test(isCorrectlyOrdered([[]], [[[]]]),  true);
    // test(isCorrectlyOrdered([[1],[2,3,4]], [[1],4]),  true);
    // test(isCorrectlyOrdered([1,[2,[3,[4,[5,6,7]]]],8,9], [1,[2,[3,[4,[5,6,0]]]],8,9]), false);
    // test(isCorrectlyOrdered([1,[2,[3,[4,[5,6,0]]]],8,9], [1,[2,[3,[4,[5,6,7]]]],8,9]), true);

    // test(isCorrectlyOrdered( [0, [], 2], [0, 1, 1]), false);
    // // testPrint( [0, [], 2], [0, 10, 10]);

    const content = fs.readFileSync("./13/input.data", "utf8");
    const lines = content.split('\n').filter((_, i) => (i + 1) % 3 !== 0); // Every third line is blank

    let correctOrderedIndexSums = 0;
    for (let i = 0; i < lines.length; i += 2) {
        const packetIndex = i / 2 + 1;
        const packet1 = parsePacket(lines[i]);
        const packet2 = parsePacket(lines[i+1]);

        const correctOrder = isCorrectlyOrdered(packet1, packet2);
        if (correctOrder) {
            correctOrderedIndexSums += packetIndex;
        }
    }
    console.log('Part 1:', correctOrderedIndexSums);

    const divider1: Packet = ([[2]]);
    const divider2: Packet = [[6]];
    const packets = lines.map(l => parsePacket(l)).concat([divider1, divider2]);
    const packetsWithScores = packets.map((p, index) => {
        // Compare package with all other packages 
        let score = 0;
        for (let i = 0; i < packets.length; ++i) {
            if (i === index)
                continue;
            
            const isPacketBefore = isCorrectlyOrdered(p, packets[i]);
            score += isPacketBefore ? 1 : 0;
        }
        return {package: p, score };
    });
    packetsWithScores.sort((a,b) => b.score - a.score);
    console.log('needle', stringify(divider1));
    const divider1Index = packetsWithScores.findIndex(x => stringify(x.package) === stringify(divider1)) + 1;
    const divider2Index = packetsWithScores.findIndex(x => stringify(x.package) === stringify(divider2)) + 1;
    console.log('Part 2 - divider1:', divider1Index, 'divider2:', divider2Index, 'dividerProduct:', divider1Index*divider2Index);
    packetsWithScores.forEach((x, i) => {
        console.log(i + 1, stringify(x.package));
    });

}
main();