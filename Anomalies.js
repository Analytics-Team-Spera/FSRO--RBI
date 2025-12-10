import React, { useState, useEffect, useMemo } from 'react';
import Layout from '../components/Layout';
import { anomalyAPI } from '../services/api';
import { 
  FaExclamationTriangle, FaCheckCircle, FaFilter, FaBell,
  FaSearch, FaEye, FaClock, FaChartLine, FaShieldAlt,
  FaIndustry, FaLeaf, FaWater, FaBalanceScale, FaTimes,
  FaChevronDown, FaChevronUp, FaHistory, FaExclamationCircle,
  FaTimesCircle, FaCheck, FaFireAlt, FaBolt, FaSortAmountDown
} from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import toast from 'react-hot-toast';

// Category icons mapping
const categoryIcons = {
  'Financial Risk': FaBalanceScale,
  'Environmental': FaLeaf,
  'Physical Risk': FaFireAlt,
  'Compliance': FaShieldAlt,
  'Market Risk': FaChartLine,
  'Agricultural': FaLeaf,
  'Transition Risk': FaIndustry,
  'Economic Impact': FaChartLine
};

// Severity configurations
const severityConfig = {
  critical: {
    color: 'red',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-500',
    textColor: 'text-red-700',
    iconBg: 'bg-red-500',
    badgeBg: 'bg-red-100',
    pulseColor: 'bg-red-400',
    priority: 1
  },
  high: {
    color: 'orange',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-500',
    textColor: 'text-orange-700',
    iconBg: 'bg-orange-500',
    badgeBg: 'bg-orange-100',
    pulseColor: 'bg-orange-400',
    priority: 2
  },
  medium: {
    color: 'yellow',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-500',
    textColor: 'text-yellow-700',
    iconBg: 'bg-yellow-500',
    badgeBg: 'bg-yellow-100',
    pulseColor: 'bg-yellow-400',
    priority: 3
  },
  low: {
    color: 'green',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-500',
    textColor: 'text-green-700',
    iconBg: 'bg-green-500',
    badgeBg: 'bg-green-100',
    pulseColor: 'bg-green-400',
    priority: 4
  }
};

