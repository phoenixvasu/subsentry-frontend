import React, { useState, useEffect } from "react";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import Card from "../components/Card";

import useAuthGuard from "../hooks/useAuthGuard";
import { useAuthStore } from "../store/auth";

const Dashboard = () => {
  useAuthGuard();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({});
  const [renewals, setRenewals] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("month"); // month, quarter, year
  const { token } = useAuthStore();

  useEffect(() => {
    if (token) {
      fetchDashboardData();
      fetchRenewals();
    }
  }, [token]);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get("/metrics");
      console.log("🔍 Dashboard API Response:", response.data);
      setDashboardData(response.data);
    } catch (err) {
      setError("Failed to fetch dashboard data.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRenewals = async () => {
    try {
      const response = await api.get("/renewals?withinDays=30");
      
      // Handle different response formats
      let renewalsData = [];
      if (response.data && response.data.data) {
        renewalsData = response.data.data;
      } else if (Array.isArray(response.data)) {
        renewalsData = response.data;
      } else {
        renewalsData = [];
      }
      
      setRenewals(renewalsData);
      
    } catch (err) {
      console.error("Failed to fetch renewals:", err);
      setRenewals([]);
    }
  };

  // Calculate savings potential
  const calculateSavingsPotential = () => {
    if (!dashboardData.totalAnnualizedCost) return 0;
    // Assume 15% potential savings through optimization
    return dashboardData.totalAnnualizedCost * 0.15;
  };

  // Calculate monthly vs yearly savings
  const calculateBillingOptimization = () => {
    if (!dashboardData.totalAnnualizedCost) return 0;
    // Assume switching to yearly could save 10%
    return dashboardData.totalAnnualizedCost * 0.10;
  };

  // Prepare data for charts
  const prepareMonthlyTrendData = () => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return months.map((month, index) => ({
      month,
      cost: Math.floor(Math.random() * 5000) + 2000, // Mock data for now
      trend: Math.random() > 0.5 ? "up" : "down"
    }));
  };

  const prepareCategoryBreakdown = () => {
    // Mock data for now - in real app this would come from API
    return [
      { name: "Streaming", value: 25, color: "#8884d8" },
      { name: "Software", value: 30, color: "#82ca9d" },
      { name: "Cloud", value: 20, color: "#ffc658" },
      { name: "Gaming", value: 15, color: "#ff7300" },
      { name: "Other", value: 10, color: "#8dd1e1" }
    ];
  };

  const prepareBillingCycleData = () => {
    return [
      { cycle: "Monthly", count: 15, cost: 4500 },
      { cycle: "Quarterly", count: 8, cost: 3200 },
      { cycle: "Yearly", count: 13, cost: 8900 }
    ];
  };

      if (isLoading) {
      return (
        <div className="text-center mt-8">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-600">Loading your financial dashboard...</p>
        </div>
      );
    }

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">💰 Financial Dashboard</h1>
        <p className="text-gray-600 text-lg">Track your subscription spending and optimize your budget</p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="text-center">
            <div className="text-3xl mb-2">💰</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Monthly Spending</h3>
            <p className="text-3xl font-bold text-blue-600">
              ₹{dashboardData.totalMonthlyCost
                ? parseFloat(dashboardData.totalMonthlyCost).toFixed(2)
                : "0.00"}
            </p>
            <p className="text-sm text-gray-500 mt-1">This month's total</p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <div className="text-3xl mb-2">📊</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Annual Cost</h3>
            <p className="text-3xl font-bold text-green-600">
              ₹{dashboardData.totalAnnualizedCost
                ? parseFloat(dashboardData.totalAnnualizedCost).toFixed(2)
                : "0.00"}
            </p>
            <p className="text-sm text-gray-500 mt-1">Yearly projection</p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <div className="text-3xl mb-2">📱</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Active Subscriptions</h3>
            <p className="text-3xl font-bold text-purple-600">
              {dashboardData.totalSubscriptions || 0}
            </p>
            <p className="text-sm text-gray-500 mt-1">Currently active</p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <div className="text-3xl mb-2">🎯</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Savings Potential</h3>
            <p className="text-3xl font-bold text-orange-600">
              ₹{calculateSavingsPotential().toFixed(2)}
            </p>
            <p className="text-sm text-gray-500 mt-1">Optimization opportunity</p>
          </div>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend Chart */}
        <Card>
          <h3 className="text-xl font-semibold mb-4 text-gray-800">📈 Monthly Spending Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={prepareMonthlyTrendData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [`₹${value}`, "Spending"]} />
              <Area 
                type="monotone" 
                dataKey="cost" 
                stroke="#3b82f6" 
                fill="#3b82f6" 
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Category Breakdown */}
        <Card>
          <h3 className="text-xl font-semibold mb-4 text-gray-800">🏷️ Spending by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={prepareCategoryBreakdown()}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {prepareCategoryBreakdown().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value}%`, "Share"]} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Billing Cycle Analysis */}
      <Card>
        <h3 className="text-xl font-semibold mb-4 text-gray-800">🔄 Billing Cycle Analysis</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={prepareBillingCycleData()}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="cycle" />
            <YAxis />
            <Tooltip formatter={(value) => [`₹${value}`, "Cost"]} />
            <Legend />
            <Bar dataKey="cost" fill="#10b981" name="Monthly Cost" />
            <Bar dataKey="count" fill="#3b82f6" name="Subscription Count" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Smart Insights */}
      <Card>
        <h3 className="text-xl font-semibold mb-4 text-gray-800">💡 Smart Insights</h3>
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="text-2xl">💰</div>
            <div>
              <h4 className="font-semibold text-gray-800">Billing Optimization</h4>
              <p className="text-sm text-gray-600">
                Switch to yearly plans could save you ₹{calculateBillingOptimization().toFixed(2)} annually
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="text-2xl">🎯</div>
            <div>
              <h4 className="font-semibold text-gray-800">Budget Goal</h4>
              <p className="text-sm text-gray-600">
                You're spending {(dashboardData.totalMonthlyCost / 5000 * 100).toFixed(1)}% of your ₹5,000 monthly budget
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="text-2xl">📱</div>
            <div>
              <h4 className="font-semibold text-gray-800">Subscription Health</h4>
              <p className="text-sm text-gray-600">
                {dashboardData.totalSubscriptions > 20 ? "Consider reviewing unused subscriptions" : "Good subscription management"}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Upcoming Renewals */}
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800">⏰ Upcoming Renewals</h3>
          <button
            onClick={fetchRenewals}
            className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
          >
            🔄 Refresh
          </button>
        </div>
        
        <div className="space-y-3">
          {renewals.length > 0 ? (
            renewals.slice(0, 5).map((sub, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                 <div>
                   <h4 className="font-semibold text-gray-800">{sub.service_name}</h4>
                   <p className="text-sm text-gray-600">
                     Renews: {new Date(sub.nextRenewalDate).toLocaleDateString()}
                   </p>
                 </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-800">
                    ₹{sub.annualized_cost
                      ? parseFloat(sub.annualized_cost).toFixed(2)
                      : "0.00"}
                  </p>
                  <p className="text-sm text-gray-500">/year</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">No upcoming renewals</p>
          )}
        </div>
      </Card>

      {/* Quick Actions */}
      <Card>
        <h3 className="text-xl font-semibold mb-4 text-gray-800">⚡ Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button 
            onClick={() => navigate("/subscriptions")}
            className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-center transition-colors cursor-pointer"
          >
            <div className="text-2xl mb-2">➕</div>
            <h4 className="font-semibold text-blue-800">Add Subscription</h4>
            <p className="text-sm text-blue-600">Track a new service</p>
          </button>
          <button 
            onClick={() => navigate("/categories")}
            className="p-4 bg-green-50 hover:bg-green-100 rounded-lg text-center transition-colors cursor-pointer"
          >
            <div className="text-2xl mb-2">📊</div>
            <h4 className="font-semibold text-green-800">View Categories</h4>
            <p className="text-sm text-green-600">Analyze spending</p>
          </button>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
