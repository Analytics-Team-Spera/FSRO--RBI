import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import Layout from '../components/Layout';
import { dashboardAPI } from '../services/api';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { 
  FaLeaf, FaIndustry, FaExclamationTriangle, FaWater, 
  FaCloudSun, FaChartLine, FaMoneyBillWave, FaFireAlt,
  FaEraser, FaSyncAlt, FaInfoCircle
} from 'react-icons/fa';
import toast from 'react-hot-toast';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// --- RBI THEME CONSTANTS ---
const RBI_COLORS = {
  primary: '#003366',    // RBI Navy Blue
  accent: '#F39C12',     // Gold/Orange
  success: '#27AE60',    // Professional Green
  danger: '#C0392B',     // Deep Red
  textDark: '#1a1a1a',
  textLight: '#ffffff',
  bgLight: '#f4f6f9',    // Light grey background
  cardBg: '#ffffff',
  border: '#e0e0e0',
  chartGrid: '#f0f0f0'
};

// Optimized chart defaults
ChartJS.defaults.animation = false;
ChartJS.defaults.responsive = true;
ChartJS.defaults.maintainAspectRatio = false;
ChartJS.defaults.font.family = "'Inter', 'Segoe UI', sans-serif";
ChartJS.defaults.color = '#4b5563';

// Date preset configurations
const getDatePresets = () => {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const startOfYesterday = new Date(yesterday);
  startOfYesterday.setHours(0, 0, 0, 0);
  
  const lastWeekStart = new Date(today);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);
  
  const lastMonthStart = new Date(today);
  lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);
  
  const mtdStart = new Date(today.getFullYear(), today.getMonth(), 1);
  
  const sixMonthsAgo = new Date(today);
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  
  const twelveMonthsAgo = new Date(today);
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
  
  const ytdStart = new Date(today.getFullYear(), 0, 1);
  
  return [
    { label: 'Today', key: 'today', startDate: startOfToday, endDate: today },
    { label: 'Yesterday', key: 'yesterday', startDate: startOfYesterday, endDate: yesterday },
    { label: 'Last 7 Days', key: 'last7days', startDate: lastWeekStart, endDate: today },
    { label: 'Last 30 Days', key: 'last30days', startDate: lastMonthStart, endDate: today },
    { label: 'MTD', key: 'mtd', startDate: mtdStart, endDate: today, tooltip: 'Month to Date' },
    { label: '6 Months', key: '6months', startDate: sixMonthsAgo, endDate: today },
    { label: '12 Months', key: '12months', startDate: twelveMonthsAgo, endDate: today },
    { label: 'YTD', key: 'ytd', startDate: ytdStart, endDate: today, tooltip: 'Year to Date' },
  ];
};

