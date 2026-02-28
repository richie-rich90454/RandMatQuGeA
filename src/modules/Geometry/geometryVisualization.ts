// geometryVisualization.ts
// (Full updated code with fixed font sizing for canvas 2D labels)

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { CSS2DRenderer, CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import { questionArea } from "../../script.js";
import { cleanupVisualization } from "./geometryUtils.js";

/**
 * Creates a 2D canvas visualization for conic sections and other 2D shapes.
 */
function createCanvas2DVisualization(shape: string, params: any, container: HTMLElement): void {
    const canvas = document.createElement("canvas");
    canvas.id = "geometry-canvas";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.display = "block";
    container.appendChild(canvas);

    const ctx = canvas.getContext("2d")!;
    const info = document.getElementById("geometry-info")!;

    const draw = () => {
        const width = container.clientWidth;
        const height = container.clientHeight;
        canvas.width = width;
        canvas.height = height;

        ctx.clearRect(0, 0, width, height);
        ctx.save();
        ctx.translate(width / 2, height / 2);
        ctx.scale(1, -1); // flip Y so positive y is up

        // Determine visible range based on shape and parameters
        let xMin = -6, xMax = 6, yMin = -6, yMax = 6;
        if (shape === "parabola") {
            const a = params.a || 1;
            const type = params.type || "upward";
            const targetExtent = 8; // desired max value on the axis perpendicular to opening direction
            
            if (type === "upward") {
                // y = a x^2
                // Set yMax = targetExtent, yMin = -0.5 to show vertex a bit below
                yMax = targetExtent;
                yMin = -0.5;
                // Compute x range to maintain aspect: xMax = sqrt(yMax / a)
                const xHalf = Math.sqrt(yMax / a);
                xMin = -xHalf;
                xMax = xHalf;
            } else {
                // x = a y^2
                // Set xMax = targetExtent, xMin = -0.5
                xMax = targetExtent;
                xMin = -0.5;
                const yHalf = Math.sqrt(xMax / a);
                yMin = -yHalf;
                yMax = yHalf;
            }
        } else if (shape === "ellipse") {
            const a = params.a || 3;
            const b = params.b || 2;
            const centerX = params.center === "translated" ? params.h : 0;
            const centerY = params.center === "translated" ? params.k : 0;
            xMin = centerX - a - 1;
            xMax = centerX + a + 1;
            yMin = centerY - b - 1;
            yMax = centerY + b + 1;
        } else if (shape === "hyperbola") {
            const a = params.a || 3;
            const b = params.b || 2;
            const centerX = params.center === "translated" ? params.h : 0;
            const centerY = params.center === "translated" ? params.k : 0;
            const xSpan = Math.max(2 * a, 6);
            const ySpan = Math.max(2 * b, 6);
            xMin = centerX - xSpan;
            xMax = centerX + xSpan;
            yMin = centerY - ySpan;
            yMax = centerY + ySpan;
        } else if (shape === "polarConic") {
            xMin = -3;
            xMax = 3;
            yMin = -3;
            yMax = 3;
        }

        // Adjust aspect ratio for better viewing
        let dataWidth = xMax - xMin;
        let dataHeight = yMax - yMin;
        const targetRatio = 1.2; // slightly wider than tall
        if (dataHeight > dataWidth * targetRatio) {
            // Height too large, expand x range
            const newWidth = dataHeight / targetRatio;
            const centerX = (xMin + xMax) / 2;
            xMin = centerX - newWidth / 2;
            xMax = centerX + newWidth / 2;
            dataWidth = xMax - xMin;
        } else if (dataWidth > dataHeight * targetRatio) {
            // Width too large, expand y range
            const newHeight = dataWidth / targetRatio;
            const centerY = (yMin + yMax) / 2;
            yMin = centerY - newHeight / 2;
            yMax = centerY + newHeight / 2;
            dataHeight = yMax - yMin;
        }

        // Add a little extra margin (5%)
        const xMargin = dataWidth * 0.05;
        const yMargin = dataHeight * 0.05;
        xMin -= xMargin;
        xMax += xMargin;
        yMin -= yMargin;
        yMax += yMargin;

        // Scale to fit canvas
        const scaleX = width / (xMax - xMin);
        const scaleY = height / (yMax - yMin);
        const scale = Math.min(scaleX, scaleY) * 0.9; // leave margin

        ctx.scale(scale, scale);
        ctx.translate(-(xMin + xMax) / 2, -(yMin + yMax) / 2);

        // Draw axes
        ctx.beginPath();
        ctx.strokeStyle = "#99aaff";
        ctx.lineWidth = 2 / scale;
        ctx.moveTo(xMin, 0);
        ctx.lineTo(xMax, 0);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, yMin);
        ctx.lineTo(0, yMax);
        ctx.stroke();

        // Determine nice step sizes for ticks (aim for about 6-8 ticks)
        const rangeX = xMax - xMin;
        const rangeY = yMax - yMin;

        function niceStep(range: number): number {
            const roughStep = range / 7;
            const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)));
            const normalized = roughStep / magnitude;
            let step;
            if (normalized < 1.5) step = 1 * magnitude;
            else if (normalized < 3) step = 2 * magnitude;
            else if (normalized < 7) step = 5 * magnitude;
            else step = 10 * magnitude;
            return step;
        }

        const stepX = niceStep(rangeX);
        const stepY = niceStep(rangeY);

        // Font size: aim for 12 screen pixels
        const desiredScreenPx = 12;
        const worldFontSize = desiredScreenPx / scale;

        ctx.fillStyle = "#ffffff";
        ctx.font = `${worldFontSize}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.scale(1, -1); // revert Y flip for text
        ctx.fillStyle = "#cccccc";

        // X axis ticks and labels (short vertical lines crossing the x-axis)
        const firstXTick = Math.ceil(xMin / stepX) * stepX;
        for (let x = firstXTick; x <= xMax; x += stepX) {
            if (Math.abs(x) < 0.01) continue;
            ctx.beginPath();
            ctx.moveTo(x, -0.2);
            ctx.lineTo(x, 0.2);
            ctx.strokeStyle = "#99aaff";
            ctx.lineWidth = 1 / scale;
            ctx.stroke();
            const label = Math.abs(x - Math.round(x)) < 0.01 ? x.toFixed(0) : x.toFixed(2);
            ctx.fillText(label, x, -0.5);
        }

        // Y axis ticks and labels (short horizontal lines crossing the y-axis)
        const firstYTick = Math.ceil(yMin / stepY) * stepY;
        for (let y = firstYTick; y <= yMax; y += stepY) {
            if (Math.abs(y) < 0.01) continue;
            ctx.beginPath();
            ctx.moveTo(-0.2, y);
            ctx.lineTo(0.2, y);
            ctx.stroke();
            const label = Math.abs(y - Math.round(y)) < 0.01 ? y.toFixed(0) : y.toFixed(2);
            ctx.fillText(label, -0.5, y);
        }

        // Origin label
        ctx.fillText("0", -0.5, -0.5);

        ctx.scale(1, -1); // flip back for drawing shapes

        // Draw the shape
        ctx.beginPath();
        ctx.strokeStyle = "#44aaff";
        ctx.lineWidth = 3 / scale;

        switch (shape) {
            case "parabola": {
                const a = params.a || 1;
                const type = params.type || "upward";
                const steps = 200;
                ctx.beginPath();
                if (type === "upward") {
                    for (let i = 0; i <= steps; i++) {
                        const x = xMin + (i / steps) * (xMax - xMin);
                        const y = a * x * x;
                        if (i === 0) ctx.moveTo(x, y);
                        else ctx.lineTo(x, y);
                    }
                } else {
                    for (let i = 0; i <= steps; i++) {
                        const y = yMin + (i / steps) * (yMax - yMin);
                        const x = a * y * y;
                        if (i === 0) ctx.moveTo(x, y);
                        else ctx.lineTo(x, y);
                    }
                }
                ctx.stroke();
                info.textContent = `Parabola: ${type === "upward" ? "y = " + a + "x²" : "x = " + a + "y²"}`;
                break;
            }
            case "ellipse": {
                const a = params.a || 3;
                const b = params.b || 2;
                const centerX = params.center === "translated" ? params.h : 0;
                const centerY = params.center === "translated" ? params.k : 0;
                ctx.beginPath();
                for (let i = 0; i <= 200; i++) {
                    const t = (i / 200) * 2 * Math.PI;
                    const x = centerX + a * Math.cos(t);
                    const y = centerY + b * Math.sin(t);
                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.closePath();
                ctx.stroke();

                const c = Math.sqrt(Math.abs(a * a - b * b));
                ctx.fillStyle = "#ffaa44";
                ctx.beginPath();
                ctx.arc(centerX + c, centerY, 0.2, 0, 2 * Math.PI);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(centerX - c, centerY, 0.2, 0, 2 * Math.PI);
                ctx.fill();

                info.textContent = `Ellipse: a = ${a}, b = ${b}`;
                break;
            }
            case "hyperbola": {
                const a = params.a || 3;
                const b = params.b || 2;
                const centerX = params.center === "translated" ? params.h : 0;
                const centerY = params.center === "translated" ? params.k : 0;
                const steps = 200;

                // Right branch
                ctx.beginPath();
                for (let i = 0; i <= steps; i++) {
                    const t = -5 + (i / steps) * 10;
                    const x = centerX + a * Math.cosh(t);
                    const y = centerY + b * Math.sinh(t);
                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.stroke();

                // Left branch
                ctx.beginPath();
                for (let i = 0; i <= steps; i++) {
                    const t = -5 + (i / steps) * 10;
                    const x = centerX - a * Math.cosh(t);
                    const y = centerY + b * Math.sinh(t);
                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.stroke();

                // Asymptotes (dashed) – screen‑based dash length
                const dashLength = 8 / scale; // dash and gap of 8 screen pixels
                ctx.setLineDash([dashLength, dashLength]);

                const slope1 = b / a;
                const slope2 = -b / a;
                // Draw asymptote 1 (positive slope)
                ctx.beginPath();
                ctx.moveTo(xMin, centerY + slope1 * (xMin - centerX));
                ctx.lineTo(xMax, centerY + slope1 * (xMax - centerX));
                ctx.stroke();
                // Draw asymptote 2 (negative slope)
                ctx.beginPath();
                ctx.moveTo(xMin, centerY + slope2 * (xMin - centerX));
                ctx.lineTo(xMax, centerY + slope2 * (xMax - centerX));
                ctx.stroke();

                ctx.setLineDash([]); // restore solid lines

                // Foci
                const c = Math.sqrt(a * a + b * b);
                ctx.fillStyle = "#ffaa44";
                ctx.beginPath();
                ctx.arc(centerX + c, centerY, 0.2, 0, 2 * Math.PI);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(centerX - c, centerY, 0.2, 0, 2 * Math.PI);
                ctx.fill();

                info.textContent = `Hyperbola: a = ${a}, b = ${b}`;
                break;
            }
            case "polarConic": {
                ctx.fillStyle = "#ffaa44";
                ctx.beginPath();
                ctx.arc(0, 0, 0.3, 0, 2 * Math.PI);
                ctx.fill();
                info.textContent = `Polar conic: e = ${params.e}`;
                break;
            }
            default:
                return;
        }

        ctx.restore();
    };

    draw();

    const resizeObserver = new ResizeObserver(() => {
        draw();
    });
    resizeObserver.observe(container);
}

export function createVisualization(shape: string, params: any): void {
    cleanupVisualization();

    const container = document.createElement("div");
    container.id = "geometry-visualization";
    container.style.width = "100%";
    container.style.height = "120px";
    container.style.minHeight = "120px";
    container.style.maxHeight = "180px";
    container.style.marginTop = "20px";
    container.style.position = "relative";
    container.style.borderRadius = "12px";
    container.style.overflow = "hidden";
    container.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";

    const info = document.createElement("div");
    info.id = "geometry-info";
    info.style.position = "absolute";
    info.style.bottom = "10px";
    info.style.left = "10px";
    info.style.backgroundColor = "rgba(0,0,0,0.7)";
    info.style.color = "white";
    info.style.padding = "4px 12px";
    info.style.borderRadius = "20px";
    info.style.fontSize = "14px";
    info.style.pointerEvents = "none";
    container.appendChild(info);

    questionArea?.appendChild(container);

    // Determine if 2D or 3D visualization
    const twoDShapes = ["parabola", "ellipse", "hyperbola", "polarConic"];
    if (twoDShapes.includes(shape)) {
        createCanvas2DVisualization(shape, params, container);
        return;
    }

    // Otherwise, use Three.js for 3D shapes
    const canvas = document.createElement("canvas");
    canvas.id = "geometry-canvas";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.display = "block";
    container.appendChild(canvas);

    const width = container.clientWidth;
    const height = container.clientHeight;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setClearColor(0x1a1a2e);
    renderer.setPixelRatio(window.devicePixelRatio);

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(8, 8, 15);
    camera.lookAt(0, 0, 0);

    // Controls for interactivity
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = true;
    controls.maxPolarAngle = Math.PI / 2; // restrict below horizon

    // CSS2DRenderer for labels
    const labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(width, height);
    labelRenderer.domElement.style.position = "absolute";
    labelRenderer.domElement.style.top = "0";
    labelRenderer.domElement.style.left = "0";
    labelRenderer.domElement.style.pointerEvents = "none"; // allow clicks to pass through
    container.appendChild(labelRenderer.domElement);

    // Ambient and directional lights
    const ambientLight = new THREE.AmbientLight(0x404060);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(1, 2, 1);
    scene.add(dirLight);

    const backLight = new THREE.DirectionalLight(0x99aaff, 0.5);
    backLight.position.set(-1, -1, -1);
    scene.add(backLight);

    // Grid and axes
    const gridHelper = new THREE.GridHelper(20, 20, 0x99aaff, 0x334466);
    scene.add(gridHelper);

    // Axes helper with custom labels
    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);

    // Create axis labels using CSS2DRenderer
    function createAxisLabel(text: string, color: string, position: THREE.Vector3): void {
        const div = document.createElement("div");
        div.textContent = text;
        div.style.color = color;
        div.style.fontSize = "16px";
        div.style.fontWeight = "bold";
        div.style.textShadow = "1px 1px 2px black";
        const label = new CSS2DObject(div);
        label.position.copy(position);
        scene.add(label);
    }

    createAxisLabel("X", "#ff5555", new THREE.Vector3(6, 0, 0));
    createAxisLabel("Y", "#55ff55", new THREE.Vector3(0, 6, 0));
    createAxisLabel("Z", "#5555ff", new THREE.Vector3(0, 0, 6));

    let mesh: THREE.Mesh | THREE.Line | THREE.Points | THREE.Group | null = null;
    let infoText = "";

    switch (shape) {
        case "sphere":
            {
                const geometry = new THREE.SphereGeometry(params.radius || 2, 32, 16);
                const material = new THREE.MeshStandardMaterial({ color: 0xffaa44, emissive: 0x442200 });
                mesh = new THREE.Mesh(geometry, material);
                scene.add(mesh);
                infoText = `Sphere: radius = ${params.radius}`;
            }
            break;
        case "cube":
            {
                const geometry = new THREE.BoxGeometry(params.size || 2, params.size || 2, params.size || 2);
                const material = new THREE.MeshStandardMaterial({ color: 0x88ccff, emissive: 0x224466 });
                mesh = new THREE.Mesh(geometry, material);
                scene.add(mesh);
                infoText = `Cube: side = ${params.size}`;
            }
            break;
        case "cylinder":
            {
                const geometry = new THREE.CylinderGeometry(params.radius || 1.5, params.radius || 1.5, params.height || 3, 32);
                const material = new THREE.MeshStandardMaterial({ color: 0x66cc66, emissive: 0x224422 });
                mesh = new THREE.Mesh(geometry, material);
                scene.add(mesh);
                infoText = `Cylinder: radius = ${params.radius}, height = ${params.height}`;
            }
            break;
        case "cone":
            {
                const geometry = new THREE.ConeGeometry(params.radius || 1.5, params.height || 3, 32);
                const material = new THREE.MeshStandardMaterial({ color: 0xff8866, emissive: 0x442211 });
                mesh = new THREE.Mesh(geometry, material);
                scene.add(mesh);
                infoText = `Cone: radius = ${params.radius}, height = ${params.height}`;
            }
            break;
        case "pyramid":
            {
                const geometry = new THREE.ConeGeometry(params.radius || 1.5, params.height || 3, 4);
                const material = new THREE.MeshStandardMaterial({ color: 0xaa88ff, emissive: 0x332266 });
                mesh = new THREE.Mesh(geometry, material);
                scene.add(mesh);
                infoText = `Pyramid: base side ≈ ${(params.radius * 1.414).toFixed(2)}, height = ${params.height}`;
            }
            break;
        case "torus":
            {
                const geometry = new THREE.TorusGeometry(params.radius || 2, params.tube || 0.5, 16, 64);
                const material = new THREE.MeshStandardMaterial({ color: 0xff66aa, emissive: 0x442233 });
                mesh = new THREE.Mesh(geometry, material);
                scene.add(mesh);
                infoText = `Torus (circle): major radius = ${params.radius}, minor = ${params.tube}`;
            }
            break;
        case "points3D":
            {
                const points = params.points || [];
                const group = new THREE.Group();
                points.forEach((p: any) => {
                    const geometry = new THREE.SphereGeometry(0.3, 16);
                    const material = new THREE.MeshStandardMaterial({ color: 0xff3333 });
                    const sphere = new THREE.Mesh(geometry, material);
                    sphere.position.set(p.x, p.y, p.z);
                    group.add(sphere);

                    // Add coordinate label
                    const div = document.createElement("div");
                    div.textContent = `(${p.x},${p.y},${p.z})`;
                    div.style.color = "white";
                    div.style.fontSize = "12px";
                    div.style.backgroundColor = "rgba(0,0,0,0.5)";
                    div.style.padding = "2px 4px";
                    div.style.borderRadius = "4px";
                    const label = new CSS2DObject(div);
                    label.position.set(p.x, p.y + 0.5, p.z);
                    group.add(label);
                });
                scene.add(group);
                mesh = group;
                infoText = `Points in 3D`;
            }
            break;
        case "line3D":
            {
                const [x0, y0, z0] = params.point;
                const [a, b, c] = params.direction;
                const t = params.t;
                // Draw line as a segment from t-2 to t+2
                const points = [
                    new THREE.Vector3(x0 + (t - 2) * a, y0 + (t - 2) * b, z0 + (t - 2) * c),
                    new THREE.Vector3(x0 + (t + 2) * a, y0 + (t + 2) * b, z0 + (t + 2) * c)
                ];
                const geometry = new THREE.BufferGeometry().setFromPoints(points);
                const material = new THREE.LineBasicMaterial({ color: 0x44aaff });
                const line = new THREE.Line(geometry, material);
                scene.add(line);

                // Draw the point at t
                const sphereGeo = new THREE.SphereGeometry(0.3, 16);
                const sphereMat = new THREE.MeshStandardMaterial({ color: 0xffaa44 });
                const sphere = new THREE.Mesh(sphereGeo, sphereMat);
                sphere.position.set(x0 + t * a, y0 + t * b, z0 + t * c);
                scene.add(sphere);

                // Label the point
                const div = document.createElement("div");
                div.textContent = `(${(x0 + t * a).toFixed(2)}, ${(y0 + t * b).toFixed(2)}, ${(z0 + t * c).toFixed(2)})`;
                div.style.color = "white";
                div.style.fontSize = "12px";
                div.style.backgroundColor = "rgba(0,0,0,0.5)";
                div.style.padding = "2px 4px";
                div.style.borderRadius = "4px";
                const label = new CSS2DObject(div);
                label.position.set(x0 + t * a, y0 + t * b + 0.5, z0 + t * c);
                scene.add(label);

                mesh = line;
                infoText = `Line in 3D`;
            }
            break;
        case "plane3D":
            {
                const [nx, ny, nz] = params.normal;
                const d = params.d;
                const [px, py, pz] = params.point;
                // Draw the point
                const sphereGeo = new THREE.SphereGeometry(0.3, 16);
                const sphereMat = new THREE.MeshStandardMaterial({ color: 0xffaa44 });
                const sphere = new THREE.Mesh(sphereGeo, sphereMat);
                sphere.position.set(px, py, pz);
                scene.add(sphere);

                // Label the point
                const div = document.createElement("div");
                div.textContent = `(${px.toFixed(2)}, ${py.toFixed(2)}, ${pz.toFixed(2)})`;
                div.style.color = "white";
                div.style.fontSize = "12px";
                div.style.backgroundColor = "rgba(0,0,0,0.5)";
                div.style.padding = "2px 4px";
                div.style.borderRadius = "4px";
                const label = new CSS2DObject(div);
                label.position.set(px, py + 0.5, pz);
                scene.add(label);

                mesh = sphere;
                infoText = `Plane: ${nx}x + ${ny}y + ${nz}z + ${d} = 0`;
            }
            break;
        default:
            return;
    }

    if (infoText) info.textContent = infoText;

    function animate() {
        requestAnimationFrame(animate);
        controls.update(); // required for damping
        renderer.render(scene, camera);
        labelRenderer.render(scene, camera);
    }
    animate();

    const resizeObserver = new ResizeObserver(entries => {
        for (let entry of entries) {
            const { width, height } = entry.contentRect;
            renderer.setSize(width, height);
            labelRenderer.setSize(width, height);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
        }
    });
    resizeObserver.observe(container);
}