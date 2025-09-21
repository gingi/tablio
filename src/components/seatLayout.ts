export type TableShape = "oval" | "circle" | "rect";

export interface SeatLayout {
    width: number;
    height: number;
    positions: { x: number; y: number }[]; // relative to center (0,0) origin
}

// Generate evenly spaced points along an ellipse perimeter using arc-length sampling
function ellipsePoints(width: number, height: number, count: number): { x: number; y: number }[] {
    const xRadius = width / 2;
    const yRadius = height / 2;
    const samples = 720;
    const pts: { t: number; x: number; y: number; s: number }[] = [];
    let prevX = xRadius;
    let prevY = 0;
    let acc = 0;
    for (let i = 0; i <= samples; i++) {
        const t = (i / samples) * 2 * Math.PI;
        const x = Math.cos(t) * xRadius;
        const y = Math.sin(t) * yRadius;
        if (i > 0) acc += Math.hypot(x - prevX, y - prevY);
        pts.push({ t, x, y, s: acc });
        prevX = x;
        prevY = y;
    }
    const total = acc;
    const seg = total / count;
    const out: { x: number; y: number }[] = [];
    for (let i = 0; i < count; i++) {
        const target = i * seg;
        let chosen = pts[0];
        for (let j = 1; j < pts.length; j++) {
            if (pts[j].s >= target) {
                chosen = pts[j];
                break;
            }
        }
        out.push({ x: chosen.x, y: chosen.y });
    }
    return out;
}

// Distribute points around a perfect circle
function circlePoints(diameter: number, count: number): { x: number; y: number }[] {
    const r = diameter / 2;
    const pts: { x: number; y: number }[] = [];
    for (let i = 0; i < count; i++) {
        const t = (i / count) * 2 * Math.PI;
        pts.push({ x: Math.cos(t) * r, y: Math.sin(t) * r });
    }
    return pts;
}

// Evenly space seats along rectangle perimeter using arc-length parameterization
function rectPoints(width: number, height: number, count: number): { x: number; y: number }[] {
    // Revised layout: for <=20 seats: place seats closer (offset 12) with one centered on each short side.
    if (count <= 20 && count >= 4) {
        const halfW = width / 2;
        const halfH = height / 2;
        const offset = 12; // pull seats in closer to table
        const leftX = -halfW - offset;
        const rightX = halfW + offset;
        const topY = -halfH - offset;
        const bottomY = halfH + offset;
        const remaining = count - 2; // side seats accounted for
        const topSeats = Math.ceil(remaining / 2);
        const bottomSeats = remaining - topSeats;
        const positions: { x: number; y: number }[] = [];
        for (let i = 1; i <= topSeats; i++) {
            const frac = i / (topSeats + 1);
            positions.push({ x: -halfW + frac * width, y: topY });
        }
        positions.push({ x: rightX, y: 0 });
        for (let i = 1; i <= bottomSeats; i++) {
            const frac = i / (bottomSeats + 1);
            positions.push({ x: halfW - frac * width, y: bottomY });
        }
        positions.push({ x: leftX, y: 0 });
        return positions;
    }
    const halfW = width / 2;
    const halfH = height / 2;
    const perimeter = 2 * (width + height);
    const seg = perimeter / count;
    const pts: { x: number; y: number }[] = [];
    for (let i = 0; i < count; i++) {
        const d = i * seg; // distance from starting corner (top-center starting is nicer?)
        // We'll start at top center and go clockwise
        let dist = d + width / 2; // shift so seat 0 at top center
        let x = 0;
        let y = 0;
        const w = width;
        const h = height;
        const edges = [w, h, w, h]; // top, right, bottom, left lengths
        for (let e = 0; e < 4; e++) {
            const elen = edges[e];
            if (dist <= elen) {
                switch (e) {
                    case 0: // top edge left->right
                        x = -halfW + dist;
                        y = -halfH;
                        break;
                    case 1: // right edge top->bottom
                        x = halfW;
                        y = -halfH + dist;
                        break;
                    case 2: // bottom edge right->left
                        x = halfW - dist;
                        y = halfH;
                        break;
                    case 3: // left edge bottom->top
                        x = -halfW;
                        y = halfH - dist;
                        break;
                }
                break;
            } else {
                dist -= elen;
            }
        }
        pts.push({ x, y });
    }
    return pts;
}

export function generateSeatLayout(shape: TableShape, seatCount: number): SeatLayout {
    // Base dimensions per shape (these sizes mirror existing oval sizing style)
    if (seatCount < 1) return { width: 0, height: 0, positions: [] };
    switch (shape) {
        case "circle": {
            const diameter = 180; // consistent circle
            const positions = circlePoints(diameter + 28, seatCount); // include ring offset similar to oval
            return { width: diameter, height: diameter, positions };
        }
        case "rect": {
            const width = 260;
            const height = 120;
            // Reduce extra ring spacing for general rectangle layout
            const positions = rectPoints(width + 24, height + 24, seatCount);
            return { width, height, positions };
        }
        case "oval":
        default: {
            const width = 240;
            const height = 160;
            const positions = ellipsePoints(width + 28, height + 28, seatCount);
            return { width, height, positions };
        }
    }
}
