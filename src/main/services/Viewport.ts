/**
 * @file Keeping the app usable while an on-screen keyboard is open.
 * @description On a phone the software keyboard covers the bottom of the window,
 * and a layout that does not account for that hides the very control the learner
 * needs. There are three separate problems and each has its own trap.
 *
 * The first is that the visual viewport and the layout viewport are different
 * sizes once a keyboard opens. The visual viewport is what is actually visible,
 * so its height is the one to measure, and reading `window.innerHeight` gives the
 * layout viewport, which does not change and therefore tells you nothing.
 *
 * The second is that the keyboard does not fire a resize on every platform. It
 * fires one on iOS and a `visualViewport` resize elsewhere, so listening to only
 * one leaves the layout wrong on the other. Both are observed, and both feed the
 * same handler.
 *
 * The third is that scroll position is reported against the layout viewport, so
 * after the keyboard closes the page can appear scrolled somewhere it never was.
 * The offset is restored whenever the viewport returns to its previous size.
 *
 * Nothing here is a polyfill for a fixed viewport unit. The stylesheet already
 * uses the dynamic unit, and this exists for the part a unit cannot express:
 * keeping the focused control and the answer area inside the visible area.
 */
import{dom}from"../core/DomRegistry";

/** The scroll offset of the window the last time it was measured. */
let lastScroll=0;

/** Whether the viewport has been narrowed by anything, keyboard included. */
let narrowed=false;
/** The deferred reveal scheduled after a focus event, null when none is pending. */
let pendingFrame: number|null=null;
/** The follow-up reveal scheduled after the keyboard settles, null when none is pending. */
let pendingTimer: ReturnType<typeof setTimeout>|null=null;
/** Whether a pointer is down; scrolling now would move the page under an in-flight tap. */
let pointerDown=false;

/** The focusable controls that must stay visible, most important first. */
const KEEP_VISIBLE="input, textarea, button, select, [tabindex]";

/**
 * Reads the visual viewport, falling back to the window where the browser does
 * not provide one. The fallback is not a polyfill attempt, it is simply the
 * viewport size for the browsers that never have a keyboard over the layout.
 *
 * @returns The visible height and the top of the visible area, in CSS pixels.
 */
function visibleArea(): { height: number; top: number }{
    let viewport=window.visualViewport;
    if (viewport){
        return { height: viewport.height, top: viewport.offsetTop };
    }
    return { height: window.innerHeight, top: 0 };
}

/**
 * Reports how much of the window the keyboard is covering, in CSS pixels. Zero
 * means nothing is covering it.
 *
 * @returns The covered height.
 */
export function coveredHeight(): number{
    let viewport=window.visualViewport;
    if (!viewport) return 0;
    return Math.max(0, window.innerHeight-viewport.height);
}

/**
 * Scrolls the smallest amount that brings an element inside the visible area, and
 * not one pixel more, so the page does not jump around while a learner types.
 *
 * @param element - The element to bring into view.
 */
function bringIntoView(element: HTMLElement): void{
    let { height, top }=visibleArea();
    let rect=element.getBoundingClientRect();
    if (rect.height>=height) return;
    let margin=12;
    if (rect.top<top+margin){
        window.scrollBy(0, rect.top-top-margin);
    }
    else if (rect.bottom>top+height-margin){
        window.scrollBy(0, rect.bottom-top-height+margin);
    }
}

/**
 * Brings the answer input and the control immediately under it into view. The
 * learner is almost always typing into the answer input and then reaching for the
 * check button, so both are kept visible rather than only the focused element.
 */
function revealAnswerArea(): void{
    let input=dom.inputs.userAnswer;
    if (input) bringIntoView(input);
    let check=dom.buttons.checkAnswerButton;
    if (check) bringIntoView(check);
}

/**
 * Cancels a reveal deferred by a focus event. A tap that arrives after focus
 * cancels the scroll that would otherwise move the page under it: the press and
 * the release would land on different points, the tap becomes a scroll, and no
 * click event fires.
 */
