export function zonedDateTimeToUtc(date: string, time: string, timeZone: string) {
  const [year, month, day] = date.split('-').map(Number);
  const [hour, minute, second = 0] = time.split(':').map(Number);
  const desired = Date.UTC(year, month - 1, day, hour, minute, second);
  let guess = desired;
  const formatter = new Intl.DateTimeFormat('en-CA', { timeZone, year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23' });
  for (let attempt = 0; attempt < 3; attempt++) {
    const parts = Object.fromEntries(formatter.formatToParts(new Date(guess)).filter(p=>p.type!=='literal').map(p=>[p.type,Number(p.value)]));
    const represented = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
    const adjustment = desired - represented;
    guess += adjustment;
    if (!adjustment) break;
  }
  return new Date(guess);
}
