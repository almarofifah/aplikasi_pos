"use client";

import { useEffect, useState } from "react";
import { Plus, AlertCircle } from "lucide-react";
import ProductForm, { ProductFormData } from "../components/ProductForm";
import ProductCard from "../components/ProductCard";

type Product = {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  category: string;
  imageUrl?: string;
  isActive: boolean;
};

export default function ProductsAdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/products");

      if (!res.ok) {
        throw new Error("Gagal mengambil data produk");
      }

      const data = await res.json();
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData: ProductFormData) => {
    try {
      const payload = {
        name: formData.name,
        description: formData.description || null,
        price: parseInt(formData.price),
        stock: parseInt(formData.stock),
        category: formData.category,
        imageUrl: formData.imageUrl || null,
      };

      if (editingId) {
        const res = await fetch(`/api/products/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          throw new Error("Gagal mengupdate produk");
        }

        alert("✓ Produk berhasil diupdate!");
      } else {
        const res = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          throw new Error("Gagal menambahkan produk");
        }

        alert("✓ Produk berhasil ditambahkan!");
      }

      handleCloseForm();
      fetchProducts();
    } catch (err) {
      alert(`❌ ${err instanceof Error ? err.message : "Terjadi kesalahan"}`);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    const product = products.find((p) => p.id === id);

    if (
      !confirm(
        `Yakin ingin menghapus "${product?.name}"? Tindakan ini tidak dapat dibatalkan.`
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Gagal menghapus produk");
      }

      alert("✓ Produk berhasil dihapus!");
      fetchProducts();
    } catch (err) {
      alert(`❌ ${err instanceof Error ? err.message : "Terjadi kesalahan"}`);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingId(null);
  };

  const editingProduct = editingId
    ? products.find((p) => p.id === editingId)
    : undefined;

  const initialFormData = editingProduct
    ? {
        name: editingProduct.name,
        description: editingProduct.description || "",
        price: editingProduct.price.toString(),
        stock: editingProduct.stock.toString(),
        category: editingProduct.category as "FOOD" | "BEVERAGE" | "DESSERT",
        imageUrl: editingProduct.imageUrl || "",
      }
    : undefined;

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Kelola Produk
              </h1>
              <p className="text-gray-600">
                Manage menu & produk restoran Anda dengan mudah
              </p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold shadow-lg hover:shadow-xl"
            >
              <Plus size={20} />
              Tambah Produk
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3 text-red-800">
            <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Terjadi kesalahan</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600 font-medium">Memuat produk...</p>
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <p className="text-gray-600 mb-4">Belum ada produk</p>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                <Plus size={18} />
                Buat Produk Pertama
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <ProductForm
          onSubmit={handleSubmit}
          onClose={handleCloseForm}
          initialData={initialFormData}
          isEditing={!!editingId}
        />
      )}
    </main>
  );
}