// Anomaly Card Component
const AnomalyCard = ({ anomaly, onAcknowledge, expanded, onToggle }) => {
  const config = severityConfig[anomaly.severity] || severityConfig.medium;
  const CategoryIcon = categoryIcons[anomaly.category] || FaExclamationTriangle;
  const timeAgo = getTimeAgo(anomaly.detected_at);
  
  return (
    <div 
      className={`
        ${config.bgColor} ${config.borderColor} border-l-4 rounded-xl shadow-sm 
        hover:shadow-lg transition-all duration-300 overflow-hidden
        ${anomaly.severity === 'critical' ? 'animate-pulse-border' : ''}
      `}
    >
      {/* Header */}
      <div 
        className="p-4 cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex items-start gap-4">
          {/* Severity Icon with Pulse for Critical */}
          <div className="relative flex-shrink-0">
            <div className={`w-12 h-12 ${config.iconBg} rounded-xl flex items-center justify-center text-white shadow-lg`}>
              <FaExclamationTriangle size={20} />
            </div>
            {anomaly.severity === 'critical' && anomaly.status === 'open' && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${config.pulseColor} opacity-75`}></span>
                <span className={`relative inline-flex rounded-full h-4 w-4 ${config.iconBg}`}></span>
              </span>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className={`font-bold ${config.textColor} text-lg`}>{anomaly.title}</h3>
            </div>
            
            <div className="flex items-center gap-3 flex-wrap">
              <span className={`
                px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                ${config.badgeBg} ${config.textColor}
              `}>
                {anomaly.severity}
              </span>
              
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 flex items-center gap-1">
                <CategoryIcon size={12} />
                {anomaly.category}
              </span>
              
              <span className={`
                px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1
                ${anomaly.status === 'open' ? 'bg-blue-100 text-blue-700' : 
                  anomaly.status === 'acknowledged' ? 'bg-purple-100 text-purple-700' : 
                  'bg-green-100 text-green-700'}
              `}>
                {anomaly.status === 'open' ? <FaBell size={10} /> : 
                 anomaly.status === 'acknowledged' ? <FaEye size={10} /> : 
                 <FaCheckCircle size={10} />}
                {anomaly.status.charAt(0).toUpperCase() + anomaly.status.slice(1)}
              </span>
            </div>

            <p className="text-gray-600 text-sm mt-2 line-clamp-2">{anomaly.description}</p>
          </div>

          {/* Right Side - Time & Actions */}
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <div className="text-right">
              <div className="flex items-center gap-1 text-gray-500 text-sm">
                <FaClock size={12} />
                <span>{timeAgo}</span>
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {new Date(anomaly.detected_at).toLocaleDateString()}
              </div>
            </div>
            
            {/* Anomaly Score Gauge */}
            <div className="flex items-center gap-2">
              <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${config.iconBg} transition-all duration-500`}
                  style={{ width: `${anomaly.score * 100}%` }}
                ></div>
              </div>
              <span className={`text-xs font-bold ${config.textColor}`}>
                {(anomaly.score * 100).toFixed(0)}%
              </span>
            </div>

            {/* Expand Toggle */}
            <button className="text-gray-400 hover:text-gray-600 transition-colors">
              {expanded ? <FaChevronUp /> : <FaChevronDown />}
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-200 bg-white/50">
          <div className="pt-4 space-y-4">
            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <div className="text-xs text-gray-500 uppercase tracking-wide">Detection Score</div>
                <div className={`text-xl font-bold ${config.textColor}`}>{(anomaly.score * 100).toFixed(1)}%</div>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <div className="text-xs text-gray-500 uppercase tracking-wide">Affected Entities</div>
                <div className="text-xl font-bold text-gray-700">{anomaly.affected_entities}</div>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <div className="text-xs text-gray-500 uppercase tracking-wide">Detected</div>
                <div className="text-sm font-medium text-gray-700">{new Date(anomaly.detected_at).toLocaleString()}</div>
              </div>
            </div>

            {/* Recommended Actions */}
            {anomaly.recommended_actions && anomaly.recommended_actions.length > 0 && (
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <FaShieldAlt className="text-[#003366]" />
                  Recommended Actions
                </h4>
                <ul className="space-y-2">
                  {anomaly.recommended_actions.map((action, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-gray-600">
                      <span className={`w-6 h-6 rounded-full ${config.iconBg} text-white flex items-center justify-center flex-shrink-0 text-xs`}>
                        {idx + 1}
                      </span>
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              {anomaly.status === 'open' && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); onAcknowledge(anomaly.id); }}
                    className="flex-1 px-4 py-2 bg-[#003366] text-white rounded-lg hover:bg-[#002244] transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <FaEye />
                    Acknowledge
                  </button>
                  <button
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <FaCheck />
                    Resolve
                  </button>
                </>
              )}
              {anomaly.status === 'acknowledged' && (
                <button
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <FaCheckCircle />
                  Mark as Resolved
                </button>
              )}
              {anomaly.status === 'resolved' && (
                <div className="flex-1 px-4 py-2 bg-green-100 text-green-700 rounded-lg font-medium flex items-center justify-center gap-2">
                  <FaCheckCircle />
                  Resolved
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to get relative time
function getTimeAgo(dateString) {
  const now = new Date();
  const past = new Date(dateString);
  const diffMs = now - past;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return past.toLocaleDateString();
}

// Stats Card Component
const StatsCard = ({ title, count, icon: Icon, color, trend, subtitle }) => (
  <div className={`bg-white rounded-xl shadow-md p-5 border-b-4 ${color} hover:shadow-lg transition-all duration-300`}>
    <div className="flex items-center justify-between mb-3">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color.replace('border-', 'bg-').replace('-500', '-100')}`}>
        <Icon className={color.replace('border-', 'text-')} size={24} />
      </div>
      {trend && (
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
          trend > 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
        }`}>
          {trend > 0 ? '+' : ''}{trend}%
        </span>
      )}
    </div>
    <div className={`text-3xl font-bold mb-1 ${color.replace('border-', 'text-')}`}>{count}</div>
    <div className="text-gray-600 font-medium">{title}</div>
    {subtitle && <div className="text-xs text-gray-400 mt-1">{subtitle}</div>}
  </div>
);

const Anomalies = () => {
  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [sortBy, setSortBy] = useState('time'); // time, severity, score
  const [filters, setFilters] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    endDate: new Date(),
    severity: 'All',
    category: 'All'
  });

  const categories = ['All', 'Financial Risk', 'Environmental', 'Physical Risk', 'Compliance', 'Market Risk', 'Agricultural', 'Transition Risk'];
  const severities = ['All', 'Critical', 'High', 'Medium', 'Low'];

  useEffect(() => {
    fetchAnomalies();
  }, [filters]);

  const fetchAnomalies = async () => {
    setLoading(true);
    try {
      const params = {
        start_date: filters.startDate.toISOString(),
        end_date: filters.endDate.toISOString(),
        severity: filters.severity,
        category: filters.category
      };
      
      const { data } = await anomalyAPI.getAnomalies(params);
      setAnomalies(data.anomalies);
    } catch (error) {
      console.error('Error fetching anomalies:', error);
      toast.error('Failed to load anomalies');
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = async (anomalyId) => {
    try {
      await anomalyAPI.acknowledge(anomalyId);
      toast.success('Anomaly acknowledged');
      fetchAnomalies();
    } catch (error) {
      console.error('Error acknowledging anomaly:', error);
      toast.error('Failed to acknowledge anomaly');
    }
  };

  // Filtered and sorted anomalies
  const processedAnomalies = useMemo(() => {
    let result = [...anomalies];

    // Filter by tab
    if (activeTab !== 'all') {
      result = result.filter(a => a.status === activeTab);
    }

    // Filter by search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(a => 
        a.title.toLowerCase().includes(term) ||
        a.description.toLowerCase().includes(term) ||
        a.category.toLowerCase().includes(term)
      );
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'severity') {
        return (severityConfig[a.severity]?.priority || 5) - (severityConfig[b.severity]?.priority || 5);
      } else if (sortBy === 'score') {
        return b.score - a.score;
      } else {
        return new Date(b.detected_at) - new Date(a.detected_at);
      }
    });

    return result;
  }, [anomalies, activeTab, searchTerm, sortBy]);

  // Stats
  const stats = useMemo(() => ({
    total: anomalies.length,
    critical: anomalies.filter(a => a.severity === 'critical').length,
    high: anomalies.filter(a => a.severity === 'high').length,
    medium: anomalies.filter(a => a.severity === 'medium').length,
    low: anomalies.filter(a => a.severity === 'low').length,
    open: anomalies.filter(a => a.status === 'open').length,
    acknowledged: anomalies.filter(a => a.status === 'acknowledged').length,
    resolved: anomalies.filter(a => a.status === 'resolved').length
  }), [anomalies]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <div className="spinner mb-4"></div>
            <p className="text-gray-600">Loading anomalies...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#003366] flex items-center gap-3">
              <FaBell className="text-orange-500" />
              Anomalies & Alerts
            </h1>
            <p className="text-gray-600">Real-time anomaly detection and early warning system</p>
          </div>
          <button
            onClick={fetchAnomalies}
            className="px-4 py-2 bg-[#003366] text-white rounded-lg hover:bg-[#002244] transition-colors flex items-center gap-2"
          >
            <FaHistory />
            Refresh
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <StatsCard 
            title="Critical" 
            count={stats.critical} 
            icon={FaExclamationCircle} 
            color="border-red-500"
            trend={stats.critical > 0 ? 12 : 0}
            subtitle="Immediate attention"
          />
          <StatsCard 
            title="High" 
            count={stats.high} 
            icon={FaExclamationTriangle} 
            color="border-orange-500"
            trend={5}
            subtitle="Within 24 hours"
          />
          <StatsCard 
            title="Medium" 
            count={stats.medium} 
            icon={FaBolt} 
            color="border-yellow-500"
            subtitle="Within 7 days"
          />
          <StatsCard 
            title="Low" 
            count={stats.low} 
            icon={FaShieldAlt} 
            color="border-green-500"
            trend={-8}
            subtitle="Monitor only"
          />
          <StatsCard 
            title="Open" 
            count={stats.open} 
            icon={FaBell} 
            color="border-blue-500"
            subtitle="Pending review"
          />
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FaFilter className="text-[#003366]" />
              <h3 className="text-lg font-semibold text-[#003366]">Filters & Search</h3>
            </div>
            
            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <FaSortAmountDown className="text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-sm border-none bg-gray-100 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#003366]"
              >
                <option value="time">Sort by Time</option>
                <option value="severity">Sort by Severity</option>
                <option value="score">Sort by Score</option>
              </select>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mb-4">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search anomalies by title, description, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#003366] focus:ring-0 transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <FaTimes />
              </button>
            )}
          </div>

          {/* Filter Grid */}
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="form-label text-sm">Start Date</label>
              <DatePicker
                selected={filters.startDate}
                onChange={(date) => setFilters({ ...filters, startDate: date })}
                className="form-input"
                dateFormat="yyyy-MM-dd"
              />
            </div>
            
            <div>
              <label className="form-label text-sm">End Date</label>
              <DatePicker
                selected={filters.endDate}
                onChange={(date) => setFilters({ ...filters, endDate: date })}
                className="form-input"
                dateFormat="yyyy-MM-dd"
              />
            </div>
            
            <div>
              <label className="form-label text-sm">Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="form-input"
              >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            
            <div>
              <label className="form-label text-sm">Severity</label>
              <select
                value={filters.severity}
                onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
                className="form-input"
              >
                {severities.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 bg-white rounded-xl shadow-md p-2">
          {[
            { key: 'all', label: 'All Alerts', count: stats.total },
            { key: 'open', label: 'Open', count: stats.open },
            { key: 'acknowledged', label: 'Acknowledged', count: stats.acknowledged },
            { key: 'resolved', label: 'Resolved', count: stats.resolved }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`
                flex-1 px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2
                ${activeTab === tab.key 
                  ? 'bg-[#003366] text-white shadow-md' 
                  : 'text-gray-600 hover:bg-gray-100'
                }
              `}
            >
              {tab.label}
              <span className={`
                px-2 py-0.5 rounded-full text-xs font-bold
                ${activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'}
              `}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>
            Showing <strong className="text-gray-700">{processedAnomalies.length}</strong> of <strong className="text-gray-700">{stats.total}</strong> anomalies
          </span>
          {searchTerm && (
            <span>
              Searching for: <strong className="text-[#003366]">"{searchTerm}"</strong>
            </span>
          )}
        </div>

        {/* Anomalies List */}
        <div className="space-y-4">
          {processedAnomalies.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              {searchTerm || activeTab !== 'all' ? (
                <>
                  <FaSearch className="text-gray-300 mx-auto mb-4" size={48} />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No Results Found</h3>
                  <p className="text-gray-500">Try adjusting your filters or search term</p>
                  <button
                    onClick={() => { setSearchTerm(''); setActiveTab('all'); }}
                    className="mt-4 px-4 py-2 bg-[#003366] text-white rounded-lg hover:bg-[#002244] transition-colors"
                  >
                    Clear Filters
                  </button>
                </>
              ) : (
                <>
                  <FaCheckCircle className="text-green-500 mx-auto mb-4" size={48} />
                  <h3 className="text-xl font-semibold text-[#003366] mb-2">No Anomalies Detected</h3>
                  <p className="text-gray-600">All systems operating within normal parameters</p>
                </>
              )}
            </div>
          ) : (
            processedAnomalies.map((anomaly) => (
              <AnomalyCard
                key={anomaly.id}
                anomaly={anomaly}
                onAcknowledge={handleAcknowledge}
                expanded={expandedId === anomaly.id}
                onToggle={() => setExpandedId(expandedId === anomaly.id ? null : anomaly.id)}
              />
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Anomalies;
