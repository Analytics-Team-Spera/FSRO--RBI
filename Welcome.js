import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaShieldAlt, FaChartLine, FaCloudSun, FaExclamationTriangle } from 'react-icons/fa';

const Welcome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const features = [
    {
      icon: FaShieldAlt,
      title: 'Risk Scoring',
      description: 'Advanced predictive models for climate-linked financial risk assessment'
    },
    {
      icon: FaChartLine,
      title: 'Forecasting',
      description: 'ML-powered forecasts for NPAs, emissions, and transition risks'
    },
    {
      icon: FaCloudSun,
      title: 'Scenario Analysis',
      description: 'Stress-test simulations across multiple climate pathways'
    },
    {
      icon: FaExclamationTriangle,
      title: 'Early Warnings',
      description: 'Real-time anomaly detection and alerting system'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="https://i0.wp.com/logotaglines.com/wp-content/uploads/2021/06/Reserve-Bank-of-India-RBI-Tagline-Slogan-punchline-motto.png?fit=640%2C404&ssl=1" 
              alt="RBI Logo" 
              className="h-20 w-20 object-contain"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2NCIgaGVpZ2h0PSI2NCIgdmlld0JveD0iMCAwIDY0IDY0Ij48Y2lyY2xlIGN4PSIzMiIgY3k9IjMyIiByPSIzMCIgZmlsbD0iIzAwMzM2NiIvPjx0ZXh0IHg9IjMyIiB5PSIzOCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPlJCSTwvdGV4dD48L3N2Zz4=';
              }}
            />
            <div>
              <h1 className="text-2xl font-bold text-[#003366]">FSRO</h1>
              <p className="text-sm text-gray-600">Financial System Risk Observatory</p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <Link
              to="/login"
              className="px-6 py-2 text-[#003366] border-2 border-[#003366] rounded-lg font-semibold hover:bg-[#003366] hover:text-white transition-colors"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-6 py-2 bg-[#003366] text-white rounded-lg font-semibold hover:bg-[#002244] transition-colors"
            >
              Register
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-[#003366] mb-6">
            Climate Risk Intelligence
            <br />
            <span className="text-[#0066CC]">for Financial Stability</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A comprehensive platform for monitoring, forecasting, and managing climate-related 
            financial risks across India's banking sector
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <feature.icon className="text-[#003366]" size={24} />
              </div>
              <h3 className="text-lg font-bold text-[#003366] mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="bg-gradient-to-r from-[#003366] to-[#0066CC] rounded-2xl p-10 text-white">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">20+</div>
              <div className="text-blue-200">KPI Metrics</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">20+</div>
              <div className="text-blue-200">Forecast Models</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">20+</div>
              <div className="text-blue-200">Scenarios</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">20+</div>
              <div className="text-blue-200">Alert Types</div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <h3 className="text-3xl font-bold text-[#003366] mb-4">
            Ready to get started?
          </h3>
          <p className="text-gray-600 mb-8">
            Register now to access the complete suite of climate risk analytics
          </p>
          <Link
            to="/register"
            className="inline-block px-8 py-4 bg-[#003366] text-white rounded-lg font-semibold text-lg hover:bg-[#002244] transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            Create Your Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8 mt-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src="https://i0.wp.com/logotaglines.com/wp-content/uploads/2021/06/Reserve-Bank-of-India-RBI-Tagline-Slogan-punchline-motto.png?fit=640%2C404&ssl=1" 
                alt="RBI Logo" 
                className="h-20 w-20 object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2NCIgaGVpZ2h0PSI2NCIgdmlld0JveD0iMCAwIDY0IDY0Ij48Y2lyY2xlIGN4PSIzMiIgY3k9IjMyIiByPSIzMCIgZmlsbD0iIzAwMzM2NiIvPjx0ZXh0IHg9IjMyIiB5PSIzOCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPlJCSTwvdGV4dD48L3N2Zz4=';
                }}
              />
              <div>
                <p className="font-semibold text-[#003366]">Reserve Bank of India</p>
                <p className="text-sm text-gray-600">Financial System Risk Observatory</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-gray-600">Powered by</span>
              <img 
                src="https://framerusercontent.com/images/9dKpCm0HntV6vMkd68Slv4ZBb5A.png?width=400&height=370" 
                alt="Spera Digital" 
                className="h-10 object-contain"
              />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Welcome;
