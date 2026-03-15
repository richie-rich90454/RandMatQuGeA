(function(){
	const NATIVE_ATTR="data-native-context";
	const contextMenu=document.getElementById("custom-context-menu")as HTMLElement;
	if(!contextMenu){
		console.error("Context menu element not found");
		return;
	}
	const menuItems=contextMenu.querySelectorAll(".context-menu-item");
	let targetElement:HTMLElement|null=null;
	let storedInputInfo:{
		input:HTMLInputElement|HTMLTextAreaElement;
		start:number;
		end:number;
		value:string;
	}|null=null;
	let hideTimeout:number|null=null;
	function hideContextMenu():void{
		contextMenu.classList.add("hidden");
		contextMenu.style.left="";
		contextMenu.style.top="";
		document.querySelectorAll(".context-menu-submenu").forEach(sub=>{
			(sub as HTMLElement).style.display="none";
		});
		storedInputInfo=null;
	}
	function showContextMenu(x:number,y:number):void{
		if(hideTimeout){
			clearTimeout(hideTimeout);
			hideTimeout=null;
		}
		contextMenu.classList.remove("hidden");
		contextMenu.style.left=x+"px";
		contextMenu.style.top=y+"px";
		const menuRect=contextMenu.getBoundingClientRect();
		const winWidth=window.innerWidth;
		const winHeight=window.innerHeight;
		let left=parseFloat(contextMenu.style.left)||x;
		let top=parseFloat(contextMenu.style.top)||y;
		if(menuRect.right>winWidth){
			left=winWidth-menuRect.width-5;
		}
		if(menuRect.bottom>winHeight){
			top=winHeight-menuRect.height-5;
		}
		if(left<0)left=0;
		if(top<0)top=0;
		contextMenu.style.left=left+"px";
		contextMenu.style.top=top+"px";
	}
	document.addEventListener("contextmenu",function(e:MouseEvent){
		let el:Node|null=e.target as Node;
		while(el&&el!==document){
			if(el instanceof Element&&el.hasAttribute(NATIVE_ATTR)){
				return;
			}
			el=el.parentNode;
		}
		e.preventDefault();
		targetElement=e.target as HTMLElement;
		if(targetElement&&(targetElement.matches("input, textarea"))){
			const input=targetElement as HTMLInputElement|HTMLTextAreaElement;
			storedInputInfo={
				input,
				start:input.selectionStart||0,
				end:input.selectionEnd||0,
				value:input.value
			};
		}
		else{
			const answerBox=document.getElementById("answer-box")as HTMLInputElement|HTMLTextAreaElement|null;
			if(answerBox){
				storedInputInfo={
					input:answerBox,
					start:answerBox.selectionStart||0,
					end:answerBox.selectionEnd||0,
					value:answerBox.value
				};
			}
		}
		hideContextMenu();
		showContextMenu(e.clientX,e.clientY);
	});
	function getTargetInput():HTMLInputElement|HTMLTextAreaElement|null{
		if(storedInputInfo){
			return storedInputInfo.input;
		}
		const active=document.activeElement;
		if(active&&(active.matches("input, textarea"))){
			return active as HTMLInputElement|HTMLTextAreaElement;
		}
		return document.getElementById("answer-box")as HTMLInputElement|HTMLTextAreaElement|null;
	}
	function insertAtCursor(input:HTMLInputElement|HTMLTextAreaElement,text:string):void{
		input.focus();
		const start=input.selectionStart||0;
		const end=input.selectionEnd||0;
		const currentValue=input.value;
		input.value=currentValue.slice(0,start)+text+currentValue.slice(end);
		input.selectionStart=input.selectionEnd=start+text.length;
		input.dispatchEvent(new Event("input",{bubbles:true}));
	}
	function wrapWithTemplate(input:HTMLInputElement|HTMLTextAreaElement,template:string):void{
		input.focus();
		const selected=input.value.substring(input.selectionStart||0,input.selectionEnd||0);
		let newText=template.replace(/\{\}/g,selected||"");
		insertAtCursor(input,newText);
	}
	function showNotification(msg:string,isError:boolean=false):void{
		const notification=document.createElement("div");
		notification.className=`notification ${isError?"notification-warning":""}`;
		notification.textContent=msg;
		notification.style.position="fixed";
		notification.style.top="20px";
		notification.style.right="20px";
		notification.style.zIndex="10000";
		document.body.appendChild(notification);
		setTimeout(()=>{
			notification.classList.add("fade-out");
			setTimeout(()=>notification.remove(),200);
		},2000);
	}
	async function handleCut():Promise<void>{
		if(!storedInputInfo){
			showNotification("No input context",true);
			return;
		}
		const {input,start,end}=storedInputInfo;
		try{
			input.focus();
			input.selectionStart=start;
			input.selectionEnd=end;
			await new Promise(resolve=>setTimeout(resolve,10));
			if(start===end){
				showNotification("Nothing selected to cut",true);
				return;
			}
			const selected=input.value.substring(start,end);
			if(!selected){
				showNotification("Nothing selected to cut",true);
				return;
			}
			await navigator.clipboard.writeText(selected);
			input.value=input.value.slice(0,start)+input.value.slice(end);
			input.selectionStart=input.selectionEnd=start;
			input.dispatchEvent(new Event("input",{bubbles:true}));
			showNotification("Cut successful");
		}
		catch(err){
			console.warn("Cut failed:",err);
			showNotification("Cut failed: "+(err instanceof Error?err.message:String(err)),true);
		}
	}
	async function handleCopy():Promise<void>{
		if(!storedInputInfo){
			showNotification("No input context",true);
			return;
		}
		const {input,start,end}=storedInputInfo;
		try{
			input.focus();
			input.selectionStart=start;
			input.selectionEnd=end;
			await new Promise(resolve=>setTimeout(resolve,10));
			if(start===end){
				showNotification("Nothing selected to copy",true);
				return;
			}
			const selected=input.value.substring(start,end);
			if(!selected){
				showNotification("Nothing selected to copy",true);
				return;
			}
			await navigator.clipboard.writeText(selected);
			showNotification("Copied to clipboard");
		}
		catch(err){
			console.warn("Copy failed:",err);
			showNotification("Copy failed: "+(err instanceof Error?err.message:String(err)),true);
		}
	}
	async function handlePaste():Promise<void>{
		const input=getTargetInput();
		if(!input){
			showNotification("No input field focused",true);
			return;
		}
		try{
			const text=await navigator.clipboard.readText();
			insertAtCursor(input,text);
			showNotification("Pasted");
		}
		catch(err){
			console.warn("Paste failed:",err);
			showNotification("Paste failed: "+(err instanceof Error?err.message:String(err)),true);
		}
	}
	function handleClear():void{
		const input=getTargetInput();
		if(!input){
			showNotification("No input field focused",true);
			return;
		}
		input.focus();
		input.value="";
		input.dispatchEvent(new Event("input",{bubbles:true}));
		showNotification("Cleared");
	}
	function handleSelectAll():void{
		const input=getTargetInput();
		if(!input){
			showNotification("No input field focused",true);
			return;
		}
		input.focus();
		input.select();
		input.dispatchEvent(new Event("select",{bubbles:true}));
		showNotification("All selected");
	}
	function handleInsertSymbol(symbol:string):void{
		const input=getTargetInput();
		if(!input){
			showNotification("No input field focused",true);
			return;
		}
		insertAtCursor(input,symbol);
	}
	function handleWrapTemplate(template:string):void{
		const input=getTargetInput();
		if(!input){
			showNotification("No input field focused",true);
			return;
		}
		wrapWithTemplate(input,template);
	}
	function handleCheck():void{
		(document.getElementById("check-answer") as HTMLButtonElement)?.click();
	}
	function handleGenerate():void{
		(document.getElementById("genQ") as HTMLButtonElement)?.click();
	}
	function handleExpected():void{
		const expected=document.getElementById("expected-format");
		if(expected)expected.scrollIntoView({behavior:"smooth"});
	}
	function handleCopyAnswer():void{
		const copyBtn=document.getElementById("copy-answer") as HTMLButtonElement;
		if(copyBtn)copyBtn.click();
	}
	function handleSkip():void{
		(document.getElementById("skip-question") as HTMLButtonElement)?.click();
	}
	function handlePause():void{
		(document.getElementById("pause-session") as HTMLButtonElement)?.click();
	}
	function handleEndSession():void{
		const startBtn=document.getElementById("start-session") as HTMLButtonElement;
		if(startBtn&&startBtn.classList.contains("stop-session")){
			startBtn.click();
		}
	}
	function handleLeaderboard():void{
		const card=document.getElementById("leaderboard-card");
		if(card)card.classList.remove("hidden");
	}
	function handleShortcuts():void{
		(document.getElementById("shortcuts-button") as HTMLButtonElement)?.click();
	}
	function handleSettings():void{
		(document.getElementById("settings-button") as HTMLButtonElement)?.click();
	}
	function handleTheme():void{
		(document.getElementById("theme-toggle") as HTMLButtonElement)?.click();
	}
	const submenuParents=document.querySelectorAll(".has-submenu");
	const submenuTimeouts=new Map<HTMLElement,number>();
	function showSubmenu(submenu:HTMLElement):void{
		document.querySelectorAll(".context-menu-submenu").forEach(s=>{
			if(s!==submenu)(s as HTMLElement).style.display="none";
		});
		submenu.style.display="block";
		const timeoutId=submenuTimeouts.get(submenu);
		if(timeoutId){
			clearTimeout(timeoutId);
			submenuTimeouts.delete(submenu);
		}
	}
	function scheduleHideSubmenu(submenu:HTMLElement,delay:number=200):void{
		const existing=submenuTimeouts.get(submenu);
		if(existing)clearTimeout(existing);
		const timeoutId=window.setTimeout(()=>{
			submenu.style.display="none";
			submenuTimeouts.delete(submenu);
		},delay);
		submenuTimeouts.set(submenu,timeoutId);
	}
	submenuParents.forEach(parent=>{
		parent.addEventListener("mouseenter",function(this:HTMLElement){
			const submenuId=this.getAttribute("data-submenu");
			if(!submenuId)return;
			const submenu=document.getElementById("submenu-"+submenuId);
			if(!submenu)return;
			const existing=submenuTimeouts.get(submenu);
			if(existing){
				clearTimeout(existing);
				submenuTimeouts.delete(submenu);
			}
			showSubmenu(submenu);
			const rect=submenu.getBoundingClientRect();
			const winWidth=window.innerWidth;
			const winHeight=window.innerHeight;
			if(rect.right>winWidth){
				submenu.style.left="auto";
				submenu.style.right="100%";
			}
			else{
				submenu.style.left="100%";
				submenu.style.right="auto";
			}
			if(rect.bottom>winHeight){
				submenu.style.top="auto";
				submenu.style.bottom="0";
			}
			else{
				submenu.style.top="0";
				submenu.style.bottom="auto";
			}
		});
		parent.addEventListener("mouseleave",function(this:HTMLElement){
			const submenuId=this.getAttribute("data-submenu");
			if(!submenuId)return;
			const submenu=document.getElementById("submenu-"+submenuId);
			if(!submenu)return;
			scheduleHideSubmenu(submenu,200);
		});
	});
	document.querySelectorAll(".context-menu-submenu").forEach(sub=>{
		sub.addEventListener("mouseenter",function(this:HTMLElement){
			const existing=submenuTimeouts.get(this);
			if(existing){
				clearTimeout(existing);
				submenuTimeouts.delete(this);
			}
		});
		sub.addEventListener("mouseleave",function(this:HTMLElement){
			scheduleHideSubmenu(this,200);
		});
	});
	menuItems.forEach(item=>{
		item.addEventListener("click",(event)=>{
			event.stopPropagation();
			const action=item.getAttribute("data-action");
			if(!action)return;
			switch(action){
				case "cut": handleCut(); break;
				case "copy": handleCopy(); break;
				case "paste": handlePaste(); break;
				case "clear": handleClear(); break;
				case "selectall": handleSelectAll(); break;
				case "insert":{
					const symbol=item.getAttribute("data-symbol");
					if(symbol)handleInsertSymbol(symbol);
					break;
				}
				case "wrap":{
					const template=item.getAttribute("data-template");
					if(template)handleWrapTemplate(template);
					break;
				}
				case "check": handleCheck(); break;
				case "generate": handleGenerate(); break;
				case "expected": handleExpected(); break;
				case "copy-answer": handleCopyAnswer(); break;
				case "skip": handleSkip(); break;
				case "pause": handlePause(); break;
				case "end-session": handleEndSession(); break;
				case "leaderboard": handleLeaderboard(); break;
				case "shortcuts": handleShortcuts(); break;
				case "settings": handleSettings(); break;
				case "theme": handleTheme(); break;
				default: console.warn("Unknown action:",action);
			}
			hideContextMenu();
		});
	});
	function outsideClickListener(e:MouseEvent):void{
		if(!contextMenu.contains(e.target as Node)){
			hideContextMenu();
		}
	}
	document.addEventListener("click",function(e){
		if(hideTimeout)clearTimeout(hideTimeout);
		hideTimeout=window.setTimeout(()=>outsideClickListener(e),10);
	});
	window.addEventListener("resize",hideContextMenu);
	window.addEventListener("scroll",hideContextMenu,true);
	document.addEventListener("keydown",function(e){
		if(e.key==="Escape")hideContextMenu();
	});
	contextMenu.addEventListener("contextmenu",function(e){
		e.preventDefault();
	});
	function updateMentalVisibility():void{
		const isMental=!!document.querySelector("#mental-controls:not(.hidden)");
		if(isMental){
			contextMenu.classList.add("mental-active");
		}
		else{
			contextMenu.classList.remove("mental-active");
		}
	}
	const observer=new MutationObserver(updateMentalVisibility);
	const mentalControls=document.getElementById("mental-controls");
	if(mentalControls){
		observer.observe(mentalControls,{attributes:true,attributeFilter:["class"]});
	}
	updateMentalVisibility();
})();