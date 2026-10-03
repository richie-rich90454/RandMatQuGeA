/**
 * @file Showing and hiding elements, in the one way this stylesheet honours.
 * @description The app has a `.hidden` class carrying `display: none !important`, and
 * every element it hides also has a class of its own that sets a `display` value. That
 * combination makes the `hidden` property useless: an attribute selector has lower
 * precedence than a class selector, so `element.hidden = true` on an element whose class
 * says `display: flex` leaves it on screen while the DOM reports it as hidden. The
 * symptom is invisible to a unit test, because jsdom applies no stylesheet, and obvious
 * in a browser, where a recommendation button that is supposed to be gone is still
 * clickable.
 */

/**
 * Shows or hides an element, setting both the attribute and the class.
 *
 * Both are set on purpose and they are not redundant. The attribute carries the
 * semantics assistive technology reads, and the class is what the stylesheet
 * actually honours. Setting only the attribute is the defect this function exists
 * to fix; setting only the class would leave the accessibility tree claiming an
 * element is present when it is not.
 *
 * @param element - The element to show or hide, or null when it is absent.
 * @param hidden - True to hide it, false to show it.
 */
export function setHidden(element: HTMLElement|null|undefined, hidden: boolean): void{
    if (!element) return;
    element.hidden=hidden;
    element.classList.toggle("hidden", hidden);
}