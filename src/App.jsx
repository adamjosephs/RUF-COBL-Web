import React, { useState } from 'react';
import { DollarSign, AlertTriangle, TrendingUp, Clock, Users, Calculator, BarChart, Table } from 'lucide-react';
import { textStrings } from './data/textStrings';
import { industries, industryDefaults } from './data/industryData';
import { config } from './data/config';
import { formatCurrency } from './utils/helpers';

const COBLCalculator = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    industry: '',
    teamSize: '',
    monthlyBusinessValue: '',
    businessValueType: '', // 'profit' or 'savings'
    includeTeamBurn: true,
    productLife: '',
    customerLossMonth: '',
    customerLossValue: '',
    otherCostMonth: '',
    otherCostValue: ''
  });
  const [results, setResults] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [viewMode, setViewMode] = useState('summary'); // 'summary', 'table', 'graph'

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculateCOBL = async () => {
    setIsCalculating(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const monthlyBusinessValue = parseInt(formData.monthlyBusinessValue) || 1000000;
      const productLife = parseInt(formData.productLife) || 36;
      const teamSize = parseInt(formData.teamSize) || 10;
      
      const industryDefault = industryDefaults[formData.industry] || industryDefaults['Other'];
      const discountRate = industryDefault.discountRate / 100 / 12;
      const rampMonths = industryDefault.rampMonths;
      const costPerPersonPerMonth = industryDefault.costPerPersonPerMonth;
      
      const params = {
        monthlyBusinessValue,
        productLife,
        teamSize,
        costPerPersonPerMonth,
        rampMonths,
        discountRate,
        businessValueType: formData.businessValueType,
        includeTeamBurn: formData.includeTeamBurn,
        customerLossMonth: parseInt(formData.customerLossMonth) || null,
        customerLossValue: parseInt(formData.customerLossValue) || 0,
        otherCostMonth: parseInt(formData.otherCostMonth) || null,
        otherCostValue: parseInt(formData.otherCostValue) || 0
      };
      
      const monthlyData = [];
      let cumulativeLostBusinessValue = 0;
      let cumulativeAdditionalBurn = 0;
      
      for (let month = 0; month <= 12; month++) {
        const lostBusinessValue = month === 0 ? 0 : monthlyBusinessValue;
        cumulativeLostBusinessValue += lostBusinessValue;
        
        const npvFactor = Math.pow(1 + discountRate, -month);
        const npvLostBusinessValue = lostBusinessValue * npvFactor;
        
        const additionalBurn = params.includeTeamBurn && month > 0 ? 
          teamSize * costPerPersonPerMonth : 0;
        cumulativeAdditionalBurn += additionalBurn;
        
        const rampFactor = month <= rampMonths ? (month / rampMonths) : 1;
        const linearCosts = cumulativeLostBusinessValue * npvFactor + cumulativeAdditionalBurn * rampFactor;
        
        let nonLinearCosts = 0;
        if (params.customerLossMonth && month >= params.customerLossMonth) {
          nonLinearCosts += params.customerLossValue;
        }
        if (params.otherCostMonth && month >= params.otherCostMonth) {
          nonLinearCosts += params.otherCostValue;
        }
        
        const totalCost = linearCosts + nonLinearCosts;
        
        monthlyData.push({
          month,
          lostBusinessValue: npvLostBusinessValue,
          additionalBurn,
          linearCosts,
          nonLinearCosts,
          totalCost
        });
      }
      
      setResults({
        monthlyBusinessValue,
        productLife,
        rampMonths,
        discountRate,
        businessValueType: formData.businessValueType,
        monthlyData,
        summary: {
          oneMonthCost: monthlyData[1]?.totalCost || 0,
          threeMonthCost: monthlyData[3]?.totalCost || 0,
          sixMonthCost: monthlyData[6]?.totalCost || 0,
          twelveMonthCost: monthlyData[12]?.totalCost || 0
        },
        params: { ...params, monthlyBusinessValue }
      });
    } catch (error) {
      console.error('Calculation error:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  const renderSimpleForm = () => {
    if (step === 1) {
      return (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {textStrings.step1.title}
            </h2>
            <p className="text-gray-600">
              {textStrings.step1.description}
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
                {textStrings.step1.teamSizeLabel}
              </label>
              <input
                type="number"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={textStrings.step1.teamSizePlaceholder}
                value={formData.teamSize}
                onChange={(e) => handleInputChange('teamSize', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {textStrings.step1.businessValueLabel}
              </label>
              <input
                type="number"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={textStrings.step1.businessValuePlaceholder}
                value={formData.monthlyBusinessValue}
                onChange={(e) => handleInputChange('monthlyBusinessValue', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {textStrings.step1.businessValueTypeLabel}
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="businessValueType"
                    value="profit"
                    checked={formData.businessValueType === 'profit'}
                    onChange={(e) => handleInputChange('businessValueType', e.target.value)}
                    className="mr-2"
                  />
                  {textStrings.step1.profitOption}
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="businessValueType"
                    value="savings"
                    checked={formData.businessValueType === 'savings'}
                    onChange={(e) => handleInputChange('businessValueType', e.target.value)}
                    className="mr-2"
                  />
                  {textStrings.step1.savingsOption}
                </label>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!formData.industry || !formData.teamSize || !formData.monthlyBusinessValue || !formData.businessValueType}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {textStrings.step1.continueButton}
            </button>
          </div>
        </div>
      );
    }

    if (step === 2) {
      return (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {textStrings.step2.title}
            </h2>
            <p className="text-gray-600">
              {textStrings.step2.description}
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {textStrings.step2.productLifeLabel}
              </label>
              <input
                type="number"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={textStrings.step2.productLifePlaceholder}
                value={formData.productLife}
                onChange={(e) => handleInputChange('productLife', e.target.value)}
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="includeTeamBurn"
                checked={formData.includeTeamBurn}
                onChange={(e) => handleInputChange('includeTeamBurn', e.target.checked)}
                className="mr-3"
              />
              <label htmlFor="includeTeamBurn" className="text-sm text-gray-700">
                {textStrings.step2.includeTeamBurnLabel}
              </label>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-medium text-gray-900 mb-3">{textStrings.step2.nonLinearCostsTitle}</h3>
              
              <div className="space-y-3">
                <div className="flex space-x-3">
                  <input
                    type="number"
                    placeholder={textStrings.step2.customerLossMonthPlaceholder}
                    value={formData.customerLossMonth}
                    onChange={(e) => handleInputChange('customerLossMonth', e.target.value)}
                    className="flex-1 p-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="number"
                    placeholder={textStrings.step2.customerLossValuePlaceholder}
                    value={formData.customerLossValue}
                    onChange={(e) => handleInputChange('customerLossValue', e.target.value)}
                    className="flex-1 p-2 border border-gray-300 rounded-lg"
                  />
                </div>
                
                <div className="flex space-x-3">
                  <input
                    type="number"
                    placeholder={textStrings.step2.otherCostMonthPlaceholder}
                    value={formData.otherCostMonth}
                    onChange={(e) => handleInputChange('otherCostMonth', e.target.value)}
                    className="flex-1 p-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="number"
                    placeholder={textStrings.step2.otherCostValuePlaceholder}
                    value={formData.otherCostValue}
                    onChange={(e) => handleInputChange('otherCostValue', e.target.value)}
                    className="flex-1 p-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => setStep(1)}
                className="flex-1 bg-gray-300 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-400 transition-colors"
              >
                {textStrings.step2.backButton}
              </button>
              <button
                onClick={calculateCOBL}
                disabled={isCalculating}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
              >
                {isCalculating ? textStrings.step2.calculatingButton : textStrings.step2.calculateButton}
              </button>
            </div>
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
              {textStrings.results.title}
            </h2>
            <p className="text-gray-600">
              {textStrings.results.description}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-red-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(results.summary.oneMonthCost)}
              </div>
              <div className="text-sm text-gray-600">{textStrings.results.oneMonthLabel}</div>
            </div>
            <div className="bg-red-100 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(results.summary.threeMonthCost)}
              </div>
              <div className="text-sm text-gray-600">{textStrings.results.threeMonthLabel}</div>
            </div>
            <div className="bg-red-200 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(results.summary.sixMonthCost)}
              </div>
              <div className="text-sm text-gray-600">{textStrings.results.sixMonthLabel}</div>
            </div>
            <div className="bg-red-300 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(results.summary.twelveMonthCost)}
              </div>
              <div className="text-sm text-gray-600">{textStrings.results.twelveMonthLabel}</div>
            </div>
          </div>

          <div className="flex justify-center space-x-4">
            <button
              onClick={() => setViewMode('table')}
              className={`px-4 py-2 rounded-lg font-medium ${viewMode === 'table' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              <Table className="h-4 w-4 inline mr-1" />
              {textStrings.results.tableButton}
            </button>
            <button
              onClick={() => setViewMode('graph')}
              className={`px-4 py-2 rounded-lg font-medium ${viewMode === 'graph' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              <BarChart className="h-4 w-4 inline mr-1" />
              {textStrings.results.graphButton}
            </button>
          </div>

          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-3">{textStrings.results.keyInsightsTitle}</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• {textStrings.results.insight1}</li>
              <li>• {textStrings.results.insight2}</li>
              <li>• {textStrings.results.insight3}</li>
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
              {textStrings.table.title}
            </h2>
            <button 
              onClick={() => setViewMode('summary')}
              className="text-blue-600 hover:underline"
            >
              {textStrings.table.backButton}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300 text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 p-2 text-left">{textStrings.table.monthsLateHeader}</th>
                  <th className="border border-gray-300 p-2 text-right">{textStrings.table.lostValueHeader} {results.businessValueType === 'profit' ? 'Profit' : 'Savings'} NPV</th>
                  {results.params.includeTeamBurn && <th className="border border-gray-300 p-2 text-right">{textStrings.table.teamCostsHeader}</th>}
                  <th className="border border-gray-300 p-2 text-right">{textStrings.table.linearSubtotalHeader}</th>
                  <th className="border border-gray-300 p-2 text-right">{textStrings.table.nonLinearCostsHeader}</th>
                  <th className="border border-gray-300 p-2 text-right font-bold">{textStrings.table.totalCostHeader}</th>
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
              {textStrings.chart.title}
            </h2>
            <button 
              onClick={() => setViewMode('summary')}
              className="text-blue-600 hover:underline"
            >
              {textStrings.chart.backButton}
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
              <div className="ml-16 relative" style={{ height: `${chartHeight}px` }}>
                {results.monthlyData.slice(1).map((data, index) => {
                  const month = index + 1;
                  const heightPercent = (data.totalCost / maxCost) * 100;
                  const barHeight = (heightPercent / 100) * chartHeight;
                  
                  return (
                    <div
                      key={month}
                      className="absolute bottom-0 bg-red-500 hover:bg-red-600 transition-colors cursor-pointer group"
                      style={{
                        left: `${(month - 1) * (100 / 12)}%`,
                        width: `${100 / 12 - 1}%`,
                        height: `${barHeight}px`
                      }}
                      title={`Month ${month}: ${formatCurrency(data.totalCost)}`}
                    >
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-black text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap mb-1">
                        {formatCurrency(data.totalCost)}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* X-axis */}
              <div className="ml-16 flex justify-between text-xs text-gray-500 mt-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(month => (
                  <span key={month}>{month}</span>
                ))}
              </div>
              
              <div className="text-center text-sm text-gray-600 mt-2">
                {textStrings.chart.xAxisLabel}
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-6 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">{textStrings.chart.insightsTitle}</h4>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>• {textStrings.chart.insight1}</li>
              <li>• {textStrings.chart.insight2}</li>
              <li>• {textStrings.chart.insight3}</li>
            </ul>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center items-center mb-4">
              <AlertTriangle className="h-8 w-8 text-red-500 mr-2" />
              <h1 className="text-3xl font-bold text-gray-900">
                {config.appTitle}
              </h1>
            </div>
            <p className="text-gray-600">
              {config.appDescription}
            </p>
          </div>

          {!results ? renderSimpleForm() : renderResults()}

          {results && (
            <div className="mt-8 text-center">
              <button
                onClick={() => {
                  setResults(null);
                  setStep(1);
                  setViewMode('summary');
                }}
                className="bg-gray-600 text-white py-2 px-6 rounded-lg font-medium hover:bg-gray-700 transition-colors"
              >
                {textStrings.results.newCalculationButton}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default COBLCalculator;