// RBI Theme KPI Card Component
const KPICard = memo(({ card }) => {
  const Icon = card.icon;
  const isPositive = card.trend.startsWith('+');
  const trendValue = parseFloat(card.trend.replace(/[^0-9.-]/g, ''));
  
  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 group">
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 rounded-md ${card.bgColor || 'bg-blue-50'}`}>
          <Icon size={18} className={`${card.iconColor || 'text-blue-800'}`} />
        </div>
        <div className="flex items-center gap-1">
          <span className={`text-xs font-bold px-2 py-1 rounded-full border ${
            isPositive 
              ? 'bg-green-50 text-green-700 border-green-100' 
              : 'bg-red-50 text-red-700 border-red-100'
          }`}>
            {card.trend}
          </span>
        </div>
      </div>
      <h3 className="text-gray-500 text-xs font-semibold mb-1 line-clamp-2 uppercase tracking-wide">{card.title}</h3>
      <p className="text-2xl font-bold text-gray-800">{card.value}</p>
      
      {/* Progress bar */}
      <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div 
          className="h-full rounded-full transition-all duration-500"
          style={{ 
            width: `${Math.min(Math.abs(trendValue) * 10 + 30, 100)}%`,
            backgroundColor: RBI_COLORS.primary
          }}
        ></div>
      </div>
    </div>
  );
});

KPICard.displayName = 'KPICard';

// RBI Theme Chart Card Component
const ChartCard = memo(({ title, children, info }) => (
  <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 h-[360px]">
    <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-2">
      <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wide border-l-4 border-orange-400 pl-2">{title}</h3>
      {info && (
        <button className="text-gray-400 hover:text-blue-700 transition-colors">
          <FaInfoCircle size={14} />
        </button>
      )}
    </div>
    <div className="h-[280px]">
      {children}
    </div>
  </div>
));

ChartCard.displayName = 'ChartCard';

// RBI Theme chart options
const rbiChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  animation: false,
  plugins: {
    legend: { 
      display: false,
      labels: { color: '#374151', font: { size: 11, weight: '500' } }
    },
    tooltip: {
      mode: 'index',
      intersect: false,
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      titleColor: '#003366',
      bodyColor: '#374151',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      padding: 12,
      cornerRadius: 4,
      titleFont: { size: 13, weight: 'bold' },
      bodyFont: { size: 12 },
      displayColors: true,
      boxPadding: 4
    }
  },
  scales: {
    x: {
      grid: { 
        display: false,
      },
      ticks: { 
        maxTicksLimit: 8,
        font: { size: 11 },
        color: '#6b7280'
      },
      border: { display: true, color: '#e5e7eb' }
    },
    y: {
      grid: { 
        color: '#f3f4f6',
        drawBorder: false
      },
      ticks: { 
        maxTicksLimit: 6,
        font: { size: 11 },
        color: '#6b7280',
        padding: 8
      },
      border: { display: false }
    }
  },
  elements: {
    point: { radius: 2, hoverRadius: 5, backgroundColor: '#fff', borderWidth: 2 },
    line: { borderWidth: 2.5, tension: 0.3 }
  }
};

const Dashboard = () => {
  const [kpis, setKpis] = useState(null);
  const [trends, setTrends] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartsLoaded, setChartsLoaded] = useState(false);
  const [activePreset, setActivePreset] = useState('12months');
  const [filters, setFilters] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 12)),
    endDate: new Date(),
    sector: 'All',
    riskLevel: 'All'
  });

  const sectors = ['All', 'Energy', 'Manufacturing', 'Agriculture', 'Services', 'Technology'];
  const riskLevels = ['All', 'Low', 'Medium', 'High', 'Critical'];
  const datePresets = getDatePresets();

  const handlePresetClick = useCallback((preset) => {
    setActivePreset(preset.key);
    setFilters(prev => ({
      ...prev,
      startDate: preset.startDate,
      endDate: preset.endDate
    }));
  }, []);

  const handleStartDateChange = useCallback((date) => {
    setActivePreset(null);
    setFilters(prev => ({ ...prev, startDate: date }));
  }, []);

  const handleEndDateChange = useCallback((date) => {
    setActivePreset(null);
    setFilters(prev => ({ ...prev, endDate: date }));
  }, []);

  const clearAllFilters = useCallback(() => {
    setActivePreset('12months');
    setFilters({
      startDate: new Date(new Date().setMonth(new Date().getMonth() - 12)),
      endDate: new Date(),
      sector: 'All',
      riskLevel: 'All'
    });
    toast.success('Filters cleared');
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setChartsLoaded(false);
    try {
      // Simulation of API delay if needed, or direct call
      const params = {
        start_date: filters.startDate.toISOString(),
        end_date: filters.endDate.toISOString(),
        sector: filters.sector !== 'All' ? filters.sector : undefined,
        risk_level: filters.riskLevel !== 'All' ? filters.riskLevel : undefined
      };
      
      const kpisRes = await dashboardAPI.getKPIs(params);
      setKpis(kpisRes.data);
      setLoading(false);
      
      const trendsRes = await dashboardAPI.getTrends(params);
      setTrends(trendsRes.data);
      setChartsLoaded(true);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // KPI cards data - Mapped to RBI Theme Colors
  const kpiCards = useMemo(() => {
    if (!kpis) return [];
    
    return [
      {
        title: 'ESG Disclosure Compliance Ratio',
        value: `${kpis.esg_disclosure_compliance_ratio}%`,
        icon: FaLeaf,
        bgColor: 'bg-green-100',
        iconColor: 'text-green-700',
        trend: '+2.3%',
        category: 'ESG & Compliance'
      },
      {
        title: 'Assured ESG Reporting Coverage',
        value: `${kpis.assured_esg_reporting_coverage}%`,
        icon: FaLeaf,
        bgColor: 'bg-green-100',
        iconColor: 'text-green-700',
        trend: '+1.5%',
        category: 'ESG & Compliance'
      },
      {
        title: 'Climate-Linked NPA Ratio',
        value: `${kpis.climate_linked_npa_ratio}%`,
        icon: FaExclamationTriangle,
        bgColor: 'bg-red-100',
        iconColor: 'text-red-700',
        trend: '+0.3%',
        category: 'Financial Risk'
      },
      {
        title: 'Sector-wise Emissions Intensity',
        value: `${Math.round(kpis.sector_emissions_intensity).toLocaleString()} tCO2e`,
        icon: FaIndustry,
        bgColor: 'bg-orange-100',
        iconColor: 'text-orange-700',
        trend: '-1.2%',
        category: 'Emissions'
      },
      {
        title: 'Carbon Reduction Alignment Score',
        value: `${kpis.carbon_reduction_alignment_score}%`,
        icon: FaLeaf,
        bgColor: 'bg-green-100',
        iconColor: 'text-green-700',
        trend: '+3.1%',
        category: 'Emissions'
      },
      {
        title: 'Green Finance Share',
        value: `${kpis.green_finance_share}%`,
        icon: FaMoneyBillWave,
        bgColor: 'bg-teal-100',
        iconColor: 'text-teal-700',
        trend: '+1.8%',
        category: 'Financial Risk'
      },
      {
        title: 'High-Carbon Sector Loan Exposure',
        value: `${kpis.high_carbon_sector_exposure}%`,
        icon: FaFireAlt,
        bgColor: 'bg-red-100',
        iconColor: 'text-red-700',
        trend: '-0.8%',
        category: 'Financial Risk'
      },
      {
        title: 'Climate Physical Risk Heatmap Score',
        value: kpis.climate_physical_risk_heatmap,
        icon: FaCloudSun,
        bgColor: 'bg-orange-100',
        iconColor: 'text-orange-700',
        trend: '+0.5%',
        category: 'Physical Risk'
      },
      {
        title: 'Asset-at-Risk in High Hazard Zones',
        value: `₹${Math.round(kpis.asset_at_risk_high_hazard).toLocaleString()} Cr`,
        icon: FaExclamationTriangle,
        bgColor: 'bg-red-100',
        iconColor: 'text-red-700',
        trend: '+2.1%',
        category: 'Physical Risk'
      },
      {
        title: 'Crop Loss & Agri-Credit Stress Index',
        value: Math.round(kpis.crop_loss_agri_credit_stress),
        icon: FaLeaf,
        bgColor: 'bg-yellow-100',
        iconColor: 'text-yellow-700',
        trend: '+1.2%',
        category: 'Agricultural Risk'
      },
      {
        title: 'Water Stress Risk Score',
        value: Math.round(kpis.water_stress_risk_score),
        icon: FaWater,
        bgColor: 'bg-blue-100',
        iconColor: 'text-blue-700',
        trend: '+0.9%',
        category: 'Physical Risk'
      },
      {
        title: 'Climate Disaster Frequency Index',
        value: kpis.climate_disaster_frequency,
        icon: FaCloudSun,
        bgColor: 'bg-red-100',
        iconColor: 'text-red-700',
        trend: '+4.5%',
        category: 'Physical Risk'
      },
      {
        title: 'Climate-Adjusted GDP Sensitivity',
        value: `${kpis.climate_adjusted_gdp_sensitivity}%`,
        icon: FaChartLine,
        bgColor: 'bg-purple-100',
        iconColor: 'text-purple-700',
        trend: '-0.3%',
        category: 'Economic Impact'
      },
      {
        title: 'Financial Stability Climate Risk Index',
        value: Math.round(kpis.financial_stability_climate_risk_index),
        icon: FaChartLine,
        bgColor: 'bg-indigo-100',
        iconColor: 'text-indigo-700',
        trend: '+1.1%',
        category: 'Financial Risk'
      },
      {
        title: 'Carbon Market Liquidity Indicator',
        value: `₹${Math.round(kpis.carbon_market_liquidity)}`,
        icon: FaMoneyBillWave,
        bgColor: 'bg-teal-100',
        iconColor: 'text-teal-700',
        trend: '+2.5%',
        category: 'Market Risk'
      },
      {
        title: 'Renewable vs Fossil Energy Share',
        value: kpis.renewable_vs_fossil_share.toFixed(2),
        icon: FaLeaf,
        bgColor: 'bg-green-100',
        iconColor: 'text-green-700',
        trend: '+0.4%',
        category: 'Emissions'
      },
      {
        title: 'Transition Risk Exposure Score',
        value: Math.round(kpis.transition_risk_exposure_score),
        icon: FaIndustry,
        bgColor: 'bg-orange-100',
        iconColor: 'text-orange-700',
        trend: '-0.6%',
        category: 'Transition Risk'
      },
      {
        title: 'ESG Incident & Violation Count',
        value: kpis.esg_incident_violation_count,
        icon: FaExclamationTriangle,
        bgColor: 'bg-red-100',
        iconColor: 'text-red-700',
        trend: '-2.1%',
        category: 'ESG & Compliance'
      },
      {
        title: 'Climate Impact Loss-to-GDP Ratio',
        value: `${kpis.climate_impact_loss_to_gdp}%`,
        icon: FaChartLine,
        bgColor: 'bg-red-100',
        iconColor: 'text-red-700',
        trend: '+0.2%',
        category: 'Economic Impact'
      },
      {
        title: 'Data Reliability & Source Confidence',
        value: `${Math.round(kpis.data_reliability_score)}%`,
        icon: FaChartLine,
        bgColor: 'bg-blue-100',
        iconColor: 'text-blue-700',
        trend: '+1.0%',
        category: 'System'
      }
    ];
  }, [kpis]);

  // Chart data with RBI Theme Colors
  const chartData = useMemo(() => {
    if (!trends) return null;
    
    const maxPoints = 12;
    const step = Math.ceil(trends.labels.length / maxPoints);
    const limitedLabels = trends.labels.filter((_, i) => i % step === 0);
    
    return {
      npaChart: {
        labels: limitedLabels,
        datasets: [{
          label: 'NPA Ratio (%)',
          data: trends.npa_climate.filter((_, i) => i % step === 0),
          borderColor: '#C0392B', // Dark Red
          backgroundColor: 'rgba(192, 57, 43, 0.1)',
          fill: true,
          tension: 0.3
        }]
      },
      greenFinanceChart: {
        labels: limitedLabels,
        datasets: [
          {
            label: 'Green Finance (%)',
            data: trends.green_finance.filter((_, i) => i % step === 0),
            borderColor: '#27AE60', // Green
            backgroundColor: 'rgba(39, 174, 96, 0.1)',
            fill: true,
            tension: 0.3
          },
          {
            label: 'Fossil Finance (%)',
            data: trends.fossil_finance.filter((_, i) => i % step === 0),
            borderColor: '#E67E22', // Orange/Brown
            backgroundColor: 'rgba(230, 126, 34, 0.1)',
            fill: true,
            tension: 0.3
          }
        ]
      },
      emissionsChart: {
        labels: limitedLabels,
        datasets: [{
          label: 'Emissions',
          data: trends.emissions.filter((_, i) => i % step === 0),
          backgroundColor: RBI_COLORS.primary, // RBI Navy
          borderRadius: 4,
          hoverBackgroundColor: '#002244',
        }]
      },
      riskIndexChart: {
        labels: limitedLabels,
        datasets: [{
          label: 'Risk Index',
          data: trends.climate_risk_index.filter((_, i) => i % step === 0),
          borderColor: RBI_COLORS.primary, // RBI Navy
          backgroundColor: 'rgba(0, 51, 102, 0.1)',
          fill: true,
          tension: 0.3
        }]
      },
      riskDistribution: {
        labels: ['Critical', 'High', 'Medium', 'Low', 'Very Low'],
        datasets: [{
          data: [18.6, 21.6, 18.6, 17.4, 23.8],
          backgroundColor: [
            '#C0392B', // Critical (Dark Red)
            '#E67E22', // High (Orange)
            '#F1C40F', // Medium (Yellow)
            '#27AE60', // Low (Green)
            '#2980B9', // Very Low (Blue)
          ],
          borderColor: '#ffffff',
          borderWidth: 2,
        }]
      }
    };
  }, [trends]);

  const categories = ['ESG & Compliance', 'Financial Risk', 'Emissions', 'Physical Risk', 'Economic Impact'];

  if (loading) {
    return (
      <Layout>
        <div className="bg-gray-50 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-blue-900 font-semibold">Loading Dashboard Data...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-gray-50 min-h-screen p-6 font-sans">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 pb-4 border-b border-gray-200">
          <div>
            <h1 className="text-3xl font-bold text-blue-900 flex items-center gap-2">
              <span className="w-2 h-8 bg-orange-500 rounded-sm"></span>
              Climate Risk Dashboard
            </h1>
            <p className="text-gray-500 text-sm mt-1 ml-4">Real-time Overview & Key Performance Indicators</p>
          </div>
          
          <div className="flex items-center gap-3 mt-4 md:mt-0">
            <button
              onClick={clearAllFilters}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm"
            >
              <FaEraser size={14} />
              Clear Filters
            </button>
            <button
              onClick={fetchData}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-900 rounded hover:bg-blue-800 transition-colors flex items-center gap-2 shadow-sm"
            >
              <FaSyncAlt size={14} className={loading ? 'animate-spin' : ''} />
              Refresh Data
            </button>
          </div>
        </div>

        {/* Filters Bar - Fixed Z-Index Issue here */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 mb-8">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Data Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-5">
            {/* Sector Filter */}
            <div className="relative">
              <label className="block text-xs font-semibold text-gray-700 mb-1">Sector</label>
              <select
                value={filters.sector}
                onChange={(e) => setFilters({ ...filters, sector: e.target.value })}
                className="w-full text-sm bg-gray-50 border border-gray-300 text-gray-900 rounded focus:ring-blue-500 focus:border-blue-500 block p-2.5"
              >
                {sectors.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            
            {/* Risk Level Filter */}
            <div className="relative">
              <label className="block text-xs font-semibold text-gray-700 mb-1">Risk Level</label>
              <select
                value={filters.riskLevel}
                onChange={(e) => setFilters({ ...filters, riskLevel: e.target.value })}
                className="w-full text-sm bg-gray-50 border border-gray-300 text-gray-900 rounded focus:ring-blue-500 focus:border-blue-500 block p-2.5"
              >
                {riskLevels.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            
            {/* Start Date - Z-INDEX FIX APPLIED */}
            <div className="relative z-50">
              <label className="block text-xs font-semibold text-gray-700 mb-1">Start Date</label>
              <DatePicker
                selected={filters.startDate}
                onChange={handleStartDateChange}
                className="w-full text-sm bg-gray-50 border border-gray-300 text-gray-900 rounded focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                dateFormat="dd/MM/yyyy"
                maxDate={filters.endDate}
                placeholderText="Select start date"
              />
            </div>
            
            {/* End Date - Z-INDEX FIX APPLIED */}
            <div className="relative z-50">
              <label className="block text-xs font-semibold text-gray-700 mb-1">End Date</label>
              <DatePicker
                selected={filters.endDate}
                onChange={handleEndDateChange}
                className="w-full text-sm bg-gray-50 border border-gray-300 text-gray-900 rounded focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                dateFormat="dd/MM/yyyy"
                minDate={filters.startDate}
                maxDate={new Date()}
                placeholderText="Select end date"
              />
            </div>

            {/* Date Presets - spanning 2 columns */}
            <div className="lg:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1">Quick Range</label>
              <div className="grid grid-cols-4 gap-2">
                {datePresets.map((preset) => (
                  <button
                    key={preset.key}
                    onClick={() => handlePresetClick(preset)}
                    title={preset.tooltip || preset.label}
                    className={`
                      px-2 py-2.5 text-xs rounded border transition-all font-medium truncate
                      ${activePreset === preset.key
                        ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-sm'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-gray-900'
                      }
                    `}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* KPI Cards by Category - At Top */}
        {categories.map(category => {
          const categoryCards = kpiCards.filter(card => card.category === category);
          if (categoryCards.length === 0) return null;
          
          return (
            <div key={category} className="mb-8">
              <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2 mb-4 border-b border-gray-200 pb-2">
                <span className="w-1.5 h-1.5 bg-blue-900 rounded-full"></span>
                {category}
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                {categoryCards.map((card, idx) => (
                  <KPICard key={idx} card={card} />
                ))}
              </div>
            </div>
          );
        })}

        {/* Charts Section - At Bottom */}
        {chartsLoaded && chartData && (
          <div className="space-y-6 mt-8">
            <h2 className="text-xl font-bold text-blue-900 uppercase tracking-wide flex items-center gap-2 border-b border-gray-300 pb-2">
              <FaChartLine className="text-orange-500" />
              Analytics & Trends
            </h2>

            {/* Top Charts Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* NPA Trend Chart */}
              <ChartCard title="Climate-Linked NPA Trend" info>
                <Line data={chartData.npaChart} options={rbiChartOptions} />
              </ChartCard>

              {/* Green Finance Chart */}
              <ChartCard title="Green vs Fossil Finance" info>
                <Line 
                  data={chartData.greenFinanceChart} 
                  options={{
                    ...rbiChartOptions,
                    plugins: {
                      ...rbiChartOptions.plugins,
                      legend: { 
                        display: true,
                        position: 'top',
                        align: 'end',
                        labels: { 
                          boxWidth: 10, 
                          font: { size: 10 },
                          color: '#4b5563',
                          padding: 10
                        }
                      }
                    }
                  }} 
                />
              </ChartCard>

              {/* Risk Distribution Doughnut */}
              <ChartCard title="Risk Level Distribution" info>
                <div className="flex h-full items-center justify-center">
                  <Doughnut 
                    data={chartData.riskDistribution}
                    options={{
                      ...rbiChartOptions,
                      cutout: '65%',
                      plugins: {
                        ...rbiChartOptions.plugins,
                        legend: {
                          display: true,
                          position: 'right',
                          labels: {
                            boxWidth: 10,
                            font: { size: 10 },
                            color: '#4b5563',
                            padding: 10
                          }
                        }
                      }
                    }}
                  />
                </div>
              </ChartCard>
            </div>

            {/* Bottom Charts Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Emissions Bar Chart */}
              <ChartCard title="Total Emissions (tCO2e)" info>
                <Bar data={chartData.emissionsChart} options={rbiChartOptions} />
              </ChartCard>

              {/* Risk Index Chart */}
              <ChartCard title="Climate Risk Index" info>
                <Line data={chartData.riskIndexChart} options={rbiChartOptions} />
              </ChartCard>
            </div>
          </div>
        )}
        
        {/* Loading indicator for charts */}
        {!chartsLoaded && kpis && (
          <div className="bg-white border border-gray-200 rounded-lg p-10 text-center mt-6 shadow-sm">
            <div className="w-8 h-8 border-4 border-blue-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">Loading charts...</p>
          </div>
        )}
        
        {/* Footer Info */}
        <div className="mt-8 pt-6 border-t border-gray-300 text-center">
          <p className="text-gray-500 text-xs">
            Data refreshed: {new Date().toLocaleString('en-IN')} | 
            Range: {filters.startDate.toLocaleDateString('en-IN')} - {filters.endDate.toLocaleDateString('en-IN')} |
            {Math.ceil((filters.endDate - filters.startDate) / (1000 * 60 * 60 * 24))} days
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;