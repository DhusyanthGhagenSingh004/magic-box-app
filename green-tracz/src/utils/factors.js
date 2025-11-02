export const FACTORS = {
  transport: {
    car: { kgCO2_per_km: 0.21, cost_per_km: 4/12 },
    public: { kgCO2_per_km: 0.05, cost_per_km: 1.5/12 },
    motorcycle: { kgCO2_per_km: 0.11, cost_per_km: 2.0/12 },
    bike: { kgCO2_per_km: 0.0, cost_per_km: 0 },
    walk: { kgCO2_per_km: 0.0, cost_per_km: 0 },
  },
  meatMealKgCO2: 2.5,
  singleUsePlasticKgCO2: 0.1,
  electricityKgCO2_per_kwh: 0.82,
  electricityCostPerKwh: 8,
};