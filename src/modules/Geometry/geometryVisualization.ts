/**
 * Geometry visualizations using Canvas 2D and Three.js.
 * @fileoverview Renders 2D (parabola, ellipse, hyperbola, polar conic, circle, triangle) and 3D (sphere, cube, cylinder, cone, pyramid, torus, points, line, plane) shapes. Cleans up previous visualizations and creates new ones in a dedicated container.
 * @date 2026-03-15
 */
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { CSS2DRenderer, CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import { questionArea } from "../../script.js";

let currentRenderer: THREE.WebGLRenderer|null=null;
let currentLabelRenderer: CSS2DRenderer|null=null;
let currentScene: THREE.Scene|null=null;
//@ts-ignore
let currentCamera: THREE.PerspectiveCamera|null=null;
let currentControls: OrbitControls|null=null;
let currentAnimationFrame: number=0;

/**
 * Computes a nice step size for axis ticks based on range.
 * @param range - total range of data
 * @returns step size
 */
function niceStep(range: number): number{
	const roughStep=range/7;
	const magnitude=Math.pow(10,Math.floor(Math.log10(roughStep)));
	const normalized=roughStep/magnitude;
	let step;
	if (normalized<1.5) step=1*magnitude;
	else if (normalized<3) step=2*magnitude;
	else if (normalized<7) step=5*magnitude;
	else step=10*magnitude;
	return step;
}

/**
 * Creates a 2D canvas visualization for a given shape.
 * @param shape - shape type (parabola, ellipse, hyperbola, polarConic, circle, triangle)
 * @param params - parameters (e.g., a, b, type, radius, base, height)
 * @param container - DOM container element
 */
function createCanvas2DVisualization(shape: string, params: any, container: HTMLElement): void{
	const canvas=document.createElement("canvas");
	canvas.id="geometry-canvas";
	canvas.style.width="100%";
	canvas.style.height="100%";
	canvas.style.display="block";
	container.appendChild(canvas);
	const ctx=canvas.getContext("2d")!;
	const info=document.getElementById("geometry-info")!;
	const draw=()=>{
		const width=container.clientWidth;
		const height=container.clientHeight;
		if (width===0||height===0){
			setTimeout(draw,50);
			return;
		}
		canvas.width=width;
		canvas.height=height;
		ctx.clearRect(0,0,width,height);
		let xMin=-6,xMax=6,yMin=-6,yMax=6;
		if (shape==="parabola"){
			const a=params.a||1;
			const type=params.type||"upward";
			const targetExtent=8;
			if (type==="upward"){
				yMax=targetExtent;
				yMin=-0.5;
				const xHalf=Math.sqrt(yMax/a);
				xMin=-xHalf;
				xMax=xHalf;
			}else{
				xMax=targetExtent;
				xMin=-0.5;
				const yHalf=Math.sqrt(xMax/a);
				yMin=-yHalf;
				yMax=yHalf;
			}
		}else if (shape==="ellipse"){
			const a=params.a||3;
			const b=params.b||2;
			const centerX=params.center==="translated"?params.h:0;
			const centerY=params.center==="translated"?params.k:0;
			xMin=centerX-a-1;
			xMax=centerX+a+1;
			yMin=centerY-b-1;
			yMax=centerY+b+1;
		}else if (shape==="hyperbola"){
			const a=params.a||3;
			const b=params.b||2;
			const centerX=params.center==="translated"?params.h:0;
			const centerY=params.center==="translated"?params.k:0;
			const xSpan=Math.max(2*a,6);
			const ySpan=Math.max(2*b,6);
			xMin=centerX-xSpan;
			xMax=centerX+xSpan;
			yMin=centerY-ySpan;
			yMax=centerY+ySpan;
		}else if (shape==="polarConic"){
			xMin=-3;
			xMax=3;
			yMin=-3;
			yMax=3;
		}else if (shape==="circle"){
			const radius=params.radius||2;
			xMin=-radius-1;
			xMax=radius+1;
			yMin=-radius-1;
			yMax=radius+1;
		}else if (shape==="triangle"){
			const base=params.base||3;
			const height=params.height||3;
			xMin=-1;
			xMax=base+1;
			yMin=-1;
			yMax=height+1;
		}
		let dataWidth=xMax-xMin;
		let dataHeight=yMax-yMin;
		const targetRatio=1.2;
		if (dataHeight>dataWidth*targetRatio){
			const newWidth=dataHeight/targetRatio;
			const centerX=(xMin+xMax)/2;
			xMin=centerX-newWidth/2;
			xMax=centerX+newWidth/2;
			dataWidth=xMax-xMin;
		}else if (dataWidth>dataHeight*targetRatio){
			const newHeight=dataWidth/targetRatio;
			const centerY=(yMin+yMax)/2;
			yMin=centerY-newHeight/2;
			yMax=centerY+newHeight/2;
			dataHeight=yMax-yMin;
		}
		const xMargin=dataWidth*0.05;
		const yMargin=dataHeight*0.05;
		xMin-=xMargin;
		xMax+=xMargin;
		yMin-=yMargin;
		yMax+=yMargin;
		const offsetX=(xMin+xMax)/2;
		const offsetY=(yMin+yMax)/2;
		const scaleX=width/(xMax-xMin);
		const scaleY=height/(yMax-yMin);
		const scale=Math.min(scaleX,scaleY)*0.9;
		ctx.save();
		ctx.translate(width/2,height/2);
		ctx.scale(scale,-scale);
		ctx.translate(-offsetX,-offsetY);
		ctx.beginPath();
		ctx.strokeStyle="#99aaff";
		ctx.lineWidth=2/scale;
		ctx.moveTo(xMin,0);
		ctx.lineTo(xMax,0);
		ctx.stroke();
		ctx.beginPath();
		ctx.moveTo(0,yMin);
		ctx.lineTo(0,yMax);
		ctx.stroke();
		ctx.beginPath();
		ctx.strokeStyle="#44aaff";
		ctx.lineWidth=3/scale;
		switch (shape){
			case "parabola":{
				const a=params.a||1;
				const type=params.type||"upward";
				const steps=200;
				if (type==="upward"){
					for (let i=0; i<=steps; i++){
						const x=xMin+(i/steps)*(xMax-xMin);
						const y=a*x*x;
						if (i===0) ctx.moveTo(x,y);
						else ctx.lineTo(x,y);
					}
				}else{
					for (let i=0; i<=steps; i++){
						const y=yMin+(i/steps)*(yMax-yMin);
						const x=a*y*y;
						if (i===0) ctx.moveTo(x,y);
						else ctx.lineTo(x,y);
					}
				}
				ctx.stroke();
				info.textContent=`Parabola: ${type==="upward"?"y = "+a+"x²":"x = "+a+"y²"}`;
				break;
			}
			case "ellipse":{
				const a=params.a||3;
				const b=params.b||2;
				const centerX=params.center==="translated"?params.h:0;
				const centerY=params.center==="translated"?params.k:0;
				for (let i=0; i<=200; i++){
					const t=(i/200)*2*Math.PI;
					const x=centerX+a*Math.cos(t);
					const y=centerY+b*Math.sin(t);
					if (i===0) ctx.moveTo(x,y);
					else ctx.lineTo(x,y);
				}
				ctx.closePath();
				ctx.stroke();
				const c=Math.sqrt(Math.abs(a*a-b*b));
				ctx.fillStyle="#ffaa44";
				ctx.beginPath();
				ctx.arc(centerX+c,centerY,0.2,0,2*Math.PI);
				ctx.fill();
				ctx.beginPath();
				ctx.arc(centerX-c,centerY,0.2,0,2*Math.PI);
				ctx.fill();
				info.textContent=`Ellipse: a = ${a}, b = ${b}`;
				break;
			}
			case "hyperbola":{
				const a=params.a||3;
				const b=params.b||2;
				const centerX=params.center==="translated"?params.h:0;
				const centerY=params.center==="translated"?params.k:0;
				const steps=200;
				for (let i=0; i<=steps; i++){
					const t=-5+(i/steps)*10;
					const x=centerX+a*Math.cosh(t);
					const y=centerY+b*Math.sinh(t);
					if (i===0) ctx.moveTo(x,y);
					else ctx.lineTo(x,y);
				}
				ctx.stroke();
				ctx.beginPath();
				for (let i=0; i<=steps; i++){
					const t=-5+(i/steps)*10;
					const x=centerX-a*Math.cosh(t);
					const y=centerY+b*Math.sinh(t);
					if (i===0) ctx.moveTo(x,y);
					else ctx.lineTo(x,y);
				}
				ctx.stroke();
				const dashLength=8/scale;
				ctx.setLineDash([dashLength,dashLength]);
				const slope1=b/a;
				const slope2=-b/a;
				ctx.beginPath();
				ctx.moveTo(xMin,centerY+slope1*(xMin-centerX));
				ctx.lineTo(xMax,centerY+slope1*(xMax-centerX));
				ctx.stroke();
				ctx.beginPath();
				ctx.moveTo(xMin,centerY+slope2*(xMin-centerX));
				ctx.lineTo(xMax,centerY+slope2*(xMax-centerX));
				ctx.stroke();
				ctx.setLineDash([]);
				const c=Math.sqrt(a*a+b*b);
				ctx.fillStyle="#ffaa44";
				ctx.beginPath();
				ctx.arc(centerX+c,centerY,0.2,0,2*Math.PI);
				ctx.fill();
				ctx.beginPath();
				ctx.arc(centerX-c,centerY,0.2,0,2*Math.PI);
				ctx.fill();
				info.textContent=`Hyperbola: a = ${a}, b = ${b}`;
				break;
			}
			case "polarConic":{
				const e=params.e||1;
				const k=params.k||2;
				const sinOrCos=params.sinOrCos||"cos";
				const sign=params.sign||"+";
				const steps=200;
				let first=true;
				for (let i=0; i<=steps; i++){
					const theta=(i/steps)*2*Math.PI;
					const trig=sinOrCos==="cos"?Math.cos(theta):Math.sin(theta);
					const denominator=1+(sign==="+"?e*trig:-e*trig);
					const r=(k*e)/denominator;
					if (r<0){
						first=true;
						continue;
					}
					const x=r*Math.cos(theta);
					const y=r*Math.sin(theta);
					if (first){
						ctx.moveTo(x,y);
						first=false;
					}else{
						ctx.lineTo(x,y);
					}
				}
				ctx.stroke();
				info.textContent=`Polar conic: e = ${e}`;
				break;
			}
			case "circle":{
				const radius=params.radius||2;
				ctx.beginPath();
				ctx.arc(0,0,radius,0,2*Math.PI);
				ctx.stroke();
				info.textContent=`Circle: radius = ${radius}`;
				break;
			}
			case "triangle":{
				const base=params.base||3;
				const height=params.height||3;
				ctx.beginPath();
				ctx.moveTo(0,0);
				ctx.lineTo(base,0);
				ctx.lineTo(0,height);
				ctx.closePath();
				ctx.stroke();
				info.textContent=`Triangle: base = ${base}, height = ${height}`;
				break;
			}
		}
		ctx.restore();
		ctx.save();
		ctx.font='12px Arial';
		ctx.fillStyle='#cccccc';
		ctx.textAlign='center';
		ctx.textBaseline='middle';
		const worldToScreenX=(x: number)=>width/2+(x-offsetX)*scale;
		const worldToScreenY=(y: number)=>height/2-(y-offsetY)*scale;
		const stepX=niceStep(xMax-xMin);
		const firstXTick=Math.ceil(xMin/stepX)*stepX;
		for (let x=firstXTick; x<=xMax; x+=stepX){
			if (Math.abs(x)<0.01) continue;
			const sx=worldToScreenX(x);
			const sy=worldToScreenY(0);
			ctx.beginPath();
			ctx.strokeStyle="#99aaff";
			ctx.lineWidth=1;
			ctx.moveTo(sx,sy-5);
			ctx.lineTo(sx,sy+5);
			ctx.stroke();
			ctx.fillText(x.toFixed(2),sx,sy-15);
		}
		const stepY=niceStep(yMax-yMin);
		const firstYTick=Math.ceil(yMin/stepY)*stepY;
		for (let y=firstYTick; y<=yMax; y+=stepY){
			if (Math.abs(y)<0.01) continue;
			const sx=worldToScreenX(0);
			const sy=worldToScreenY(y);
			ctx.beginPath();
			ctx.strokeStyle="#99aaff";
			ctx.lineWidth=1;
			ctx.moveTo(sx-5,sy);
			ctx.lineTo(sx+5,sy);
			ctx.stroke();
			ctx.fillText(y.toFixed(2),sx-15,sy);
		}
		const ox=worldToScreenX(0);
		const oy=worldToScreenY(0);
		ctx.fillText("0",ox,oy-15);
		ctx.restore();
	};
	draw();
	const resizeObserver=new ResizeObserver(()=>draw());
	resizeObserver.observe(container);
}

/**
 * Creates a visualization (2D canvas or 3D Three.js) for a given shape.
 * @param shape - shape type (parabola, ellipse, hyperbola, polarConic, circle, triangle, sphere, cube, cylinder, cone, pyramid, torus, points3D, line3D, plane3D)
 * @param params - parameters for the shape
 */
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
	if (!questionArea){
		console.error("questionArea not found");
		return;
	}
	questionArea.appendChild(container);
	const twoDShapes=["parabola","ellipse","hyperbola","polarConic","circle","triangle"];
	if (twoDShapes.includes(shape)){
		createCanvas2DVisualization(shape,params,container);
		return;
	}
	const canvas=document.createElement("canvas");
	canvas.id="geometry-canvas";
	canvas.style.width="100%";
	canvas.style.height="100%";
	canvas.style.display="block";
	container.appendChild(canvas);
	const width=container.clientWidth;
	const height=container.clientHeight;
	const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false});
	renderer.setSize(width,height);
	renderer.setClearColor(0x1a1a2e);
	renderer.setPixelRatio(window.devicePixelRatio);
	currentRenderer=renderer;
	const scene=new THREE.Scene();
	currentScene=scene;
	const camera=new THREE.PerspectiveCamera(45,width/height,0.1,1000);
	camera.position.set(8,8,15);
	camera.lookAt(0,0,0);
	currentCamera=camera;
	const controls=new OrbitControls(camera,renderer.domElement);
	controls.enableDamping=true;
	controls.dampingFactor=0.05;
	controls.screenSpacePanning=true;
	controls.maxPolarAngle=Math.PI/2;
	currentControls=controls;
	const labelRenderer=new CSS2DRenderer();
	labelRenderer.setSize(width,height);
	labelRenderer.domElement.style.position="absolute";
	labelRenderer.domElement.style.top="0";
	labelRenderer.domElement.style.left="0";
	labelRenderer.domElement.style.pointerEvents="none";
	container.appendChild(labelRenderer.domElement);
	currentLabelRenderer=labelRenderer;
	const ambientLight=new THREE.AmbientLight(0x404060);
	scene.add(ambientLight);
	const dirLight=new THREE.DirectionalLight(0xffffff,1);
	dirLight.position.set(1,2,1);
	scene.add(dirLight);
	const backLight=new THREE.DirectionalLight(0x99aaff,0.5);
	backLight.position.set(-1,-1,-1);
	scene.add(backLight);
	const gridHelper=new THREE.GridHelper(20,20,0x99aaff,0x334466);
	scene.add(gridHelper);
	const axesHelper=new THREE.AxesHelper(5);
	scene.add(axesHelper);
	function createAxisLabel(text: string,color: string,position: THREE.Vector3): void{
		const div=document.createElement("div");
		div.textContent=text;
		div.style.color=color;
		div.style.fontSize="16px";
		div.style.fontWeight="bold";
		div.style.textShadow="1px 1px 2px black";
		const label=new CSS2DObject(div);
		label.position.copy(position);
		scene.add(label);
	}
	createAxisLabel("X","#ff5555",new THREE.Vector3(6,0,0));
	createAxisLabel("Y","#55ff55",new THREE.Vector3(0,6,0));
	createAxisLabel("Z","#5555ff",new THREE.Vector3(0,0,6));
	let mesh: THREE.Mesh|THREE.Line|THREE.Points|THREE.Group|null=null;
	let infoText="";
	switch (shape){
		case "sphere":{
			const radius=params.radius||2;
			const geometry=new THREE.SphereGeometry(radius,32,16);
			const material=new THREE.MeshStandardMaterial({color:0xffaa44,emissive:0x442200});
			mesh=new THREE.Mesh(geometry,material);
			scene.add(mesh);
			infoText=`Sphere: radius = ${radius}`;
			break;
		}
		case "cube":{
			const size=params.size||2;
			const geometry=new THREE.BoxGeometry(size,size,size);
			const material=new THREE.MeshStandardMaterial({color:0x88ccff,emissive:0x224466});
			mesh=new THREE.Mesh(geometry,material);
			scene.add(mesh);
			infoText=`Cube: side = ${size}`;
			break;
		}
		case "cylinder":{
			const radius=params.radius||1.5;
			const height=params.height||3;
			const geometry=new THREE.CylinderGeometry(radius,radius,height,32);
			const material=new THREE.MeshStandardMaterial({color:0x66cc66,emissive:0x224422});
			mesh=new THREE.Mesh(geometry,material);
			scene.add(mesh);
			infoText=`Cylinder: radius = ${radius}, height = ${height}`;
			break;
		}
		case "cone":{
			const radius=params.radius||1.5;
			const height=params.height||3;
			const geometry=new THREE.ConeGeometry(radius,height,32);
			const material=new THREE.MeshStandardMaterial({color:0xff8866,emissive:0x442211});
			mesh=new THREE.Mesh(geometry,material);
			scene.add(mesh);
			infoText=`Cone: radius = ${radius}, height = ${height}`;
			break;
		}
		case "pyramid":{
			const baseHalf=params.radius||1.5;
			const height=params.height||3;
			const geometry=new THREE.ConeGeometry(baseHalf,height,4);
			const material=new THREE.MeshStandardMaterial({color:0xaa88ff,emissive:0x332266});
			mesh=new THREE.Mesh(geometry,material);
			scene.add(mesh);
			infoText=`Pyramid: base side ≈ ${(baseHalf*1.414).toFixed(2)}, height = ${height}`;
			break;
		}
		case "torus":{
			const radius=params.radius||2;
			const tube=params.tube||0.5;
			const geometry=new THREE.TorusGeometry(radius,tube,16,64);
			const material=new THREE.MeshStandardMaterial({color:0xff66aa,emissive:0x442233});
			mesh=new THREE.Mesh(geometry,material);
			scene.add(mesh);
			infoText=`Torus: major radius = ${radius}, minor = ${tube}`;
			break;
		}
		case "points3D":{
			const points=params.points||[];
			const group=new THREE.Group();
			points.forEach((p: any)=>{
				const sphereGeo=new THREE.SphereGeometry(0.3,16);
				const sphereMat=new THREE.MeshStandardMaterial({color:0xff3333});
				const sphere=new THREE.Mesh(sphereGeo,sphereMat);
				sphere.position.set(p.x,p.y,p.z);
				group.add(sphere);
				const div=document.createElement("div");
				div.textContent=`(${p.x},${p.y},${p.z})`;
				div.style.color="white";
				div.style.fontSize="12px";
				div.style.backgroundColor="rgba(0,0,0,0.5)";
				div.style.padding="2px 4px";
				div.style.borderRadius="4px";
				const label=new CSS2DObject(div);
				label.position.set(p.x,p.y+0.5,p.z);
				group.add(label);
			});
			scene.add(group);
			mesh=group;
			infoText=`Points in 3D`;
			break;
		}
		case "line3D":{
			const [x0,y0,z0]=params.point;
			const [a,b,c]=params.direction;
			const t=params.t;
			const points=[
				new THREE.Vector3(x0+(t-2)*a,y0+(t-2)*b,z0+(t-2)*c),
				new THREE.Vector3(x0+(t+2)*a,y0+(t+2)*b,z0+(t+2)*c)
			];
			const geometry=new THREE.BufferGeometry().setFromPoints(points);
			const material=new THREE.LineBasicMaterial({color:0x44aaff});
			const line=new THREE.Line(geometry,material);
			scene.add(line);
			const sphereGeo=new THREE.SphereGeometry(0.3,16);
			const sphereMat=new THREE.MeshStandardMaterial({color:0xffaa44});
			const sphere=new THREE.Mesh(sphereGeo,sphereMat);
			sphere.position.set(x0+t*a,y0+t*b,z0+t*c);
			scene.add(sphere);
			const div=document.createElement("div");
			div.textContent=`(${(x0+t*a).toFixed(2)}, ${(y0+t*b).toFixed(2)}, ${(z0+t*c).toFixed(2)})`;
			div.style.color="white";
			div.style.fontSize="12px";
			div.style.backgroundColor="rgba(0,0,0,0.5)";
			div.style.padding="2px 4px";
			div.style.borderRadius="4px";
			const label=new CSS2DObject(div);
			label.position.set(x0+t*a,y0+t*b+0.5,z0+t*c);
			scene.add(label);
			mesh=line;
			infoText=`Line in 3D`;
			break;
		}
		case "plane3D":{
			const [nx,ny,nz]=params.normal;
			const d=params.d;
			const [px,py,pz]=params.point;
			const sphereGeo=new THREE.SphereGeometry(0.3,16);
			const sphereMat=new THREE.MeshStandardMaterial({color:0xffaa44});
			const sphere=new THREE.Mesh(sphereGeo,sphereMat);
			sphere.position.set(px,py,pz);
			scene.add(sphere);
			const div=document.createElement("div");
			div.textContent=`(${px.toFixed(2)}, ${py.toFixed(2)}, ${pz.toFixed(2)})`;
			div.style.color="white";
			div.style.fontSize="12px";
			div.style.backgroundColor="rgba(0,0,0,0.5)";
			div.style.padding="2px 4px";
			div.style.borderRadius="4px";
			const label=new CSS2DObject(div);
			label.position.set(px,py+0.5,pz);
			scene.add(label);
			mesh=sphere;
			infoText=`Plane: ${nx}x + ${ny}y + ${nz}z + ${d} = 0`;
			break;
		}
		default:
			console.warn("Unknown 3D shape:",shape);
			return;
	}
	if (infoText) info.textContent=infoText;
	if (mesh){
		const box=new THREE.Box3().setFromObject(mesh);
		const sphere=box.getBoundingSphere(new THREE.Sphere());
		if (sphere.radius>0){
			const distance=sphere.radius*2.5;
			camera.position.set(distance,distance*0.8,distance*1.5);
			controls.target.copy(sphere.center);
			controls.update();
		}
	}
	function animate(){
		currentAnimationFrame=requestAnimationFrame(animate);
		controls.update();
		renderer.render(scene,camera);
		labelRenderer.render(scene,camera);
	}
	animate();
	const resizeObserver=new ResizeObserver(entries=>{
		for (let entry of entries){
			const{width,height}=entry.contentRect;
			if (width===0||height===0) return;
			renderer.setSize(width,height);
			labelRenderer.setSize(width,height);
			camera.aspect=width/height;
			camera.updateProjectionMatrix();
		}
	});
	resizeObserver.observe(container);
}

/**
 * Cleans up all visualization resources: stops animation, disposes renderers, removes DOM elements.
 */
export function cleanupVisualization(): void{
	if (currentAnimationFrame){
		cancelAnimationFrame(currentAnimationFrame);
		currentAnimationFrame=0;
	}
	if (currentRenderer){
		currentRenderer.dispose();
		currentRenderer=null;
	}
	if (currentLabelRenderer){
		currentLabelRenderer.domElement.remove();
		currentLabelRenderer=null;
	}
	if (currentControls){
		currentControls.dispose();
		currentControls=null;
	}
	if (currentScene){
		currentScene.traverse((obj)=>{
			if (obj instanceof THREE.Mesh){
				if (obj.geometry) obj.geometry.dispose();
				if (obj.material){
					if (Array.isArray(obj.material)){
						obj.material.forEach(m=>m.dispose());
					}else{
						obj.material.dispose();
					}
				}
			}
		});
		currentScene=null;
	}
	currentCamera=null;
	const container=document.getElementById("geometry-visualization");
	if (container) container.remove();
	const info=document.getElementById("geometry-info");
	if (info) info.remove();
}