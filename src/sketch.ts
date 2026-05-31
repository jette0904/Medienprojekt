import p5 from 'p5';

type Coordinate = { x: number; y: number };

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

    constructor(color: Color, thickness: number = 10000, fadeTime: number = 10000) {
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
    drawCoordinate: Coordinate;
    private growthSpeed: number;
    children: TreeNode[];
    parent: TreeNode | null = null;

    private controlPoint1: Coordinate;
    private controlPoint2: Coordinate;

    constructor(coordinate: Coordinate, parent: TreeNode | null = null, growthSpeed: number = 0.02) {
        this.coordinate = coordinate;
        this.drawCoordinate = parent ? { x: parent.drawCoordinate.x, y: parent.drawCoordinate.y } : { x: coordinate.x, y: coordinate.y };
        this.children = [];
        this.parent = parent;
        this.growthSpeed = growthSpeed;

        // Zufällige Kontrollpunkte zwischen Start und Ende
        const start = parent ? parent.coordinate : coordinate;
        const end = coordinate;
        const bending = 25;
        this.controlPoint1 = {
            x: start.x + (end.x - start.x) * 0.33 + (Math.random() - 0.5) * bending,
            y: start.y + (end.y - start.y) * 0.33 + (Math.random() - 0.5) * bending,
        };
        this.controlPoint2 = {
            x: start.x + (end.x - start.x) * 0.66 + (Math.random() - 0.5) * bending,
            y: start.y + (end.y - start.y) * 0.66 + (Math.random() - 0.5) * bending,
        };
    }

    private t: number = 0; // Fortschritt entlang der Kurve (0 = Start, 1 = Ende)

    draw(p: p5) {
        if (!this.shrinking && this.t < 1) {
            // ← nur wachsen wenn nicht shrinking
            this.t = Math.min(1, this.t + this.growthSpeed);
        }

        if (this.parent) {
            const start = this.parent.drawCoordinate;
            const cp1 = this.controlPoint1;
            const cp2 = this.controlPoint2;
            const end = this.coordinate;

            // Kurve als viele kleine Segmente zeichnen, nur bis t
            const steps = 20;
            for (let i = 1; i <= Math.floor(this.t * steps); i++) {
                const t0 = (i - 1) / steps;
                const t1 = i / steps;

                const x0 = (1 - t0) ** 3 * start.x + 3 * (1 - t0) ** 2 * t0 * cp1.x + 3 * (1 - t0) * t0 * t0 * cp2.x + t0 ** 3 * end.x;
                const y0 = (1 - t0) ** 3 * start.y + 3 * (1 - t0) ** 2 * t0 * cp1.y + 3 * (1 - t0) * t0 * t0 * cp2.y + t0 ** 3 * end.y;
                const x1 = (1 - t1) ** 3 * start.x + 3 * (1 - t1) ** 2 * t1 * cp1.x + 3 * (1 - t1) * t1 * t1 * cp2.x + t1 ** 3 * end.x;
                const y1 = (1 - t1) ** 3 * start.y + 3 * (1 - t1) ** 2 * t1 * cp1.y + 3 * (1 - t1) * t1 * t1 * cp2.y + t1 ** 3 * end.y;

                p.line(x0, y0, x1, y1);
            }

            // drawCoordinate aktuell halten für Kinder
            this.drawCoordinate = {
                x: (1 - this.t) ** 3 * start.x + 3 * (1 - this.t) ** 2 * this.t * cp1.x + 3 * (1 - this.t) * this.t * this.t * cp2.x + this.t ** 3 * end.x,
                y: (1 - this.t) ** 3 * start.y + 3 * (1 - this.t) ** 2 * this.t * cp1.y + 3 * (1 - this.t) * this.t * this.t * cp2.y + this.t ** 3 * end.y,
            };
        }

        for (const child of this.children) {
            child.draw(p);
        }
    }

    isFullyGrown(): boolean {
        return this.t >= 1;
    }

    getLeafNodes(): TreeNode[] {
        if (this.children.length === 0) {
            return this.isFullyGrown() ? [this] : [];
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

    private shrinking: boolean = false;

    shrink(): number {
        let totalChildLen =0
        for (const child of this.children) {
            totalChildLen +=child.shrink();
        }
        if (totalChildLen > 0) return this.t + totalChildLen
        
        this.shrinking = true;
        this.t = Math.max(0, this.t - this.growthSpeed);
        return this.t
    }

    isFullyShrunk(): boolean {
        if (this.parent && this.t > 0) return false; // dieser Node noch nicht fertig
        for (const child of this.children) {
            if (!child.isFullyShrunk()) return false; // ein Kind noch nicht fertig
        }
        return true;
    }
}

class Tree {
    private color: Color;
    private growthRate: number;
    private maxDepth: number;
    coordinate: Coordinate;
    root: TreeNode;
    lastGrowthTime: number;

    constructor(rootCoordinate: Coordinate, color: Color, growthRate: number = 500, maxDepth: number = 8) {
        this.coordinate = rootCoordinate
        this.root = new TreeNode(rootCoordinate);
        this.color = color;
        this.maxDepth = maxDepth;
        this.growthRate = growthRate;
        this.lastGrowthTime = Date.now();
    }

    draw(p: p5) {
        const shouldGrow = this.root.getDepth() < this.maxDepth;

        p.stroke(this.color.r, this.color.g, this.color.b);
        p.strokeWeight(3);
        this.root.draw(p);

        const timeSinceLastGrowth = Date.now() - this.lastGrowthTime;
        if (shouldGrow && this.root.getLeafNodes().length > 0 && timeSinceLastGrowth >= this.growthRate) {
            this.grow();
            this.lastGrowthTime = Date.now();
        }
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
                const speed = 0.001 + Math.random() * 0.006;
                leaf.children.push(new TreeNode(newCoordinate, leaf, speed));
            }
        }
        this.lastGrowthTime = Date.now();
    }
    shrink() {
        this.root.shrink();
    }

    isGone(): boolean {
        return this.root.isFullyShrunk();
    }
}

let lastMousePosition: Coordinate | null = null;
let line: Line | null = null;
let trees: Tree[] = [];

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
            line = new Line(color, 30, 10000);
        }

        if (isMoving) {
            line.add(currentPosition);
        }

        line.draw(p)   
        
        const isCurrentPosition = (tree: Tree): boolean => {return tree.coordinate.x == currentPosition.x && tree.coordinate.y == currentPosition.y}
        
        if (!isMoving) {
            let currentTree = trees.find(tree => isCurrentPosition(tree))

            if (!currentTree) {
                const tree = new Tree({ x: p.mouseX, y: p.mouseY }, line.color, 1000);
                trees.push(tree)

            }
        }
        
        for (const tree of trees) {
            if (!isCurrentPosition(tree)) {
                tree.shrink()
            }
            tree.draw(p)
        }
        trees = trees.filter(tree => !tree.isGone()|| isCurrentPosition(tree))
    };
});
