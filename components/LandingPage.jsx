// components/LandingPage.jsx
import React from "react";

const products = [
  { id: 1, name: "Product 1", price: 49.99, image: "/placeholder.png" },
  { id: 2, name: "Product 2", price: 59.99, image: "/placeholder.png" },
  { id: 3, name: "Product 3", price: 29.99, image: "/placeholder.png" },
  { id: 4, name: "Product 4", price: 19.99, image: "/placeholder.png" },
];

const categories = [
  { id: 1, name: "Electronics", image: "/category.png" },
  { id: 2, name: "Fashion", image: "/category.png" },
  { id: 3, name: "Home", image: "/category.png" },
  { id: 4, name: "Beauty", image: "/category.png" },
];

const testimonials = [
  { id: 1, name: "Jane Doe", text: "Amazing products and fast delivery!" },
  { id: 2, name: "John Smith", text: "High quality and excellent service." },
];

export default function LandingPage() {
  return (
    <div className="font-sans">
      {/* 1. Hero Section */}
      <section className="relative bg-gray-100 h-[500px] flex items-center justify-center text-center">
        <div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Shop the Best Products</h1>
          <p className="text-lg sm:text-xl mb-6">Quality you can trust, delivered fast.</p>
          <button className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition">
            Shop Now
          </button>
        </div>
      </section>

      {/* 2. Navigation Example (Sticky) */}
      <nav className="sticky top-0 bg-white shadow z-50 py-3 px-6 flex justify-between items-center">
        <div className="text-xl font-bold">MyStore</div>
        <ul className="flex space-x-4">
          <li className="hover:text-orange-500 cursor-pointer">Home</li>
          <li className="hover:text-orange-500 cursor-pointer">Products</li>
          <li className="hover:text-orange-500 cursor-pointer">Categories</li>
          <li className="hover:text-orange-500 cursor-pointer">Contact</li>
        </ul>
      </nav>

      {/* 3. Featured Products / Bestsellers */}
      <section className="py-12 px-6">
        <h2 className="text-2xl font-bold mb-6">Featured Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {products.map((p) => (
            <div key={p.id} className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition">
              <img src={p.image} alt={p.name} className="w-full h-48 object-cover rounded" />
              <h3 className="mt-3 font-semibold">{p.name}</h3>
              <p className="mt-1 text-orange-500 font-bold">${p.price}</p>
              <button className="mt-2 w-full py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition">
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Promotions / Offers */}
      <section className="py-12 px-6 bg-orange-50 text-center rounded-lg mx-6 my-6">
        <h2 className="text-2xl font-bold mb-2">Limited Time Offer!</h2>
        <p className="mb-4">Get 20% off on all products. Hurry up, offer ends soon!</p>
        <button className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition">
          Shop Now
        </button>
      </section>

      {/* 5. Categories Section */}
      <section className="py-12 px-6">
        <h2 className="text-2xl font-bold mb-6">Shop by Category</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <div key={cat.id} className="relative rounded-lg overflow-hidden hover:scale-105 transform transition">
              <img src={cat.image} alt={cat.name} className="w-full h-32 object-cover" />
              <div className="absolute inset-0 bg-black bg-opacity-25 flex items-center justify-center">
                <span className="text-white font-bold">{cat.name}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Social Proof / Testimonials */}
      <section className="py-12 px-6 bg-gray-100">
        <h2 className="text-2xl font-bold mb-6 text-center">What Our Customers Say</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {testimonials.map((t) => (
            <div key={t.id} className="bg-white p-6 rounded-lg shadow text-center">
              <p className="mb-4">"{t.text}"</p>
              <span className="font-semibold">{t.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 7. Newsletter Signup */}
      <section className="py-12 px-6 text-center">
        <h2 className="text-2xl font-bold mb-4">Subscribe for Updates</h2>
        <p className="mb-4">Get exclusive offers and the latest products in your inbox.</p>
        <form className="flex flex-col sm:flex-row justify-center gap-2 max-w-md mx-auto">
          <input
            type="email"
            placeholder="Enter your email"
            className="px-4 py-2 border rounded-lg w-full"
          />
          <button className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition">
            Subscribe
          </button>
        </form>
      </section>

      {/* 8. Footer */}
      <footer className="bg-gray-800 text-white py-6 px-6 mt-12">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between gap-4">
          <div>
            <h3 className="font-bold mb-2">MyStore</h3>
            <p>© 2025 MyStore. All rights reserved.</p>
          </div>
          <div className="flex flex-col md:flex-row gap-6">
            <a href="#" className="hover:text-orange-500">About</a>
            <a href="#" className="hover:text-orange-500">Contact</a>
            <a href="#" className="hover:text-orange-500">Privacy</a>
            <a href="#" className="hover:text-orange-500">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
