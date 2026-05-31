import type p5 from 'p5';
import type { Color, Coordinate } from './types';

type LineSegment = {
    coordinate: Coordinate;
    timestamp: number;
};

export class Line {
    private thickness: number;
    private fadeTime: number;
    color: Color;

    private points: LineSegment[] = [];

    constructor(color: Color, thickness: number = 10, fadeTime: number = 10000) {
        this.color = color;
        this.thickness = thickness;
        this.fadeTime = fadeTime;
    }

    draw(p: p5) {
        // remove old points that have faded out
        const currentTime = Date.now();
        this.points = this.points.filter(point => currentTime - point.timestamp <= this.fadeTime);

        // draw remaining points with fading effect
        p.noFill();
        p.strokeWeight(this.thickness);
        for (let i = 1; i < this.points.length; i++) {
            const prev = this.points[i - 1]!;
            const curr = this.points[i]!;
            const age = currentTime - curr.timestamp;
            const fadedAlpha = 255 * (1 - age / this.fadeTime);
            p.stroke(this.color.r, this.color.g, this.color.b, fadedAlpha);
            p.line(prev.coordinate.x, prev.coordinate.y, curr.coordinate.x, curr.coordinate.y);
        }
    }

    add(coordinate: Coordinate) {
        const newLineSegment: LineSegment = { coordinate, timestamp: Date.now() };
        this.points.push(newLineSegment);
    }
}
