import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Layout from '../components/Layout';
import { scenarioAPI } from '../services/api';
import { Line, Bar, Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { 
  FaProjectDiagram, FaPlay, FaChartBar, FaSlidersH, 
  FaExclamationTriangle, FaCheckCircle, FaInfoCircle,
  FaThermometerHalf, FaWater, FaIndustry, FaLeaf,
  FaChartLine, FaBalanceScale, FaSyncAlt
} from 'react-icons/fa';
import toast from 'react-hot-toast';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Stress Test Parameter Configurations
const STRESS_TEST_PARAMS = {
  temperature_rise: {
    label: 'Temperature Rise',
    unit: '°C',
    min: 1.0,
    max: 4.0,
    step: 0.1,
    default: 1.5,
    icon: FaThermometerHalf,
    color: '#EF4444',
    description: 'Global temperature increase scenario'
  },
  carbon_price: {
    label: 'Carbon Price',
    unit: '₹/tonne',
    min: 500,
    max: 5000,
    step: 100,
    default: 1000,
    icon: FaIndustry,
    color: '#F59E0B',
    description: 'Carbon credit market price'
  },
  green_investment_growth: {
    label: 'Green Investment Growth',
    unit: '%',
    min: 0,
    max: 50,
    step: 1,
    default: 20,
    icon: FaLeaf,
    color: '#10B981',
    description: 'Annual green finance growth rate'
  },
  fossil_phase_out: {
    label: 'Fossil Fuel Phase-out Rate',
    unit: '%/year',
    min: 0,
    max: 15,
    step: 0.5,
    default: 5,
    icon: FaIndustry,
    color: '#6B7280',
    description: 'Rate of fossil fuel divestment'
  },
  water_stress_level: {
    label: 'Water Stress Level',
    unit: 'Index',
    min: 0,
    max: 100,
    step: 1,
    default: 45,
    icon: FaWater,
    color: '#3B82F6',
    description: 'Regional water scarcity index'
  },
  disaster_frequency: {
    label: 'Extreme Weather Frequency',
    unit: 'x baseline',
    min: 1.0,
    max: 3.0,
    step: 0.1,
    default: 1.5,
    icon: FaExclamationTriangle,
    color: '#8B5CF6',
    description: 'Multiplier for extreme weather events'
  }
};

// Calculate stress test outcomes based on parameters
const calculateStressOutcomes = (params) => {
  const {
    temperature_rise,
    carbon_price,
    green_investment_growth,
    fossil_phase_out,
    water_stress_level,
    disaster_frequency
  } = params;

  // Base values
  const baseNPA = 2.5;
  const baseGDP = 6.5;
  const baseExpectedLoss = 15000;
  const baseGreenFinance = 20;

  // Calculate impacts
  const temperatureImpact = Math.pow(temperature_rise - 1.5, 2) * 0.8;
  const carbonPriceImpact = (carbon_price - 1000) / 1000 * 0.3;
  const greenInvestmentBenefit = green_investment_growth * 0.02;
  const fossilPhaseOutCost = fossil_phase_out * 0.15;
  const waterStressImpact = water_stress_level / 100 * 0.5;
  const disasterImpact = (disaster_frequency - 1) * 1.2;

  // Projected metrics
  const projectedNPA = Math.max(0, baseNPA + temperatureImpact + waterStressImpact + disasterImpact - greenInvestmentBenefit);
  const projectedGDP = Math.max(0, baseGDP - temperatureImpact * 0.5 - fossilPhaseOutCost * 0.3 - disasterImpact * 0.4 + greenInvestmentBenefit * 0.2);
  const projectedExpectedLoss = baseExpectedLoss * (1 + temperatureImpact * 0.2 + disasterImpact * 0.15);
  const projectedGreenFinance = baseGreenFinance + green_investment_growth * 0.5;
  
  // Risk scores
  const physicalRisk = Math.min(100, (temperatureImpact + waterStressImpact + disasterImpact) * 25 + 30);
  const transitionRisk = Math.min(100, (carbonPriceImpact + fossilPhaseOutCost) * 20 + 25);
  const financialRisk = Math.min(100, (projectedNPA / baseNPA - 1) * 50 + 40);
  const operationalRisk = Math.min(100, (disasterImpact + waterStressImpact) * 30 + 20);
  const regulatoryRisk = Math.min(100, (carbon_price / 1000) * 15 + 30);

  // Overall stress score
  const overallStressScore = (physicalRisk + transitionRisk + financialRisk + operationalRisk + regulatoryRisk) / 5;

  // Capital adequacy impact
  const capitalImpact = -1 * (temperatureImpact + transitionRisk / 100) * 2;
  
  // Liquidity stress
  const liquidityStress = Math.min(100, disasterImpact * 20 + waterStressImpact * 15 + 25);

  return {
    baseline: {
      npa_ratio: baseNPA,
      gdp_growth: baseGDP,
      expected_loss: baseExpectedLoss,
      green_finance_share: baseGreenFinance,
      capital_ratio: 15.5,
      liquidity_coverage: 135
    },
    projected: {
      npa_ratio: parseFloat(projectedNPA.toFixed(2)),
      gdp_growth: parseFloat(projectedGDP.toFixed(2)),
      expected_loss: parseFloat(projectedExpectedLoss.toFixed(0)),
      green_finance_share: parseFloat(projectedGreenFinance.toFixed(1)),
      capital_ratio: parseFloat((15.5 + capitalImpact).toFixed(2)),
      liquidity_coverage: parseFloat((135 - liquidityStress * 0.5).toFixed(0))
    },
    risk_scores: {
      physical: parseFloat(physicalRisk.toFixed(1)),
      transition: parseFloat(transitionRisk.toFixed(1)),
      financial: parseFloat(financialRisk.toFixed(1)),
      operational: parseFloat(operationalRisk.toFixed(1)),
      regulatory: parseFloat(regulatoryRisk.toFixed(1)),
      overall: parseFloat(overallStressScore.toFixed(1))
    },
    changes: {
      npa_change: parseFloat((projectedNPA - baseNPA).toFixed(2)),
      gdp_change: parseFloat((projectedGDP - baseGDP).toFixed(2)),
      loss_change_pct: parseFloat(((projectedExpectedLoss - baseExpectedLoss) / baseExpectedLoss * 100).toFixed(1))
    },
    stress_level: overallStressScore > 70 ? 'Severe' : overallStressScore > 50 ? 'High' : overallStressScore > 30 ? 'Moderate' : 'Low',
    capital_adequacy: (15.5 + capitalImpact) >= 11.5 ? 'Adequate' : (15.5 + capitalImpact) >= 9 ? 'Watch' : 'Critical'
  };
};

// Slider Component
const ParamSlider = ({ paramKey, config, value, onChange }) => {
  const Icon = config.icon;
  const percentage = ((value - config.min) / (config.max - config.min)) * 100;
  
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className="text-gray-600" size={16} style={{ color: config.color }} />
          <span className="font-medium text-gray-700 text-sm">{config.label}</span>
        </div>
        <span className="text-lg font-bold" style={{ color: config.color }}>
          {value}{config.unit}
        </span>
      </div>
      
      <input
        type="range"
        min={config.min}
        max={config.max}
        step={config.step}
        value={value}
        onChange={(e) => onChange(paramKey, parseFloat(e.target.value))}
        className="w-full h-2 rounded-lg appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, ${config.color} 0%, ${config.color} ${percentage}%, #E5E7EB ${percentage}%, #E5E7EB 100%)`
        }}
      />
      
      <div className="flex justify-between text-xs text-gray-400 mt-1">
        <span>{config.min}{config.unit}</span>
        <span>{config.max}{config.unit}</span>
      </div>
      <p className="text-xs text-gray-500 mt-2">{config.description}</p>
    </div>
  );
};

