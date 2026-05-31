import p5 from 'p5';
import { Person } from './person';
import type { Coordinate } from './types';

const _lastMousePosition: Coordinate | null = null;
const people: Person[] = [];

export const canvasDimensions: {
    width: number;
    height: number;
} = {
    width: 800,
    height: 600,
};

new p5((p: p5) => {
    p.setup = () => {
        p.createCanvas(canvasDimensions.width, canvasDimensions.height);
        p.background(255);
        p.mousePressed = () => {
            people.push(new Person({ x: p.mouseX, y: p.mouseY }));
        };
    };

    p.draw = () => {
        p.background(255);

        for (const person of people) {
            person.simulate();
            person.draw(p);
        }
    };
});
