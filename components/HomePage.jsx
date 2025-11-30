"use client";
import React from "react";
import { ArrowRight, Search } from "lucide-react";

const HomePage = () => {
  return (
    <div className="w-full min-h-screen bg-gray-50 text-gray-800">

      {/* ===== HEADER / NAVBAR ===== */}
      {/* <header className="fixed top-0 left-0 w-full bg-white shadow z-50">
        <div className="container mx-auto flex justify-between items-center py-4 px-6">
          <h1 className="text-2xl font-semibold text-blue-600">RealEstateCo</h1>
          <nav className="hidden md:flex space-x-6">
            {["Home", "Properties", "Services", "Projects", "Blog", "About", "Contact"].map((item) => (
              <a key={item} href="#" className="hover:text-blue-600 transition">
                {item}
              </a>
            ))}
          </nav>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm hover:bg-blue-700">
            List Your Property
          </button>
        </div>
      </header> */}

      {/* ===== HERO SECTION ===== */}
      <section className="pt-28 pb-20 bg-[url('/hero.jpg')] bg-cover bg-center relative">
        <div className="absolute inset-0 bg-black bg-opacity-50" />
        <div className="relative container mx-auto text-center text-white px-6">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Find Your Dream Home</h2>
          <p className="text-lg mb-8">
            Explore properties for sale, rent, or investment across Nigeria.
          </p>

          {/* Search Bar */}
          <div className="bg-white rounded-full flex flex-col md:flex-row md:items-center md:space-x-2 max-w-3xl mx-auto p-2">
            <input
              type="text"
              placeholder="Enter location..."
              className="flex-1 p-3 rounded-full outline-none text-gray-700"
            />
            <button className="bg-blue-600 text-white px-6 py-3 rounded-full flex items-center justify-center hover:bg-blue-700">
              <Search className="w-5 h-5 mr-2" /> Search
            </button>
          </div>
        </div>
      </section>

      {/* ===== FEATURED PROPERTIES ===== */}
      <section className="py-16 container mx-auto px-6">
        <h3 className="text-2xl font-semibold mb-8 text-center">Featured Properties</h3>
        <div className="grid md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl shadow hover:shadow-lg transition p-4">
              <div className="h-48 bg-gray-200 rounded-xl mb-4" />
              <h4 className="font-semibold text-lg mb-2">Luxury Apartment {i}</h4>
              <p className="text-sm text-gray-600">Lekki, Lagos</p>
              <p className="mt-2 text-blue-600 font-medium">₦{(80 + i) * 1_000_000}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== ABOUT THE COMPANY ===== */}
      <section className="py-16 bg-gray-100 px-6">
        <div className="container mx-auto text-center md:text-left md:flex md:items-center md:space-x-12">
          <div className="md:w-1/2">
            <h3 className="text-2xl font-semibold mb-4">About Our Company</h3>
            <p className="text-gray-700 leading-relaxed">
              RealEstateCo is a trusted property development and brokerage firm
              offering premium sales, rentals, and management services across
              Nigeria. We combine technology with expertise to simplify your real estate journey.
            </p>
            <button className="mt-6 bg-blue-600 text-white px-5 py-2 rounded-full hover:bg-blue-700">
              Learn More
            </button>
          </div>
          <div className="md:w-1/2 mt-8 md:mt-0">
            <div className="h-64 bg-gray-300 rounded-2xl" />
          </div>
        </div>
      </section>

      {/* ===== OUR SERVICES ===== */}
      <section className="py-16 container mx-auto px-6">
        <h3 className="text-2xl font-semibold mb-8 text-center">Our Services</h3>
        <div className="grid md:grid-cols-3 gap-6">
          {["Property Sales", "Rentals & Leasing", "Property Management"].map((service) => (
            <div key={service} className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition">
              <h4 className="font-semibold text-lg mb-2 text-blue-600">{service}</h4>
              <p className="text-gray-600">
                We provide expert services for {service.toLowerCase()} with a focus on transparency and trust.
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== FEATURED PROJECTS ===== */}
      <section className="py-16 bg-gray-100 px-6">
        <div className="container mx-auto text-center">
          <h3 className="text-2xl font-semibold mb-8">Featured Projects</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl shadow hover:shadow-lg transition p-4">
                <div className="h-48 bg-gray-200 rounded-xl mb-4" />
                <h4 className="font-semibold text-lg mb-2">Green Estate {i}</h4>
                <p className="text-sm text-gray-600">Abuja, Nigeria</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== WHY CHOOSE US ===== */}
      <section className="py-16 container mx-auto px-6">
        <h3 className="text-2xl font-semibold mb-8 text-center">Why Choose Us</h3>
        <div className="grid md:grid-cols-4 gap-6 text-center">
          {["Trusted Experts", "Prime Locations", "Transparent Deals", "24/7 Support"].map((item) => (
            <div key={item} className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition">
              <h4 className="font-semibold text-lg mb-2 text-blue-600">{item}</h4>
              <p className="text-gray-600">Experience unmatched quality and professionalism with every transaction.</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="py-16 bg-gray-100 px-6 text-center">
        <h3 className="text-2xl font-semibold mb-8">What Our Clients Say</h3>
        <div className="grid md:grid-cols-3 gap-6 container mx-auto">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow hover:shadow-lg transition">
              <p className="italic text-gray-600 mb-4">
                “The process was smooth and professional. Highly recommend RealEstateCo!”
              </p>
              <h4 className="font-semibold">Client {i}</h4>
            </div>
          ))}
        </div>
      </section>

      {/* ===== BLOG HIGHLIGHTS ===== */}
      <section className="py-16 container mx-auto px-6">
        <h3 className="text-2xl font-semibold mb-8 text-center">Latest Blog Posts</h3>
        <div className="grid md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl shadow hover:shadow-lg transition p-4">
              <div className="h-48 bg-gray-200 rounded-xl mb-4" />
              <h4 className="font-semibold text-lg mb-2">Real Estate Tips {i}</h4>
              <p className="text-gray-600 text-sm mb-4">Learn how to make smart property investments in Nigeria.</p>
              <button className="text-blue-600 font-semibold flex items-center">
                Read More <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ===== CONTACT / CTA ===== */}
      <section className="py-20 bg-blue-600 text-white text-center px-6">
        <h3 className="text-3xl font-semibold mb-4">Ready to Find Your Dream Property?</h3>
        <p className="mb-6">Get in touch with our expert agents today.</p>
        <button className="bg-white text-blue-600 px-6 py-3 rounded-full font-semibold hover:bg-gray-100">
          Contact Us
        </button>
      </section>

      {/* ===== NEWSLETTER ===== */}
      <section className="py-16 bg-gray-100 px-6 text-center">
        <h3 className="text-2xl font-semibold mb-4">Subscribe to Our Newsletter</h3>
        <p className="text-gray-600 mb-6">
          Stay updated with the latest property listings and real estate trends.
        </p>
        <div className="flex justify-center max-w-md mx-auto">
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full p-3 rounded-l-full outline-none"
          />
          <button className="bg-blue-600 text-white px-6 rounded-r-full hover:bg-blue-700">
            Subscribe
          </button>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="bg-gray-900 text-gray-400 py-10 px-6">
        <div className="container mx-auto grid md:grid-cols-4 gap-8">
          <div>
            <h4 className="text-white text-lg font-semibold mb-3">RealEstateCo</h4>
            <p>Leading property experts helping Nigerians find, buy, and invest confidently.</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Quick Links</h4>
            <ul className="space-y-2">
              {["Home", "About", "Services", "Blog", "Contact"].map((link) => (
                <li key={link}>
                  <a href="#" className="hover:text-white transition">{link}</a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Contact</h4>
            <p>Lagos, Nigeria</p>
            <p>+234 800 000 0000</p>
            <p>info@realestateco.ng</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Follow Us</h4>
            <p>Instagram | Facebook | LinkedIn</p>
          </div>
        </div>
        <div className="text-center text-sm mt-8 text-gray-500">
          © {new Date().getFullYear()} RealEstateCo. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
