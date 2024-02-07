import BigNumber from "bignumber.js"

export const convertExponential = (n: string | number) => {
  const newNr = new BigNumber(n)
  return newNr.toFixed(9)
}
