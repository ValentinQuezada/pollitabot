export function horaSimpleConHrs(date: Date, timeZone: string = 'America/Bogota'): string {
  const [horas, minutos] = date
    .toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone })
    .split(':');
  return `${horas}:${minutos} hrs`;
}

export function diaSimple(date: Date, timeZone: string = 'America/Bogota'): string {
  const opciones: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', timeZone };
  const [dia, mes] = date
    .toLocaleDateString('es-PE', opciones)
    .split('/')
    .map((parte) => parte.padStart(2, '0'));
  return `${dia}/${mes}`;
}