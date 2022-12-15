import * as fs from 'fs';
import * as readline from "readline";

function dist(a: [number,number], b: [number, number]): number {
    const manhattenDistance = Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
    return manhattenDistance;
}

function drawMap(map: Map<number, number[]>, min: [number, number], max: [number, number]) {
    for (let j = min[1]; j <= max[1]; j++) {
        const row = extractRow(map, j);
        const line = Array.from('.'.repeat(max[0] - min[0]) + ` ${j}`);
        for (const col of row) {
            line[col - min[0]] = '#';
        }
        console.log(line.join(''));
    }
    /*
    const coordinates = Array.from(map.keys()).map(s => {
        const coordinate: [number, number] = parseKey(s);
        return coordinate;
    });

    [...new Array(max[1] - min[1]).keys()].forEach((_, j) => {
        const row = min[1] + j;
        const line = Array.from('.'.repeat(max[0] - min[0]) + ` ${row}`);
        for (let col = min[0]; col < max[0]; col++) {
            let i = col - min[0];
            if (map.has(key([col, row]))) {
                line[i] = map.get(key([col, row]));
            }
        }
        console.log(line.join(''));
    });
    */
}

function key(p: [number,number]) {
    return (p[0] << 32) | (p[1]);
    // return JSON.stringify(p);
}

function parseKey(key: number): [number, number] {
    const x = (key >> 32);  
    const y = (key && 0xffffffff);
    return [x,y];
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
    // const deltaMax = Math.ceil(beaconSignalDistance);
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

        /*
        for (let i = -(beaconSignalDistance - j); i <= (beaconSignalDistance - j); i++) {
            const p : [number, number] = [sx + i, sy + j];
            const k = key(p);
            // if (dist(p, [sx, sy]) <= beaconSignalDistance) {
            //     if (!map.has(k)) {
            //         map.set(k, '#');
            //     }
            // }
        }
        */
    // }
    // map.set(key(signal), 'S');
    // map.set(key(beacon), 'B');

// }

async function main() {
    const stream = fs.createReadStream("./15/input.data");
    const lineReader = readline.createInterface(stream);

    const coveredCoordinates = new Map<number, number[]>();
    const beaconsByRow = new Map<number, Set<number>>();
    // addCoordinate(coveredCoordinates, [8,7], [2,10]);
    for await (const line of lineReader) {
        const split = line.split(/[\s:,=]/);
        const sx = Number.parseInt(split[3]);
        const sy = Number.parseInt(split[6]);
        const bx = Number.parseInt(split[13]);
        const by = Number.parseInt(split[16]);
        console.log('add', [sx,sy], 'and', [bx, by]);
        addCoordinate(coveredCoordinates, [sx, sy], [bx, by]);
        beaconsByRow.has(by) ? beaconsByRow.get(by).add(bx) : beaconsByRow.set(by, new Set([bx]));
    }
    
    // drawMap(coveredCoordinates, [-10, -10], [35, 35]);
    const row = 2000000;
    const cols = extractRow(coveredCoordinates, row);
    const beaconsOnRow = beaconsByRow.get(row)?.size ?? 0;
    console.log('Part 1:', cols.size - beaconsOnRow);
}
main();