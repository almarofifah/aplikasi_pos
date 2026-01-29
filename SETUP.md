# POS Sederhana - Setup Instructions

## 📋 Struktur Aplikasi

```
Home (/) → Login → Register → Kasir → Dashboard
         ↓
      Admin Products (Kelola Produk)
```

## 🚀 Cara Setup

### 1. Update Database Schema
```bash
npx prisma db push
```

### 2. Seed Sample Data (Nasi Goreng & Produk Lain)
```bash
npm run seed
```

### 3. Jalankan Development Server
```bash
npm run dev
```

### 4. Akses Aplikasi
- **Home**: `http://localhost:3000` → Redirect ke Login
- **Login**: `http://localhost:3000/login` (belum ada akun)
- **Register**: `http://localhost:3000/register` (daftar akun baru)
- **Kasir**: `http://localhost:3000/kasir` (setelah login)
- **Admin Products**: `http://localhost:3000/admin/products` (kelola produk)
- **Dashboard**: `http://localhost:3000/dashboard` (statistik)

## 📦 Fitur yang Sudah Ada

✅ **Struktur Folder CRUD Admin**
- Dashboard layout dengan sidebar
- Product management (Create, Read, Update, Delete)
- Komponen terpisah (ProductForm, ProductCard)

✅ **Kasir Dashboard**
- Grid layout produk dengan kategori filter
- Shopping cart dengan quantity controls
- Order list sidebar
- Customer name input

✅ **Authentication Flow**
- Login page
- Register page
- Middleware untuk protect routes
- Token-based auth (cookie)

✅ **Sample Data**
- 9 produk dengan gambar:
  - Nasi Goreng
  - Gado-gado
  - Soto Ayam
  - Es Jeruk
  - Es Cendol
  - Kopi Hitam
  - Pudding Cokelat
  - Tiramisu
  - Brownies

## 🔧 File yang Dibuat/Update

### Created:
- `middleware.ts` - Route protection
- `app/dashboard/layout.tsx` - Dashboard layout
- `app/dashboard/page.tsx` - Dashboard home
- `app/kasir/layout.tsx` - Kasir layout
- `prisma/seed.ts` - Sample data seeder

### Updated:
- `app/page.tsx` - Redirect ke login
- `package.json` - Add seed commands
- `prisma/schema.prisma` - Add seed generator

## 🔐 Workflow Login/Register/Kasir

1. User masuk ke `http://localhost:3000`
2. Redirect ke `/login`
3. Jika belum punya akun, klik "Register" → `/register`
4. Isi form daftar dan submit
5. Redirect ke `/login`, login dengan akun yang baru dibuat
6. Setelah login → redirect ke `/kasir`
7. Cookie token tersimpan, akses protected
8. Bisa akses sidebar menu: Kasir, Dashboard, Admin Products
9. Logout akan clear cookie dan redirect ke login

## 📝 Next Steps

- [ ] Lengkapi implementasi Login API
- [ ] Lengkapi implementasi Register API
- [ ] Update Kasir untuk submit order ke database
- [ ] Buat halaman order history
- [ ] Export/Print invoice functionality
