export function formatNumber(value: number): string {

    const absoluteValue = Math.abs(value);

    if (absoluteValue >= 10000000) {
        return `${(value / 10000000).toFixed(2)} Cr`;
    }

    if (absoluteValue >= 100000) {
        return `${(value / 100000).toFixed(2)} L`;
    }

    if (absoluteValue >= 1000) {
        return `${(value / 1000).toFixed(2)} K`;
    }

    return value.toString();
}