import { Console } from "console";
import * as fs from "fs";
import * as readline from "readline";

function signal(sums: number[], cycle: number): number {
  return sums[cycle] * cycle;
}

async function runInstructions() {
  const stream = fs.createReadStream("./10/input.data");
  const lineReader = readline.createInterface(stream);

  let sum = 1;
  let sums: number[] = [];
  let cycle = 1;
  for await (const line of lineReader) {
    console.log("------------------------");
    console.log(cycle, line.toUpperCase());
    if (line.startsWith("addx")) {
      const value = Number.parseInt(line.substring(5));
      sums[cycle] = sum;
      console.log(cycle, sums[cycle]);
      cycle++;
      sums[cycle] = sum;
      console.log(cycle, sums[cycle]);
      cycle++;
      sum += value;
    } else {
      sums[cycle] = sum;
      console.log(cycle, sums[cycle]);
      cycle++;
    }
  }

  // PART 1
  let signalSum = 0;
  let i = 20;
  do {
    console.log(`${i} x ${sums[i]} =`, signal(sums, i));
    signalSum += signal(sums, i);
    i += 40;
  } while (i < sums.length);
  console.log("Sum:", signalSum);

  // PART 2
  i = 0;
  do {
    let row = '';
    for (let j = 0; j < 40; j++) {
        const spritePos = sums[i + j];
        row = row + ((j >= spritePos  && j < spritePos + 3) ? '#' : '.');
    }
    console.log(row);
    i += 40;
  } while (i < sums.length);

}

async function main() {
  console.log("Part 1:");
  await runInstructions();
}
main();
