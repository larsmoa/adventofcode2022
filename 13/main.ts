import { assert } from "console";
import * as fs from "fs";
import { parse } from "path";

type Packet = (number | Packet)[];

function isPacket(p: number | Packet): p is Packet {
  return Array.isArray(p);
}

function stringify(p: Packet) {
  return JSON.stringify(p, null, 0).replace("\n", "");
}

function parsePacket(s: string): Packet {
  const parsed = JSON.parse(s) as Packet;
  return parsed;
}

function isCorrectlyOrderedRecurse(
  left: Packet,
  right: Packet,
  leftIdx: number,
  rightIdx: number
): "correct" | "incorrect" | "unknown" {
  if (left.length === leftIdx && right.length > rightIdx) return "correct";
  if (left.length > leftIdx && right.length === rightIdx) return "incorrect";
  if (left.length === leftIdx && right.length === rightIdx) {
    return "unknown";
  }

  const l = left[leftIdx];
  const r = right[rightIdx];
  // If both values are integers, the lower integer should come first. If the left integer is lower than the right integer, the inputs are in the right order. If the left integer is higher than the right integer, the inputs are not in the right order. Otherwise, the inputs are the same integer; continue checking the next part of the input.
  if (!isPacket(l) && !isPacket(r)) {
    if (l < r) return "correct";
    if (l > r) return "incorrect";
    return isCorrectlyOrderedRecurse(left, right, leftIdx + 1, rightIdx + 1);
  }
  // If both values are lists, compare the first value of each list, then the second value, and so on. If the left list runs out of items first, the inputs are in the right order. If the right list runs out of items first, the inputs are not in the right order. If the lists are the same length and no comparison makes a decision about the order, continue checking the next part of the input.
  else if (isPacket(l) && isPacket(r)) {
    const result = isCorrectlyOrderedRecurse(l, r, 0, 0);
    if (result !== "unknown") {
      return result;
    }
    return isCorrectlyOrderedRecurse(left, right, leftIdx + 1, rightIdx + 1);
  }
  // If exactly one value is an integer, convert the integer to a list which contains that integer as its only value, then retry the comparison. For example, if comparing [0,0,0] and 2, convert the right value to [2] (a list containing 2); the result is then found by instead comparing [0,0,0] and [2].
  else if (isPacket(l) && !isPacket(r)) {
    const result = isCorrectlyOrderedRecurse(l, [r], 0, 0);
    if (result !== "unknown") {
      return result;
    }
    return isCorrectlyOrderedRecurse(left, right, leftIdx + 1, rightIdx + 1);
  } else if (!isPacket(l) && isPacket(r)) {
    const result = isCorrectlyOrderedRecurse([l], r, 0, 0);
    if (result !== "unknown") {
      return result;
    }
    return isCorrectlyOrderedRecurse(left, right, leftIdx + 1, rightIdx + 1);
  } else {
    assert(false, "UNEXPE");
  }
}

function isCorrectlyOrdered(leftPacket: Packet, rightPacket: Packet): boolean {
  const result = isCorrectlyOrderedRecurse(leftPacket, rightPacket, 0, 0);

  switch (result) {
    case "correct":
      return true;
    case "incorrect":
      return false;
    default:
      assert(
        false,
        'Unexpected result for "%s" and "%s"',
        stringify(leftPacket),
        stringify(rightPacket)
      );
  }
}

let testIndex = 0;
function test(actual: boolean, expected: boolean) {
  testIndex++;
  if (actual !== expected) {
    console.error(
      `[Test case #${testIndex}: Expected: ${expected}, but got ${actual}`
    );
  } else {
    console.error(`[Test case #${testIndex}: success`);
  }
}

async function main() {
  const content = fs.readFileSync("./13/input.data", "utf8");
  const lines = content.split("\n").filter((_, i) => (i + 1) % 3 !== 0); // Every third line is blank

  let correctOrderedIndexSums = 0;
  for (let i = 0; i < lines.length; i += 2) {
    const packetIndex = i / 2 + 1;
    const packet1 = parsePacket(lines[i]);
    const packet2 = parsePacket(lines[i + 1]);

    const correctOrder = isCorrectlyOrdered(packet1, packet2);
    if (correctOrder) {
      correctOrderedIndexSums += packetIndex;
    }
  }
  console.log("Part 1:", correctOrderedIndexSums);

  const divider1: Packet = [[2]];
  const divider2: Packet = [[6]];
  const packets = lines.map((l) => parsePacket(l)).concat([divider1, divider2]);
  const packetsWithScores = packets.map((p, index) => {
    // Compare package with all other packages
    let score = 0;
    for (let i = 0; i < packets.length; ++i) {
      if (i === index) continue;

      const isPacketBefore = isCorrectlyOrdered(p, packets[i]);
      score += isPacketBefore ? 1 : 0;
    }
    return { package: p, score };
  });
  packetsWithScores.sort((a, b) => b.score - a.score);
  const divider1Index =
    packetsWithScores.findIndex(
      (x) => stringify(x.package) === stringify(divider1)
    ) + 1;
  const divider2Index =
    packetsWithScores.findIndex(
      (x) => stringify(x.package) === stringify(divider2)
    ) + 1;
  console.log(
    "Part 2 - divider1:",
    divider1Index,
    "divider2:",
    divider2Index,
    "dividerProduct:",
    divider1Index * divider2Index
  );
}
main();
