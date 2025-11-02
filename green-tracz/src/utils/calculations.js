// src/utils/calculations.js
import { FACTORS } from "./factors";

/**
 * calculateWeekly(inputs)
 * inputs: {
 *   transportKm,
 *   transportMode,
 *   meatMealsPerWeek,
 *   singleUsePlasticsPerWeek,
 *   electricityKwhPerMonth,
 *   reusableBottle,
 *   reusableBag,
 *   solarAtHome
 * }
 */
export function calculateWeekly(inputs) {
  const {
    transportKm,
    transportMode,
    meatMealsPerWeek,
    singleUsePlasticsPerWeek,
    electricityKwhPerMonth,
    reusableBottle,
    reusableBag,
    solarAtHome,
  } = inputs;

  const weeklyTransportKm = (transportKm || 0) * 7;
  const tFactor = FACTORS.transport[transportMode] || FACTORS.transport.car;
  const transportKgCO2 = weeklyTransportKm * tFactor.kgCO2_per_km;
  const transportCost = weeklyTransportKm * tFactor.cost_per_km;

  const foodKgCO2 = (meatMealsPerWeek || 0) * FACTORS.meatMealKgCO2;
  const foodCostSavingsIfVegSwap = (meatMealsPerWeek || 0) * 40; // example saving per meal

  const plasticsKgCO2 = (singleUsePlasticsPerWeek || 0) * FACTORS.singleUsePlasticKgCO2;
  const plasticsCost = (singleUsePlasticsPerWeek || 0) * 20; // example cost per item

  // Convert monthly kWh to weekly kWh (approx)
  const weeklyElectricityKwh = ((electricityKwhPerMonth || 0) * 12) / 52;
  const electricityKgCO2 = weeklyElectricityKwh * FACTORS.electricityKgCO2_per_kwh;
  const electricityCost = weeklyElectricityKwh * FACTORS.electricityCostPerKwh;

  // savings from reusable items (example values)
  const reusableSavings = (reusableBottle ? 30 : 0) + (reusableBag ? 10 : 0); // per week
  const solarSavings = solarAtHome ? electricityCost * 0.6 : 0; // 60% offset

  const totalKgCO2 = transportKgCO2 + foodKgCO2 + plasticsKgCO2 + electricityKgCO2;
  const totalCost = transportCost + plasticsCost + electricityCost - reusableSavings - solarSavings - foodCostSavingsIfVegSwap;

  const treesSaved = +(totalKgCO2 / 21).toFixed(2); // comparative number

  return {
    transportKgCO2: +transportKgCO2.toFixed(2),
    transportCost: +transportCost.toFixed(2),
    foodKgCO2: +foodKgCO2.toFixed(2),
    foodCostSavingsIfVegSwap: +foodCostSavingsIfVegSwap.toFixed(2),
    plasticsKgCO2: +plasticsKgCO2.toFixed(2),
    plasticsCost: +plasticsCost.toFixed(2),
    electricityKgCO2: +electricityKgCO2.toFixed(2),
    electricityCost: +electricityCost.toFixed(2),
    totalKgCO2: +totalKgCO2.toFixed(2),
    totalCost: +totalCost.toFixed(2),
    treesSaved,
    weeklyElectricityKwh: +weeklyElectricityKwh.toFixed(2),
  };
}

/**
 * generateSuggestions(report, inputs) -> returns array of suggestions
 * Each suggestion: { id, title, impact: { kgCO2, money } }
 */
export function generateSuggestions(report, inputs) {
  const suggestions = [];
  if (!inputs) return suggestions;

  if (inputs.transportMode === "car") {
    suggestions.push({
      id: "switch_public",
      title: "Try public transport 2 days/week",
      impact: { kgCO2: +(report.transportKgCO2 * 0.3).toFixed(2), money: 200 },
    });
    suggestions.push({
      id: "carpool",
      title: "Carpool once a week",
      impact: { kgCO2: +(report.transportKgCO2 * 0.15).toFixed(2), money: 100 },
    });
  } else if (inputs.transportMode === "public") {
    suggestions.push({
      id: "bike_short",
      title: "Cycle for short trips",
      impact: { kgCO2: +(report.transportKgCO2 * 0.2).toFixed(2), money: 0 },
    });
  }

  if (!inputs.reusableBottle && (inputs.singleUsePlasticsPerWeek || 0) > 0) {
    suggestions.push({
      id: "bottle",
      title: "Use a reusable bottle",
      impact: { kgCO2: +((inputs.singleUsePlasticsPerWeek || 0) * 0.1).toFixed(2), money: 150 },
    });
  }

  if ((inputs.meatMealsPerWeek || 0) > 0) {
    suggestions.push({
      id: "veg_swap",
      title: "Replace 1 meat meal with veg each week",
      impact: { kgCO2: FACTORS.meatMealKgCO2, money: 40 },
    });
  }

  if (!inputs.solarAtHome && (inputs.electricityKwhPerMonth || 0) > 100) {
    suggestions.push({
      id: "solar",
      title: "Consider home solar (long-term)",
      impact: { kgCO2: +(report.electricityKgCO2 * 0.6).toFixed(2), money: 500 },
    });
  }

  return suggestions;
}

/**
 * computeBadges(report, inputs) -> array of badges
 */
export function computeBadges(report, inputs) {
  const badges = [];
  if (!report) return badges;

  if (report.totalKgCO2 < 10) badges.push({ id: "low_emitter", label: "Low Emission" });
  if (inputs?.reusableBottle) badges.push({ id: "bottle", label: "Reusable Hero" });
  if (inputs?.solarAtHome) badges.push({ id: "solar", label: "Solar Friend" });
  if (report.totalCost < 500) badges.push({ id: "thrifty", label: "Thrifty Saver" });
  return badges;
}