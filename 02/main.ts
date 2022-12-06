import { assert } from 'console';
import * as fs from 'fs';
import * as readline from 'readline';

const stream = fs.createReadStream('./02/input.data');
const lineReader = readline.createInterface(stream);

type Shape = 'Rock' | 'Paper' | 'Scissors';
type Outcome = 'Lose' | 'Draw' | 'Win';

const shapeScores: Record<Shape, number> = {'Rock': 1, 'Paper': 2, 'Scissors': 3 };
const winShape: Record<Shape, Shape> = {'Rock': 'Paper', 'Paper': 'Scissors', 'Scissors': 'Rock'};
const loseShape: Record<Shape, Shape> = {'Rock': 'Scissors', 'Paper': 'Rock', 'Scissors': 'Paper'};

function determineShape(opponentShape: Shape, wantedOutcome: 'X' | 'Y' | 'Z'): Shape {
    const outcome: Outcome = wantedOutcome === 'X' ? 'Lose' : wantedOutcome === 'Y' ? 'Draw' : 'Win';
    switch (true) {
        case outcome === 'Draw':
            return opponentShape;
        case outcome === 'Win':
            return winShape[opponentShape];
        default:
            return loseShape[opponentShape];
    }
}

function play(opponent: 'A' | 'B' | 'C', you: 'X' | 'Y' | 'Z'): number {
    const opponentShape: Shape = opponent === 'A' ? 'Rock' : opponent === 'B' ? 'Paper' : 'Scissors';
    const youShape = determineShape(opponentShape, you);
    const shapeScore = shapeScores[youShape];
    switch (true) {
        case (opponentShape === youShape):
            return 3 + shapeScore; // Draw
        case (opponentShape === 'Rock' && youShape === 'Scissors'):
        case (opponentShape === 'Paper' && youShape === 'Rock'):
        case (opponentShape === 'Scissors' && youShape === 'Paper'):
            return shapeScore; // Lose
        default:
            return 6 + shapeScore; // Win
    }
}

async function main() {
    let totalScore = 0;
    for await (const line of lineReader) {
        const tokens = line.split(' ');
        assert(tokens.length === 2);

        const opponent = tokens[0] as 'A' | 'B' | 'C';
        const you = tokens[1] as 'X' | 'Y' | 'Z';
        const score = play(opponent, you);
        totalScore += score;
    }
    console.log(totalScore);
}
main();