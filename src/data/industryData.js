// Industry data and financial assumptions for Risk Up Front calculations
// Edit these values to adjust industry-specific parameters

export const industries = [
  'Biotech/Pharmaceutical',
  'Financial Technology', 
  'Software/SaaS',
  'Hardware/Electronics',
  'Semiconductor',
  'Industrial Technology',
  'Energy/Cleantech',
  'Other'
];

export const industryDefaults = {
  'Biotech/Pharmaceutical': { 
    discountRate: 14,    // Annual discount rate (%)
    rampMonths: 4,       // Months to reach full value
    costPerPersonPerMonth: 12000 // Monthly cost per team member ($)
  },
  'Financial Technology': { 
    discountRate: 11, 
    rampMonths: 3, 
    costPerPersonPerMonth: 15000 
  },
  'Software/SaaS': { 
    discountRate: 12, 
    rampMonths: 3, 
    costPerPersonPerMonth: 13000 
  },
  'Hardware/Electronics': { 
    discountRate: 10, 
    rampMonths: 6, 
    costPerPersonPerMonth: 11000 
  },
  'Semiconductor': { 
    discountRate: 13, 
    rampMonths: 8, 
    costPerPersonPerMonth: 14000 
  },
  'Industrial Technology': { 
    discountRate: 10, 
    rampMonths: 6, 
    costPerPersonPerMonth: 12000 
  },
  'Energy/Cleantech': { 
    discountRate: 9, 
    rampMonths: 8, 
    costPerPersonPerMonth: 10000 
  },
  'Other': { 
    discountRate: 10, 
    rampMonths: 4, 
    costPerPersonPerMonth: 12000 
  }
};

// Business value types
export const businessValueTypes = {
  PROFIT: 'profit',
  SAVINGS: 'savings'
};

// Default values for calculations
export const calculationDefaults = {
  monthlyBusinessValue: 1000000,
  productLife: 36,
  maxDelayMonths: 12,
  simulationDelay: 1500 // ms - artificial delay for calculation animation
};
