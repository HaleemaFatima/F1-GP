import React, { useEffect, useState } from 'react';
import { Users, Calendar, Clock, TrendingUp, RefreshCw } from 'lucide-react';
import { supabaseApi } from '../utils/supabaseApi';
import { CountdownTimer } from '../components/CountdownTimer';

export const Admin: React.FC = () => {
  const [adminData, setAdminData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'holds' | 'sold' | 'expired' | 'metrics'>('metrics');

  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      const data = await supabaseApi.getAdminData();
      setAdminData(data);
    } catch (error) {
      console.error('Failed to load admin data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
    
    // Auto-refresh every 5 seconds
    const interval = setInterval(loadAdminData, 5000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading && !adminData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="w-16 h-16 bg-f1-dark rounded-lg mx-auto mb-4"></div>
          <p className="text-f1-gray">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-4xl font-display font-bold text-white mb-4 f1-accent">
              Admin Dashboard
            </h1>
            <p className="text-xl text-f1-gray">
              Real-time seat booking analytics and management
            </p>
          </div>
          <button
            onClick={loadAdminData}
            disabled={isLoading}
            className="bg-f1-red hover:bg-red-600 disabled:bg-f1-red/50 text-white font-semibold px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 mt-4 sm:mt-0"
          >
            <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Metrics Cards */}
        {adminData && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <MetricCard
              title="Total Seats"
              value={adminData.metrics.totalSeats}
              icon={<Calendar />}
              color="bg-blue-500"
            />
            <MetricCard
              title="Sold Seats"
              value={adminData.metrics.soldSeats}
              icon={<TrendingUp />}
              color="bg-success"
            />
            <MetricCard
              title="Active Holds"
              value={adminData.metrics.heldSeats}
              icon={<Clock />}
              color="bg-warning"
            />
            <MetricCard
              title="Available"
              value={adminData.metrics.availableSeats}
              icon={<Users />}
              color="bg-f1-red"
            />
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-f1-dark rounded-lg mb-6">
          <div className="flex border-b border-white/10">
            <TabButton
              active={activeTab === 'metrics'}
              onClick={() => setActiveTab('metrics')}
            >
              Metrics Overview
            </TabButton>
            <TabButton
              active={activeTab === 'holds'}
              onClick={() => setActiveTab('holds')}
            >
              Active Holds ({adminData?.activeHolds?.length || 0})
            </TabButton>
            <TabButton
              active={activeTab === 'sold'}
              onClick={() => setActiveTab('sold')}
            >
              Sold Seats
            </TabButton>
            <TabButton
              active={activeTab === 'expired'}
              onClick={() => setActiveTab('expired')}
            >
              Expired Holds
            </TabButton>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-f1-dark rounded-lg p-6">
          {activeTab === 'metrics' && adminData && (
            <MetricsOverview metrics={adminData.metrics} />
          )}
          
          {activeTab === 'holds' && adminData && (
            <ActiveHolds holds={adminData.activeHolds} />
          )}
          
          {activeTab === 'sold' && adminData && (
            <SoldSeats seats={adminData.soldSeats} />
          )}
          
          {activeTab === 'expired' && adminData && (
            <ExpiredHolds holds={adminData.expiredHolds} />
          )}
        </div>
      </div>
    </div>
  );
};

interface MetricCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon, color }) => (
  <div className="bg-f1-dark rounded-lg p-6 border border-white/10">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-f1-gray text-sm font-medium">{title}</p>
        <p className="text-3xl font-bold text-white mt-1">{value}</p>
      </div>
      <div className={`${color} p-3 rounded-lg`}>
        {React.cloneElement(icon as React.ReactElement, { 
          size: 24, 
          className: 'text-white' 
        })}
      </div>
    </div>
  </div>
);

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

