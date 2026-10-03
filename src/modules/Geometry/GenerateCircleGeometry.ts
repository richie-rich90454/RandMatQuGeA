/**
 * @file Circle geometry: central and inscribed angles, arcs and sectors, the
 * tangent-radius perpendicular, chord length, and the angle formed by two chords
 * or two secants meeting inside or outside a circle.
 * @description Angles come out in whole degrees. Every theorem here halves or
 * doubles a pair of whole numbers, so both numbers of such a pair are drawn on the
 * same parity grid and the halved result is a whole number of degrees. Nothing is
 * rounded, and the two lengths that are genuinely irrational, an arc length and a
 * sector area, state in the prompt that pi is 3.14 and that the answer is to the
 * nearest hundredth, and are then computed from exactly those printed integers
 * with exactly that stated approximation before being rounded once.
 *
 * Every degree measure is printed as a superscript inside a math group. A bare
 * degree sign is never emitted, and no unit or currency symbol is ever placed
 * inside a math group.
 */
import type{RngFn, QuestionDto}from"../../types/global";
import{fmt}from"../shared/Numeric";
import{fourOptions}from"../shared/Options.js";
import{randInt, randStep, shuffle}from"../shared/Random";

/**
 * The length of the chord subtending a central angle of the given size. The chord
 * is twice the radius times the sine of half the central angle, so the half-angle
 * is taken here rather than in the caller, and the prompt states the same formula.
 *
 * @param radius - The radius of the circle.
 * @param centralDeg - The central angle in degrees.
 * @returns The chord length, before any rounding.
 */
function chordLength(radius: number, centralDeg: number): number{
    return 2*radius*Math.sin(centralDeg*Math.PI/360);
}

