import { assert } from "console";
import * as fs from "fs";
import * as readline from "readline";

type Worrylevel = {
  factors: number[];
  constant: number;
}

function isDivisibleBy(left: Worrylevel, divisor: number): boolean {
  // ab mod n = [(a mod n)(b mod n)] mod n.
  const factorMod = left.factors.reduce((mod, x) => mod * (x % divisor), 1) % divisor;
  // (a + b) mod n = [(a mod n) + (b mod n)] mod n.
  const mod = (factorMod + left.constant % divisor) % divisor;
  assert(mod === ((left.factors.reduce((val,x) => val*x, 1) + left.constant) % divisor));

  return mod === 0;
}

type Monkey = {
  id: number;
  items: Worrylevel[];
  operation: string;
  throwTestDivisibleBy: number;
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
      .map((x) => Number.parseInt(x));
    const operation = monkey[2].split(":")[1].trim();
    const throwTestDivisibleBy = Number.parseInt(
      monkey[3].split(":")[1].split(" ").reverse()[0]
    );
    const throwToIfTrue = Number.parseInt(monkey[4].split(" ").reverse()[0]);
    const throwToIfFalse = Number.parseInt(monkey[5].split(" ").reverse()[0]);

    const m: Monkey = {
      id,
      items: startingItems.map(x => ({constant: 0, factors: [x]})),
      operation,
      throwTestDivisibleBy,
      throwToIfTrue,
      throwToIfFalse,
      totalInspectedCount: 0,
    };
    // console.log(m);
    monkeys.push(m);
  } while (monkeysStr.length > 0);

  return monkeys;
}

function applyOperation(op: string, worryLevel: Worrylevel) {
  const [left, operator, right] = op.substring(6).split(" ");
  assert(left === 'old', 'left === old');
  switch (operator) {
    case '*':
      if (right === 'old') {
        worryLevel.factors.concat(worryLevel.factors);
      } else {
        worryLevel.factors.push(Number.parseInt(right));
      }
      break;
    case '+':
      assert(right !== 'old', 'right !== old');
      worryLevel.constant += Number.parseInt(right);
      break;
    default:
      assert(false, 'Unknown operator "%s"', operator);
  }
}
/*
(a*b*c + d) / e = a*b*c/e + d/e

X % E == 0 -> (A*B*C) % E + D % E == E 
 */


function simulateMonkeys(monkeys: Monkey[], worryReductionFactor: number) {
  assert(worryReductionFactor === 1); // Broken when doing part 2
  for (const m of monkeys) {
    const { items, throwTestDivisibleBy, throwToIfFalse, throwToIfTrue } = m;
    // console.log('Monkey', m.id, 'divisible', throwTestDivisibleBy);
    for (let i = 0; i < items.length; i++) {
      const worrylevel = items[i];
      applyOperation(m.operation, worrylevel);
      // console.log('  item', i, items[i], 'is divisible?', isDivisibleBy(worrylevel, throwTestDivisibleBy));
      if (isDivisibleBy(worrylevel, throwTestDivisibleBy)) {
        monkeys[throwToIfTrue].items.push(worrylevel);
      console.log('  item', i, items[i], 'is divisible by',throwTestDivisibleBy, '?', isDivisibleBy(worrylevel, throwTestDivisibleBy));
        // console.log('Throw', worryLevel, 'to', throwToIfTrue);
      } else {
        monkeys[throwToIfFalse].items.push(worrylevel);
        // console.log('Throw', worryLevel, 'to', throwToIfFalse);
      }
    }
    m.totalInspectedCount += items.length;
    items.splice(0);
  }
}

async function main() {
  // {
  //   const monkeys = parseMonkeys();

  //   console.log("Part 1:");
  //   for (let i = 0; i < 20; i++) {
  //     simulateMonkeys(monkeys, 3);
  //   }
  //   const mostActive = monkeys
  //     .map((x) => x.totalInspectedCount)
  //     .sort((a, b) => b - a)
  //     .slice(0, 2);
  //   const mostActiveProduct = mostActive.reduce((x, product) => product * x, 1);
  //   console.log(mostActiveProduct);
  // }
  console.log("Part 2:");
  {
    const monkeys = parseMonkeys();
    console.log(
    monkeys.map(m => m.items.map(x => {
      return { constant: x.constant, factors: x.factors.slice().sort().join('') };
    })));
    console.log();
    console.log();
    console.log();    

    for (let i = 1; i <= 20; i++) {
      simulateMonkeys(monkeys, 1);

      // console.log(i);
      // console.log(
      //   monkeys.map(m => m.items.map(x => {
      //     return { constant: x.constant, factors: x.factors.slice().sort().join('') };
      //   })));      console.log();
      // console.log();
      // console.log();
      if (new Set([1, 2, 20, 1000]).has(i))
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
