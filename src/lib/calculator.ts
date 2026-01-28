export const MILLION_TARGET = 1000000;

export interface CalculationResult {
  yearsReal: number;
  yearsOptimized: number;
  scenario: "iniciante" | "investidor";
}

export type InvestorProfile = "conservative" | "aggressive";

/**
 * Calculates the number of years to reach 1 million.
 * Uses NPER formula for compound interest with monthly contributions.
 * 
 * @param currentInvestment (PV) Initial investment
 * @param monthlyInvestment (PMT) Monthly contribution
 * @param annualRate Annual interest rate (decimal, e.g. 0.08 for 8%)
 * @returns Number of years
 */
export const calculateYearsToMillion = (
  currentInvestment: number,
  monthlyInvestment: number,
  annualRate: number
): number => {
  const fv = MILLION_TARGET;
  const pv = currentInvestment;
  const pmt = monthlyInvestment;
  
  // Guard clause for invalid inputs to prevent NaN/Infinity in typical usage
  if (pv >= fv) return 0;
  if (pmt <= 0 && pv <= 0 && annualRate <= 0) return Infinity; 

  const monthlyRate = Math.pow(1 + annualRate, 1 / 12) - 1;

  if (monthlyRate === 0) {
    if (pmt === 0) return Infinity; // Will never reach it without interest or contribution
    return (fv - pv) / pmt / 12;
  }

  // NPER formula: n = ln((FV * r + PMT) / (PV * r + PMT)) / ln(1 + r)
  // Check for edge cases where log argument might be negative/zero, though unlikely with positive inputs
  const numeratorArg = (fv * monthlyRate + pmt) / (pv * monthlyRate + pmt);
  if (numeratorArg <= 0) return Infinity; 

  const numerator = Math.log(numeratorArg);
  const denominator = Math.log(1 + monthlyRate);
  const months = numerator / denominator;

  return Math.max(0, months / 12);
};

export const getRatesByProfile = (profile: InvestorProfile) => {
  const isConservative = profile === "conservative";
  // Real rate: 4% (cons) or 8% (agg)
  const realRate = isConservative ? 0.04 : 0.08;
  // Optimized rate: 8% (cons) or 10% (agg)
  const optimizedRate = isConservative ? 0.08 : 0.10;
  
  return { realRate, optimizedRate };
};

export const determineScenario = (currentInvestment: number, profile: InvestorProfile): "iniciante" | "investidor" => {
  const isConservative = profile === "conservative";
  // Logic from original component: if < 5000 OR conservative -> iniciante
  if (currentInvestment < 5000 || isConservative) {
    return "iniciante";
  }
  return "investidor";
};
