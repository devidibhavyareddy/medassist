import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';

const AppointmentChart = ({ data = [] }) => {
  // data format: [{ _id: 'completed', count: 12 }, { _id: 'scheduled', count: 8 }, ...]
  const chartData = data.map((item) => ({
    status: item._id || 'Unknown',
    count: item.count || 0,
  }));

  const getBarColor = (status) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return '#10b981'; // emerald
      case 'scheduled':
        return '#06b6d4'; // cyan
      case 'checkedin':
      case 'inconsultation':
        return '#3b82f6'; // blue
      case 'cancelled':
      case 'noshow':
        return '#f43f5e'; // rose
      default:
        return '#8b5cf6'; // violet
    }
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const dataItem = payload[0].payload;
      return (
        <div className="rounded-xl bg-[#090e1c] border border-cyan-500/30 p-3 shadow-xl backdrop-blur-md">
          <p className="text-xs font-mono uppercase tracking-wider text-slate-400">
            {dataItem.status}
          </p>
          <p className="text-lg font-bold text-white mt-0.5">
            {dataItem.count} <span className="text-xs text-slate-400 font-normal">appointments</span>
          </p>
        </div>
      );
    }
    return null;
  };

  if (!chartData.length) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
        No appointment status statistics available
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
          <XAxis
            dataKey="status"
            stroke="#64748b"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(val) => val.charAt(0).toUpperCase() + val.slice(1)}
          />
          <YAxis
            stroke="#64748b"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="count" radius={[6, 6, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.status)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AppointmentChart;