export function generateCircleGeometry(difficulty?: string, rng: RngFn=Math.random): QuestionDto{
    let types=["inscribed_central","arc_sector","tangent_right_angle","chord_length","chords_inside","secants_external"];
    let type=types[Math.floor(rng()*types.length)];
    let radiusMax=difficulty==="hard"?24:difficulty==="easy"?8:14;
    let key=0;
    let latex="";
    let wrong:number[]=[];
    let format:(value: number)=>string=String;
    let expectedFormat="Enter a whole number";
    let rungs:string[]=[];
    let steps:string[]=[];
    switch(type){
        case "inscribed_central":{
            if (rng()<0.5){
                // An inscribed angle is half the central angle on the same arc, so
                // the central angle is drawn even and no greater than a straight
                // angle, and the half is a whole number of degrees. A central
                // angle above a straight angle would have to be the reflex one,
                // which is not what "the central angle" names.
                let central=randStep(rng, 40, 180, 2);
                key=central/2;
                latex=`Points \\( A \\), \\( B \\) and \\( C \\) lie on a circle with center \\( O \\). The central angle \\( AOC \\) measures \\( ${central}^{\\circ} \\). What is the measure, in degrees, of the inscribed angle \\( ABC \\) subtending the same arc \\( AC \\)?`;
                wrong=[central, 360-central, 180-central/2, central*2];
                rungs=[
                    "The two angles stand on the same chord, and the one at the center is twice the one at the circle, so halve the central angle you are given.",
                    "Both angles open onto the same arc AC, which is what makes the relationship hold; an inscribed angle on the other arc is the supplement."
                ];
                steps=[
                    `The central angle AOC subtends arc AC and measures ${central} degrees.`,
                    `The inscribed angle ABC subtends the same arc, and is half the central angle.`,
                    `Half of ${central} degrees = ${key}`
                ];
            }
            else{
                let inscribed=randInt(rng, 20, 90);
                key=inscribed*2;
                latex=`Points \\( A \\), \\( B \\) and \\( C \\) lie on a circle with center \\( O \\). The inscribed angle \\( ABC \\) subtending the arc \\( AC \\) measures \\( ${inscribed}^{\\circ} \\). What is the measure, in degrees, of the central angle \\( AOC \\) subtending the same arc \\( AC \\)?`;
                wrong=[inscribed, 180-inscribed, Math.round(inscribed/2), key-2];
                rungs=[
                    "The two angles stand on the same chord, and the one at the center is twice the one at the circle, so double the inscribed angle you are given.",
                    "Both angles open onto the same arc AC, which is what makes the relationship hold."
                ];
                steps=[
                    `The inscribed angle ABC subtends arc AC and measures ${inscribed} degrees.`,
                    `The central angle AOC subtends the same arc, and is twice the inscribed angle.`,
                    `Twice ${inscribed} degrees = ${key}`
                ];
            }
            break;
        }
        case "arc_sector":{
            // Both lengths use the 3.14 the prompt states, and both are rounded
            // once by the formatter, which is the rounding the prompt asked for.
            let radius=randInt(rng, 3, radiusMax);
            let quarters=[90, 180, 270];
            let angle=quarters[Math.floor(rng()*quarters.length)];
            let askArea=rng()<0.5;
            format=(value: number)=>fmt(value, 2);
            expectedFormat="Enter a decimal rounded to the nearest hundredth";
            if (askArea){
                key=(angle/360)*3.14*radius*radius;
                latex=`Find the area of a sector with central angle \\( ${angle}^{\\circ} \\) in a circle of radius \\( ${radius} \\). Use \\( \\pi \\approx 3.14 \\) and round your answer to the nearest hundredth.`;
                wrong=[(angle/360)*3.14*(radius+1)*(radius+1), 3.14*radius*radius, ((360-angle)/360)*3.14*radius*radius, key/2];
                rungs=[
                    "A sector is the share of the whole circle its central angle names, and an area is what that share is taken of: pi times the radius squared.",
                    `Work out what fraction of the circle the angle covers, then take that fraction of the whole area.`
                ];
                steps=[
                    `The sector is ${angle}/360 of the circle.`,
                    `The whole circle is 3.14 x ${radius} x ${radius} = ${fmt(3.14*radius*radius, 4)}.`,
                    `So the area is ${angle}/360 x ${fmt(3.14*radius*radius, 4)}, which rounds to ${format(key)}`
                ];
            }
            else{
                key=(angle/360)*2*3.14*radius;
                latex=`Find the length of the arc with central angle \\( ${angle}^{\\circ} \\) in a circle of radius \\( ${radius} \\). Use \\( \\pi \\approx 3.14 \\) and round your answer to the nearest hundredth.`;
                wrong=[(angle/360)*2*3.14*(radius+1), 2*3.14*radius, ((360-angle)/360)*2*3.14*radius, key/2];
                rungs=[
                    "An arc is the share of the whole circumference its central angle names, and the whole circumference is twice pi times the radius.",
                    `Work out what fraction of the circumference the angle covers, then take that fraction of the whole circumference.`
                ];
                steps=[
                    `The arc is ${angle}/360 of the circumference.`,
                    `The whole circumference is 2 x 3.14 x ${radius} = ${fmt(2*3.14*radius, 4)}.`,
                    `So the arc length is ${angle}/360 x ${fmt(2*3.14*radius, 4)}, which rounds to ${format(key)}`
                ];
            }
            break;
        }
        case "tangent_right_angle":{
            // The tangent is perpendicular to the radius at the point of tangency,
            // so the radius, the chord and the tangent always bound a right angle
            // and the other two angles of that triangle must sum to ninety.
            let alpha=randInt(rng, 15, 75);
            key=90-alpha;
            latex=`A line is tangent to a circle at the point \\( T \\), so the radius \\( OT \\) is perpendicular to it. A chord from \\( T \\) meets the circle again at \\( A \\). The angle \\( OAT \\) measures \\( ${alpha}^{\\circ} \\). What is the measure, in degrees, of the angle \\( AOT \\)?`;
            wrong=[180-alpha, 90+alpha, alpha, alpha*2];
            rungs=[
                "A tangent is perpendicular to the radius at the point of tangency, so the radius, the chord and the tangent bound a triangle with a right angle at T and the other two angles summing to ninety.",
                "The angle you are given and the angle you want are the two non-right angles of that triangle, so they add to ninety."
            ];
            steps=[
                `The angle at T is a right angle, so angle OAT + angle AOT = 90 degrees.`,
                `angle AOT = 90 - ${alpha} degrees.`,
                `90 - ${alpha} = ${key}`
            ];
            break;
        }
        case "chord_length":{
            let radius=randInt(rng, 3, radiusMax);
            let angles=difficulty==="hard"?[30, 60, 90, 120, 150, 180]:[60, 90, 120, 180];
            let angle=angles[Math.floor(rng()*angles.length)];
            key=chordLength(radius, angle);
            format=(value: number)=>fmt(value, 2);
            expectedFormat="Enter a decimal rounded to the nearest hundredth";
            latex=`A chord of a circle of radius \\( ${radius} \\) subtends a central angle of \\( ${angle}^{\\circ} \\). The chord is \\( 2r\\sin\\left(\\frac{\\theta}{2}\\right) \\), where \\( r \\) is the radius and \\( \\theta \\) is the central angle in degrees. Round your answer to the nearest hundredth.`;
            wrong=[chordLength(radius, angle/2), radius*Math.cos(angle*Math.PI/360), 2*radius, angle];
            rungs=[
                "The chord is twice the radius times the sine of half the central angle, so the half-angle is what goes into the sine and not the whole angle.",
                "Halve the central angle the prompt gives before you take its sine, then multiply by twice the radius."
            ];
            steps=[
                `Half of ${angle} degrees is ${angle/2} degrees.`,
                `Chord = 2 x ${radius} x sin(${angle/2} degrees) = ${fmt(2*radius*Math.sin(angle*Math.PI/360), 4)}.`,
                `Rounded to the nearest hundredth, the chord is ${format(key)}`
            ];
            break;
        }
        case "chords_inside":{
            // Chords AB and CD meeting at P inside the circle give APB half the sum
            // of the arcs AB and CD cut off by it and by its vertical angle. Both
            // arcs are drawn even so their sum is even and the half is whole.
            let first=randStep(rng, 20, 160, 2);
            let second=randStep(rng, 20, 160, 2);
            key=(first+second)/2;
            latex=`Chords \\( AB \\) and \\( CD \\) of a circle intersect at a point \\( P \\) inside the circle. The arc \\( \\widehat{AB} \\) cut off by the angle \\( APB \\) and the arc \\( \\widehat{CD} \\) cut off by its vertical angle \\( CPD \\) measure \\( ${first}^{\\circ} \\) and \\( ${second}^{\\circ} \\). What is the measure, in degrees, of the angle \\( APB \\)?`;
            wrong=[first+second, first, second, 180-(first+second)/2];
            rungs=[
                "Two chords meeting inside a circle make an angle equal to half the sum of the two arcs cut off by it and by its vertical angle, not half of one of them.",
                "Add the two arcs first, then halve the sum."
            ];
            steps=[
                `The two arcs cut off measure ${first} and ${second} degrees.`,
                `angle APB = (${first} + ${second}) / 2.`,
                `(${first} + ${second}) / 2 = ${key}`
            ];
            break;
        }
        case "secants_external":{
            // Two secants from a point outside the circle give an angle equal to
            // half the difference of the far arc and the near arc. Both arcs are
            // drawn even, so the difference, the sum and each half are all whole.
            let far=randStep(rng, 80, 240, 2);
            let near=randStep(rng, 20, Math.min(far-20, 120), 2);
            key=(far-near)/2;
            latex=`Two secants drawn from a point \\( P \\) outside a circle meet it at \\( A \\), \\( B \\) and at \\( C \\), \\( D \\), where \\( B \\) and \\( C \\) are the nearer intersection points. The far arc \\( \\widehat{AD} \\) measures \\( ${far}^{\\circ} \\) and the near arc \\( \\widehat{BC} \\) measures \\( ${near}^{\\circ} \\). What is the measure, in degrees, of the angle between the two secants at \\( P \\)?`;
            wrong=[far-near, (far+near)/2, far/2, near/2];
            rungs=[
                "Two secants from a point outside the circle make an angle equal to half the difference of the far arc and the near arc, not half of the far arc alone.",
                "Subtract the near arc from the far arc, then halve the difference."
            ];
            steps=[
                `The far arc measures ${far} degrees and the near arc ${near} degrees.`,
                `angle P = (${far} - ${near}) / 2.`,
                `(${far} - ${near}) / 2 = ${key}`
            ];
            break;
        }
    }
    let keyText=format(key);
    return {latex, correct:keyText, alternate:keyText, display:keyText, choices:shuffle(rng, fourOptions(keyText, wrong.map(format))), expectedFormat, subskill:type, hints:{rungs, concede:"The answer is "+keyText+"."}, solution: steps};
}