"use client";

import { useState } from "react";

interface ProductFormProps {
  onSubmit: (data: ProductFormData) => Promise<void>;
  onClose: () => void;
  initialData?: ProductFormData;
  isEditing?: boolean;
}

export interface ProductFormData {
  name: string;
  description: string;
  price: string;
  stock: string;
  category: "FOOD" | "BEVERAGE" | "DESSERT";
  imageUrl: string;
}

export default function ProductForm({
  onSubmit,
  onClose,
  initialData,
  isEditing = false,
}: ProductFormProps) {
  const [formData, setFormData] = useState<ProductFormData>(
    initialData || {
      name: "",
      description: "",
      price: "",
      stock: "",
      category: "FOOD",
      imageUrl: "",
    }
  );

  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSubmit(formData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex justify-between items-center p-6 border-b bg-white">
          <h2 className="text-xl font-bold text-gray-900">
            {isEditing ? "Edit Produk" : "Tambah Produk Baru"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition text-2xl font-light"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Nama Produk */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nama Produk <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="Contoh: Gado-gado Special"
            />
          </div>

          {/* Deskripsi */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Deskripsi
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
              rows={3}
              placeholder="Deskripsi produk..."
            />
          </div>

          {/* Kategori */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Kategori <span className="text-red-500">*</span>
            </label>
            <select
              name="category"
              required
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            >
              <option value="FOOD">Makanan</option>
              <option value="BEVERAGE">Minuman</option>
              <option value="DESSERT">Dessert</option>
            </select>
          </div>

          {/* Harga */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Harga (Rp) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="price"
              required
              value={formData.price}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="20000"
              min="0"
            />
          </div>

          {/* Stok */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Stok <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="stock"
              required
              value={formData.stock}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="50"
              min="0"
            />
          </div>

          {/* URL Gambar */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              URL Gambar
            </label>
            <input
              type="url"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="https://..."
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-semibold"
              disabled={loading}
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Menyimpan..." : isEditing ? "Update" : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
