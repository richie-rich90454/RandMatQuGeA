import * as THREE from "three";
import {questionArea} from "../script.js";

function getMaxForDifficulty(difficulty?: string, baseMax: number=10): number{
    if(difficulty==="easy") return Math.floor(baseMax*0.5);
    if(difficulty==="hard") return Math.floor(baseMax*2);
    return baseMax;
}
function cleanupVisualization(): void{
    const existingCanvas=document.getElementById("geometry-canvas");
    if(existingCanvas) existingCanvas.remove();
    const existingInfo=document.getElementById("geometry-info");
    if(existingInfo) existingInfo.remove();
}
function createVisualization(shape: string, params: any): void{
    cleanupVisualization();
    const container=document.createElement("div");
    container.id="geometry-visualization";
    container.style.width="100%";
    container.style.height="120px";
    container.style.minHeight="120px";
    container.style.maxHeight="180px";
    container.style.marginTop="20px";
    container.style.position="relative";
    container.style.borderRadius="12px";
    container.style.overflow="hidden";
    container.style.boxShadow="0 4px 12px rgba(0,0,0,0.1)";
    const canvas=document.createElement("canvas");
    canvas.id="geometry-canvas";
    canvas.style.width="100%";
    canvas.style.height="100%";
    canvas.style.display="block";
    container.appendChild(canvas);
    const info=document.createElement("div");
    info.id="geometry-info";
    info.style.position="absolute";
    info.style.bottom="10px";
    info.style.left="10px";
    info.style.backgroundColor="rgba(0,0,0,0.7)";
    info.style.color="white";
    info.style.padding="4px 12px";
    info.style.borderRadius="20px";
    info.style.fontSize="14px";
    info.style.pointerEvents="none";
    container.appendChild(info);
    questionArea?.appendChild(container);
    const width=container.clientWidth;
    const height=container.clientHeight;
    const renderer=new THREE.WebGLRenderer({canvas, antialias: true, alpha: false});
    renderer.setSize(width, height);
    renderer.setClearColor(0x1a1a2e);
    const scene=new THREE.Scene();
    const camera=new THREE.PerspectiveCamera(45, width/height, 0.1, 1000);
    camera.position.set(8,8,15);
    camera.lookAt(0,0,0);
    const ambientLight=new THREE.AmbientLight(0x404060);
    scene.add(ambientLight);
    const dirLight=new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(1,2,1);
    scene.add(dirLight);
    const backLight=new THREE.DirectionalLight(0x99aaff, 0.5);
    backLight.position.set(-1,-1,-1);
    scene.add(backLight);
    const gridHelper=new THREE.GridHelper(20,20,0x99aaff,0x334466);
    scene.add(gridHelper);
    const axesHelper=new THREE.AxesHelper(5);
    scene.add(axesHelper);
    let geometry: THREE.BufferGeometry;
    let material: THREE.Material;
    let mesh: THREE.Mesh;
    let infoText="";
    switch(shape){
        case "circle":
            geometry=new THREE.CircleGeometry(params.radius||2,64);
            material=new THREE.MeshStandardMaterial({color:0x44aaff,side:THREE.DoubleSide,emissive:0x113366});
            mesh=new THREE.Mesh(geometry,material);
            mesh.rotation.x=-Math.PI/2;
            scene.add(mesh);
            infoText=`Circle: radius = ${params.radius}`;
            break;
        case "sphere":
            geometry=new THREE.SphereGeometry(params.radius||2,32,16);
            material=new THREE.MeshStandardMaterial({color:0xffaa44,emissive:0x442200});
            mesh=new THREE.Mesh(geometry,material);
            scene.add(mesh);
            infoText=`Sphere: radius = ${params.radius}`;
            break;
        case "cube":
            geometry=new THREE.BoxGeometry(params.size||2,params.size||2,params.size||2);
            material=new THREE.MeshStandardMaterial({color:0x88ccff,emissive:0x224466});
            mesh=new THREE.Mesh(geometry,material);
            scene.add(mesh);
            infoText=`Cube: side = ${params.size}`;
            break;
        case "cylinder":
            geometry=new THREE.CylinderGeometry(params.radius||1.5,params.radius||1.5,params.height||3,32);
            material=new THREE.MeshStandardMaterial({color:0x66cc66,emissive:0x224422});
            mesh=new THREE.Mesh(geometry,material);
            scene.add(mesh);
            infoText=`Cylinder: radius = ${params.radius}, height = ${params.height}`;
            break;
        case "cone":
            geometry=new THREE.ConeGeometry(params.radius||1.5,params.height||3,32);
            material=new THREE.MeshStandardMaterial({color:0xff8866,emissive:0x442211});
            mesh=new THREE.Mesh(geometry,material);
            scene.add(mesh);
            infoText=`Cone: radius = ${params.radius}, height = ${params.height}`;
            break;
        case "pyramid":
            geometry=new THREE.ConeGeometry(params.radius||1.5,params.height||3,4);
            material=new THREE.MeshStandardMaterial({color:0xaa88ff,emissive:0x332266});
            mesh=new THREE.Mesh(geometry,material);
            scene.add(mesh);
            infoText=`Pyramid: base side ≈ ${(params.radius*1.414).toFixed(2)}, height = ${params.height}`;
            break;
        case "torus":
            geometry=new THREE.TorusGeometry(params.radius||2,params.tube||0.5,16,64);
            material=new THREE.MeshStandardMaterial({color:0xff66aa,emissive:0x442233});
            mesh=new THREE.Mesh(geometry,material);
            scene.add(mesh);
            infoText=`Torus (circle): major radius = ${params.radius}, minor = ${params.tube}`;
            break;
        case "triangle":
            const vertices=new Float32Array([
                -params.base/2,0,0,
                params.base/2,0,0,
                0,params.height,0
            ]);
            geometry=new THREE.BufferGeometry();
            geometry.setAttribute("position",new THREE.BufferAttribute(vertices,3));
            geometry.setIndex([0,1,2]);
            geometry.computeVertexNormals();
            material=new THREE.MeshStandardMaterial({color:0xffaa44,side:THREE.DoubleSide});
            mesh=new THREE.Mesh(geometry,material);
            scene.add(mesh);
            infoText=`Triangle: base = ${params.base}, height = ${params.height}`;
            break;
        default:
            return;
    }
    info.textContent=infoText;
    function animate(){
        requestAnimationFrame(animate);
        mesh.rotation.y+=0.005;
        renderer.render(scene,camera);
    }
    animate();
    const resizeObserver=new ResizeObserver(entries=>{
        for(let entry of entries){
            const{width,height}=entry.contentRect;
            renderer.setSize(width,height);
            camera.aspect=width/height;
            camera.updateProjectionMatrix();
        }
    });
    resizeObserver.observe(container);
}
export function generateAreaCircle(difficulty?: string): void{
    if(!questionArea) return;
    questionArea.innerHTML="";
    cleanupVisualization();
    const maxRadius=getMaxForDifficulty(difficulty,10);
    const radius=Math.floor(Math.random()*maxRadius)+2;
    const area=Math.PI*radius*radius;
    const rounded=Math.round(area*100)/100;
    questionArea.innerHTML=`Find the area of a circle with radius \\( ${radius} \\). (Use \\( \\pi \\approx 3.14 \\))`;
    window.correctAnswer={
        correct: rounded.toFixed(2),
        alternate: (Math.PI*radius*radius).toFixed(2)
    };
    window.expectedFormat="Enter a decimal (e.g., 78.54)";
    createVisualization("circle",{radius});
    if(window.MathJax?.typeset) window.MathJax.typeset();
}
export function generatePythagorean(difficulty?: string): void{
    if(!questionArea) return;
    questionArea.innerHTML="";
    cleanupVisualization();
    const maxLeg=getMaxForDifficulty(difficulty,8);
    let a=Math.floor(Math.random()*maxLeg)+3;
    let b=Math.floor(Math.random()*maxLeg)+3;
    const c=Math.sqrt(a*a+b*b);
    const roundedC=Math.round(c*100)/100;
    questionArea.innerHTML=`In a right triangle, the legs are \\( ${a} \\) and \\( ${b} \\). Find the hypotenuse.`;
    window.correctAnswer={
        correct: roundedC.toFixed(2),
        alternate: Math.sqrt(a*a+b*b).toFixed(2)
    };
    window.expectedFormat="Enter a decimal (e.g., 5.83)";
    createVisualization("triangle",{base:a,height:b});
    if(window.MathJax?.typeset) window.MathJax.typeset();
}
export function generateVolumeSphere(difficulty?: string): void{
    if(!questionArea) return;
    questionArea.innerHTML="";
    cleanupVisualization();
    const maxRadius=getMaxForDifficulty(difficulty,6);
    const radius=Math.floor(Math.random()*maxRadius)+2;
    const volume=(4/3)*Math.PI*Math.pow(radius,3);
    const rounded=Math.round(volume*100)/100;
    questionArea.innerHTML=`Find the volume of a sphere with radius \\( ${radius} \\). (Use \\( \\pi \\approx 3.14 \\))`;
    window.correctAnswer={
        correct: rounded.toFixed(2),
        alternate: (4/3*Math.PI*radius**3).toFixed(2)
    };
    window.expectedFormat="Enter a decimal (e.g., 113.10)";
    createVisualization("sphere",{radius});
    if(window.MathJax?.typeset) window.MathJax.typeset();
}
export function generateAreaRectangle(difficulty?: string): void{
    if(!questionArea) return;
    questionArea.innerHTML="";
    cleanupVisualization();
    const maxDim=getMaxForDifficulty(difficulty,12);
    const length=Math.floor(Math.random()*maxDim)+3;
    const width=Math.floor(Math.random()*maxDim)+2;
    const area=length*width;
    questionArea.innerHTML=`Find the area of a rectangle with length \\( ${length} \\) and width \\( ${width} \\).`;
    window.correctAnswer={correct:area.toString(),alternate:area.toString()};
    window.expectedFormat="Enter a whole number";
    createVisualization("cube",{size:Math.min(length,width,5)});
    if(window.MathJax?.typeset) window.MathJax.typeset();
}
export function generateAreaTriangle(difficulty?: string): void{
    if(!questionArea) return;
    questionArea.innerHTML="";
    cleanupVisualization();
    const maxBase=getMaxForDifficulty(difficulty,10);
    const maxHeight=getMaxForDifficulty(difficulty,10);
    const base=Math.floor(Math.random()*maxBase)+3;
    const height=Math.floor(Math.random()*maxHeight)+3;
    const area=0.5*base*height;
    const rounded=Math.round(area*100)/100;
    questionArea.innerHTML=`Find the area of a triangle with base \\( ${base} \\) and height \\( ${height} \\).`;
    window.correctAnswer={
        correct: rounded.toFixed(2),
        alternate: (0.5*base*height).toFixed(2)
    };
    window.expectedFormat="Enter a decimal (e.g., 12.5)";
    createVisualization("triangle",{base,height});
    if(window.MathJax?.typeset) window.MathJax.typeset();
}
export function generatePerimeter(difficulty?: string): void{
    if(!questionArea) return;
    questionArea.innerHTML="";
    cleanupVisualization();
    const shape=Math.random()>0.5?"rectangle":"triangle";
    if(shape==="rectangle"){
        const maxDim=getMaxForDifficulty(difficulty,10);
        const l=Math.floor(Math.random()*maxDim)+3;
        const w=Math.floor(Math.random()*maxDim)+2;
        const perimeter=2*(l+w);
        questionArea.innerHTML=`Find the perimeter of a rectangle with length \\( ${l} \\) and width \\( ${w} \\).`;
        window.correctAnswer={correct:perimeter.toString(),alternate:perimeter.toString()};
        createVisualization("cube",{size:Math.min(l,w,4)});
    }
    else{
        const maxSide=getMaxForDifficulty(difficulty,8);
        const a=Math.floor(Math.random()*maxSide)+3;
        const b=Math.floor(Math.random()*maxSide)+3;
        const c=Math.floor(Math.random()*maxSide)+3;
        const perimeter=a+b+c;
        questionArea.innerHTML=`Find the perimeter of a triangle with sides \\( ${a}, ${b}, ${c} \\).`;
        window.correctAnswer={correct:perimeter.toString(),alternate:perimeter.toString()};
        createVisualization("triangle",{base:a,height:b});
    }
    window.expectedFormat="Enter a whole number";
    if(window.MathJax?.typeset) window.MathJax.typeset();
}
export function generateVolumeCylinder(difficulty?: string): void{
    if(!questionArea) return;
    questionArea.innerHTML="";
    cleanupVisualization();
    const maxRadius=getMaxForDifficulty(difficulty,5);
    const maxHeight=getMaxForDifficulty(difficulty,8);
    const r=Math.floor(Math.random()*maxRadius)+2;
    const h=Math.floor(Math.random()*maxHeight)+3;
    const volume=Math.PI*r*r*h;
    const rounded=Math.round(volume*100)/100;
    questionArea.innerHTML=`Find the volume of a cylinder with radius \\( ${r} \\) and height \\( ${h} \\). (Use \\( \\pi \\approx 3.14 \\))`;
    window.correctAnswer={
        correct: rounded.toFixed(2),
        alternate: (Math.PI*r*r*h).toFixed(2)
    };
    window.expectedFormat="Enter a decimal";
    createVisualization("cylinder",{radius:r,height:h});
    if(window.MathJax?.typeset) window.MathJax.typeset();
}
export function generateSurfaceAreaCube(difficulty?: string): void{
    if(!questionArea) return;
    questionArea.innerHTML="";
    cleanupVisualization();
    const maxSide=getMaxForDifficulty(difficulty,6);
    const s=Math.floor(Math.random()*maxSide)+2;
    const area=6*s*s;
    questionArea.innerHTML=`Find the surface area of a cube with side \\( ${s} \\).`;
    window.correctAnswer={correct:area.toString(),alternate:area.toString()};
    window.expectedFormat="Enter a whole number";
    createVisualization("cube",{size:s});
    if(window.MathJax?.typeset) window.MathJax.typeset();
}
export function generateSimilarTriangles(difficulty?: string): void{
    if(!questionArea) return;
    questionArea.innerHTML="";
    cleanupVisualization();
    const maxScale=getMaxForDifficulty(difficulty,4);
    const scale=Math.floor(Math.random()*maxScale)+2;
    const side1=Math.floor(Math.random()*5)+3;
    const side2=side1*scale;
    questionArea.innerHTML=`Triangle A has a side of length \\( ${side1} \\). Triangle B is similar with scale factor \\( ${scale} \\). Find the corresponding side in triangle B.`;
    window.correctAnswer={correct:side2.toString(),alternate:side2.toString()};
    window.expectedFormat="Enter a whole number";
    createVisualization("triangle",{base:side1,height:side1});
    if(window.MathJax?.typeset) window.MathJax.typeset();
}
export function generateArcLength(difficulty?: string): void{
    if(!questionArea) return;
    questionArea.innerHTML="";
    cleanupVisualization();
    const maxRadius=getMaxForDifficulty(difficulty,8);
    const r=Math.floor(Math.random()*maxRadius)+3;
    const angle=Math.floor(Math.random()*90)+30;
    const arc=(angle/360)*2*Math.PI*r;
    const rounded=Math.round(arc*100)/100;
    questionArea.innerHTML=`Find the length of an arc with central angle \\( ${angle}^\\circ \\) in a circle of radius \\( ${r} \\).`;
    window.correctAnswer={
        correct: rounded.toFixed(2),
        alternate: ((angle/360)*2*Math.PI*r).toFixed(2)
    };
    window.expectedFormat="Enter a decimal";
    createVisualization("torus",{radius:r,tube:0.2});
    if(window.MathJax?.typeset) window.MathJax.typeset();
}
export function generateSectorArea(difficulty?: string): void{
    if(!questionArea) return;
    questionArea.innerHTML="";
    cleanupVisualization();
    const maxRadius=getMaxForDifficulty(difficulty,8);
    const r=Math.floor(Math.random()*maxRadius)+3;
    const angle=Math.floor(Math.random()*90)+30;
    const area=(angle/360)*Math.PI*r*r;
    const rounded=Math.round(area*100)/100;
    questionArea.innerHTML=`Find the area of a sector with central angle \\( ${angle}^\\circ \\) in a circle of radius \\( ${r} \\).`;
    window.correctAnswer={
        correct: rounded.toFixed(2),
        alternate: ((angle/360)*Math.PI*r*r).toFixed(2)
    };
    window.expectedFormat="Enter a decimal";
    createVisualization("circle",{radius:r});
    if(window.MathJax?.typeset) window.MathJax.typeset();
}
export function generateVolumeCone(difficulty?: string): void{
    if(!questionArea) return;
    questionArea.innerHTML="";
    cleanupVisualization();
    const maxRadius=getMaxForDifficulty(difficulty,5);
    const maxHeight=getMaxForDifficulty(difficulty,8);
    const r=Math.floor(Math.random()*maxRadius)+2;
    const h=Math.floor(Math.random()*maxHeight)+3;
    const volume=(1/3)*Math.PI*r*r*h;
    const rounded=Math.round(volume*100)/100;
    questionArea.innerHTML=`Find the volume of a cone with radius \\( ${r} \\) and height \\( ${h} \\).`;
    window.correctAnswer={
        correct: rounded.toFixed(2),
        alternate: ((1/3)*Math.PI*r*r*h).toFixed(2)
    };
    window.expectedFormat="Enter a decimal";
    createVisualization("cone",{radius:r,height:h});
    if(window.MathJax?.typeset) window.MathJax.typeset();
}
export function generateVolumePyramid(difficulty?: string): void{
    if(!questionArea) return;
    questionArea.innerHTML="";
    cleanupVisualization();
    const maxBase=getMaxForDifficulty(difficulty,6);
    const base=Math.floor(Math.random()*maxBase)+3;
    const height=Math.floor(Math.random()*maxBase)+4;
    const volume=(1/3)*base*base*height;
    const rounded=Math.round(volume*100)/100;
    questionArea.innerHTML=`Find the volume of a square pyramid with base side \\( ${base} \\) and height \\( ${height} \\).`;
    window.correctAnswer={
        correct: rounded.toFixed(2),
        alternate: ((1/3)*base*base*height).toFixed(2)
    };
    window.expectedFormat="Enter a decimal";
    createVisualization("pyramid",{radius:base/2,height});
    if(window.MathJax?.typeset) window.MathJax.typeset();
}
export function generateDistanceFormula(difficulty?: string): void{
    if(!questionArea) return;
    questionArea.innerHTML="";
    cleanupVisualization();
    const maxCoord=getMaxForDifficulty(difficulty,8);
    const x1=Math.floor(Math.random()*maxCoord)-4;
    const y1=Math.floor(Math.random()*maxCoord)-4;
    const x2=Math.floor(Math.random()*maxCoord)-4;
    const y2=Math.floor(Math.random()*maxCoord)-4;
    const dist=Math.sqrt((x2-x1)**2+(y2-y1)**2);
    const rounded=Math.round(dist*100)/100;
    questionArea.innerHTML=`Find the distance between points \\( (${x1},${y1}) \\) and \\( (${x2},${y2}) \\).`;
    window.correctAnswer={
        correct: rounded.toFixed(2),
        alternate: Math.sqrt((x2-x1)**2+(y2-y1)**2).toFixed(2)
    };
    window.expectedFormat="Enter a decimal";
    if(window.MathJax?.typeset) window.MathJax.typeset();
}
export function generateAngleRelations(_difficulty?: string): void{
    if(!questionArea) return;
    questionArea.innerHTML="";
    cleanupVisualization();
    const angle=Math.floor(Math.random()*60)+20;
    const comp=90-angle;
    const supp=180-angle;
    questionArea.innerHTML=`An angle measures \\( ${angle}^\\circ \\). Find its complementary and supplementary angles.`;
    window.correctAnswer={
        correct: `complement: ${comp}, supplement: ${supp}`,
        alternate: `${comp}, ${supp}`
    };
    window.expectedFormat="Enter as \"complement: X, supplement: Y\"";
    if(window.MathJax?.typeset) window.MathJax.typeset();
}
export function generateTriangleClassification(_difficulty?: string): void{
    if(!questionArea) return;
    questionArea.innerHTML="";
    cleanupVisualization();
    const sides=[
        [3,4,5],
        [5,5,5],
        [5,5,8],
        [7,8,9]
    ];
    const pick=sides[Math.floor(Math.random()*sides.length)];
    const [a,b,c]=pick;
    let type="";
    if(a===b&&b===c) type="equilateral";
    else if(a===b||b===c||a===c) type="isosceles";
    else type="scalene";
    questionArea.innerHTML=`Classify the triangle with sides \\( ${a}, ${b}, ${c} \\).`;
    window.correctAnswer={correct:type,alternate:type};
    window.expectedFormat="Enter \"equilateral\", \"isosceles\", or \"scalene\"";
    createVisualization("triangle",{base:a,height:b});
    if(window.MathJax?.typeset) window.MathJax.typeset();
}