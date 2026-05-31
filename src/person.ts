import type p5 from 'p5';
import { Line } from './line.ts';
import { canvasDimensions } from './sketch.ts';
import { Tree } from './tree.ts';
import { type Color, type Coordinate, isSameCoord, randomColor } from './types.ts';

export class Person {
    coordinate: Coordinate;
    hasMoved: boolean = false;
    trees: Tree[] = [];
    line: Line;
    color: Color;

    lastStepTimestamp: number;
    speedInMs = 300;

    private preferredAngle: number = Math.random() * 2 * Math.PI;
    private angleVariance: number = Math.PI / 4;

    constructor(coordinate: Coordinate) {
        this.coordinate = coordinate;
        this.color = randomColor();
        this.line = new Line(this.color, 10);
        this.lastStepTimestamp = Date.now();
    }

    simulate() {
        if (Date.now() - this.lastStepTimestamp <= this.speedInMs) return;
        this.lastStepTimestamp = Date.now();

        // slowly drift preferred direction
        this.preferredAngle += (Math.random() - 0.5) * 0.3;

        const p = Math.random() * 100;
        if (p <= 1) this.hasMoved = !this.hasMoved;
        if (!this.hasMoved) return;

        this.coordinate = movePosition(this.coordinate, this.preferredAngle, this.angleVariance);
    }

    setPosition(coordinate: Coordinate) {
        this.hasMoved = isSameCoord(this.coordinate, coordinate);
        this.coordinate = coordinate;
    }

    draw(p: p5) {
        if (this.hasMoved) {
            this.line.add(this.coordinate);
        }

        this.line.draw(p);

        const isCurrentPosition = (tree: Tree): boolean => {
            return isSameCoord(this.coordinate, tree.coordinate);
        };

        if (!this.hasMoved) {
            const currentTree = this.trees.find(tree => isCurrentPosition(tree));

            if (!currentTree) {
                const tree = new Tree({ x: this.coordinate.x, y: this.coordinate.y }, this.line.color, 1000);
                this.trees.push(tree);
            }
        }

        for (const tree of this.trees) {
            if (!isCurrentPosition(tree)) {
                tree.shrink();
            }
            tree.draw(p);
        }

        this.trees = this.trees.filter(tree => !tree.isGone() || isCurrentPosition(tree));
    }
}

function movePosition(pos: Coordinate, preferredAngle: number, angleVariance: number, schrittweite: number = 5): Coordinate {
    const winkel = preferredAngle + (Math.random() - 0.5) * 2 * angleVariance;
    const distanz = Math.random() * schrittweite;

    return {
        x: Math.max(0, Math.min(canvasDimensions.width, pos.x + Math.cos(winkel) * distanz)),
        y: Math.max(0, Math.min(canvasDimensions.height, pos.y + Math.sin(winkel) * distanz)),
    };
}
