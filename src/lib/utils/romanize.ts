export function romanize(num: number) {
  const numerals = [
    { value: 1000, token: 'M' },
    { value: 900, token: 'CM' },
    { value: 500, token: 'D' },
    { value: 400, token: 'CD' },
    { value: 100, token: 'C' },
    { value: 90, token: 'XC' },
    { value: 50, token: 'L' },
    { value: 40, token: 'XL' },
    { value: 10, token: 'X' },
    { value: 9, token: 'IX' },
    { value: 5, token: 'V' },
    { value: 4, token: 'IV' },
    { value: 1, token: 'I' }
  ]

  let roman = ''

  for (const numeral of numerals) {
    while (num >= numeral.value) {
      roman += numeral.token
      num -= numeral.value
    }
  }

  return roman
}