// Risk Gauge Component
const RiskGauge = ({ label, value, maxValue = 100 }) => {
  const percentage = (value / maxValue) * 100;
  const color = value > 70 ? '#EF4444' : value > 50 ? '#F59E0B' : value > 30 ? '#FBBF24' : '#10B981';
  
  return (
    <div className="text-center">
      <div className="relative w-20 h-20 mx-auto mb-2">
        <svg className="w-20 h-20 transform -rotate-90">
          <circle
            cx="40"
            cy="40"
            r="35"
            stroke="#E5E7EB"
            strokeWidth="6"
            fill="none"
          />
          <circle
            cx="40"
            cy="40"
            r="35"
            stroke={color}
            strokeWidth="6"
            fill="none"
            strokeDasharray={`${percentage * 2.2} 220`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold" style={{ color }}>{value}</span>
        </div>
      </div>
      <p className="text-xs text-gray-600 font-medium">{label}</p>
    </div>
  );
};

const Scenarios = () => {
  const [activeTab, setActiveTab] = useState('stress-test'); // 'stress-test' or 'what-if'
  const [scenarios, setScenarios] = useState([]);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [severity, setSeverity] = useState('moderate');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  // Stress Test Parameters State
  const [stressParams, setStressParams] = useState({
    temperature_rise: 1.5,
    carbon_price: 1000,
    green_investment_growth: 20,
    fossil_phase_out: 5,
    water_stress_level: 45,
    disaster_frequency: 1.5
  });

  // Preset Scenarios for Quick Selection
  const presetScenarios = [
    { 
      name: 'Net Zero 2050', 
      params: { temperature_rise: 1.5, carbon_price: 3000, green_investment_growth: 40, fossil_phase_out: 10, water_stress_level: 35, disaster_frequency: 1.2 },
      description: 'Aggressive decarbonization pathway'
    },
    { 
      name: 'Business as Usual', 
      params: { temperature_rise: 2.5, carbon_price: 800, green_investment_growth: 10, fossil_phase_out: 2, water_stress_level: 55, disaster_frequency: 1.8 },
      description: 'Current trajectory continues'
    },
    { 
      name: 'Delayed Transition', 
      params: { temperature_rise: 2.0, carbon_price: 1500, green_investment_growth: 25, fossil_phase_out: 5, water_stress_level: 50, disaster_frequency: 1.5 },
      description: 'Gradual policy implementation'
    },
    { 
      name: 'Climate Crisis', 
      params: { temperature_rise: 3.5, carbon_price: 500, green_investment_growth: 5, fossil_phase_out: 1, water_stress_level: 80, disaster_frequency: 2.5 },
      description: 'Worst-case climate scenario'
    },
    { 
      name: 'Green Recovery', 
      params: { temperature_rise: 1.8, carbon_price: 2500, green_investment_growth: 45, fossil_phase_out: 12, water_stress_level: 40, disaster_frequency: 1.3 },
      description: 'Accelerated green investment'
    }
  ];

  // Calculate outcomes whenever params change
  const stressOutcomes = useMemo(() => calculateStressOutcomes(stressParams), [stressParams]);

  // Handle parameter change
  const handleParamChange = useCallback((key, value) => {
    setStressParams(prev => ({ ...prev, [key]: value }));
  }, []);

  // Apply preset scenario
  const applyPreset = useCallback((preset) => {
    setStressParams(preset.params);
    toast.success(`Applied "${preset.name}" scenario`);
  }, []);

  // Reset to defaults
  const resetParams = useCallback(() => {
    const defaults = {};
    Object.keys(STRESS_TEST_PARAMS).forEach(key => {
      defaults[key] = STRESS_TEST_PARAMS[key].default;
    });
    setStressParams(defaults);
    toast.success('Parameters reset to defaults');
  }, []);

  useEffect(() => {
    fetchScenarios();
  }, []);

  const fetchScenarios = async () => {
    try {
      const { data } = await scenarioAPI.listScenarios();
      setScenarios(data.scenarios);
    } catch (error) {
      console.error('Error fetching scenarios:', error);
      toast.error('Failed to load scenarios');
    }
  };

  const runSimulation = async () => {
    if (!selectedScenario) {
      toast.error('Please select a scenario');
      return;
    }

    setLoading(true);
    try {
      const { data } = await scenarioAPI.simulate({
        scenario_type: selectedScenario.id,
        parameters: { severity },
        base_date: new Date().toISOString()
      });
      setResults(data);
      toast.success('Simulation completed!');
    } catch (error) {
      console.error('Error running simulation:', error);
      toast.error('Simulation failed');
    } finally {
      setLoading(false);
    }
  };

  // Chart data for stress test results
  const riskRadarData = {
    labels: ['Physical Risk', 'Transition Risk', 'Financial Risk', 'Operational Risk', 'Regulatory Risk'],
    datasets: [{
      label: 'Risk Score',
      data: [
        stressOutcomes.risk_scores.physical,
        stressOutcomes.risk_scores.transition,
        stressOutcomes.risk_scores.financial,
        stressOutcomes.risk_scores.operational,
        stressOutcomes.risk_scores.regulatory
      ],
      backgroundColor: 'rgba(0, 51, 102, 0.2)',
      borderColor: '#003366',
      borderWidth: 2,
      pointBackgroundColor: '#003366'
    }]
  };

  const comparisonChartData = {
    labels: ['NPA Ratio (%)', 'GDP Growth (%)', 'Green Finance (%)', 'Capital Ratio (%)'],
    datasets: [
      {
        label: 'Baseline',
        data: [
          stressOutcomes.baseline.npa_ratio,
          stressOutcomes.baseline.gdp_growth,
          stressOutcomes.baseline.green_finance_share,
          stressOutcomes.baseline.capital_ratio
        ],
        backgroundColor: 'rgba(16, 185, 129, 0.7)',
        borderRadius: 4
      },
      {
        label: 'Stressed',
        data: [
          stressOutcomes.projected.npa_ratio,
          stressOutcomes.projected.gdp_growth,
          stressOutcomes.projected.green_finance_share,
          stressOutcomes.projected.capital_ratio
        ],
        backgroundColor: 'rgba(239, 68, 68, 0.7)',
        borderRadius: 4
      }
    ]
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-[#003366]">Scenario Analysis & Stress Testing</h1>
          <p className="text-gray-600">Run stress-test simulations and explore climate risk scenarios</p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-md p-2 inline-flex gap-2">
          <button
            onClick={() => setActiveTab('stress-test')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'stress-test'
                ? 'bg-[#003366] text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <FaSlidersH />
            Stress Test (Interactive)
          </button>
          <button
            onClick={() => setActiveTab('what-if')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'what-if'
                ? 'bg-[#003366] text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <FaProjectDiagram />
            What-If Scenarios
          </button>
        </div>

        {/* STRESS TEST TAB */}
        {activeTab === 'stress-test' && (
          <div className="space-y-6">
            {/* Preset Scenarios */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[#003366] flex items-center gap-2">
                  <FaChartLine />
                  Quick Scenario Presets
                </h3>
                <button
                  onClick={resetParams}
                  className="text-sm text-gray-500 hover:text-[#003366] flex items-center gap-1"
                >
                  <FaSyncAlt size={12} />
                  Reset to Defaults
                </button>
              </div>
              <div className="flex flex-wrap gap-3">
                {presetScenarios.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => applyPreset(preset)}
                    className="px-4 py-2 bg-gray-100 hover:bg-blue-50 hover:border-[#003366] border-2 border-transparent rounded-lg transition-all group"
                    title={preset.description}
                  >
                    <span className="font-medium text-gray-700 group-hover:text-[#003366]">{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Parameter Sliders */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-[#003366] mb-4 flex items-center gap-2">
                <FaSlidersH />
                Adjust Stress Parameters
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(STRESS_TEST_PARAMS).map(([key, config]) => (
                  <ParamSlider
                    key={key}
                    paramKey={key}
                    config={config}
                    value={stressParams[key]}
                    onChange={handleParamChange}
                  />
                ))}
              </div>
            </div>

            {/* Real-time Results */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Overall Stress Score */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold text-[#003366] mb-4">Overall Stress Assessment</h3>
                <div className="text-center mb-6">
                  <div className={`text-6xl font-bold mb-2 ${
                    stressOutcomes.risk_scores.overall > 70 ? 'text-red-500' :
                    stressOutcomes.risk_scores.overall > 50 ? 'text-orange-500' :
                    stressOutcomes.risk_scores.overall > 30 ? 'text-yellow-500' : 'text-green-500'
                  }`}>
                    {stressOutcomes.risk_scores.overall}
                  </div>
                  <div className={`text-lg font-semibold px-4 py-1 rounded-full inline-block ${
                    stressOutcomes.stress_level === 'Severe' ? 'bg-red-100 text-red-700' :
                    stressOutcomes.stress_level === 'High' ? 'bg-orange-100 text-orange-700' :
                    stressOutcomes.stress_level === 'Moderate' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {stressOutcomes.stress_level} Stress
                  </div>
                </div>

                <div className="grid grid-cols-5 gap-2">
                  <RiskGauge label="Physical" value={stressOutcomes.risk_scores.physical} />
                  <RiskGauge label="Transition" value={stressOutcomes.risk_scores.transition} />
                  <RiskGauge label="Financial" value={stressOutcomes.risk_scores.financial} />
                  <RiskGauge label="Operational" value={stressOutcomes.risk_scores.operational} />
                  <RiskGauge label="Regulatory" value={stressOutcomes.risk_scores.regulatory} />
                </div>
              </div>

              {/* Risk Radar Chart */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold text-[#003366] mb-4">Risk Profile</h3>
                <div className="h-64">
                  <Radar
                    data={riskRadarData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        r: {
                          beginAtZero: true,
                          max: 100,
                          ticks: { stepSize: 20 }
                        }
                      },
                      plugins: { legend: { display: false } }
                    }}
                  />
                </div>
              </div>

              {/* Key Metrics Comparison */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold text-[#003366] mb-4">Baseline vs Stressed</h3>
                <div className="h-64">
                  <Bar
                    data={comparisonChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'top',
                          labels: { boxWidth: 12, font: { size: 10 } }
                        }
                      },
                      scales: {
                        y: { beginAtZero: true }
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Detailed Impact Analysis */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Financial Impact */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold text-[#003366] mb-4 flex items-center gap-2">
                  <FaBalanceScale />
                  Financial Impact Analysis
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">NPA Ratio</span>
                    <div className="text-right">
                      <span className="text-gray-400 text-sm mr-2">{stressOutcomes.baseline.npa_ratio}% →</span>
                      <span className={`font-bold ${stressOutcomes.changes.npa_change > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {stressOutcomes.projected.npa_ratio}%
                      </span>
                      <span className={`text-xs ml-2 ${stressOutcomes.changes.npa_change > 0 ? 'text-red-500' : 'text-green-500'}`}>
                        ({stressOutcomes.changes.npa_change > 0 ? '+' : ''}{stressOutcomes.changes.npa_change}%)
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">GDP Growth</span>
                    <div className="text-right">
                      <span className="text-gray-400 text-sm mr-2">{stressOutcomes.baseline.gdp_growth}% →</span>
                      <span className={`font-bold ${stressOutcomes.changes.gdp_change < 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {stressOutcomes.projected.gdp_growth}%
                      </span>
                      <span className={`text-xs ml-2 ${stressOutcomes.changes.gdp_change < 0 ? 'text-red-500' : 'text-green-500'}`}>
                        ({stressOutcomes.changes.gdp_change > 0 ? '+' : ''}{stressOutcomes.changes.gdp_change}%)
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Expected Loss</span>
                    <div className="text-right">
                      <span className="text-gray-400 text-sm mr-2">₹{stressOutcomes.baseline.expected_loss.toLocaleString()} Cr →</span>
                      <span className={`font-bold ${stressOutcomes.changes.loss_change_pct > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        ₹{stressOutcomes.projected.expected_loss.toLocaleString()} Cr
                      </span>
                      <span className={`text-xs ml-2 ${stressOutcomes.changes.loss_change_pct > 0 ? 'text-red-500' : 'text-green-500'}`}>
                        ({stressOutcomes.changes.loss_change_pct > 0 ? '+' : ''}{stressOutcomes.changes.loss_change_pct}%)
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Capital Adequacy</span>
                    <div className="text-right">
                      <span className="text-gray-400 text-sm mr-2">{stressOutcomes.baseline.capital_ratio}% →</span>
                      <span className={`font-bold ${
                        stressOutcomes.capital_adequacy === 'Adequate' ? 'text-green-600' :
                        stressOutcomes.capital_adequacy === 'Watch' ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {stressOutcomes.projected.capital_ratio}%
                      </span>
                      <span className={`text-xs ml-2 px-2 py-0.5 rounded ${
                        stressOutcomes.capital_adequacy === 'Adequate' ? 'bg-green-100 text-green-700' :
                        stressOutcomes.capital_adequacy === 'Watch' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {stressOutcomes.capital_adequacy}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Liquidity Coverage</span>
                    <div className="text-right">
                      <span className="text-gray-400 text-sm mr-2">{stressOutcomes.baseline.liquidity_coverage}% →</span>
                      <span className={`font-bold ${stressOutcomes.projected.liquidity_coverage >= 100 ? 'text-green-600' : 'text-red-600'}`}>
                        {stressOutcomes.projected.liquidity_coverage}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold text-[#003366] mb-4 flex items-center gap-2">
                  <FaCheckCircle className="text-green-500" />
                  Stress Test Recommendations
                </h3>
                <ul className="space-y-3">
                  {stressOutcomes.risk_scores.physical > 50 && (
                    <li className="flex items-start gap-2 p-3 bg-red-50 rounded-lg">
                      <FaExclamationTriangle className="text-red-500 mt-1 flex-shrink-0" />
                      <span className="text-gray-700 text-sm">Increase physical risk provisions and review exposure to climate-vulnerable assets</span>
                    </li>
                  )}
                  {stressOutcomes.risk_scores.transition > 50 && (
                    <li className="flex items-start gap-2 p-3 bg-orange-50 rounded-lg">
                      <FaExclamationTriangle className="text-orange-500 mt-1 flex-shrink-0" />
                      <span className="text-gray-700 text-sm">Accelerate divestment from high-carbon sectors and increase green finance allocation</span>
                    </li>
                  )}
                  {stressOutcomes.projected.capital_ratio < 12 && (
                    <li className="flex items-start gap-2 p-3 bg-yellow-50 rounded-lg">
                      <FaExclamationTriangle className="text-yellow-500 mt-1 flex-shrink-0" />
                      <span className="text-gray-700 text-sm">Consider capital buffer enhancement to maintain regulatory requirements</span>
                    </li>
                  )}
                  {stressOutcomes.changes.npa_change > 1 && (
                    <li className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                      <FaInfoCircle className="text-blue-500 mt-1 flex-shrink-0" />
                      <span className="text-gray-700 text-sm">Implement enhanced credit monitoring for climate-sensitive sectors</span>
                    </li>
                  )}
                  <li className="flex items-start gap-2 p-3 bg-green-50 rounded-lg">
                    <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                    <span className="text-gray-700 text-sm">Continue monitoring and run quarterly stress tests with updated parameters</span>
                  </li>
                  <li className="flex items-start gap-2 p-3 bg-green-50 rounded-lg">
                    <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                    <span className="text-gray-700 text-sm">Maintain diversified portfolio across climate-resilient sectors</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* WHAT-IF SCENARIOS TAB */}
        {activeTab === 'what-if' && (
          <div className="space-y-6">
            {/* Scenario Selection */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-[#003366] mb-4">Select Scenario</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {scenarios.map((scenario) => (
                  <div
                    key={scenario.id}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedScenario?.id === scenario.id
                        ? 'border-[#003366] bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                    onClick={() => setSelectedScenario(scenario)}
                  >
                    <div className="flex items-start gap-3">
                      <FaProjectDiagram className="text-[#003366] mt-1" size={20} />
                      <div>
                        <h4 className="font-semibold text-[#003366]">{scenario.name}</h4>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Severity Selection */}
            {selectedScenario && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold text-[#003366] mb-4">Select Severity Level</h3>
                <div className="flex gap-4 flex-wrap">
                  {selectedScenario.severities.map((sev) => (
                    <button
                      key={sev}
                      onClick={() => setSeverity(sev)}
                      className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                        severity === sev
                          ? 'bg-[#003366] text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {sev.charAt(0).toUpperCase() + sev.slice(1)}
                    </button>
                  ))}
                </div>

                <button
                  onClick={runSimulation}
                  disabled={loading}
                  className="mt-6 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Running Simulation...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <FaPlay />
                      <span>Run Simulation</span>
                    </div>
                  )}
                </button>
              </div>
            )}

            {/* Results */}
            {results && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="text-xl font-bold text-[#003366] mb-4">Simulation Results</h3>
                  
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-semibold text-[#003366] mb-3">Baseline Metrics</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>NPA Ratio:</span>
                          <span className="font-medium">{results.baseline.npa_ratio}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Expected Loss:</span>
                          <span className="font-medium">₹{results.baseline.expected_loss} Cr</span>
                        </div>
                        <div className="flex justify-between">
                          <span>GDP Growth:</span>
                          <span className="font-medium">{results.baseline.gdp_growth}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-red-50 rounded-lg p-4">
                      <h4 className="font-semibold text-[#003366] mb-3">Projected Impact</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>NPA Ratio:</span>
                          <span className="font-medium text-red-600">{results.projected.npa_ratio}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Expected Loss:</span>
                          <span className="font-medium text-red-600">₹{results.projected.expected_loss} Cr</span>
                        </div>
                        <div className="flex justify-between">
                          <span>GDP Impact:</span>
                          <span className="font-medium text-red-600">{results.projected.gdp_impact}%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                    <h4 className="font-semibold text-[#003366] mb-2">Risk Assessment</h4>
                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Probability:</span>
                        <span className="ml-2 font-medium">{(results.risk_assessment.probability * 100).toFixed(0)}%</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Impact Score:</span>
                        <span className="ml-2 font-medium">{results.risk_assessment.impact_score}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Urgency:</span>
                        <span className="ml-2 font-medium">{results.risk_assessment.urgency}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="font-semibold text-[#003366] mb-3">Recommendations</h4>
                    <ul className="space-y-2">
                      {results.recommendations.map((rec, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-green-500 mt-1">✓</span>
                          <span className="text-gray-700">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Scenarios;
