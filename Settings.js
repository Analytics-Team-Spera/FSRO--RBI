import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { settingsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { FaBell, FaShieldAlt, FaDatabase, FaCheckCircle, FaTimes } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Settings = () => {
  const { user, enable2FA, verify2FA, disable2FA } = useAuth();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // 2FA State
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [password2FA, setPassword2FA] = useState('');
  const [qrData, setQrData] = useState(null);
  const [otpCode, setOtpCode] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await settingsAPI.get();
      setSettings(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await settingsAPI.update(settings);
      toast.success('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleTestSlack = async () => {
    try {
      const result = await settingsAPI.testSlack(settings.slack_webhook);
      if (result.data.status === 'success') {
        toast.success('Slack test message sent!');
      } else {
        toast.error('Slack test failed: ' + result.data.message);
      }
    } catch (error) {
      console.error('Error testing Slack:', error);
      toast.error('Failed to test Slack webhook');
    }
  };

  const handleEnable2FA = async () => {
    if (!password2FA) {
      toast.error('Please enter your password');
      return;
    }
    
    const result = await enable2FA(password2FA);
    if (result.success) {
      setQrData(result.data);
      toast.success('Scan QR code with your authenticator app');
    }
  };

  const handleVerify2FA = async () => {
    if (!otpCode || otpCode.length !== 6) {
      toast.error('Please enter 6-digit code');
      return;
    }
    
    const result = await verify2FA(otpCode);
    if (result.success) {
      setShow2FASetup(false);
      setQrData(null);
      setPassword2FA('');
      setOtpCode('');
    }
  };

  const handleDisable2FA = async () => {
    if (!password2FA) {
      toast.error('Please enter your password');
      return;
    }
    
    const result = await disable2FA(password2FA);
    if (result.success) {
      setPassword2FA('');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="spinner"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-[#003366]">Settings</h1>
          <p className="text-gray-600">Configure alerts, security, and integrations</p>
        </div>

        {/* Security Settings */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center gap-2 mb-6">
            <FaShieldAlt className="text-[#003366]" size={20} />
            <h3 className="text-lg font-semibold text-[#003366]">Security Settings</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-semibold text-[#003366]">Two-Factor Authentication (2FA)</h4>
                <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
              </div>
              
              {user?.is_2fa_enabled ? (
                <button
                  onClick={() => setShow2FASetup(true)}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Disable 2FA
                </button>
              ) : (
                <button
                  onClick={() => setShow2FASetup(true)}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  Enable 2FA
                </button>
              )}
            </div>

            {/* 2FA Setup Modal */}
            {show2FASetup && (
              <div className="modal-overlay" onClick={() => setShow2FASetup(false)}>
                <div className="modal-content max-w-md" onClick={(e) => e.stopPropagation()}>
                  <h2 className="text-2xl font-bold text-[#003366] mb-6">
                    {user?.is_2fa_enabled ? 'Disable 2FA' : 'Enable 2FA'}
                  </h2>

                  {!user?.is_2fa_enabled && !qrData && (
                    <div className="space-y-4">
                      <p className="text-gray-600">Enter your password to generate QR code</p>
                      <input
                        type="password"
                        value={password2FA}
                        onChange={(e) => setPassword2FA(e.target.value)}
                        className="form-input"
                        placeholder="Enter your password"
                      />
                      <button onClick={handleEnable2FA} className="w-full btn-primary">
                        Generate QR Code
                      </button>
                    </div>
                  )}

                  {!user?.is_2fa_enabled && qrData && (
                    <div className="space-y-4">
                      <p className="text-gray-600 mb-4">Scan this QR code with your authenticator app:</p>
                      <div className="bg-gray-100 p-4 rounded-lg text-center">
                        <img src={qrData.qr_uri} alt="QR Code" className="mx-auto" />
                      </div>
                      <p className="text-sm text-gray-600">Or enter this secret manually: <code className="bg-gray-100 px-2 py-1 rounded">{qrData.secret}</code></p>
                      
                      <input
                        type="text"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        className="form-input text-center text-2xl tracking-widest"
                        placeholder="000000"
                        maxLength={6}
                      />
                      <button onClick={handleVerify2FA} className="w-full btn-primary">
                        Verify & Enable
                      </button>
                    </div>
                  )}

                  {user?.is_2fa_enabled && (
                    <div className="space-y-4">
                      <p className="text-gray-600">Enter your password to disable 2FA</p>
                      <input
                        type="password"
                        value={password2FA}
                        onChange={(e) => setPassword2FA(e.target.value)}
                        className="form-input"
                        placeholder="Enter your password"
                      />
                      <button onClick={handleDisable2FA} className="w-full btn-primary bg-red-500 hover:bg-red-600">
                        Disable 2FA
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Alert Settings */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center gap-2 mb-6">
            <FaBell className="text-[#003366]" size={20} />
            <h3 className="text-lg font-semibold text-[#003366]">Alert Settings</h3>
          </div>

          <div className="space-y-4">
            {/* Slack Integration */}
            <div>
              <label className="form-label">Slack Webhook URL</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={settings?.slack_webhook || ''}
                  onChange={(e) => setSettings({ ...settings, slack_webhook: e.target.value })}
                  className="form-input flex-1"
                  placeholder="https://hooks.slack.com/services/..."
                />
                <button
                  onClick={handleTestSlack}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Test
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-1">Receive real-time alerts in your Slack channel</p>
            </div>

            {/* Email Alerts */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-semibold text-[#003366]">Email Alerts</h4>
                <p className="text-sm text-gray-600">Receive alert notifications via email</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings?.email_alerts || false}
                  onChange={(e) => setSettings({ ...settings, email_alerts: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Threshold Settings */}
            <div>
              <h4 className="font-semibold text-[#003366] mb-3">Alert Thresholds</h4>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="form-label text-sm">NPA Threshold (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={settings?.threshold_npa || 5.0}
                    onChange={(e) => setSettings({ ...settings, threshold_npa: parseFloat(e.target.value) })}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label text-sm">Emission Threshold (tCO2e)</label>
                  <input
                    type="number"
                    step="100"
                    value={settings?.threshold_emission || 6000}
                    onChange={(e) => setSettings({ ...settings, threshold_emission: parseInt(e.target.value) })}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label text-sm">Green Finance Threshold (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={settings?.threshold_green_finance || 15.0}
                    onChange={(e) => setSettings({ ...settings, threshold_green_finance: parseFloat(e.target.value) })}
                    className="form-input"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Data Sources */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center gap-2 mb-6">
            <FaDatabase className="text-[#003366]" size={20} />
            <h3 className="text-lg font-semibold text-[#003366]">Data Sources</h3>
          </div>

          <div className="space-y-3">
            {[
              { name: 'Climate Data', status: 'Connected', lastSync: '2024-12-09 14:30' },
              { name: 'Financial Sector Data', status: 'Connected', lastSync: '2024-12-09 14:25' },
              { name: 'ESG Data', status: 'Connected', lastSync: '2024-12-09 14:20' },
              { name: 'Natural Disaster Data', status: 'Connected', lastSync: '2024-12-09 14:15' }
            ].map((source, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-semibold text-[#003366]">{source.name}</h4>
                  <p className="text-sm text-gray-600">Last synced: {source.lastSync}</p>
                </div>
                <div className="flex items-center gap-2">
                  {source.status === 'Connected' ? (
                    <>
                      <FaCheckCircle className="text-green-500" />
                      <span className="text-green-600 font-semibold">{source.status}</span>
                    </>
                  ) : (
                    <>
                      <FaTimes className="text-red-500" />
                      <span className="text-red-600 font-semibold">{source.status}</span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSaveSettings}
          disabled={saving}
          className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Saving...</span>
            </div>
          ) : (
            'Save Settings'
          )}
        </button>
      </div>
    </Layout>
  );
};

export default Settings;
