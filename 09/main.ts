import * as fs from "fs";
import * as readline from "readline";

type Position = [x: number, y: number];
const movements: Record<string, Position> = { 'R': [1,0], 'L': [-1,0], 'U': [0,1], 'D': [0,-1] };

function printBoard(snake: Position[]) {
    const minX = snake.reduce((min, p) => Math.min(p[0], min), 0);
    const maxX = snake.reduce((max, p) => Math.max(p[0], max), -Infinity);
    const minY = snake.reduce((min, p) => Math.min(p[1], min), 0);
    const maxY = snake.reduce((max, p) => Math.max(p[1], max), -Infinity);

    for (let j = maxY; j >= minY; j--) {
        let line = '';
        for (let i = minX; i <= maxX; i++) {
            let visited = false;
            for (let k = 0; k < snake.length; ++k) { 
                const [px, py] = snake[k];
                if (px === i && py === j) {
                    visited = true;
                    line = `${line}${k}`;
                    break;
                }
            }
            if (!visited)
                line = line + ((i === 0 && j === 0) ? 's' : '-');
        }
        console.log(line);
        
    }
}

function moveTail(tail: Position, head: Position): Position {
    const [tailX, tailY] = tail;
    const [headX, headY] = head;
    
    const distX = Math.abs(headX - tailX);
    const distY = Math.abs(headY - tailY);
    const distance = distX + distY;
    if (distance <= 1)
        return tail;
    if (distance === 2 && distX === 1 && distY === 1)
        return tail;

    return [tailX + Math.sign(headX - tailX), tailY + Math.sign(headY - tailY)]; 
}

async function runSimulation(numKnots: number) {
    const stream = fs.createReadStream("./09/input.data");
    const lineReader = readline.createInterface(stream);
  
    let head: Position = [0,0];
    let knots: Position[] = new Array<Position>(numKnots).fill([0, 0]);
    const visitedTail = new Set<string>();
    for await (const line of lineReader) {
      const [direction, stepsStr] = line.split(" ");
      const steps = Number.parseInt(stepsStr);
      const [dX, dY] = movements[direction];

      for (let i = 0; i < steps; i++) {
          head[0] += dX;
          head[1] += dY;
          knots[0] = moveTail(knots[0], head);
          for (let j = 1; j < numKnots; ++j) {
            knots[j] = moveTail(knots[j], knots[j - 1]);
          }
          visitedTail.add(`${knots[numKnots - 1]},${knots[numKnots - 1]}`);
      }
    //   console.log(direction, steps);
    //   printBoard([head, ...knots]);
    //   console.log();
    }
    console.log('Tail visited:', visitedTail.size);
  }

async function main() {
    console.log('Part 1:');
    await runSimulation(1);
    console.log('Part 2:');
    await runSimulation(9);
}
main();

