// Round to two significant digits to avoid false precision
const roundToTwoSignificantDigits = (num) => {
  if (num === 0) return 0;
  
  const magnitude = Math.pow(10, Math.floor(Math.log10(Math.abs(num))));
  const normalized = num / magnitude;
  const rounded = Math.round(normalized * 10) / 10; // Round to 1 decimal place
  
  return rounded * magnitude;
};

export const formatCurrency = (amount) => {
  const roundedAmount = roundToTwoSignificantDigits(amount);
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(roundedAmount);
};

// Helper function to generate nice Y-axis tick marks
export const generateYAxisTicks = (maxValue, tickCount = 6) => {
  if (maxValue === 0) return [0];
  
  // Calculate nice round step size
  const range = maxValue;
  const roughStep = range / (tickCount - 1);
  
  // Round to nearest nice number
  const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)));
  const normalizedStep = roughStep / magnitude;
  
  let niceStep;
  if (normalizedStep < 1.5) niceStep = 1;
  else if (normalizedStep < 3) niceStep = 2;
  else if (normalizedStep < 7) niceStep = 5;
  else niceStep = 10;
  
  const step = niceStep * magnitude;
  
  // Generate ticks from 0 to at least maxValue
  const ticks = [];
  for (let i = 0; i * step <= maxValue; i++) {
    ticks.push(i * step);
  }
  
  // Ensure we have the max value or close to it
  const lastTick = ticks[ticks.length - 1];
  if (lastTick < maxValue) {
    ticks.push(lastTick + step);
  }
  
  return ticks.reverse(); // Reverse so highest value is first (top of chart)
};
