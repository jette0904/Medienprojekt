export type Coordinate = { x: number; y: number };

export function isSameCoord(a: Coordinate, b: Coordinate): boolean {
    return Math.abs(a.x - b.x) < 0.01 && Math.abs(a.y - b.y) < 0.01;
}

export type Color = { r: number; g: number; b: number; alpha?: number };
export function randomColor(): Color {
    return {
        r: Math.floor(Math.random() * 256),
        g: Math.floor(Math.random() * 256),
        b: Math.floor(Math.random() * 256),
        alpha: 255,
    };
}
