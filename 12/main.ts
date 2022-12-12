import { assert } from "console";
import * as fs from "fs";
import * as readline from "readline";

type Pos = [number,number];

function toHeight(c: string): number {
  return c.charCodeAt(0) - 'a'.charCodeAt(0);
}

function parseMap(): { map: number[][], startPos: Pos, endPos: Pos } {
  const content = fs.readFileSync("./12/input.data", "utf8");
  const mapArray = content.split("\n");
  const columns = mapArray[0].length;

  const map: number[][] = new Array<number[]>(mapArray.length);
  let startPos: Pos = [-1, -1];
  let endPos: Pos = [-1, -1];

  for (let j = 0; j < mapArray.length; j++) {
    map[j] = new Array<number>(columns);
    mapArray[j].split('').forEach((v,i) => {
      switch (v) {
        case 'S':
          map[j][i] = toHeight('a');
          startPos = [i, j];
          break;
        case 'E':
          map[j][i] = toHeight('z');
          endPos = [i, j];
          break;
        default:
          map[j][i] = toHeight(v);
          break;
      }
    });
  }
  
  return { map, startPos, endPos};
}

function heighAt(map: number[][], pos: Pos): number {
  return map[pos[1]][pos[0]];
}

function *findPossibleMoves(map: number[][], path: Pos[], position: Pos): Generator<Pos> {
  function adjustPos(dx: number, dy: number): Pos {
    return [position[0] + dx, position[1] + dy];
  }
  function isInBounds(p: Pos): boolean {
    return (p[0] >= 0 && p[0] < map[0].length && p[1] >= 0 && p[1] < map.length);
  }
  function isDeltaHeightOk(p: Pos) {
    return Math.abs(heighAt(map, p) - heighAt(map, position)) <= 1;
  }
  function isNotVisited(p: Pos) {
    return !path.some(pos => pos[0] === p[0] && pos[1] === p[1]);
  }

  {
    const p = adjustPos(-1, 0);
    if (isInBounds(p) && isDeltaHeightOk(p) && isNotVisited(p))
      yield p;
  }
  {
    const p = adjustPos(1, 0);
    if (isInBounds(p) && isDeltaHeightOk(p) && isNotVisited(p))
      yield p;
  }
  {
    const p = adjustPos(0, -1);
    if (isInBounds(p) && isDeltaHeightOk(p) && isNotVisited(p))
      yield p;
  }
  {
    const p = adjustPos(0, 1);
    if (isInBounds(p) && isDeltaHeightOk(p) && isNotVisited(p))
      yield p;
  }
}

function findBestPath(map: number[][], startPos: Pos, endPos: Pos, path: Pos[]): Pos[] {
  path = path.slice();
  path.push(startPos);
  if (startPos[0] === endPos[0] && startPos[1] === endPos[1])
    return path;

  // Find candidates
  const possibleMoves = Array.from(findPossibleMoves(map, path, startPos));
  let paths: Pos[][] = [];
  for (let i = 0; i < possibleMoves.length; i++) {
    const fullPath = findBestPath(map, possibleMoves[i], endPos, path);
    if (fullPath.length !== 0) {
      paths.push(fullPath);
    }
  }

  if (paths.length === 0) {
    return [];
  } else {
    paths.sort((a,b) => a.length - b.length);
    // console.log(paths.map(x => x.length));
    return paths[0];
  }
}

async function main() {
  const { map, startPos, endPos } = parseMap();
  console.log(map, startPos, endPos)
  const best = findBestPath(map, startPos, endPos, []);
  console.log(best.map(p => `<${p[0]},${p[1]}> (${heighAt(map, p)})`).join('\n'));
  console.log('Shortest:', best.length);


}
main();
