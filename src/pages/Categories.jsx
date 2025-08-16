import React, { useState, useEffect } from "react";
import api from "../lib/api";
import Card from "../components/Card";
import Modal from "../components/Modal";
import Input from "../components/Input";
import Table from "../components/Table";
import useAuthGuard from "../hooks/useAuthGuard";

const Categories = () => {
  useAuthGuard();
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [categoryName, setCategoryName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get("/categories");
      setCategories(response.data);
    } catch (err) {
      setError("Failed to fetch categories.");
    }
  };

  const handleAddCategory = () => {
    setCurrentCategory(null);
    setCategoryName("");
    setError("");
    setSuccess("");
    setIsModalOpen(true);
  };

  const handleEditCategory = (category) => {
    setCurrentCategory(category);
    setCategoryName(category.name);
    setError("");
    setSuccess("");
    setIsModalOpen(true);
  };

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await api.delete(`/categories/${categoryId}`);
        setSuccess("Category deleted successfully!");
        fetchCategories();
      } catch (err) {
        setError(err.response?.data?.message || "Failed to delete category.");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      if (currentCategory) {
        await api.put(`/categories/${currentCategory._id}`, {
          name: categoryName,
        });
        setSuccess("Category updated successfully!");
      } else {
        await api.post("/categories", { name: categoryName });
        setSuccess("Category added successfully!");
      }
      fetchCategories();
      setIsModalOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save category.");
    }
  };

  const columns = [
    { header: "Name", accessor: "name" },
    {
      header: "Actions",
      render: (row) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleEditCategory(row)}
            className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-3 rounded text-xs"
          >
            Edit
          </button>
          <button
            onClick={() => handleDeleteCategory(row._id)}
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
      <h1 className="text-2xl font-bold mb-4">Categories</h1>
      <Card>
        <div className="flex justify-end mb-4">
          <button
            onClick={handleAddCategory}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Add Category
          </button>
        </div>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {success && (
          <p className="text-green-500 text-center mb-4">{success}</p>
        )}
        <Table columns={columns} data={categories} />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentCategory ? "Edit Category" : "Add Category"}
      >
        <form onSubmit={handleSubmit}>
          <Input
            label="Category Name"
            id="categoryName"
            type="text"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            required
          />
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

export default Categories;
