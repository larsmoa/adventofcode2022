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

async function main() {
  const { map, startPos, endPos } = parseMap();
  console.log(map, startPos, endPos)

}
main();
