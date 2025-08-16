import React, { useState, useEffect } from "react";
import api from "../lib/api";
import Card from "../components/Card";
import useAuthGuard from "../hooks/useAuthGuard";

const Dashboard = () => {
  useAuthGuard();
  const [dashboardData, setDashboardData] = useState(null);
  const [upcomingRenewals, setUpcomingRenewals] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    fetchUpcomingRenewals();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get("/metrics");
      setDashboardData(response.data);
    } catch (err) {
      setError("Failed to fetch dashboard data.");
      console.error("Dashboard data error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUpcomingRenewals = async () => {
    try {
      const response = await api.get("/renewals");
      setUpcomingRenewals(response.data);
    } catch (err) {
      setError("Failed to fetch upcoming renewals.");
      console.error("Renewals error:", err);
    }
  };

  if (loading) {
    return <div className="text-center mt-8">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center mt-8">{error}</div>;
  }

  if (!dashboardData) {
    return <div className="text-center mt-8">No dashboard data available</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <h2 className="text-lg font-semibold mb-2">Total Monthly Cost</h2>
          <p className="text-3xl font-bold">
            ${dashboardData.totalMonthlyCost?.toFixed(2) || "0.00"}
          </p>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold mb-2">Total Annualized Cost</h2>
          <p className="text-3xl font-bold">
            ${dashboardData.totalAnnualizedCost?.toFixed(2) || "0.00"}
          </p>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold mb-2">Highest Subscription</h2>
          <p className="text-xl font-bold">
            {dashboardData.highestSubscription?.service_name || "N/A"}
          </p>
          <p className="text-lg">
            $
            {dashboardData.highestSubscription?.annualized_cost?.toFixed(2) ||
              "0.00"}{" "}
            / year
          </p>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold mb-2">Total Subscriptions</h2>
          <p className="text-3xl font-bold">
            {dashboardData.totalSubscriptions || 0}
          </p>
        </Card>
      </div>

      <Card>
        <h2 className="text-xl font-bold mb-4">
          Upcoming Renewals (Next 30 Days)
        </h2>
        {upcomingRenewals.length === 0 ? (
          <p>No upcoming renewals in the next 30 days.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {upcomingRenewals.map((sub) => (
              <li
                key={sub.id}
                className="py-3 flex justify-between items-center"
              >
                <div>
                  <p className="text-lg font-semibold">{sub.service_name}</p>
                  <p className="text-sm text-gray-600">
                    Renews on:{" "}
                    {new Date(sub.nextRenewalDate).toLocaleDateString()}
                  </p>
                </div>
                <p className="text-lg font-bold">
                  ${sub.annualized_cost?.toFixed(2) || "0.00"} / year
                </p>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
};

export default Dashboard;
