"use client";

import { useEffect, useState } from "react";

type Product = {
  id: number;
  name: string;
  price: number;
  stock: number;
};

export default function KasirPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<Record<number, number>>({});

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => setProducts(data));
  }, []);

  const addItem = (id: number) => {
    setCart((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));
  };

  const removeItem = (id: number) => {
    setCart((prev) => {
      if (!prev[id]) return prev;
      return { ...prev, [id]: prev[id] - 1 };
    });
  };

  const total = products.reduce((sum, p) => {
    return sum + (cart[p.id] || 0) * p.price;
  }, 0);

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow p-6">
        <h1 className="text-2xl font-bold mb-6">Kasir</h1>

        <table className="w-full border">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-2 text-left">Produk</th>
              <th className="p-2">Harga</th>
              <th className="p-2">Qty</th>
              <th className="p-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="p-2">{p.name}</td>
                <td className="p-2 text-center">
                  Rp {p.price.toLocaleString("id-ID")}
                </td>
                <td className="p-2 text-center">{cart[p.id] || 0}</td>
                <td className="p-2 text-center space-x-2">
                  <button
                    onClick={() => addItem(p.id)}
                    className="px-2 py-1 bg-blue-600 text-white rounded"
                  >
                    +
                  </button>
                  <button
                    onClick={() => removeItem(p.id)}
                    className="px-2 py-1 bg-red-500 text-white rounded"
                  >
                    -
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-6 text-right">
          <p className="text-lg font-semibold">
            Total: Rp {total.toLocaleString("id-ID")}
          </p>
        </div>
      </div>
    </main>
  );
}
