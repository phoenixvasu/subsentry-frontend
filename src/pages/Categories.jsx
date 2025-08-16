import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import api from "../lib/api";
import Card from "../components/Card";
import LoadingSpinner from "../components/LoadingSpinner";
import Table from "../components/Table";
import useAuthGuard from "../hooks/useAuthGuard";

const Categories = () => {
  useAuthGuard();
  const [categories, setCategories] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      // Fetch both categories and subscriptions
      const [categoriesResponse, subscriptionsResponse] = await Promise.all([
        api.get("/categories"),
        api.get("/subscriptions")
      ]);

      const categoriesData = categoriesResponse.data.data || [];
      const subscriptionsData = subscriptionsResponse.data.data || [];

      setCategories(categoriesData);
      setSubscriptions(subscriptionsData);
    } catch (err) {
      setError("Failed to fetch data.");
      console.error("Error fetching data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Get category-wise data
  const getCategoryStats = () => {
    const stats = {};
    
    categories.forEach(category => {
      const categorySubs = subscriptions.filter(sub => sub.category === category.id);
      const totalCost = categorySubs.reduce((sum, sub) => sum + parseFloat(sub.cost), 0);
      const totalAnnualized = categorySubs.reduce((sum, sub) => sum + parseFloat(sub.annualized_cost), 0);
      
      stats[category.id] = {
        id: category.id,
        name: category.name,
        subscriptionCount: categorySubs.length,
        totalMonthlyCost: categorySubs.reduce((sum, sub) => {
          switch (sub.billing_cycle) {
            case 'Monthly': return sum + parseFloat(sub.cost);
            case 'Yearly': return sum + (parseFloat(sub.cost) / 12);
            case 'Quarterly': return sum + (parseFloat(sub.cost) / 3);
            default: return sum;
          }
        }, 0),
        totalAnnualizedCost: totalAnnualized,
        subscriptions: categorySubs
      };
    });

    return Object.values(stats).sort((a, b) => b.totalAnnualizedCost - a.totalAnnualizedCost);
  };

  // Get subscriptions for a specific category
  const getCategorySubscriptions = (categoryId) => {
    return subscriptions.filter(sub => sub.category === categoryId);
  };

  // Prepare data for pie chart
  const preparePieChartData = () => {
    return getCategoryStats().map(stat => ({
      name: stat.name,
      value: stat.totalAnnualizedCost,
      count: stat.subscriptionCount
    }));
  };

  // Prepare data for bar chart
  const prepareBarChartData = () => {
    return getCategoryStats().map(stat => ({
      category: stat.name,
      monthlyCost: stat.totalMonthlyCost,
      annualCost: stat.totalAnnualizedCost,
      subscriptionCount: stat.subscriptionCount
    }));
  };

  // Get top spending categories
  const getTopSpendingCategories = () => {
    return getCategoryStats().slice(0, 5);
  };

  // Get budget recommendations
  const getBudgetRecommendations = () => {
    const stats = getCategoryStats();
    const totalMonthly = stats.reduce((sum, stat) => sum + stat.totalMonthlyCost, 0);
    const recommendations = [];

    if (totalMonthly > 5000) {
      recommendations.push({
        type: "warning",
        message: "Your monthly spending is above ₹5,000. Consider reviewing high-cost categories.",
        icon: "⚠️"
      });
    }

    const highSpendingCategories = stats.filter(stat => stat.totalMonthlyCost > 1000);
    if (highSpendingCategories.length > 0) {
      recommendations.push({
        type: "info",
        message: `${highSpendingCategories.length} categories exceed ₹1,000/month. Review for optimization opportunities.`,
        icon: "💡"
      });
    }

    const lowUsageCategories = stats.filter(stat => stat.subscriptionCount === 1 && stat.totalMonthlyCost > 500);
    if (lowUsageCategories.length > 0) {
      recommendations.push({
        type: "suggestion",
        message: `${lowUsageCategories.length} categories have single expensive subscriptions. Consider alternatives.`,
        icon: "🔍"
      });
    }

    return recommendations;
  };

  const categoryStats = getCategoryStats();

  if (isLoading) {
    return (
      <div className="text-center mt-8">
        <LoadingSpinner size="lg" text="Loading spending analysis..." />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">🏷️ Category-wise Spending Analysis</h1>
        <p className="text-gray-600 text-lg">View your spending breakdown by category. Categories are automatically created when you add subscriptions.</p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Category Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="text-center">
            <div className="text-3xl mb-2">🏷️</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Categories</h3>
            <p className="text-3xl font-bold text-blue-600">{categories.length}</p>
            <p className="text-sm text-gray-500 mt-1">Active categories</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl mb-2">📱</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Subscriptions</h3>
            <p className="text-3xl font-bold text-green-600">{subscriptions.length}</p>
            <p className="text-sm text-gray-500 mt-1">Active services</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl mb-2">💰</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Monthly Cost</h3>
            <p className="text-3xl font-bold text-purple-600">
              ₹{subscriptions.reduce((sum, sub) => {
                switch (sub.billing_cycle) {
                  case 'Monthly': return sum + parseFloat(sub.cost);
                  case 'Yearly': return sum + (parseFloat(sub.cost) / 12);
                  case 'Quarterly': return sum + (parseFloat(sub.cost) / 3);
                  default: return sum;
                }
              }, 0).toFixed(2)}
            </p>
            <p className="text-sm text-gray-500 mt-1">This month's total</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl mb-2">📊</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Annual Cost</h3>
            <p className="text-3xl font-bold text-red-600">
              ₹{subscriptions.reduce((sum, sub) => sum + parseFloat(sub.annualized_cost), 0).toFixed(2)}
            </p>
            <p className="text-sm text-gray-500 mt-1">Yearly projection</p>
          </div>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution Pie Chart */}
        <Card>
          <h3 className="text-xl font-semibold mb-4 text-gray-800">📊 Spending Distribution by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={preparePieChartData()}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}\n₹${value.toFixed(0)}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {preparePieChartData().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57'][index % 10]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`₹${value.toFixed(2)}`, "Annual Cost"]} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Monthly vs Annual Cost Bar Chart */}
        <Card>
          <h3 className="text-xl font-semibold mb-4 text-gray-800">📈 Monthly vs Annual Cost Comparison</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={prepareBarChartData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip formatter={(value, name) => [`₹${value.toFixed(2)}`, name === 'monthlyCost' ? 'Monthly Cost' : 'Annual Cost']} />
              <Legend />
              <Bar dataKey="monthlyCost" fill="#3b82f6" name="Monthly Cost" />
              <Bar dataKey="annualCost" fill="#10b981" name="Annual Cost" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Top Spending Categories */}
      <Card>
        <h2 className="text-2xl font-bold mb-6 text-gray-800">🏆 Top Spending Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {getTopSpendingCategories().map((stat, index) => (
            <div key={stat.id} className="bg-gradient-to-br from-blue-50 to-indigo-100 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-800">{stat.name}</h3>
                <span className="text-2xl">{['🥇', '🥈', '🥉', '4️⃣', '5️⃣'][index]}</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subscriptions:</span>
                  <span className="font-semibold">{stat.subscriptionCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Monthly:</span>
                  <span className="font-semibold text-blue-600">₹{stat.totalMonthlyCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Annual:</span>
                  <span className="font-semibold text-green-600">₹{stat.totalAnnualizedCost.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Budget Recommendations */}
      <Card>
        <h2 className="text-2xl font-bold mb-6 text-gray-800">💡 Smart Budget Recommendations</h2>
        <div className="space-y-4">
          {getBudgetRecommendations().map((rec, index) => (
            <div key={index} className={`p-4 rounded-lg border-l-4 ${
              rec.type === 'warning' ? 'bg-yellow-50 border-yellow-400' :
              rec.type === 'info' ? 'bg-blue-50 border-blue-400' :
              'bg-green-50 border-green-400'
            }`}>
              <div className="flex items-start space-x-3">
                <div className="text-2xl">{rec.icon}</div>
                <p className="text-gray-700">{rec.message}</p>
              </div>
            </div>
          ))}
          {getBudgetRecommendations().length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">🎉</div>
              <p className="text-lg">Great job! Your spending is well-managed across categories.</p>
            </div>
          )}
        </div>
      </Card>

      {/* Category-wise Spending Analysis Table */}
      <Card>
        <h2 className="text-2xl font-bold mb-6 text-gray-800">📋 Detailed Category Analysis</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="py-3 px-6">Category</th>
                <th className="py-3 px-6">Subscriptions</th>
                <th className="py-3 px-6">Monthly Cost</th>
                <th className="py-3 px-6">Annual Cost</th>
                <th className="py-3 px-6">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categoryStats.map((stat) => (
                <tr key={stat.id} className="bg-white border-b hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <div className="font-semibold text-gray-900">{stat.name}</div>
                    <div className="text-sm text-gray-500">
                      {stat.subscriptionCount} subscription{stat.subscriptionCount !== 1 ? 's' : ''}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      {stat.subscriptionCount}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-semibold">
                    ₹{stat.totalMonthlyCost.toFixed(2)}
                  </td>
                  <td className="py-4 px-6 font-semibold">
                    ₹{stat.totalAnnualizedCost.toFixed(2)}
                  </td>
                  <td className="py-4 px-6">
                    <button
                      onClick={() => setSelectedCategory(selectedCategory === stat.id ? null : stat.id)}
                      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-xs transition-colors"
                    >
                      {selectedCategory === stat.id ? 'Hide Details' : 'Show Details'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Category Details - Expandable Sections */}
      <div className="space-y-4">
        {categoryStats.map((stat) => (
          selectedCategory === stat.id && (
            <Card key={stat.id}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">{stat.name}</h3>
                <div className="text-sm text-gray-500">
                  {stat.subscriptionCount} subscription{stat.subscriptionCount !== 1 ? 's' : ''} • 
                  Monthly: ₹{stat.totalMonthlyCost.toFixed(2)} • 
                  Annual: ₹{stat.totalAnnualizedCost.toFixed(2)}
                </div>
              </div>
              
              {stat.subscriptions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                      <tr>
                        <th className="py-2 px-4">Service</th>
                        <th className="py-2 px-4">Cost</th>
                        <th className="py-2 px-4">Billing Cycle</th>
                        <th className="py-2 px-4">Annual Cost</th>
                        <th className="py-2 px-4">Start Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stat.subscriptions.map((sub) => (
                        <tr key={sub.id} className="bg-white border-b hover:bg-gray-50">
                          <td className="py-2 px-4 font-medium">{sub.service_name}</td>
                          <td className="py-2 px-4">₹{parseFloat(sub.cost).toFixed(2)}</td>
                          <td className="py-2 px-4">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              sub.billing_cycle === 'Monthly' ? 'bg-blue-100 text-blue-800' :
                              sub.billing_cycle === 'Yearly' ? 'bg-green-100 text-green-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {sub.billing_cycle}
                            </span>
                          </td>
                          <td className="py-2 px-4 font-semibold">₹{parseFloat(sub.annualized_cost).toFixed(2)}</td>
                          <td className="py-2 px-4">{new Date(sub.start_date).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No subscriptions in this category</p>
              )}
            </Card>
          )
        ))}
      </div>
    </div>
  );
};

export default Categories;
