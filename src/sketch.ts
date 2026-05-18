import p5 from 'p5';

type Coordinate = { x: number; y: number };
function _randomCoordinate(origin: Coordinate, maxDistance: number): Coordinate {
    const angle = Math.random() * 2 * Math.PI;
    const distance = Math.random() * maxDistance;
    return {
        x: origin.x + distance * Math.cos(angle),
        y: origin.y + distance * Math.sin(angle),
    };
}

type Color = { r: number; g: number; b: number; alpha?: number };
function randomColor(): Color {
    return {
        r: Math.floor(Math.random() * 256),
        g: Math.floor(Math.random() * 256),
        b: Math.floor(Math.random() * 256),
        alpha: 255,
    };
}

type LineSegment = {
    coordinate: Coordinate;
    timestamp: number;
};
class Line {
    private thickness: number;
    private fadeTime: number;
    color: Color;

    private points: LineSegment[] = [];

    constructor(color: Color, thickness: number = 5, fadeTime: number = 5000) {
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

class TreeNode {
    coordinate: Coordinate;
    children: TreeNode[];
    parent: TreeNode | null = null;

    constructor(coordinate: Coordinate, parent: TreeNode | null = null) {
        this.coordinate = coordinate;
        this.children = [];
        this.parent = parent;
    }

    draw(p: p5) {
        p.strokeWeight(4);
        p.point(this.coordinate.x, this.coordinate.y);
        for (const child of this.children) {
            p.strokeWeight(1);
            p.line(this.coordinate.x, this.coordinate.y, child.coordinate.x, child.coordinate.y);
            child.draw(p);
        }
    }

    getLeafNodes(): TreeNode[] {
        if (this.children.length === 0) {
            return [this];
        }
        let leafNodes: TreeNode[] = [];
        for (const child of this.children) {
            leafNodes = leafNodes.concat(child.getLeafNodes());
        }
        return leafNodes;
    }

    getDepth(): number {
        if (this.children.length === 0) {
            return 1;
        }
        return 1 + Math.max(...this.children.map(child => child.getDepth()));
    }
}

class Tree {
    private color: Color;
    private growthRate: number;
    private maxDepth: number;

    root: TreeNode;
    lastGrowthTime: number;

    constructor(rootCoordinate: Coordinate, color: Color, growthRate: number = 500, maxDepth: number = 5) {
        this.root = new TreeNode(rootCoordinate);
        this.color = color;
        this.maxDepth = maxDepth;
        this.growthRate = growthRate;
        this.lastGrowthTime = Date.now();
    }

    draw(p: p5) {
        const shouldGrow = Date.now() - this.lastGrowthTime >= this.growthRate && this.root.getDepth() < this.maxDepth;
        if (shouldGrow) {
            this.grow();
        }

        p.stroke(this.color.r, this.color.g, this.color.b);
        this.root.draw(p);
    }

    private grow() {
        const leafNodes = this.root.getLeafNodes();
        for (const leaf of leafNodes) {
            const incomingAngle = leaf.parent ? Math.atan2(leaf.coordinate.y - leaf.parent.coordinate.y, leaf.coordinate.x - leaf.parent.coordinate.x) : Math.random() * Math.PI * 2;

            const branchCount = Math.floor(Math.random() * 3) + 1;
            const spreadArc = Math.PI / 2;
            const jitter = Math.PI / 12;

            for (let i = 0; i < branchCount; i++) {
                const evenAngle = branchCount === 1 ? incomingAngle : incomingAngle - spreadArc / 2 + (spreadArc * i) / (branchCount - 1);
                const angle = evenAngle + (Math.random() - 0.5) * jitter;
                const length = 30 + Math.random() * 20;

                const newCoordinate: Coordinate = {
                    x: leaf.coordinate.x + Math.cos(angle) * length,
                    y: leaf.coordinate.y + Math.sin(angle) * length,
                };
                leaf.children.push(new TreeNode(newCoordinate, leaf));
            }
        }
        this.lastGrowthTime = Date.now();
    }
}

let lastMousePosition: Coordinate | null = null;
let line: Line | null = null;
let tree: Tree | null = null;

new p5((p: p5) => {
    p.setup = () => {
        p.createCanvas(800, 600);
        p.background(20);
    };

    p.draw = () => {
        p.background(20);

        let isMoving = false;
        if (lastMousePosition) {
            isMoving = lastMousePosition.x !== p.mouseX || lastMousePosition.y !== p.mouseY;
        }

        const currentPosition: Coordinate = { x: p.mouseX, y: p.mouseY };
        lastMousePosition = currentPosition;

        if (line === null) {
            const color = randomColor();
            line = new Line(color, 5, 5000);
        }

        line.add(currentPosition);
        line.draw(p);

        if (isMoving) {
            tree = null;
            return;
        }

        if (!tree) {
            tree = new Tree({ x: p.mouseX, y: p.mouseY }, line.color, 1000);
        }
        tree.draw(p);
    };
});
