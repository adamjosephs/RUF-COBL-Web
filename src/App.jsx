import React, { useState } from 'react';
import { Calculator, BarChart, Table } from 'lucide-react';

// Import our organized data and utilities
import { textStrings } from './data/textStrings.js';
import { industries, industryDefaults, businessValueTypes, calculationDefaults } from './data/industryData.js';
import { config } from './data/config.js';
import { formatCurrency, replaceTextPlaceholders, getChartColor, validateForm } from './utils/helpers.js';

const COBLCalculator = () => {
  const [step, setStep] = useState(config.steps.FORM_1);
  const [formData, setFormData] = useState({
    industry: '',
    teamSize: '',
    monthlyBusinessValue: '',
    businessValueType: '',
    includeTeamBurn: true,
    productLife: '',
    customerLossMonth: '',
    customerLossValue: '',
    otherCostMonth: '',
    otherCostValue: ''
  });
  const [results, setResults] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [viewMode, setViewMode] = useState(config.viewModes.SUMMARY);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculateCOBL = async () => {
    setIsCalculating(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, calculationDefaults.simulationDelay));
      
      const monthlyBusinessValue = parseInt(formData.monthlyBusinessValue) || calculationDefaults.monthlyBusinessValue;
      const productLife = parseInt(formData.productLife) || calculationDefaults.productLife;
      const teamSize = parseInt(formData.teamSize) || 0;
      const includeTeamBurn = formData.includeTeamBurn && teamSize > 0;
      const customerLossMonth = parseInt(formData.customerLossMonth) || 0;
      const customerLossValue = parseInt(formData.customerLossValue) || 0;
      const otherCostMonth = parseInt(formData.otherCostMonth) || 0;
      const otherCostValue = parseInt(formData.otherCostValue) || 0;
      
      // Use industry defaults
      const defaults = industryDefaults[formData.industry] || industryDefaults['Other'];
      const discountRate = defaults.discountRate;
      const rampMonths = defaults.rampMonths;
      const teamBurnRate = includeTeamBurn ? (teamSize * defaults.costPerPersonPerMonth) : 0;
      
      const results = calculateCOBLOverTime({
        monthlyBusinessValue,
        businessValueType: formData.businessValueType,
        productLife,
        rampMonths,
        teamBurnRate,
        discountRate,
        customerLossMonth,
        customerLossValue,
        otherCostMonth,
        otherCostValue,
        includeTeamBurn
      });
      
      setResults(results);
      setIsCalculating(false);
      setStep(3);
    } catch (error) {
      console.error('Calculation error:', error);
      setIsCalculating(false);
    }
  };

  const calculateCOBLOverTime = (params) => {
    const {
      monthlyBusinessValue, businessValueType, productLife, rampMonths, teamBurnRate, discountRate,
      customerLossMonth = 0, customerLossValue = 0, otherCostMonth = 0, otherCostValue = 0, includeTeamBurn = true
    } = params;
    
    const monthlyDiscountRate = discountRate / 100 / 12;
    
    // Calculate NPV for different delay scenarios
    const calculateNPV = (delayMonths) => {
      let npv = 0;
      for (let month = 1; month <= productLife; month++) {
        const effectiveMonth = month + delayMonths;
        
        // For profit projects, apply ramp period; for savings projects, immediate value
        let value;
        if (businessValueType === businessValueTypes.PROFIT) {
          value = month <= rampMonths ? (monthlyBusinessValue * (month / rampMonths)) : monthlyBusinessValue;
        } else {
          value = monthlyBusinessValue; // Savings start immediately when deployed
        }
        
        const discountFactor = Math.pow(1 + monthlyDiscountRate, -effectiveMonth);
        npv += value * discountFactor;
      }
      return npv;
    };

    const onTimeNPV = calculateNPV(0);
    const monthlyData = [];
    
    // Calculate cost for each month of delay (0 to maxDelayMonths)
    for (let delayMonths = 0; delayMonths <= calculationDefaults.maxDelayMonths; delayMonths++) {
      const delayedNPV = calculateNPV(delayMonths);
      const lostBusinessValue = onTimeNPV - delayedNPV;
      const additionalBurn = teamBurnRate * delayMonths;
      
      const linearCosts = lostBusinessValue + additionalBurn;
      
      // Simple non-linear costs based on user input
      let nonLinearCosts = 0;
      if (delayMonths >= customerLossMonth && customerLossMonth > 0) {
        nonLinearCosts += customerLossValue;
      }
      if (delayMonths >= otherCostMonth && otherCostMonth > 0) {
        nonLinearCosts += otherCostValue;
      }
      
      const totalCost = linearCosts + nonLinearCosts;
      
      monthlyData.push({
        month: delayMonths,
        lostBusinessValue: Math.round(lostBusinessValue),
        additionalBurn: Math.round(additionalBurn),
        linearCosts: Math.round(linearCosts),
        nonLinearCosts: Math.round(nonLinearCosts),
        totalCost: Math.round(totalCost),
        monthlyCost: delayMonths > 0 ? Math.round(totalCost / delayMonths) : 0
      });
    }

    return {
      onTimeNPV: Math.round(onTimeNPV),
      productLife,
      rampMonths,
      discountRate,
      businessValueType,
      monthlyData,
      summary: {
        oneMonthCost: monthlyData[1]?.totalCost || 0,
        threeMonthCost: monthlyData[3]?.totalCost || 0,
        sixMonthCost: monthlyData[6]?.totalCost || 0,
        twelveMonthCost: monthlyData[12]?.totalCost || 0
      },
      params: { ...params, monthlyBusinessValue }
    };
  };

  const renderSimpleForm = () => {
    if (step === config.steps.FORM_1) {
      return (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {textStrings.step1.title}
            </h2>
            <p className="text-gray-600">
              {textStrings.step1.subtitle}
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {textStrings.step1.industryLabel}
              </label>
              <select 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.industry}
                onChange={(e) => handleInputChange('industry', e.target.value)}
              >
                <option value="">{textStrings.step1.industryPlaceholder}</option>
                {industries.map(industry => (
                  <option key={industry} value={industry}>{industry}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {textStrings.step1.businessValueLabel}
              </label>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                <p className="text-sm text-yellow-800">
                  <strong>{textStrings.step1.businessValueWarning.title}</strong> {textStrings.step1.businessValueWarning.text}
                </p>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-2">
                    {textStrings.step1.valueTypeLabel}
                  </label>
                  <select 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.businessValueType}
                    onChange={(e) => handleInputChange('businessValueType', e.target.value)}
                  >
                    <option value="">{textStrings.step1.valueTypePlaceholder}</option>
                    <option value={businessValueTypes.PROFIT}>{textStrings.step1.valueTypeOptions.profit}</option>
                    <option value={businessValueTypes.SAVINGS}>{textStrings.step1.valueTypeOptions.savings}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-2">
                    {formData.businessValueType === businessValueTypes.PROFIT ? 
                      textStrings.step1.monthlyValueLabel.profit : 
                      formData.businessValueType === businessValueTypes.SAVINGS ?
                      textStrings.step1.monthlyValueLabel.savings :
                      textStrings.step1.monthlyValueLabel.default}
                  </label>
                  <input 
                    type="number"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={textStrings.step1.monthlyValuePlaceholder}
                    value={formData.monthlyBusinessValue}
                    onChange={(e) => handleInputChange('monthlyBusinessValue', e.target.value)}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {formData.businessValueType === businessValueTypes.PROFIT ? 
                      textStrings.step1.monthlyValueHelp.profit : 
                      formData.businessValueType === businessValueTypes.SAVINGS ?
                      textStrings.step1.monthlyValueHelp.savings :
                      textStrings.step1.monthlyValueHelp.default}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {textStrings.step1.productLifeLabel}
              </label>
              <input 
                type="number"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={textStrings.step1.productLifePlaceholder}
                value={formData.productLife}
                onChange={(e) => handleInputChange('productLife', e.target.value)}
              />
              <p className="text-sm text-gray-500 mt-1">
                {textStrings.step1.productLifeHelp}
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h3 className="font-medium text-blue-900 mb-2">{textStrings.step1.teamCostTitle}</h3>
              <p className="text-sm text-blue-800">
                <strong>{textStrings.step1.teamCostDescription}</strong>
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {textStrings.step1.teamSizeLabel}
              </label>
              <input 
                type="number"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={textStrings.step1.teamSizePlaceholder}
                value={formData.teamSize}
                onChange={(e) => handleInputChange('teamSize', e.target.value)}
              />
              <p className="text-sm text-gray-500 mt-1">
                {textStrings.step1.teamSizeHelp}
              </p>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg">
              <label className="flex items-center space-x-3">
                <input 
                  type="checkbox"
                  checked={formData.includeTeamBurn}
                  onChange={(e) => handleInputChange('includeTeamBurn', e.target.checked)}
                  className="h-5 w-5 text-blue-600"
                />
                <div>
                  <div className="font-medium">{textStrings.step1.includeTeamBurnLabel}</div>
                  <div className="text-sm text-gray-600">
                    {textStrings.step1.includeTeamBurnHelp}
                  </div>
                </div>
              </label>
            </div>
          </div>

          <button 
            onClick={() => setStep(config.steps.FORM_2)}
            disabled={!validateForm(formData)}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {textStrings.step1.continueButton}
          </button>
        </div>
      );
    }

    if (step === config.steps.FORM_2) {
      return (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {textStrings.step2.title}
            </h2>
            <p className="text-gray-600">
              {textStrings.step2.subtitle}
            </p>
          </div>

          <div className="space-y-6">
            {/* Customer Loss Question */}
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-3">
                Non-Linear Cost #1: Customer Loss Impact
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    After how many months of delay would you lose one or more key customers?
                  </label>
                  <input 
                    type="number"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 3 (leave blank if not applicable)"
                    value={formData.customerLossMonth}
                    onChange={(e) => handleInputChange('customerLossMonth', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What would losing those customers be worth? ($)
                  </label>
                  <input 
                    type="number"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 5000000"
                    value={formData.customerLossValue}
                    onChange={(e) => handleInputChange('customerLossValue', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Other Critical Cost Question */}
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-3">
                Non-Linear Cost #2: Other Critical Impact
              </h3>
              <div className="mb-3 text-sm text-gray-600">
                <strong>Risk Up Front examples:</strong> contract penalties, missed funding deadlines, regulatory windows, 
                partnership agreements, competitive market windows, manufacturing slots, valuation impacts
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    At what month would this other non-linear cost hit?
                  </label>
                  <input 
                    type="number"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 6 (leave blank if not applicable)"
                    value={formData.otherCostMonth}
                    onChange={(e) => handleInputChange('otherCostMonth', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What would this non-linear cost be worth? ($)
                  </label>
                  <input 
                    type="number"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 2000000"
                    value={formData.otherCostValue}
                    onChange={(e) => handleInputChange('otherCostValue', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-sm text-blue-800">
                <strong>Risk Up Front Linear Costs We'll Calculate:</strong> NPV of lost {formData.businessValueType === 'profit' ? 'profit' : formData.businessValueType === 'savings' ? 'cost savings' : 'business value'}{formData.includeTeamBurn && formData.teamSize && industryDefaults[formData.industry] ? `, linear team costs (~$${industryDefaults[formData.industry].costPerPersonPerMonth.toLocaleString()}/person/month)` : ''}, and discount rates based on {formData.industry} industry standards
              </div>
            </div>
          </div>

          <div className="flex space-x-4">
            <button 
              onClick={() => setStep(1)}
              className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              Back
            </button>
            <button 
              onClick={calculateCOBL}
              className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Calculate Risk Up Front Cost of Being Late
            </button>
          </div>
        </div>
      );
    }
  };

  const renderResults = () => {
    if (!results) return null;

    if (viewMode === 'summary') {
      return (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Your Risk Up Front Cost of Being Late Analysis
            </h2>
            <p className="text-gray-600">
              Based on {formatCurrency(results.params.monthlyBusinessValue)}/month {results.businessValueType === 'profit' ? 'profit' : 'cost savings'} over {results.productLife} months
            </p>
          </div>

          {/* Quick Summary Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="text-sm text-yellow-700 font-medium">1 Month Late</div>
              <div className="text-2xl font-bold text-yellow-800">{formatCurrency(results.summary.oneMonthCost)}</div>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="text-sm text-orange-700 font-medium">3 Months Late</div>
              <div className="text-2xl font-bold text-orange-800">{formatCurrency(results.summary.threeMonthCost)}</div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="text-sm text-red-700 font-medium">6 Months Late</div>
              <div className="text-2xl font-bold text-red-800">{formatCurrency(results.summary.sixMonthCost)}</div>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="text-sm text-purple-700 font-medium">12 Months Late</div>
              <div className="text-2xl font-bold text-purple-800">{formatCurrency(results.summary.twelveMonthCost)}</div>
            </div>
          </div>

          {/* Risk Up Front Calculation Assumptions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Risk Up Front Calculation Assumptions
            </h3>
            <div className="mb-4 text-sm text-blue-800">
              <strong>Industry assumptions reflect typical business characteristics:</strong> High-growth/high-risk industries use higher discount rates. 
              Complex products require longer ramp periods. Specialized talent commands higher costs.
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-medium text-gray-900">Industry: {formData.industry}</div>
                <ul className="mt-2 space-y-1 text-gray-700">
                  <li>• Discount rate: {results.discountRate}% annually</li>
                  <li>• {results.businessValueType === 'profit' ? 'Revenue ramp period' : 'Deployment period'}: {results.rampMonths} months</li>
                  {results.params.includeTeamBurn && <li>• Team cost: {formatCurrency(industryDefaults[formData.industry]?.costPerPersonPerMonth || 12000)}/person/month</li>}
                </ul>
              </div>
              <div>
                <div className="font-medium text-gray-900">Your Project Parameters</div>
                <ul className="mt-2 space-y-1 text-gray-700">
                  <li>• Monthly {results.businessValueType === 'profit' ? 'profit' : 'cost savings'}: {formatCurrency(results.params.monthlyBusinessValue)}</li>
                  <li>• Product lifetime: {results.productLife} months</li>
                  {results.params.includeTeamBurn && <li>• Team size: {parseInt(formData.teamSize)} people</li>}
                  {results.params.customerLossMonth > 0 && <li>• Customer loss risk: Month {results.params.customerLossMonth} ({formatCurrency(results.params.customerLossValue)})</li>}
                  {results.params.otherCostMonth > 0 && <li>• Other critical cost: Month {results.params.otherCostMonth} ({formatCurrency(results.params.otherCostValue)})</li>}
                </ul>
              </div>
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex space-x-2 justify-center">
            <button 
              onClick={() => setViewMode('summary')}
              className={`px-4 py-2 rounded-lg font-medium ${viewMode === 'summary' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Summary
            </button>
            <button 
              onClick={() => setViewMode('table')}
              className={`px-4 py-2 rounded-lg font-medium ${viewMode === 'table' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              <Table className="h-4 w-4 inline mr-1" />
              Table
            </button>
            <button 
              onClick={() => setViewMode('graph')}
              className={`px-4 py-2 rounded-lg font-medium ${viewMode === 'graph' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              <BarChart className="h-4 w-4 inline mr-1" />
              Graph
            </button>
          </div>

          {/* Key Insights */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Risk Up Front Key Insights
            </h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                <span><strong>Linear cost per month:</strong> Approximately {formatCurrency(results.monthlyData[1]?.monthlyCost || 0)}</span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                <span><strong>Non-linear costs:</strong> {
                  (() => {
                    const firstNonLinear = results.monthlyData.find(d => d.nonLinearCosts > 0);
                    if (firstNonLinear) {
                      return `Activate after ${firstNonLinear.month} months (step-function impact)`;
                    } else {
                      return 'None identified in this analysis';
                    }
                  })()
                }</span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                <span><strong>Total {results.businessValueType === 'profit' ? 'profit' : 'savings'} NPV at risk:</strong> {formatCurrency(results.onTimeNPV)}</span>
              </li>
            </ul>
          </div>
        </div>
      );
    }

    if (viewMode === 'table') {
      return (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Risk Up Front Cost Analysis by Month
            </h2>
            <button 
              onClick={() => setViewMode('summary')}
              className="text-blue-600 hover:underline"
            >
              ← Back to Summary
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300 text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 p-2 text-left">Months Late</th>
                  <th className="border border-gray-300 p-2 text-right">Lost {results.businessValueType === 'profit' ? 'Profit' : 'Savings'} NPV</th>
                  {results.params.includeTeamBurn && <th className="border border-gray-300 p-2 text-right">Linear Team Costs</th>}
                  <th className="border border-gray-300 p-2 text-right">Linear Cost Subtotal</th>
                  <th className="border border-gray-300 p-2 text-right">Non-Linear Costs</th>
                  <th className="border border-gray-300 p-2 text-right font-bold">Total Cost</th>
                </tr>
              </thead>
              <tbody>
                {results.monthlyData.map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="border border-gray-300 p-2 font-medium">{row.month}</td>
                    <td className="border border-gray-300 p-2 text-right">{formatCurrency(row.lostBusinessValue)}</td>
                    {results.params.includeTeamBurn && <td className="border border-gray-300 p-2 text-right">{formatCurrency(row.additionalBurn)}</td>}
                    <td className="border border-gray-300 p-2 text-right">{formatCurrency(row.linearCosts)}</td>
                    <td className="border border-gray-300 p-2 text-right">{formatCurrency(row.nonLinearCosts)}</td>
                    <td className="border border-gray-300 p-2 text-right font-bold text-red-600">{formatCurrency(row.totalCost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    if (viewMode === 'graph') {
      const maxCost = Math.max(...results.monthlyData.map(d => d.totalCost));
      const chartHeight = 300;
      
      return (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Risk Up Front Cost of Being Late Over Time
            </h2>
            <button 
              onClick={() => setViewMode('summary')}
              className="text-blue-600 hover:underline"
            >
              ← Back to Summary
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg border">
            <div className="relative" style={{ height: `${chartHeight + 60}px` }}>
              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 pr-2">
                <span>{formatCurrency(maxCost)}</span>
                <span>{formatCurrency(maxCost * 0.75)}</span>
                <span>{formatCurrency(maxCost * 0.5)}</span>
                <span>{formatCurrency(maxCost * 0.25)}</span>
                <span>$0</span>
              </div>
              
              {/* Chart area */}
              <div className="ml-20 mr-4">
                <div className="flex items-end justify-between h-80 border-l border-b border-gray-300">
                  {results.monthlyData.map((data, i) => {
                    const heightPercent = maxCost > 0 ? (data.totalCost / maxCost) * 100 : 0;
                    const barHeight = (heightPercent / 100) * chartHeight;
                    
                    return (
                      <div key={i} className="flex flex-col items-center flex-1 mx-1">
                        {/* Value label on top */}
                        <div className="text-xs text-gray-600 mb-1 h-8 flex items-end">
                          {data.totalCost > 0 && formatCurrency(data.totalCost)}
                        </div>
                        
                        {/* Bar */}
                        <div className="w-full max-w-8 relative">
                          <div 
                            className={`w-full rounded-t transition-all duration-500 ${
                              i === 0 ? 'bg-green-500' : 
                              i <= 3 ? 'bg-yellow-500' : 
                              i <= 6 ? 'bg-orange-500' : 'bg-red-500'
                            }`}
                            style={{ 
                              height: `${barHeight}px`,
                              minHeight: data.totalCost > 0 ? '4px' : '0px'
                            }}
                          ></div>
                        </div>
                        
                        {/* Month label */}
                        <div className="text-xs text-gray-700 mt-2 font-medium">
                          {i === 0 ? 'On Time' : `${data.month}m`}
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* X-axis label */}
                <div className="text-center text-sm text-gray-600 mt-4">
                  Months of Delay
                </div>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span>On Time (No Cost)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <span>1-3 Months Late</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-orange-500 rounded"></div>
              <span>4-6 Months Late</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span>7+ Months Late</span>
            </div>
          </div>

          {/* Key Insights */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Risk Up Front Chart Insights:</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• <strong>Non-linear costs:</strong> {
                (() => {
                  const customerMonth = results.params.customerLossMonth;
                  const otherMonth = results.params.otherCostMonth;
                  if (customerMonth > 0 && otherMonth > 0) {
                    return `Create dramatic step-function jumps at months ${customerMonth} and ${otherMonth}`;
                  } else if (customerMonth > 0) {
                    return `Create dramatic step-function jump at month ${customerMonth}`;
                  } else if (otherMonth > 0) {
                    return `Create dramatic step-function jump at month ${otherMonth}`;
                  } else {
                    return 'None identified - only linear costs apply';
                  }
                })()
              }</li>
              {results.params.includeTeamBurn && <li>• <strong>Linear team costs:</strong> {formatCurrency(results.params.teamBurnRate)}/month</li>}
              <li>• <strong>Linear {results.businessValueType === 'profit' ? 'profit' : 'savings'} NPV loss</strong> accelerates with longer delays due to {results.discountRate}% discount rate</li>
            </ul>
          </div>
        </div>
      );
    }
  };

  const resetCalculator = () => {
    setStep(1);
    setResults(null);
    setViewMode('summary');
    setFormData({
      industry: '',
      teamSize: '',
      monthlyBusinessValue: '',
      businessValueType: '',
      includeTeamBurn: true,
      productLife: '',
      customerLossMonth: '',
      customerLossValue: '',
      otherCostMonth: '',
      otherCostValue: ''
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Calculator className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Risk Up Front
            </h1>
          </div>
          <h2 className="text-xl text-gray-600 mb-2">
            Cost of Being Late Calculator
          </h2>
          <p className="text-sm text-gray-500">
            Powered by Celerity Consulting Group methodology
          </p>
        </div>

        {/* Loading State */}
        {isCalculating && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Calculating Your Risk Up Front Cost of Being Late
            </h3>
            <p className="text-gray-600">
              Analyzing linear and non-linear cost impact across {formData.productLife || formData.productLife || 36} month project lifecycle...
            </p>
          </div>
        )}

        {/* Content */}
        {!isCalculating && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            {results ? renderResults() : renderSimpleForm()}
            
            {results && (
              <div className="mt-8 space-y-4">
                <button className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                  Download Full Risk Up Front Cost of Being Late Report
                </button>
                <div className="flex space-x-4">
                  <button className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 transition-colors">
                    Schedule Risk Up Front Assessment
                  </button>
                  <button 
                    onClick={resetCalculator}
                    className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                  >
                    New Calculation
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>© 2025 Celerity Consulting Group Inc. Risk Up Front® is a registered trademark.</p>
        </div>
      </div>
    </div>
  );
};

export default COBLCalculator;