function cancelPendingReveal(): void{
    if(pendingFrame!==null){
        cancelAnimationFrame(pendingFrame);
        pendingFrame=null;
    }
    if(pendingTimer!==null){
        clearTimeout(pendingTimer);
        pendingTimer=null;
    }
}

/**
 * Applies the current visual viewport to the document. A custom property is set
 * rather than inline styles on the shell, so the stylesheet owns the layout and
 * this module only reports the measurement.
 */
function applyViewport(): void{
    let { height, top }=visibleArea();
    lastScroll=window.scrollY;
    let covered=Math.max(0, window.innerHeight-height);
    let isNarrowed=covered>80;
    if (isNarrowed!==narrowed){
        narrowed=isNarrowed;
        document.documentElement.classList.toggle("keyboard-open", narrowed);
    }
    document.documentElement.style.setProperty("--visual-viewport-height", `${height}px`);
    document.documentElement.style.setProperty("--visual-viewport-top", `${top}px`);
    if (narrowed) revealAnswerArea();
}

/**
 * Restores the scroll position the page had before the keyboard opened. Without
 * this, closing the keyboard leaves the page scrolled by however much the layout
 * moved, which reads as the app having jumped.
 */
function restoreScroll(): void{
    if (coveredHeight()>80) return;
    let delta=window.scrollY-lastScroll;
    if (delta!==0){
        window.scrollTo(0, lastScroll);
    }
    document.documentElement.classList.remove("keyboard-open");
    narrowed=false;
}

/**
 * Watches the viewport and the focused control, and keeps the answer area visible
 * while a keyboard is open. Safe to call once at start-up; calling it again does
 * not register a second set of listeners.
 */
export async function watchVisualViewport(): Promise<void>{
    if (document.documentElement.dataset.viewportWatched==="true") return;
    document.documentElement.dataset.viewportWatched="true";
    // The watcher is only needed where a keyboard can cover the answer, so on a
    // machine with a precise pointer the measurement is taken once and no
    // listeners are installed at all.
    if (window.matchMedia&&!window.matchMedia("(pointer: coarse)").matches){
        applyViewport();
        return;
    }
    let viewport=window.visualViewport;
    if (viewport){
        viewport.addEventListener("resize", applyViewport);
        viewport.addEventListener("scroll", applyViewport);
    }
    // A keyboard on Android and on desktop browsers resizes the window instead.
    window.addEventListener("resize", applyViewport);
    document.addEventListener("focusin", (event)=>{
        let target=event.target;
        if (!(target instanceof HTMLElement)) return;
        if (!target.matches(KEEP_VISIBLE)) return;
        // The focus event arrives before the keyboard has resized the viewport, so
        // the reveal is deferred to the next frame and repeated once more after the
        // keyboard settles. Either deferred scroll is cancelled by a tap that arrives
        // first and skipped while a pointer is down, so the page never moves under an
        // in-flight tap. bringIntoView already skips elements that are visible, so a
        // reveal that does fire only scrolls for something the keyboard would cover.
        cancelPendingReveal();
        pendingFrame=requestAnimationFrame(()=>{
            pendingFrame=null;
            if(!pointerDown) revealAnswerArea();
            pendingTimer=setTimeout(()=>{
                pendingTimer=null;
                if(!pointerDown) revealAnswerArea();
            }, 250);
        });
    });
    // A tap landing while a reveal is still pending cancels it; moving the page
    // between the press and the release turns the tap into a scroll with no click.
    document.addEventListener("pointerdown", ()=>{
        pointerDown=true;
        cancelPendingReveal();
    }, true);
    document.addEventListener("pointerup", ()=>{
        pointerDown=false;
    }, true);
    document.addEventListener("pointercancel", ()=>{
        pointerDown=false;
    }, true);
    document.addEventListener("click", ()=>{
        cancelPendingReveal();
    }, true);
    document.addEventListener("focusout", ()=>{
        setTimeout(restoreScroll, 120);
    });
    applyViewport();
}
