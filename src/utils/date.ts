export function convertToDateTime(dateString: string): Date {
    try{
        const [date, time] = dateString.split(' ');
        const [year, month, day] = date.split('-').map(Number);
        const [hours, minutes] = time.split(':').map(Number);
        return new Date(year, month - 1, day, hours, minutes);
    } catch (error) {
        throw new Error("Invalid date format");
    }
}