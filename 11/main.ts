import { assert, profileEnd } from "console";
import * as fs from "fs";
import * as readline from "readline";

type Monkey = {
  id: number;
  items: bigint[];
  operation: string;
  throwTestDivisibleBy: bigint;
  throwToIfTrue: number;
  throwToIfFalse: number;
  totalInspectedCount: number;
};

function parseMonkeys(): Monkey[] {
  const content = fs.readFileSync("./11/input.data", "utf8");
  const monkeysStr = content.split("\n");
  const monkeys: Monkey[] = [];
  do {
    const monkey = monkeysStr.splice(0, 7);
    const id = Number.parseInt(monkey[0].split(" ")[1]);
    const startingItems = monkey[1]
      .split(":")[1]
      .split(",")
      .map((x) => BigInt(Number.parseInt(x)));
    const operation = monkey[2].split(":")[1].trim();
    const throwTestDivisibleBy = BigInt(Number.parseInt(
      monkey[3].split(":")[1].split(" ").reverse()[0]
    ));
    const throwToIfTrue = Number.parseInt(monkey[4].split(" ").reverse()[0]);
    const throwToIfFalse = Number.parseInt(monkey[5].split(" ").reverse()[0]);

    const m: Monkey = {
      id,
      items: startingItems,
      operation,
      throwTestDivisibleBy,
      throwToIfTrue,
      throwToIfFalse,
      totalInspectedCount: 0,
    };
    monkeys.push(m);
  } while (monkeysStr.length > 0);

  return monkeys;
}

function applyOperation(op: string, worryLevel: bigint): bigint {
  function determineValue(value: string): bigint {
    return value === "old" ? worryLevel : BigInt(Number.parseInt(value));
  }
  const [left, operator, right] = op.substring(6).split(" ");
  const leftValue = determineValue(left);
  const rightValue = determineValue(right);
  if (operator === "+") {
    return leftValue + rightValue;
  } else if (operator === "*") {
    return leftValue * rightValue;
  } else {
    assert(false);
  }
}

function simulateMonkeys(monkeys: Monkey[], worryReductionFactor: bigint) {
  for (const m of monkeys) {
    const { items, throwTestDivisibleBy, throwToIfFalse, throwToIfTrue } = m;
    for (let i = 0; i < items.length; i++) {
      const worryLevel = applyOperation(m.operation, items[i]) / worryReductionFactor;
      if (worryLevel % throwTestDivisibleBy === BigInt(0)) {
        monkeys[throwToIfTrue].items.push(worryLevel);
      } else {
        monkeys[throwToIfFalse].items.push(worryLevel);
      }
    }
    m.totalInspectedCount += items.length;
    items.splice(0);
  }
}

async function main() {
  {
    const monkeys = parseMonkeys();

    console.log("Part 1:");
    for (let i = 0; i < 20; i++) {
      simulateMonkeys(monkeys, BigInt(3));
    }
    const mostActive = monkeys
      .map((x) => x.totalInspectedCount)
      .sort((a, b) => b - a)
      .slice(0, 2);
    const mostActiveProduct = mostActive.reduce((x, product) => product * x, 1);
    console.log(mostActiveProduct);
  }
  console.log("Part 2:");
  {
    const monkeys = parseMonkeys();
    for (let i = 1; i <= 1000; i++) {
      if (i % 100 === 0)
        console.log(i);
      simulateMonkeys(monkeys, BigInt(1));
      if (new Set([1, 20, 1000]).has(i))
        console.log(monkeys.map(x => x.totalInspectedCount));
    }
    const mostActive = monkeys
      .map((x) => x.totalInspectedCount)
      .sort((a, b) => b - a)
      .slice(0, 2);
    const mostActiveProduct = mostActive.reduce((x, product) => product * x, 1);
    console.log(mostActive, mostActiveProduct);
  }
}
main();
