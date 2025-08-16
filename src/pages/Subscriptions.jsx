import React, { useState, useEffect, useCallback, useMemo } from "react";
import api from "../lib/api";
import Card from "../components/Card";
// import Modal from "../components/Modal";
import Input from "../components/Input";
import Select from "../components/Select";
import Table from "../components/Table";
import Pagination from "../components/Pagination";
import useAuthGuard from "../hooks/useAuthGuard";
import { useDebounce } from "use-debounce";

const Subscriptions = () => {
  useAuthGuard();
  const [subscriptions, setSubscriptions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [formData, setFormData] = useState({
    service_name: "",
    cost: "",
    billing_cycle: "Monthly",
    category: "",
    auto_renews: true,
    start_date: "",
  });
  const [annualizedCost, setAnnualizedCost] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Pagination, Filtering, Sorting, Searching states
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filterCategory, setFilterCategory] = useState("");
  const [filterBillingCycle, setFilterBillingCycle] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery] = useDebounce(searchQuery, 500);
  const [sortBy, setSortBy] = useState("start_date");
  const [totalPages, setTotalPages] = useState(1);

  const billingCycleOptions = [
    { value: "Monthly", label: "Monthly" },
    { value: "Quarterly", label: "Quarterly" },
    { value: "Yearly", label: "Yearly" },
  ];

  const fetchSubscriptions = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log("Fetching subscriptions...");
      // Backend doesn't support pagination/filtering yet, so we'll fetch all and handle it client-side
      const response = await api.get("/subscriptions");
      console.log("Subscriptions response:", response);
      // Backend returns: { message: "...", data: [...] }
      const subscriptionsData = response.data.data || [];
      console.log("Subscriptions data:", subscriptionsData);
      setSubscriptions(subscriptionsData);
    } catch (err) {
      console.error("Error fetching subscriptions:", err);
      setError("Failed to fetch subscriptions.");
      setSubscriptions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get("/categories");
      // Fix: Access the data property from the response
      setCategories(response.data.data || []);
    } catch (err) {
      setError("Failed to fetch categories.");
      setCategories([]); // Ensure categories is always an array
    }
  };

  // Apply filters, search, and sorting to subscriptions
  const filteredAndSortedSubscriptions = useMemo(() => {
    let filtered = [...subscriptions];

    // Apply search filter
    if (debouncedSearchQuery.trim()) {
      const searchTerm = debouncedSearchQuery.toLowerCase();
      filtered = filtered.filter(sub => 
        sub.service_name.toLowerCase().includes(searchTerm) ||
        (sub.category_name && sub.category_name.toLowerCase().includes(searchTerm))
      );
    }

    // Apply category filter
    if (filterCategory) {
      filtered = filtered.filter(sub => {
        const subCategory = typeof sub.category === 'string' ? parseInt(sub.category) : sub.category;
        const filterCat = parseInt(filterCategory);
        return subCategory === filterCat;
      });
    }

    // Apply billing cycle filter
    if (filterBillingCycle) {
      filtered = filtered.filter(sub => sub.billing_cycle === filterBillingCycle);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "cost":
          return parseFloat(b.cost) - parseFloat(a.cost);
        case "annualized_cost":
          return parseFloat(b.annualized_cost) - parseFloat(a.annualized_cost);
        case "start_date":
        default:
          return new Date(b.start_date) - new Date(a.start_date);
      }
    });

    return filtered;
  }, [subscriptions, debouncedSearchQuery, filterCategory, filterBillingCycle, sortBy]);

  // Calculate total pages based on filtered data
  useEffect(() => {
    setTotalPages(Math.ceil(filteredAndSortedSubscriptions.length / limit));
    // Reset to page 1 if current page is beyond total pages
    if (page > Math.ceil(filteredAndSortedSubscriptions.length / limit)) {
      setPage(1);
    }
  }, [filteredAndSortedSubscriptions.length, limit, page]);

  // Get current page's subscriptions from filtered data
  const getCurrentPageSubscriptions = () => {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    return filteredAndSortedSubscriptions.slice(startIndex, endIndex);
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setPage(newPage);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  // Reset to page 1 when search or filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearchQuery, filterCategory, filterBillingCycle]);

  useEffect(() => {
    const cost = parseFloat(formData.cost);
    if (isNaN(cost)) {
      setAnnualizedCost(0);
      return;
    }
    let calculatedAnnualizedCost = 0;
    switch (formData.billing_cycle) {
      case "Monthly":
        calculatedAnnualizedCost = cost * 12;
        break;
      case "Quarterly":
        calculatedAnnualizedCost = cost * 4;
        break;
      case "Yearly":
        calculatedAnnualizedCost = cost;
        break;
      default:
        calculatedAnnualizedCost = 0;
    }
    setAnnualizedCost(calculatedAnnualizedCost);
  }, [formData.cost, formData.billing_cycle]);

  const handleInputChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAddSubscription = () => {
    setCurrentSubscription(null);
    setFormData({
      service_name: "",
      cost: "",
      billing_cycle: "Monthly",
      category: categories.length > 0 ? categories[0].id : "",
      auto_renews: true,
      start_date: new Date().toISOString().split("T")[0],
    });
    setError("");
    setSuccess("");
    setIsModalOpen(true);
  };

  const handleEditSubscription = (subscription) => {
    setCurrentSubscription(subscription);
    setFormData({
      service_name: subscription.service_name,
      cost: subscription.cost,
      billing_cycle: subscription.billing_cycle,
      category: subscription.category_id || subscription.category,
      auto_renews: subscription.auto_renews,
      start_date: new Date(subscription.start_date).toISOString().split("T")[0],
    });
    setError("");
    setSuccess("");
    setIsModalOpen(true);
  };

  const handleDeleteSubscription = async (subscriptionId) => {
    if (window.confirm("Are you sure you want to delete this subscription?")) {
      try {
        await api.delete(`/subscriptions/${subscriptionId}`);
        setSuccess("Subscription deleted successfully!");
        fetchSubscriptions();
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to delete subscription."
        );
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    // Frontend validation
    if (!formData.service_name.trim()) {
      setError("Service name is required");
      return;
    }
    
    if (!formData.cost || parseFloat(formData.cost) <= 0) {
      setError("Cost must be greater than 0");
      return;
    }
    
    if (!formData.category) {
      setError("Category is required");
      return;
    }
    
    if (!formData.start_date) {
      setError("Start date is required");
      return;
    }
    
    try {
      const payload = { 
        ...formData, 
        cost: parseFloat(formData.cost),
        service_name: formData.service_name.trim()
      };
      
      if (currentSubscription) {
        await api.put(`/subscriptions/${currentSubscription.id}`, payload);
        setSuccess("Subscription updated successfully!");
      } else {
        await api.post("/subscriptions", payload);
        setSuccess("Subscription added successfully!");
      }
      fetchSubscriptions();
      setIsModalOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save subscription.");
    }
  };

    const columns = [
      { 
        header: "Service Name", 
        accessor: "service_name",
        render: (row) => (
          <div className="font-semibold text-gray-800">
            {row.service_name}
          </div>
        )
      },
      { 
        header: "Cost", 
        render: (row) => (
          <div className="text-right">
            <div className="font-bold text-green-600">₹{parseFloat(row.cost).toFixed(2)}</div>
            <div className="text-xs text-gray-500">{row.billing_cycle}</div>
          </div>
        )
      },
      { 
        header: "Category", 
        render: (row) => (
          <span className="px-3 py-1 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 rounded-full text-xs font-medium border border-blue-300">
            {row.category_name || "Uncategorized"}
          </span>
        )
      },
      {
        header: "Auto Renews",
        render: (row) => (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            row.auto_renews 
              ? "bg-green-100 text-green-800 border border-green-300" 
              : "bg-red-100 text-red-800 border border-red-300"
          }`}>
            {row.auto_renews ? "🔄 Yes" : "⏹️ No"}
          </span>
        ),
      },
      { 
        header: "Start Date", 
        render: (row) => (
          <div className="text-gray-700">
            {new Date(row.start_date).toLocaleDateString('en-IN', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}
          </div>
        )
      },
      { 
        header: "Annual Cost", 
        render: (row) => (
          <div className="text-right">
            <div className="font-bold text-purple-600">₹{parseFloat(row.annualized_cost).toFixed(2)}</div>
            <div className="text-xs text-gray-500">/year</div>
          </div>
        )
      },
      {
        header: "Actions",
        render: (row) => (
          <div className="flex space-x-2">
            <button
              onClick={() => handleEditSubscription(row)}
              className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white font-medium py-2 px-3 rounded-lg text-xs shadow-sm hover:shadow-md transition-all duration-200"
            >
              ✏️ Edit
            </button>
            <button
              onClick={() => handleDeleteSubscription(row.id)}
              className="bg-gradient-to-r from-red-400 to-red-500 hover:from-red-500 hover:to-red-600 text-white font-medium py-2 px-3 rounded-lg text-xs shadow-sm hover:shadow-md transition-all duration-200"
            >
              🗑️ Delete
            </button>
          </div>
        ),
      },
    ];

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">📱 Subscriptions</h1>
        <p className="text-gray-600">Manage your subscription services and track your recurring expenses</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <div className="text-center">
            <div className="text-2xl font-bold">{filteredAndSortedSubscriptions.length}</div>
            <div className="text-blue-100">Total Subscriptions</div>
          </div>
        </Card>
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <div className="text-center">
            <div className="text-2xl font-bold">
              ₹{filteredAndSortedSubscriptions.reduce((sum, sub) => sum + parseFloat(sub.cost || 0), 0).toFixed(2)}
            </div>
            <div className="text-green-100">Monthly Cost</div>
          </div>
        </Card>
        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <div className="text-center">
            <div className="text-2xl font-bold">
              ₹{filteredAndSortedSubscriptions.reduce((sum, sub) => sum + parseFloat(sub.annualized_cost || 0), 0).toFixed(2)}
            </div>
            <div className="text-purple-100">Annual Cost</div>
          </div>
        </Card>
        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <div className="text-center">
            <div className="text-2xl font-bold">
              {filteredAndSortedSubscriptions.filter(sub => sub.auto_renews).length}
            </div>
            <div className="text-orange-100">Auto-Renewing</div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
          <button
            onClick={handleAddSubscription}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2"
          >
            <span className="text-xl">➕</span>
            <span>Add Subscription</span>
          </button>
          <div className="flex flex-wrap gap-3">
            <div className="relative">
              <Input
                id="search"
                type="text"
                placeholder="🔍 Search subscriptions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
              />
            </div>
            
            <Select
              id="filterCategory"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              options={[
                { value: "", label: "🏷️ All Categories" },
                ...categories.map((cat) => ({
                  value: cat.id,
                  label: `🏷️ ${cat.name}`,
                })),
              ]}
              className="min-w-[150px] border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
            />
            
            <Select
              id="filterBillingCycle"
              value={filterBillingCycle}
              onChange={(e) => setFilterBillingCycle(e.target.value)}
              options={[
                { value: "", label: "🔄 All Cycles" },
                ...billingCycleOptions.map(option => ({
                  ...option,
                  label: `🔄 ${option.label}`
                })),
              ]}
              className="min-w-[150px] border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
            />
            
            <Select
              id="sortBy"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              options={[
                { value: "start_date", label: "📅 Sort by Start Date" },
                { value: "cost", label: "💰 Sort by Cost" },
                { value: "annualized_cost", label: "📊 Sort by Annualized Cost" },
              ]}
              className="min-w-[180px] border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
            />
            
            <Select
              id="pageSize"
              value={limit}
              onChange={(e) => {
                setLimit(parseInt(e.target.value));
                setPage(1);
              }}
              options={[
                { value: 5, label: "5 per page" },
                { value: 10, label: "10 per page" },
                { value: 20, label: "20 per page" },
                { value: 50, label: "50 per page" },
              ]}
              className="min-w-[120px] border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
            />
          </div>
        </div>
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center">
              <span className="text-red-500 mr-2">❌</span>
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center">
              <span className="text-green-500 mr-2">✅</span>
              <p className="text-green-700 font-medium">{success}</p>
            </div>
          </div>
        )}
        
        {/* Pagination Info */}
        {!isLoading && filteredAndSortedSubscriptions.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-center">
            <div className="text-sm text-gray-600">
              📊 Showing <span className="font-semibold text-blue-600">{((page - 1) * limit) + 1}</span> to <span className="font-semibold text-blue-600">{Math.min(page * limit, filteredAndSortedSubscriptions.length)}</span> of <span className="font-semibold text-blue-600">{filteredAndSortedSubscriptions.length}</span> subscriptions
            </div>
          </div>
        )}
        
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-600 text-lg">Loading your subscriptions...</p>
          </div>
        ) : filteredAndSortedSubscriptions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📱</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {subscriptions.length === 0 ? "No subscriptions found" : "No subscriptions match your filters"}
            </h3>
            <p className="text-gray-500 mb-4">
              {subscriptions.length === 0 
                ? "Start by adding your first subscription service"
                : "Try adjusting your search or filter criteria"
              }
            </p>
            {subscriptions.length === 0 && (
              <button
                onClick={handleAddSubscription}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Add Your First Subscription
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <Table columns={columns} data={getCurrentPageSubscriptions()} />
          </div>
        )}
        {/* Pagination */}
        {!isLoading && filteredAndSortedSubscriptions.length > 0 && totalPages > 1 && (
          <div className="mt-6">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </Card>


      
      {/* Simple Inline Modal for Testing */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
          <div className="relative p-5 border w-full max-w-md md:max-w-lg lg:max-w-xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center pb-3">
              <h3 className="text-lg font-semibold text-gray-900">
                {currentSubscription ? "Edit Subscription" : "Add Subscription"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300 rounded-md"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Service Name
                </label>
                <input
                  type="text"
                  id="service_name"
                  value={formData.service_name}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Cost
                </label>
                <input
                  type="number"
                  id="cost"
                  value={formData.cost}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Billing Cycle
                </label>
                <select
                  id="billing_cycle"
                  value={formData.billing_cycle}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                >
                  {billingCycleOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Category
                </label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    id="auto_renews"
                    checked={formData.auto_renews}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <span className="text-sm font-bold text-gray-700">Auto Renews</span>
                </label>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  id="start_date"
                  value={formData.start_date}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              
              <p className="text-lg font-bold mt-4 mb-4">
                Annualized Cost: ₹{annualizedCost.toFixed(2)}
              </p>
              
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Subscriptions;
