import { assert } from "console";
import * as fs from "fs";
import * as readline from "readline";

type Worrylevel = {
  factors: number[];
  constant: number;
  pow: number;
}
function asNumber(worrylevel: Worrylevel): number {
  const value = (worrylevel.factors.reduce((val,x) => val*x, 1) + worrylevel.constant);
  assert(value < Math.pow(2, 53),' Out of bounds');
  return value;
}

function isDivisibleBy(left: Worrylevel, divisor: number): boolean {
  // assert(left.pow === 1, 'POW NOT SUPPORTED YET');

  // Input: (a*b*c*d + e)^n mod m
  // -> ((a*b*c*d + e) mod n) * (a*b*c*d + e) mod n)) mod m

  // ab mod n = [(a mod n)(b mod n)] mod n.
  const factorMod = left.factors.reduce((mod, x) => mod * (x % divisor), 1) % divisor;
  // (a + b) mod n = [(a mod n) + (b mod n)] mod n.
  const A = (factorMod + left.constant % divisor) % divisor;
  // a^n mod m = (a * a^(n-1)) mod m = (a mod m)(a^(n-1) mod m) mod m
  // a^(n-1) mod m = (a * a^(n-2)) mod m = (a mod m)*(a^(n-2) mod m) mod m
  // A = a mod m
  // a^n mod m = A * ( A * (a^(n-2) mod m) mod m ) mod m
  // a^n mod m = A * ( A * ( A * ( a^(n-3) mod m ) mod m ) mod m ) mod m
  // a^4 mod m = A * ( A * ( A * A ) mod m ) mod m ) mod m
  // etc
  let mod = A;
  for (let i = 1; i < left.pow; i++) {
    mod = (A * mod) % divisor;
  }

  // Sanity check
  // const term = (left.factors.reduce((val,x) => val*BigInt(x), BigInt(1)) + BigInt(left.constant));
  // let value = term;
  // for (let i = 1; i < left.pow; i++) {
  //   value *= term;
  //   console.log(value);
  // }
  // assert(BigInt(mod) === value % BigInt(divisor), BigInt(mod), value % BigInt(divisor), value);

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
      items: startingItems.map(x => ({constant: 0, factors: [x], pow: 1})),
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

// (a*b*c*d + e) * 15
// (a*b*c*d + e) * (a*b*c*d + e) -> (a*b*c*d)^2 + a*b*c*d*2*e + e^2 - fuck

function applyOperation(op: string, worryLevel: Worrylevel) {
  const [left, operator, right] = op.substring(6).split(" ");
  assert(left === 'old', 'left === old');
  switch (operator) {
    case '*':
      if (right === 'old') {
        // console.log('===================== POW ============================');
        worryLevel.pow += 1;
        // worryLevel.factors.concat(worryLevel.factors);
      } else {
        const multiplier = Number.parseInt(right);
        worryLevel.factors.push(multiplier);
        worryLevel.constant *= multiplier;
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
      // console.log('  item', i, items[i], 'is divisible by',throwTestDivisibleBy, '?', isDivisibleBy(worrylevel, throwTestDivisibleBy));
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
      return { constant: x.constant, factors: x.factors.slice().sort().join(','), pow: x.pow };
    })));
    console.log();
    console.log();
    console.log();    

    for (let i = 1; i <= 20; i++) {
      simulateMonkeys(monkeys, 1);

      console.log(i);
      console.log(
        monkeys.map((m,i) => m.items.map(x => {
          return { id: i, constant: x.constant, factors: x.factors.slice().sort().join(','), pow: x.pow };
        })));      console.log();
      console.log();
      console.log();
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
