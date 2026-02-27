export function formatPiFraction(value: number): string {
    const pi=Math.PI;
    const tolerance=1e-6;
    if (Math.abs(value) < tolerance) return "0";
    let numerator=value / pi;
    for (let den=1; den<=8; den++) {
        let num=numerator * den;
        if (Math.abs(num - Math.round(num)) < tolerance) {
            let rounded=Math.round(num);
            if (den===1) {
                if (rounded===1) return "π";
                if (rounded===-1) return "-π";
                return rounded + "π";
            }
            if (rounded===1) return `π/${den}`;
            if (rounded===-1) return `-π/${den}`;
            return `${rounded}π/${den}`;
        }
    }
    return value.toFixed(2);
}