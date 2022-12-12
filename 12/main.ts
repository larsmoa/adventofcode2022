import { assert } from "console";
import * as fs from "fs";
import * as readline from "readline";
import { start } from "repl";

type Pos = [number,number,number];

function toHeight(c: string): number {
  return c.charCodeAt(0) - 'a'.charCodeAt(0);
}

function parseMap(): { map: number[][], startPos: Pos, endPos: Pos } {
  const content = fs.readFileSync("./12/input.data", "utf8");
  const mapArray = content.split("\n");
  const columns = mapArray[0].length;

  const map: number[][] = new Array<number[]>(mapArray.length);
  let startPos: Pos = [-1, -1, 0];
  let endPos: Pos = [-1, -1, 0];

  for (let j = 0; j < mapArray.length; j++) {
    map[j] = new Array<number>(columns);
    mapArray[j].split('').forEach((v,i) => {
      switch (v) {
        case 'S':
          map[j][i] = toHeight('a');
          startPos = [i, j, 0];
          break;
        case 'E':
          map[j][i] = toHeight('z');
          endPos = [i, j, 0];
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

function *findPossibleMoves(map: number[][], visited: Pos[], position: Pos): Generator<Pos> {
  function adjustPos(dx: number, dy: number): Pos {
    return [position[0] + dx, position[1] + dy, position[2] + 1 /* counter */];
  }
  function isInBounds(p: Pos): boolean {
    return (p[0] >= 0 && p[0] < map[0].length && p[1] >= 0 && p[1] < map.length);
  }
  function isDeltaHeightOk(p: Pos) {
    // We're moving backwards
    const from = heighAt(map, p);
    const to = heighAt(map, position);
    console.log('delta ok?', from, '->', to, from > to || from + 1 === to || from === to);
    return from > to || from + 1 === to || from === to;
  }
  function isVisited(p: Pos) {
    const hasVisited = visited.some(pos => pos[0] === p[0] && pos[1] === p[1]);
    return hasVisited;
  }
  function *checkCandidate(dx: number, dy: number) {
    const p = adjustPos(dx, dy);
    if (p[0] === 0 && p[1] === 20) {
      console.log(position,'->',p, 'height:', heighAt(map, p), 'prevHeight:', heighAt(map, position));
    }
    // if (p[0] === 0 && p[1] === 20) throw Error('found');
    if (isInBounds(p) && isDeltaHeightOk(p) && !isVisited(p))
      yield p;
  }

  const offsets = [[-1,0],[1,0],[0,-1],[0,1]];
  for (const c of offsets.flatMap(x => Array.from(checkCandidate(x[0], x[1])))) {
    yield c;
  }
/*
  {
    const p = adjustPos(-1, 0);
    if (isInBounds(p) && isDeltaHeightOk(p) && !isVisited(p))
      yield p;
  }
  {
    const p = adjustPos(1, 0);
    if (isInBounds(p) && isDeltaHeightOk(p) && !isVisited(p))
      yield p;
  }
  {
    const p = adjustPos(0, -1);
    if (isInBounds(p) && isDeltaHeightOk(p) && !isVisited(p))
      yield p;
  }
  {
    const p = adjustPos(0, 1);
    if (isInBounds(p) && isDeltaHeightOk(p) && !isVisited(p))
      yield p;
  }
  */
}


function findNextBestMove(map: number[][], position: Pos): Pos {
  function adjustPos(dx: number, dy: number): Pos {
    return [position[0] + dx, position[1] + dy, Infinity];
  }
  function isInBounds(p: Pos): boolean {
    return (p[0] >= 0 && p[0] < map[0].length && p[1] >= 0 && p[1] < map.length);
  }
  const candidates : Pos[] = [];
  function checkCandidate(dx: number, dy: number) {
    const p = adjustPos(dx, dy);
    if (isInBounds(p) && map[position[1]][position[0]] - map[p[1]][p[0]] === 1) {
      candidates.push([p[0], p[1], map[p[1]][p[0]]]);
    }
  }
  checkCandidate(-1, 0);
  checkCandidate(1, 0);
  checkCandidate(0, -1);
  checkCandidate(0, 1);

  candidates.sort((a,b) => a[2] - b[2]);
  // console.log('candidates:', candidates);
  return candidates[0];
}


function findBestPath(map: number[][], startPos: Pos, endPos: Pos, _path: Pos[]): Pos[] {
  function isSamePos(a: Pos, b: Pos) {
    return a[0] === b[0] && a[1] === b[1];
  }

  let visits: Pos[] = [endPos];
  let i = 0;
  do {
    const pos = visits[i];
    // if (isSamePos(pos, startPos)) throw Error('found');
    const possibleMoves = Array.from(findPossibleMoves(map, visits, pos));
    visits = visits.concat(possibleMoves);
    i++;
  } while (i < visits.length);
  // const mapKey = (x: Pos) => `${x[0]},${x[1]}`;
  // const visitsMap = visits.reduce((map, x) => map.set(mapKey(x), x), new Map<string, Pos>());
  console.log(visits);
  const mapCounters: number[][] = map.map(row => {
    return row.map(() => Infinity);
  });
  for (const v of visits) {
    // console.log('v',v);
    // console.log('before',mapCounters[v[1]][v[0]]);
    mapCounters[v[1]][v[0]] = v[2];
    // console.log('after',mapCounters[v[1]][v[0]]);
  }
  for (let i = 0; i < mapCounters.length; ++i) {
    const row = mapCounters.at(i);
    console.log(row.map(c => {
      if (!Number.isFinite(c)) return '#';
      if (c < 10) return `${c}`;
      if (c < 36) return String.fromCharCode('a'.charCodeAt(0) + c - 10);
      if (c > 51 + 10) return '+';
      return String.fromCharCode('A'.charCodeAt(0) + c - 36);
    }).join(''), i + 1);
  }

  console.log();
  for (let j = 0; j < mapCounters.length; ++j) {
    const row = mapCounters.at(j);
    console.log(row.map((c,i) => {
      if (Number.isFinite(c))
        return String.fromCharCode('A'.charCodeAt(0) + heighAt(map, [i, j, 0]));
      return String.fromCharCode('a'.charCodeAt(0) + heighAt(map, [i, j, 0]));
    }).join(''), j + 1);
  }

  const path: Pos[] = [];
  let pos: Pos = [startPos[0], startPos[1], mapCounters[startPos[1]][startPos[0]]];  
  do {
    console.log(pos);
    path.push(pos);
    pos = findNextBestMove(mapCounters, pos);
  } while (!isSamePos(pos, endPos));
  // console.log(visits.map((v,i) => `[${i}] <${v[0]},${v[1]}> (${v[2]})`).join('\n'), index);  

  for (let j = 0; j < mapCounters.length; ++j) {
    const row = mapCounters.at(j);
    console.log(row.map((c,i) => {
      if (path.some(p => p[0] === i && p[1] === j)) {
        return String.fromCharCode('a'.charCodeAt(0) + heighAt(map, [i, j, 0]));
      }
      return '#';
    }).join(''), j + 1);
  }
  return path;

  /*
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
  */
}

async function main() {
  const { map, startPos, endPos } = parseMap();
  // console.log(map, startPos, endPos)
  const best = findBestPath(map, startPos, endPos, []);
  console.log(best.map(p => `<${p[0]},${p[1]}> (${heighAt(map, p)})`).join('\n'));
  console.log('Shortest:', best.length);


}
main();
