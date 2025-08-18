// All user-facing text strings for the Risk Up Front calculator
// Edit these to change the copy without touching the main code

export const textStrings = {
  // Header and branding
  appTitle: "Risk Up Front",
  appSubtitle: "Cost of Being Late Calculator",
  poweredBy: "Powered by Celerity Consulting Group methodology",
  copyright: "© 2025 Celerity Consulting Group Inc. Risk Up Front® is a registered trademark.",

  // Step 1 - Initial form
  step1: {
    title: "Risk Up Front Quick Assessment",
    subtitle: "Calculate linear and non-linear costs in under 60 seconds",
    
    industryLabel: "Industry",
    industryPlaceholder: "Select your industry",
    
    businessValueLabel: "Monthly Business Value",
    businessValueWarning: {
      title: "Important:",
      text: "For revenue-generating projects, we need profit (revenue minus costs), not just revenue. This gives us the actual business value at risk when you're late."
    },
    
    valueTypeLabel: "What type of value does this project deliver each month?",
    valueTypePlaceholder: "Select value type",
    valueTypeOptions: {
      profit: "Lost Profit (revenue-generating project)",
      savings: "Lost Savings (cost-reduction project)"
    },
    
    monthlyValueLabel: {
      profit: "Monthly profit at full scale ($)",
      savings: "Monthly cost savings when deployed ($)",
      default: "Monthly business value ($)"
    },
    monthlyValuePlaceholder: "e.g., 500000",
    monthlyValueHelp: {
      profit: "Profit per month once your product reaches steady state (profit = revenue minus costs)",
      savings: "How much you save in operating costs each month when this is deployed",
      default: "The business value you lose each month by being late"
    },
    
    productLifeLabel: "Product Lifetime (months)",
    productLifePlaceholder: "e.g., 36",
    productLifeHelp: "How long will this project deliver value?",
    
    teamCostTitle: "Team Cost Analysis (Risk Up Front Methodology)",
    teamCostDescription: "If you'd like to calculate the additional cost of funding the team longer than planned, complete these fields. Otherwise, leave them blank. This represents the linear cost of extended team time - some organizations count this as real cost, others consider it \"we're paying them anyway.\"",
    
    teamSizeLabel: "Team Size (optional)",
    teamSizePlaceholder: "e.g., 25",
    teamSizeHelp: "Number of people working on this project",
    
    includeTeamBurnLabel: "Include Linear Team Costs in Analysis",
    includeTeamBurnHelp: "Count extended team time as additional linear cost (Risk Up Front methodology)",
    
    continueButton: "Continue to Non-Linear Costs"
  },

  // Step 2 - Non-linear costs
  step2: {
    title: "Non-Linear Cost Questions",
    subtitle: "Risk Up Front methodology: These create step-function costs when deadlines are breached",
    
    customerLossTitle: "Non-Linear Cost #1: Customer Loss Impact",
    customerLossMonthLabel: "After how many months of delay would you lose one or more key customers?",
    customerLossMonthPlaceholder: "e.g., 3 (leave blank if not applicable)",
    customerLossValueLabel: "What would losing those customers be worth? ($)",
    customerLossValuePlaceholder: "e.g., 5000000",
    
    otherCostTitle: "Non-Linear Cost #2: Other Critical Impact",
    otherCostExamples: "Risk Up Front examples: contract penalties, missed funding deadlines, regulatory windows, partnership agreements, competitive market windows, manufacturing slots, valuation impacts",
    otherCostMonthLabel: "At what month would this other non-linear cost hit?",
    otherCostMonthPlaceholder: "e.g., 6 (leave blank if not applicable)",
    otherCostValueLabel: "What would this non-linear cost be worth? ($)",
    otherCostValuePlaceholder: "e.g., 2000000",
    
    backButton: "Back",
    calculateButton: "Calculate Risk Up Front Cost of Being Late"
  },

  // Loading state
  loading: {
    title: "Calculating Your Risk Up Front Cost of Being Late",
    subtitle: "Analyzing linear and non-linear cost impact across {months} month project lifecycle..."
  },

  // Results
  results: {
    title: "Your Risk Up Front Cost of Being Late Analysis",
    subtitle: "Based on {monthlyValue}/month {valueType} over {productLife} months",
    
    summaryCards: {
      oneMonth: "1 Month Late",
      threeMonths: "3 Months Late",
      sixMonths: "6 Months Late",
      twelveMonths: "12 Months Late"
    },
    
    assumptionsTitle: "Risk Up Front Calculation Assumptions",
    assumptionsSubtitle: "Industry assumptions reflect typical business characteristics: High-growth/high-risk industries use higher discount rates. Complex products require longer ramp periods. Specialized talent commands higher costs.",
    
    viewButtons: {
      summary: "Summary",
      table: "Table",
      graph: "Graph"
    },
    
    insightsTitle: "Risk Up Front Key Insights",
    insights: {
      linearCost: "Linear cost per month: Approximately {amount}",
      nonLinearCosts: {
        found: "Activate after {month} months (step-function impact)",
        none: "None identified in this analysis"
      },
      totalNPV: "Total {valueType} NPV at risk: {amount}"
    },
    
    tableTitle: "Risk Up Front Cost Analysis by Month",
    tableHeaders: {
      monthsLate: "Months Late",
      lostValue: "Lost {valueType} NPV",
      teamCosts: "Linear Team Costs",
      linearSubtotal: "Linear Cost Subtotal",
      nonLinearCosts: "Non-Linear Costs",
      totalCost: "Total Cost"
    },
    
    chartTitle: "Risk Up Front Cost of Being Late Over Time",
    chartInsights: {
      title: "Risk Up Front Chart Insights:",
      nonLinearCosts: {
        both: "Create dramatic step-function jumps at months {customerMonth} and {otherMonth}",
        customer: "Create dramatic step-function jump at month {customerMonth}",
        other: "Create dramatic step-function jump at month {otherMonth}",
        none: "None identified - only linear costs apply"
      },
      linearTeamCosts: "Linear team costs: {amount}/month",
      npvLoss: "Linear {valueType} NPV loss accelerates with longer delays due to {discountRate}% discount rate"
    },
    
    actionButtons: {
      downloadReport: "Download Full Risk Up Front Cost of Being Late Report",
      scheduleAssessment: "Schedule Risk Up Front Assessment",
      newCalculation: "New Calculation"
    }
  },

  // General
  backToSummary: "← Back to Summary",
  chartLegend: {
    onTime: "On Time (No Cost)",
    earlyLate: "1-3 Months Late",
    midLate: "4-6 Months Late",
    veryLate: "7+ Months Late"
  },
  xAxisLabel: "Months of Delay"
};
