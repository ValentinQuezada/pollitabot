export function extractFromCodeblock(text: string): string {
    const match = text.match(/```json\s*([\s\S]*?)\s*```/);
    if (match) {
        return match[1];
    }
    const match2 = text.match(/```\s*([\s\S]*?)\s*```/);
    if (match2) {
        return match2[1];
    }
    return text;
}   

export function markerToDuple(marker: string): [number, number] {
    const match = marker.match(/(\d+)[^\d]+(\d+)/);
    if (match) {
        const num1 = parseInt(match[1], 10);
        const num2 = parseInt(match[2], 10);
        return [num1, num2];
    }
    throw new Error("Invalid marker format");
}