"use client";

import React, { useEffect, useState } from "react";
import { Plus, Minus, Trash2, Search, UtensilsCrossed, Coffee, IceCream } from "lucide-react";

type Product = {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  category: string;
  imageUrl?: string;
};

type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string | null;
};

const CATEGORIES = ["All Menu", "FOOD", "BEVERAGE", "DESSERT"];
const CATEGORY_LABELS: Record<string, string> = {
  "All Menu": "All Menu",
  FOOD: "Foods",
  BEVERAGE: "Beverages",
  DESSERT: "Dessert",
};

export default function KasirPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All Menu");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [diningMode, setDiningMode] = useState<'DINE_IN'|'TAKE_AWAY'>('DINE_IN');
  const [tableNo, setTableNo] = useState("");
  const [orderNotes, setOrderNotes] = useState("");

  // derive filteredProducts via memo
  const filteredProducts = React.useMemo(() => {
    let items = products;
    if (selectedCategory !== "All Menu") items = items.filter((p) => p.category === selectedCategory);
    if (search.trim()) {
      const s = search.toLowerCase();
      items = items.filter((p) => p.name.toLowerCase().includes(s));
    }
    return items;
  }, [products, selectedCategory, search]);

  // Payment modal + confirmation states
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'CASH'|'CARD'|'EWALLET'>('CASH');
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const [lastQueue, setLastQueue] = useState<number>(() => {
    try { return parseInt(localStorage.getItem('lastQueue') || '0', 10) || 0 } catch { return 0 }
  });

  type LocalOrder = {
    id?: string;
    queue?: number;
    items?: CartItem[];
    subtotal?: number;
    tax?: number;
    packaging?: number;
    total?: number;
    customerName?: string;
    createdAt?: string;
    paymentMethod?: string;
    orderNotes?: string;
  };

  const [orders, setOrders] = useState<LocalOrder[]>(() => {
    try { const s = JSON.parse(localStorage.getItem('orders') || '[]'); return Array.isArray(s) ? s : [] } catch { return [] }
  });
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptOrder, setReceiptOrder] = useState<LocalOrder | null>(null);

  // Financials
  const TAX_RATE = 0.1; // 10% tax
  const PACKAGING_FEE = 2000; // flat packaging fee in IDR

  // local initializers already loaded queue/orders synchronously; no extra effect needed

  const handleProfileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const result = reader.result as string;
      setProfileImage(result);

      // persist to server
      try {
        await fetch('/api/users/me', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profileImage: result }),
        });
      } catch (err) {
        console.error('Failed to save profile image:', err);
      }
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
      });

    // fetch current user profile image
    (async () => {
      try {
        const res = await fetch('/api/users/me');
        if (!res.ok) return;
        const body = await res.json();
        const img = body?.user?.profileImage;
        if (img) setProfileImage(img);
      } catch (err) {
        console.error('Failed to fetch user profile', err);
      }
    })();
  }, []);

  // filteredProducts derived using useMemo (no setState in effects)

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existingItem = prev.find((item) => item.id === product.id);
      if (existingItem) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          imageUrl: product.imageUrl || null,
        },
      ];
    });
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
    } else {
      setCart((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, quantity } : item
        )
      );
    }
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Order breakdown
  const tax = Math.round(total * TAX_RATE);
  const packaging = PACKAGING_FEE;
  const grandTotal = total + tax + packaging;



  // Open payment modal (do validation first)
  const initiatePayment = () => {
    if (cart.length === 0) return;
    if (diningMode === 'DINE_IN' && tableNo === '') {
      alert('Please select a table number before paying.');
      return;
    }
    setShowPayment(true);
  };

  // Confirm payment and create order (send to server)
  const confirmPayment = async () => {
    try {
      const itemsPayload = cart.map((c) => ({ productId: c.id, quantity: c.quantity, price: c.price }));
      const payload = {
        items: itemsPayload,
        total: total,
        customerName: customerName || 'Guest',
        paymentMethod,
        orderNotes,
        diningMode,
        tableNo,
      };

      console.log('Posting order to /api/orders', payload);

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        console.error('Order creation failed', data);
        alert(data.error || 'Failed to create order');
        setShowPayment(false);
        return;
      }

      const created = data.order;
      console.log('Order created on server:', created);

      // keep a local copy as well for quick access
      const nextQueue = lastQueue + 1;
      const orderForReceipt = {
        id: created.id,
        queue: nextQueue,
        customerName: created.user?.username || customerName || 'Guest',
        items: cart,
        subtotal: total,
        tax,
        packaging,
        total: created.total || grandTotal,
        paymentMethod,
        orderNotes,
        createdAt: created.createdAt || new Date().toISOString(),
        profileImage,
      };

      const newOrders = [orderForReceipt, ...orders];
      setOrders(newOrders);
      localStorage.setItem('orders', JSON.stringify(newOrders));
      setLastQueue(nextQueue);
      localStorage.setItem('lastQueue', String(nextQueue));

      // Show receipt
      setReceiptOrder(orderForReceipt);
      setShowReceipt(true);

      // Close payment modal and clear
      setShowPayment(false);
      setCart([]);
      setCustomerName('');
      setTableNo('');
      setOrderNotes('');
    } catch (err) {
      console.error('Error confirming payment', err);
      alert('Failed to create order');
      setShowPayment(false);
    }
  };

  const printReceipt = (order: { id?: string; queue?: number; customerName?: string; items?: CartItem[]; total?: number }) => {
    const w = window.open('', '_blank', 'width=400,height=600');
    if (!w) return;

    const itemsHtml = (order.items || []).map((it) => `<div class="item"><span>${it.name} x ${it.quantity}</span><span>Rp ${ (it.price*it.quantity).toLocaleString('id-ID') }</span></div>`).join('');

    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Receipt</title><style>body{font-family: system-ui, sans-serif;padding:20px} .logo{width:50px;height:50px;border-radius:50%;background:#2563eb;color:white;display:flex;align-items:center;justify-content:center;font-weight:bold;margin-bottom:12px} .items{margin-top:10px} .item{display:flex;justify-content:space-between;margin-bottom:6px}</style></head><body>
      <div class="logo">P</div>
      <h3>Order Receipt</h3>
      <p>Order ID: ${order.id || ''}</p>
      <p>Queue: ${order.queue || ''}</p>
      <p>Customer: ${order.customerName || ''}</p>
      <div class="items">${itemsHtml}</div>
      <hr/>
      <h4>Total: Rp ${((order.total || 0)).toLocaleString('id-ID')}</h4>
      </body></html>`;
    w.document.open();
    w.document.write(html);
    w.document.close();
    w.focus();
    w.print();
    // w.close(); // leave open so user can see
  };
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="flex gap-6 p-6">
        {/* Main Content */}
        <div className="flex-1">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-gray-600">Manage customer orders</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                {profileImage ? (
                  <img src={profileImage} alt="profile" className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">JD</div>
                )}
                <input id="profile-upload" type="file" accept="image/*" onChange={handleProfileUpload} className="hidden" />
                <label htmlFor="profile-upload" className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow cursor-pointer text-xs">+</label>
              </div>

              <div className="text-right">
                <p className="text-sm text-gray-900 text-left font-semibold">John</p>
                <p className="text-xs text-gray-500">Cashier</p>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="mb-4">
            <div className="relative group">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-blue-600 transition-colors">
                <Search size={18} />
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search menu..."
                className="w-full h-12 pl-11 pr-4 border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-600 outline-none transition duration-150 ease-in-out group-hover:shadow-md group-hover:border-blue-300"
              />
            </div>
          </div> 

          {/* Category Tabs */} 
          <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
            {CATEGORIES.map((cat) => {
              const Icon = cat === 'FOOD' ? UtensilsCrossed : cat === 'BEVERAGE' ? Coffee : cat === 'DESSERT' ? IceCream : null;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  aria-label={CATEGORY_LABELS[cat]}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition whitespace-nowrap ${
                    selectedCategory === cat
                      ? "bg-blue-600 text-white shadow-lg"
                      : "bg-white text-gray-700 border border-gray-300 hover:border-blue-400"
                  }`}
                >
                  {Icon && <Icon size={16} aria-hidden="true" />}
                  <span>{CATEGORY_LABELS[cat]}</span>
                </button>
              );
            })}
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden flex flex-col"
              >
                {/* Image */}
                {product.imageUrl ? (
                  <div className="relative w-full h-32 bg-gray-200 overflow-hidden">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.src =
                          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Crect fill='%23e5e7eb' width='200' height='200'/%3E%3C/svg%3E";
                      }}
                    />
                    <div className="absolute top-1 right-1 bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                      {CATEGORY_LABELS[product.category]}
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-32 bg-gray-200 flex items-center justify-center relative">
                    <span className="text-gray-400 text-xs">No Image</span>
                    <div className="absolute top-1 right-1 bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                      {CATEGORY_LABELS[product.category]}
                    </div>
                  </div>
                )}

                {/* Content */}
                <div className="p-3 flex flex-col grow">
                  <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-1">
                    {product.name}
                  </h3>
                  {product.description && (
                    <p className="text-xs text-gray-600 line-clamp-1 mb-2">
                      {product.description}
                    </p>
                  )}
                  <div className="mt-auto">
                    <p className="text-blue-600 font-bold mb-2">
                      Rp {product.price.toLocaleString("id-ID")}
                    </p>
                    <button
                      onClick={() => addToCart(product)}
                      disabled={product.stock === 0}
                      className="w-full py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      {product.stock === 0 ? "Out of stock" : "Add"}
                    </button>
                  </div> 
                </div>
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Tidak ada produk di kategori ini</p>
            </div>
          )}
        </div>

        {/* Sidebar - Order List */}
        <div className="w-100 bg-white rounded-lg shadow-lg p-6 sticky top-6 bottom-6 border-2 border-purple-200 flex flex-col">
          {/* Scrollable content area */}
          <div className="flex-1 min-h-0">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Order List</h2>

            <div className="flex gap-3 mb-4">
              <button
                onClick={() => setDiningMode('DINE_IN')}
                className={`flex-1 px-4 py-3 rounded-full font-medium ${diningMode === 'DINE_IN' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-400'}`}>
                Dine In
              </button>
              <button
                onClick={() => { setDiningMode('TAKE_AWAY'); setTableNo(''); }}
                className={`flex-1 px-4 py-3 rounded-full font-medium ${diningMode === 'TAKE_AWAY' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-400'}`}>
                Take Away
              </button>
            </div>

            <div className="mb-4 grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Customer Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter customer name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              {/* Show table selector only for Dine In */}
              {diningMode === 'DINE_IN' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Table No.</label>
                  <select value={tableNo} onChange={(e) => setTableNo(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    <option value="">Select Table</option>
                    {Array.from({ length: 10 }).map((_, i) => (
                      <option key={i} value={`${i + 1}`}>{i + 1}</option>
                    ))}
                  </select>
                </div>
              ) : null}
            </div>

            {/* Order Notes */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Order Notes</label>
              <textarea value={orderNotes} onChange={(e)=>setOrderNotes(e.target.value)} placeholder="Special instructions (e.g., no chilli, extra sauce)" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm h-20 resize-none" />
            </div>

            <div className="mb-6 overflow-y-auto px-1 pb-24">
              {cart.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">No orders selected</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div key={item.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200 hover:shadow-md transition flex flex-col">
                      <div className="flex items-start gap-3 mb-3">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.name} className="w-12 h-12 rounded object-cover" />
                        ) : (
                          <div className="w-12 h-12 rounded bg-gray-100 flex items-center justify-center text-gray-400">No</div>
                        )}

                        <div className="flex-1">
                          <p className="font-medium text-gray-900 text-sm">{item.name}</p>
                          <p className="text-blue-600 font-semibold text-sm">Rp {item.price.toLocaleString("id-ID")}</p>
                        </div>

                        <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700 transition" title="Remove from order">
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div className="flex items-center gap-2 mt-auto">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition"><Minus size={14} /></button>
                        <input type="number" value={item.quantity} onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)} className="w-12 px-2 py-1 border border-gray-300 rounded text-center text-sm" min="1" />
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition"><Plus size={14} /></button>
                        <span className="ml-auto text-sm font-semibold text-gray-900">Rp {(item.price * item.quantity).toLocaleString("id-ID")}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer - sticky at bottom */}
          <div className="sticky bottom-0 z-10 bg-white border-t border-gray-200 pt-4 -mx-6 px-6 py-3 rounded-b-lg shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <p className="text-gray-600">Subtotal:</p>
              <p className="font-semibold text-gray-900">Rp {total.toLocaleString("id-ID")}</p>
            </div>

            <div className="space-y-3">
              <button
                onClick={initiatePayment}
                disabled={cart.length === 0 || (diningMode === 'DINE_IN' && tableNo === '')}
                title={diningMode === 'DINE_IN' && tableNo === '' ? 'Select table number to enable Pay' : ''}
                className="w-full py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition disabled:opacity-50"
              >
                Pay
              </button>

              {diningMode === 'DINE_IN' && tableNo === '' && cart.length > 0 && (
                <p className="text-xs text-red-600 mt-1">Please select a table number to enable Pay.</p>
              )}

              
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPayment && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white w-96 p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-3">Payment</h3>

            <div className="space-y-2 mb-3">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>Rp {total.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax ({(TAX_RATE*100).toFixed(0)}%)</span>
                <span>Rp {tax.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Packaging</span>
                <span>Rp {packaging.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>Rp {grandTotal.toLocaleString('id-ID')}</span>
              </div>
            </div>

            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
              <select value={paymentMethod} onChange={(e)=>setPaymentMethod(e.target.value as 'CASH'|'CARD'|'EWALLET')} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                <option value="CASH">Cash</option>
                <option value="CARD">Card</option>
                <option value="EWALLET">E-wallet</option>
              </select>
            </div>

            {orderNotes && (
              <div className="mb-3 text-sm text-gray-600">Notes: {orderNotes}</div>
            )}

            <div className="flex gap-3 mt-4">
              <button onClick={confirmPayment} className="flex-1 py-2 bg-blue-600 text-white rounded">Confirm Payment</button>
              <button onClick={()=>setShowPayment(false)} className="flex-1 py-2 bg-gray-200 rounded">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel confirmation modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white w-80 p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-3">Cancel Order</h3>
            <p className="text-sm text-gray-600 mb-4">Are you sure you want to cancel the current order? This will clear the current cart.</p>
            <div className="flex gap-3">
              <button onClick={() => { setCart([]); setShowCancelConfirm(false); }} className="flex-1 py-2 bg-red-600 text-white rounded">Yes, Cancel</button>
              <button onClick={() => setShowCancelConfirm(false)} className="flex-1 py-2 bg-gray-200 rounded">No</button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceipt && receiptOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white w-80 p-6 rounded-lg shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">P</div>
              <div>
                <p className="text-sm text-gray-500">Queue #{receiptOrder.queue}</p>
                <p className="text-lg font-semibold">Order Receipt</p>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-2">Order ID: {receiptOrder.id}</p>
                  <p className="text-sm text-gray-600 mb-4">Customer: {receiptOrder.customerName || 'Guest'}</p>

            <div className="space-y-2 mb-4">
              {(receiptOrder.items || []).map((it) => (
                <div key={it.id} className="flex justify-between text-sm">
                  <div className="flex items-center gap-2">
                    {it.imageUrl ? <img src={it.imageUrl} alt={it.name} className="w-8 h-8 rounded object-cover"/> : <div className="w-8 h-8 bg-gray-100 rounded"/>}
                    <div>
                      <div className="font-medium">{it.name}</div>
                      <div className="text-xs text-gray-500">x{it.quantity}</div>
                    </div>
                  </div>
                  <div className="font-medium">Rp {(it.price * it.quantity).toLocaleString('id-ID')}</div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-3">
              <div className="flex justify-between mb-1">
                <div className="text-sm text-gray-600">Subtotal</div>
                <div className="font-semibold">Rp {(receiptOrder.total || 0).toLocaleString('id-ID')}</div>
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button onClick={() => { printReceipt(receiptOrder); }} className="flex-1 py-2 bg-blue-600 text-white rounded">Print</button>
              <button onClick={() => { setShowReceipt(false); setReceiptOrder(null); }} className="flex-1 py-2 bg-gray-200 rounded">Close</button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}
