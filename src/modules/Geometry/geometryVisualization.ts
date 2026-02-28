import * as THREE from "three";
import {questionArea} from "../../script.js";
import {cleanupVisualization} from "./geometryUtils.js";

export function createVisualization(shape: string, params: any): void{
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