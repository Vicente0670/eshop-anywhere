function setMinutes(n: number): string {
  const m = (Math.floor(n / 60) % 60).toString();
  if (m.length < 2)
    return "0" + m;
  return m;
}

function setSeconds(n: number): string {
  const s = Math.floor(n % 60).toString();
  if (s.length < 2)
    return "0" + s;
  return s;
}

function setMilliseconds(n: number): string {
  let m = Math.floor((n * 1000) % 1000).toString();
  if (m.length < 3)
    while (m.length < 3)
      m = "0" + m;
  return m;
}

export function formatMMSSMM(n: number): string {
  return `${setMinutes(n)}:${setSeconds(n)}.${setMilliseconds(n)}`;
}