export function remaining(target, now = Date.now()) {
 const seconds = Math.max(0, Math.floor((Date.parse(target) - now) / 1000));
 return [Math.floor(seconds/86400),Math.floor(seconds/3600)%24,Math.floor(seconds/60)%60,seconds%60];
}
export function whatsappMessage(name, count) {
 if (!name.trim() || !Number.isInteger(count) || count < 1 || count > 30) throw new Error('Revisa tu nombre y el número de personas (1 a 30).');
 return `Hola, con mucho gusto confirmo mi asistencia al bautizo de Dulce Abigail Flores Martínez, el sábado 26 de diciembre de 2026.\n\nMi nombre es ${name.trim()} y asistiremos ${count} personas.\n\n¡Muchas gracias por la invitación!`;
}
export function calendar() {
 return ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Familia Flores Martinez//Bautizo//ES','CALSCALE:GREGORIAN','BEGIN:VEVENT','UID:bautizo-dulce-abigail-20261226@antauri7.github.io','DTSTAMP:20261110T000000Z','DTSTART:20261226T180000Z','SUMMARY:Bautizo de Dulce Abigail Flores Martínez','LOCATION:Iglesia del Divino Salvador\\, Av. 16 de Enero 1869\\, Centro\\, San Salvador\\, Hidalgo','DESCRIPTION:Ceremonia religiosa a las 12:00 p. m. (America/Mexico_City).','END:VEVENT','END:VCALENDAR',''].map(line => {
 const parts=[];let part='';let bytes=0;
 for(const c of line){const n=new TextEncoder().encode(c).length;if(bytes+n>73){parts.push(part);part=' ';bytes=1;}part+=c;bytes+=n;}parts.push(part);return parts.join('\r\n');
 }).join('\r\n');
}
