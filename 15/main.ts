import * as fs from 'fs';
import * as readline from "readline";

function dist(a: [number,number], b: [number, number]): number {
    const manhattenDistance = Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
    return manhattenDistance;
}

function drawMap(map: Map<number, number[]>, min: [number, number], max: [number, number]) {
    console.log(Array.from(new Array(max[0] - min[0]).keys()).map((_, i) => Math.floor(i / 10)).join(''));
    console.log(Array.from(new Array(max[0] - min[0]).keys()).map((_, i) => Math.floor(i % 10)).join(''));
    for (let j = min[1]; j <= max[1]; j++) {
        const row = extractRow(map, j);
        const line = Array.from('.'.repeat(max[0] - min[0] + 1) + ` ${j}`);
        for (const col of row) {
            if (col >= min[0] && col <= max[0]) 
                line[col - min[0]] = '#';
        }
        console.log(line.join(''));
    }
}

function extractRow(map: Map<number, number[]>, rowIndex: number): Set<number> {
    const cols = new Set<number>();
    if (map.has(rowIndex)) {
        const ranges = map.get(rowIndex);
        for (let r = 0; r < ranges.length; r += 2) {
            for (let i = ranges[r]; i <= ranges[r + 1]; i++) {
                cols.add(i);
            }
        }
    }
    return cols;
}

function addCoordinate(map: Map<number, number[]>, signal: [number, number], beacon: [number, number]) {
    const [sx, sy] = signal;
    const [bx, by] = beacon;
    const beaconSignalDistance = dist([sx, sy], [bx, by]);
    const delta = Math.floor(beaconSignalDistance);
    console.log('Distance', beaconSignalDistance);

    for (let j = -delta; j <= delta; j++) {
        const y = sy + j;
        const minX = sx - (delta - Math.abs(j));
        const maxX = sx + (delta - Math.abs(j));
        if (map.has(y)) {
            const ranges = map.get(y);
            ranges.push(minX, maxX);
            map.set(y, ranges);
        } else {
            map.set(y, [minX, maxX]);
        }
    }
}

type Signal = { signal: [number, number], beacon: [number, number], signalReach: number };


const notFoundSignal: Signal = { signal: [-1, -1], beacon: [-1, -1], signalReach: -1 };
function findClosest(signals: Signal[], p: [number, number]): Signal {
    const best = signals
        .filter(s => dist(s.signal, p) <= s.signalReach)
        .map(s => {
            return { signal: s, distance: dist(s.signal, p) };
        })
        .reduce((best, candidate) => {
            if (best.distance > candidate.distance) {
                return candidate;
            }
            return best;
        }, { signal: notFoundSignal, distance: Infinity });
    return best.signal;
}

function findNextRowNotCoveredBySignal(p: [number, number], signal: Signal, searchSpace: number): [number, number] {
    /*
            012345678
            ...###...           0
            ..#####..           1
            .#######.           2
            #########           3
          # ####S#### #         4
            #########           5
            .#######.           6
            ..#####..           7
            ...###...           8
      signal = [4,4], signalReach = 5
      searchSpace = 8
      
      p = [3,0] -> result = [6,0]
      p = [2,1] -> result = [7,1]
      p = [7,1] -> result = [8,1]
      p = [8,2] -> result = [0,6]
    */
   const [px, py] = p;
   const [sx, sy] = signal.signal;
   const signalReach = signal.signalReach;
   const vDist = Math.abs(py - sy);
   const hReach = signalReach - vDist;
   
   const nextPx = Math.max(px + 1, sx + hReach + 1);
   if (nextPx > searchSpace) {
    // In theory it might be possible to jump several lines, but not worth it.
    return [0, py + 1]; 
   }
   return [nextPx, py];
}


async function main() {
    const stream = fs.createReadStream("./15/input.data");
    const lineReader = readline.createInterface(stream);

    const coveredCoordinates = new Map<number, number[]>();
    const beaconsByRow = new Map<number, Set<number>>();
    const signals: Signal[] = [];
    for await (const line of lineReader) {
        const split = line.split(/[\s:,=]/);
        const sx = Number.parseInt(split[3]);
        const sy = Number.parseInt(split[6]);
        const bx = Number.parseInt(split[13]);
        const by = Number.parseInt(split[16]);
        console.log('add', [sx,sy], 'and', [bx, by]);
        addCoordinate(coveredCoordinates, [sx, sy], [bx, by]);
        beaconsByRow.has(by) ? beaconsByRow.get(by).add(bx) : beaconsByRow.set(by, new Set([bx]));
        signals.push({ signal: [sx, sy], beacon: [bx, by], signalReach: dist([bx, by], [sx, sy])});
    }
    
    const row = 10;
    const cols = extractRow(coveredCoordinates, row);
    const beaconsOnRow = beaconsByRow.get(row)?.size ?? 0;
    console.log('Part 1:', cols.size - beaconsOnRow);

    const searchSpace = 4_000_000;
    let j = 0;
    let i = 0;
    let lastReportedJ = 0;
    do {
        // Find closest beacon
        const closest = findClosest(signals, [i, j]);
        if (closest.signalReach === -1) {
            console.log('Part 2 - found:', [i,j], 'tuning frequency:', i*4000000 + j);
            return;
        } else {
            // Skip forward!
            [i,j] = findNextRowNotCoveredBySignal([i,j], closest, searchSpace);
        }
        if (lastReportedJ !== j && (j - lastReportedJ) > 10000) {
            console.log(j);
            lastReportedJ = j;
        }
    } while (i <= searchSpace && j <= searchSpace);
}
main();