const TabButton: React.FC<TabButtonProps> = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-6 py-4 font-medium transition-colors ${
      active
        ? 'text-f1-red border-b-2 border-f1-red bg-f1-red/5'
        : 'text-f1-gray hover:text-white'
    }`}
  >
    {children}
  </button>
);

const MetricsOverview: React.FC<{ metrics: any }> = ({ metrics }) => {
  const occupancyRate = ((metrics.soldSeats + metrics.heldSeats) / metrics.totalSeats * 100).toFixed(1);
  const conversionRate = (metrics.soldSeats / metrics.totalSeats * 100).toFixed(1);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Occupancy Chart */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Seat Distribution</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-f1-gray">Available</span>
            <span className="text-white font-medium">{metrics.availableSeats}</span>
          </div>
          <div className="w-full bg-f1-black rounded-full h-2">
            <div 
              className="bg-f1-gray rounded-full h-2 transition-all duration-300"
              style={{ width: `${(metrics.availableSeats / metrics.totalSeats) * 100}%` }}
            ></div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-f1-gray">Held</span>
            <span className="text-white font-medium">{metrics.heldSeats}</span>
          </div>
          <div className="w-full bg-f1-black rounded-full h-2">
            <div 
              className="bg-warning rounded-full h-2 transition-all duration-300"
              style={{ width: `${(metrics.heldSeats / metrics.totalSeats) * 100}%` }}
            ></div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-f1-gray">Sold</span>
            <span className="text-white font-medium">{metrics.soldSeats}</span>
          </div>
          <div className="w-full bg-f1-black rounded-full h-2">
            <div 
              className="bg-success rounded-full h-2 transition-all duration-300"
              style={{ width: `${(metrics.soldSeats / metrics.totalSeats) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Performance</h3>
        <div className="space-y-6">
          <div className="bg-f1-black rounded-lg p-4">
            <div className="text-2xl font-bold text-white">{occupancyRate}%</div>
            <div className="text-f1-gray text-sm">Current Occupancy Rate</div>
            <div className="text-xs text-f1-gray mt-1">
              (Sold + Held) / Total Seats
            </div>
          </div>
          
          <div className="bg-f1-black rounded-lg p-4">
            <div className="text-2xl font-bold text-success">{conversionRate}%</div>
            <div className="text-f1-gray text-sm">Conversion Rate</div>
            <div className="text-xs text-f1-gray mt-1">
              Sold / Total Seats
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ActiveHolds: React.FC<{ holds: any[] }> = ({ holds }) => (
  <div>
    <h3 className="text-lg font-semibold text-white mb-4">
      Active Holds ({holds.length})
    </h3>
    {holds.length > 0 ? (
      <div className="space-y-3">
        {holds.map((hold) => (
          <div key={hold.id} className="bg-f1-black rounded-lg p-4 flex items-center justify-between">
            <div>
              <div className="font-medium text-white">Hold #{hold.id.slice(-8)}</div>
              <div className="text-sm text-f1-gray">
                Seats: {hold.seatIds.join(', ')} • User: {hold.userId}
              </div>
            </div>
            <div className="text-right">
              <CountdownTimer
                expireAt={hold.expireAt}
                onExpire={() => {}}
                className="justify-end"
              />
            </div>
          </div>
        ))}
      </div>
    ) : (
      <p className="text-f1-gray text-center py-8">No active holds</p>
    )}
  </div>
);

const SoldSeats: React.FC<{ seats: any[] }> = ({ seats }) => (
  <div>
    <h3 className="text-lg font-semibold text-white mb-4">
      Sold Seats ({seats.length})
    </h3>
    {seats.length > 0 ? (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {seats.slice(0, 50).map((seat) => (
          <div key={seat.seatId} className="bg-f1-black rounded-lg p-3">
            <div className="font-medium text-white">{seat.seatId}</div>
            <div className="text-sm text-success">SOLD</div>
          </div>
        ))}
        {seats.length > 50 && (
          <div className="bg-f1-black rounded-lg p-3 flex items-center justify-center">
            <div className="text-f1-gray text-sm">
              +{seats.length - 50} more
            </div>
          </div>
        )}
      </div>
    ) : (
      <p className="text-f1-gray text-center py-8">No sold seats</p>
    )}
  </div>
);

const ExpiredHolds: React.FC<{ holds: any[] }> = ({ holds }) => (
  <div>
    <h3 className="text-lg font-semibold text-white mb-4">
      Expired Holds ({holds.length})
    </h3>
    {holds.length > 0 ? (
      <div className="space-y-3">
        {holds.slice(0, 20).map((hold) => (
          <div key={hold.id} className="bg-f1-black rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-white">Hold #{hold.id.slice(-8)}</div>
                <div className="text-sm text-f1-gray">
                  Seats: {hold.seatIds.join(', ')} • User: {hold.userId}
                </div>
              </div>
              <div className="text-error text-sm font-medium">EXPIRED</div>
            </div>
          </div>
        ))}
        {holds.length > 20 && (
          <div className="text-center text-f1-gray text-sm">
            +{holds.length - 20} more expired holds
          </div>
        )}
      </div>
    ) : (
      <p className="text-f1-gray text-center py-8">No expired holds</p>
    )}
  </div>
);