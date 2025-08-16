import React, { useState, useEffect, useCallback } from "react";
import api from "../lib/api";
import Card from "../components/Card";
import Modal from "../components/Modal";
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
      setTotalPages(1); // No pagination support yet
    } catch (err) {
      console.error("Error fetching subscriptions:", err);
      setError("Failed to fetch subscriptions.");
      setSubscriptions([]);
    } finally {
      setIsLoading(false);
    }
  }, []); // Remove dependencies since we're not using filters yet

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

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

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
      category: subscription.category.id,
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
    try {
      const payload = { ...formData, cost: parseFloat(formData.cost) };
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
    { header: "Service Name", accessor: "service_name" },
    { header: "Cost", accessor: "cost" },
    { header: "Billing Cycle", accessor: "billing_cycle" },
    { header: "Category", render: (row) => row.category?.name },
    {
      header: "Auto Renews",
      render: (row) => (row.auto_renews ? "Yes" : "No"),
    },
    { header: "Start Date", accessor: "start_date" },
    { header: "Annualized Cost", accessor: "annualized_cost" },
    {
      header: "Actions",
      render: (row) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleEditSubscription(row)}
            className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-3 rounded text-xs"
          >
            Edit
          </button>
          <button
            onClick={() => handleDeleteSubscription(row._id)}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-xs"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Subscriptions</h1>
      <Card>
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={handleAddSubscription}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Add Subscription
          </button>
          <div className="flex space-x-2">
            <Input
              id="search"
              type="text"
              placeholder="Search by service name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Select
              id="filterCategory"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              options={[
                { value: "", label: "All Categories" },
                ...categories.map((cat) => ({
                  value: cat.id,
                  label: cat.name,
                })),
              ]}
            />
            <Select
              id="filterBillingCycle"
              value={filterBillingCycle}
              onChange={(e) => setFilterBillingCycle(e.target.value)}
              options={[
                { value: "", label: "All Cycles" },
                ...billingCycleOptions,
              ]}
            />
            <Select
              id="sortBy"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              options={[
                { value: "start_date", label: "Sort by Start Date" },
                { value: "cost", label: "Sort by Cost" },
                { value: "annualized_cost", label: "Sort by Annualized Cost" },
              ]}
            />
          </div>
        </div>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {success && (
          <p className="text-green-500 text-center mb-4">{success}</p>
        )}
        {isLoading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-gray-600">Loading subscriptions...</p>
          </div>
        ) : (
          <Table columns={columns} data={subscriptions} />
        )}
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentSubscription ? "Edit Subscription" : "Add Subscription"}
      >
        <form onSubmit={handleSubmit}>
          <Input
            label="Service Name"
            id="service_name"
            type="text"
            value={formData.service_name}
            onChange={handleInputChange}
            required
          />
          <Input
            label="Cost"
            id="cost"
            type="number"
            value={formData.cost}
            onChange={handleInputChange}
            required
          />
          <Select
            label="Billing Cycle"
            id="billing_cycle"
            value={formData.billing_cycle}
            onChange={handleInputChange}
            options={billingCycleOptions}
            required
          />
          <Select
            label="Category"
            id="category"
            value={formData.category}
            onChange={handleInputChange}
            options={categories.map((cat) => ({
              value: cat.id,
              label: cat.name,
            }))}
            required
          />
          <Input
            label="Auto Renews"
            id="auto_renews"
            type="checkbox"
            checked={formData.auto_renews}
            onChange={handleInputChange}
          />
          <Input
            label="Start Date"
            id="start_date"
            type="date"
            value={formData.start_date}
            onChange={handleInputChange}
            required
          />
          <p className="text-lg font-bold mt-4">
            Annualized Cost: ${annualizedCost.toFixed(2)}
          </p>
          <div className="flex justify-end space-x-2 mt-4">
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
      </Modal>
    </div>
  );
};

export default Subscriptions;
