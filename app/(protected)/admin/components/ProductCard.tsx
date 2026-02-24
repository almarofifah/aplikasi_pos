"use client";

import { Pencil, Trash2 } from "lucide-react";
import { Product } from "@prisma/client";

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  FOOD: "Makanan",
  BEVERAGE: "Minuman",
  DESSERT: "Dessert",
};

export default function ProductCard({
  product,
  onEdit,
  onDelete,
}: ProductCardProps) {
  const categoryLabel = CATEGORY_LABELS[product.category] || product.category;
  const isLowStock = product.stock < 5;

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden flex flex-col h-full">
      {/* Product Image */}
      {product.imageUrl ? (
        <div className="relative w-full h-48 bg-gray-200 overflow-hidden">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.currentTarget.src =
                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect fill='%23e5e7eb' width='400' height='300'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='24' fill='%239ca3af'%3ENo Image%3C/text%3E%3C/svg%3E";
            }}
          />
          <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs font-medium px-3 py-1 rounded-full">
            {categoryLabel}
          </div>
        </div>
      ) : (
        <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
          <span className="text-gray-400 text-sm">No Image</span>
        </div>
      )}

      {/* Product Info */}
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
          {product.name}
        </h3>

        {product.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {product.description}
          </p>
        )}

        {/* Price & Stock */}
        <div className="grid grid-cols-2 gap-3 mb-4 mt-auto">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-600 font-medium">Harga</p>
            <p className="text-lg font-bold text-gray-900">
              Rp {product.price.toLocaleString("id-ID")}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-600 font-medium">Stok</p>
            <p
              className={`text-lg font-bold ${
                isLowStock ? "text-red-600" : "text-green-600"
              }`}
            >
              {product.stock}
            </p>
            {isLowStock && (
              <p className="text-xs text-red-600 mt-1">Stok Terbatas</p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(product)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition font-medium text-sm"
            title="Edit produk"
          >
            <Pencil size={16} />
            Edit
          </button>
          <button
            onClick={() => onDelete(product.id)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition font-medium text-sm"
            title="Hapus produk"
          >
            <Trash2 size={16} />
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
}
