export interface Phone {
  display: string;
  whatsapp?: string;
}

const NON_GEOGRAPHIC = /^0[3589]00/;

export function parsePhoneBR(raw: string | undefined): Phone | undefined {
  const first = raw?.split(/[;,/]/)[0]?.trim();
  if (!first) return undefined;
  if (first.startsWith("+") && !first.startsWith("+55")) return { display: first };

  let digits = first.replace(/\D/g, "");
  if (digits.length === 11 && NON_GEOGRAPHIC.test(digits)) {
    return { display: `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}` };
  }
  if (digits.startsWith("55") && (digits.length === 12 || digits.length === 13)) digits = digits.slice(2);
  else if (digits.startsWith("0") && (digits.length === 11 || digits.length === 12)) digits = digits.slice(1);

  if (!/^[1-9]{2}/.test(digits)) return { display: first };
  const ddd = digits.slice(0, 2);
  if (digits.length === 10) {
    return { display: `(${ddd}) ${digits.slice(2, 6)}-${digits.slice(6)}` };
  }
  if (digits.length === 11 && digits[2] === "9") {
    return {
      display: `(${ddd}) ${digits.slice(2, 7)}-${digits.slice(7)}`,
      whatsapp: `https://wa.me/55${digits}`,
    };
  }
  return { display: first };
}
