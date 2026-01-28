import { describe, it, expect } from "vitest";
import { calculateYearsToMillion, getRatesByProfile, determineScenario } from "../lib/calculator";

describe("calculateYearsToMillion", () => {
    it("should calculate correct years for simple case without interest", () => {
        // 0 initial, 10,000 monthly, 0% interest -> 1,000,000 / 10,000 = 100 months = 8.33 years
        const years = calculateYearsToMillion(0, 10000, 0);
        expect(years).toBeCloseTo(8.333, 3);
    });

    it("should return 0 if already millionaire", () => {
        expect(calculateYearsToMillion(1000000, 1000, 0.1)).toBe(0);
        expect(calculateYearsToMillion(2000000, 1000, 0.1)).toBe(0);
    });

    it("should handle compound interest correctly", () => {
        // Standard check: PV=0, PMT=1000, Rate=10%
        // Excel NPER(10%/12, -1000, 0, 1000000) / 12
        const years = calculateYearsToMillion(0, 1000, 0.10);
        // Rough estimate: ~23-24 years
        expect(years).toBeGreaterThan(20);
        expect(years).toBeLessThan(30);
    });

    it("should return Infinity if progress is impossible", () => {
        // 0 initial, 0 monthly, 0 interest
        expect(calculateYearsToMillion(0, 0, 0)).toBe(Infinity);
    });
});

describe("getRatesByProfile", () => {
    it("should return correct rates for conservative", () => {
        const { realRate, optimizedRate } = getRatesByProfile("conservative");
        expect(realRate).toBe(0.04);
        expect(optimizedRate).toBe(0.08);
    });

    it("should return correct rates for aggressive", () => {
        const { realRate, optimizedRate } = getRatesByProfile("aggressive");
        expect(realRate).toBe(0.08);
        expect(optimizedRate).toBe(0.10);
    });
});

describe("determineScenario", () => {
    it("should be 'iniciante' if conservative", () => {
        expect(determineScenario(100000, "conservative")).toBe("iniciante");
    });

    it("should be 'iniciante' if aggressive but low investment", () => {
        expect(determineScenario(4000, "aggressive")).toBe("iniciante");
    });

    it("should be 'investidor' if aggressive and high investment", () => {
        expect(determineScenario(5000, "aggressive")).toBe("investidor");
        expect(determineScenario(100000, "aggressive")).toBe("investidor");
    });
});
