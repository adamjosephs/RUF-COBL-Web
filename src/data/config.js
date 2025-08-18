// Configuration constants for the Risk Up Front calculator
// Edit these to adjust application behavior and settings

export const config = {
  // Chart configuration
  chart: {
    height: 300,
    colors: {
      onTime: 'bg-green-500',
      early: 'bg-yellow-500',      // 1-3 months
      mid: 'bg-orange-500',        // 4-6 months  
      late: 'bg-red-500'           // 7+ months
    },
    breakpoints: {
      early: 3,
      mid: 6
    }
  },

  // Form validation
  validation: {
    required: ['industry', 'monthlyBusinessValue', 'businessValueType', 'productLife']
  },

  // Number formatting
  currency: {
    locale: 'en-US',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  },

  // View modes
  viewModes: {
    SUMMARY: 'summary',
    TABLE: 'table', 
    GRAPH: 'graph'
  },

  // Steps
  steps: {
    FORM_1: 1,
    FORM_2: 2,
    RESULTS: 3
  }
};
