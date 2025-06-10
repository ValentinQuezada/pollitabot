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