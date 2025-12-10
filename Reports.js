import React, { useState } from 'react';
import Layout from '../components/Layout';
import { reportAPI } from '../services/api';
import DatePicker from 'react-datepicker';
import { FaDownload, FaFileExport, FaCheckCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Reports = () => {
  const [filters, setFilters] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    endDate: new Date(),
    reportType: 'kpis'
  });
  const [exporting, setExporting] = useState(false);

  const reportTypes = [
    { value: 'kpis', label: 'Dashboard KPIs', description: 'All key performance indicators with historical data' },
    { value: 'anomalies', label: 'Anomalies & Alerts', description: 'Detected anomalies and alert history' },
    { value: 'forecasts', label: 'Forecast Data', description: 'All forecast projections and confidence intervals' }
  ];

  const handleExport = async () => {
    setExporting(true);
    try {
      const params = {
        report_type: filters.reportType,
        start_date: filters.startDate.toISOString(),
        end_date: filters.endDate.toISOString(),
        format: 'csv'
      };
      
      const response = await reportAPI.export(params);
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `fsro_${filters.reportType}_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Report exported successfully!');
    } catch (error) {
      console.error('Error exporting report:', error);
      toast.error('Failed to export report');
    } finally {
      setExporting(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-[#003366]">Reports & Export</h1>
          <p className="text-gray-600">Export data in CSV format for analysis</p>
        </div>

        {/* Export Configuration */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-[#003366] mb-6">Export Configuration</h3>
          
          {/* Report Type Selection */}
          <div className="mb-6">
            <label className="form-label">Report Type</label>
            <div className="grid md:grid-cols-3 gap-4">
              {reportTypes.map((type) => (
                <div
                  key={type.value}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    filters.reportType === type.value
                      ? 'border-[#003366] bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                  onClick={() => setFilters({ ...filters, reportType: type.value })}
                >
                  <div className="flex items-start gap-3">
                    <FaFileExport className="text-[#003366] mt-1" size={20} />
                    <div>
                      <h4 className="font-semibold text-[#003366] mb-1">{type.label}</h4>
                      <p className="text-sm text-gray-600">{type.description}</p>
                    </div>
                  </div>
                  {filters.reportType === type.value && (
                    <div className="mt-3 flex items-center gap-2 text-green-600">
                      <FaCheckCircle />
                      <span className="text-sm font-semibold">Selected</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="form-label">Start Date</label>
              <DatePicker
                selected={filters.startDate}
                onChange={(date) => setFilters({ ...filters, startDate: date })}
                className="form-input"
                dateFormat="yyyy-MM-dd"
              />
            </div>
            
            <div>
              <label className="form-label">End Date</label>
              <DatePicker
                selected={filters.endDate}
                onChange={(date) => setFilters({ ...filters, endDate: date })}
                className="form-input"
                dateFormat="yyyy-MM-dd"
              />
            </div>
          </div>

          {/* Export Button */}
          <button
            onClick={handleExport}
            disabled={exporting}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {exporting ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Exporting...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <FaDownload />
                <span>Export to CSV</span>
              </div>
            )}
          </button>
        </div>

        {/* Export Guidelines */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
          <h3 className="font-semibold text-[#003366] mb-3">Export Guidelines</h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>All data is exported in CSV format for easy integration with Excel and analysis tools</span>
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>Date filters apply to all exported records</span>
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>Exported files include all relevant metadata and timestamps</span>
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>Maintain confidentiality of exported data as per RBI guidelines</span>
            </li>
          </ul>
        </div>

        {/* Recent Exports (Mock) */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-[#003366] mb-4">Recent Exports</h3>
          <div className="space-y-3">
            {[
              { date: '2024-12-09 14:30', type: 'Dashboard KPIs', size: '2.4 MB' },
              { date: '2024-12-08 10:15', type: 'Anomalies & Alerts', size: '1.8 MB' },
              { date: '2024-12-07 16:45', type: 'Forecast Data', size: '3.1 MB' }
            ].map((exp, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold text-[#003366]">{exp.type}</p>
                  <p className="text-sm text-gray-600">{exp.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">{exp.size}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Reports;
