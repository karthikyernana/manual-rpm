import { useState } from 'react';
import { Settings as SettingsIcon, Clipboard, Users, Database, FileText } from 'lucide-react';
import Navbar from '../components/Navbar';
import TemplatesContent from './templates/TemplatesContent';
import AdminUsersContent from './admin/AdminUsersContent';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('templates');

  const tabs = [
    { id: 'templates', name: 'Vitals Templates', icon: Clipboard, component: TemplatesContent },
    { id: 'users', name: 'User Management', icon: Users, component: AdminUsersContent },
    { id: 'system', name: 'System Settings', icon: Database, component: null },
    { id: 'audit', name: 'Audit Logs', icon: FileText, component: null },
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center space-x-3 mb-2">
            <SettingsIcon size={32} className="text-gray-700" />
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          </div>
          <p className="text-gray-600">Manage system configuration, users, and templates</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm
                    transition-colors duration-200
                    ${activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon size={18} />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="animate-fadeIn">
          {ActiveComponent ? (
            <ActiveComponent />
          ) : (
            <div className="card text-center py-12">
              <div className="mb-4">
                {tabs.find(t => t.id === activeTab)?.icon && (
                  <div className="mx-auto w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                    {(() => {
                      const Icon = tabs.find(t => t.id === activeTab)?.icon;
                      return Icon ? <Icon size={32} className="text-primary-600" /> : null;
                    })()}
                  </div>
                )}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {tabs.find(t => t.id === activeTab)?.name}
              </h3>
              <p className="text-gray-600 mb-4">
                {activeTab === 'system' && 'System configuration coming soon!'}
                {activeTab === 'audit' && 'Audit logging feature coming soon!'}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;
