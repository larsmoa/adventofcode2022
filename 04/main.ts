import { assert } from 'console';
import * as fs from 'fs';
import * as readline from 'readline';

type Range = [number, number];

function fullyWithin(haystack: Range, needle: Range): boolean {
    return haystack[0] <= needle[0] && haystack[1] >= needle[1];
}

function isOverlapping(haystack: Range, needle: Range): boolean {
    return (needle[0] >= haystack[0] && needle[0] <= haystack[1]) 
        || (needle[1] >= haystack[0] && needle[1] <= haystack[1]);
}

async function main() {
    const stream = fs.createReadStream('./04/input.data');
    const lineReader = readline.createInterface(stream);

    let fullyContained = 0;
    let overlapping = 0;
    for await (const line of lineReader) {
        const [range1, range2] = line.split(',');
        const [from1, to1] = range1.split('-').map(Number.parseInt);
        const [from2, to2] = range2.split('-').map(Number.parseInt);
        const r1: [number, number] = [from1, to1];
        const r2: [number, number] = [from2, to2];

        // Part 1
        const isWithin = fullyWithin(r1, r2) || fullyWithin(r2, r1);
        if (isWithin) {
            fullyContained++;
        }

        // Part 2
        const hasOverlap = isOverlapping(r1, r2) || isOverlapping(r2, r1);
        overlapping += hasOverlap ? 1 : 0;
    }
    console.log('Part1:',fullyContained);
    console.log('Part2:',overlapping);

}
main();