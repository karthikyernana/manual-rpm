import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Clipboard, Users, Database, FileText } from 'lucide-react';
import Navbar from '../components/Navbar';
import TemplatesContent from './templates/TemplatesContent';
import AdminUsersContent from './admin/AdminUsersContent';
import SystemSettingsContent from './admin/SystemSettingsContent';
import AuditLogsContent from './admin/AuditLogsContent';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('templates');

  const tabs = [
    { id: 'templates', name: 'Vitals Templates', icon: Clipboard, component: TemplatesContent },
    { id: 'users', name: 'User Management', icon: Users, component: AdminUsersContent },
    { id: 'system', name: 'System Settings', icon: Database, component: SystemSettingsContent },
    { id: 'audit', name: 'Audit Logs', icon: FileText, component: AuditLogsContent },
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="page-container">
      <Navbar />
      
      <main className="page-content">


        {/* Tabs */}
        <motion.div
          className="mb-6"
          style={{ borderBottom: '1px solid var(--border-subtle)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <nav className="-mb-px flex space-x-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`tab ${isActive ? 'tab-active' : ''}`}
                >
                  <Icon size={16} />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </motion.div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {ActiveComponent ? (
            <ActiveComponent />
          ) : (
            <div className="card empty-state py-16">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                style={{ background: 'var(--brand-muted)' }}
              >
                {(() => {
                  const Icon = tabs.find(t => t.id === activeTab)?.icon;
                  return Icon ? <Icon size={32} style={{ color: 'var(--brand-primary)' }} /> : null;
                })()}
              </div>
              <h3
                className="text-lg font-semibold mb-2"
                style={{ color: 'var(--text-primary)' }}
              >
                {tabs.find(t => t.id === activeTab)?.name}
              </h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                {activeTab === 'system' && 'System configuration coming soon'}
                {activeTab === 'audit' && 'Audit logging feature coming soon'}
              </p>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default SettingsPage;
