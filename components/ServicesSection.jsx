"use client";

import React from "react";
import {
  Home,
  FileText,
  Settings,
  CheckCircle,
  MapPin,
  DollarSign,
  Clock,
} from "lucide-react";

const ServicesSection = () => {
  const services = [
    {
      title: "Property Sales",
      description:
        "We provide expert services for property sales with a focus on transparency and trust.",
      icon: <Home className="text-blue-600 w-10 h-10" />,
    },
    {
      title: "Rentals & Leasing",
      description:
        "Comprehensive rental and leasing solutions tailored for tenants and property owners.",
      icon: <FileText className="text-blue-600 w-10 h-10" />,
    },
    {
      title: "Property Management",
      description:
        "Professional property management ensuring smooth operations and maximized returns.",
      icon: <Settings className="text-blue-600 w-10 h-10" />,
    },
  ];

  const reasons = [
    {
      title: "Trusted Experts",
      description: "Experience unmatched quality and professionalism with every transaction.",
      icon: <CheckCircle className="text-blue-600 w-10 h-10 mx-auto mb-3" />,
    },
    {
      title: "Prime Locations",
      description: "We focus on high-value properties in strategic and sought-after areas.",
      icon: <MapPin className="text-blue-600 w-10 h-10 mx-auto mb-3" />,
    },
    {
      title: "Transparent Deals",
      description: "Clear, honest, and fair transactions for all our clients.",
      icon: <DollarSign className="text-blue-600 w-10 h-10 mx-auto mb-3" />,
    },
    {
      title: "24/7 Support",
      description: "Our team is always available to assist with your real estate needs.",
      icon: <Clock className="text-blue-600 w-10 h-10 mx-auto mb-3" />,
    },
  ];

  return (
    <div className="bg-gray-50">
      {/* ===== OUR SERVICES ===== */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <h3 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
          Our Services
        </h3>

        <div className="grid gap-8 md:grid-cols-3">
          {services.map((service) => (
            <div
              key={service.title}
              className="bg-white rounded-3xl p-8 flex flex-col items-start shadow-md hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
            >
              <div className="mb-4">{service.icon}</div>
              <h4 className="text-xl font-semibold mb-3 text-blue-600">{service.title}</h4>
              <p className="text-gray-600 leading-relaxed">{service.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== WHY CHOOSE US ===== */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <h3 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
          Why Choose Us
        </h3>

        <div className="grid gap-8 md:grid-cols-4 text-center">
          {reasons.map((item) => (
            <div
              key={item.title}
              className="bg-white rounded-3xl p-8 shadow-md hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
            >
              {item.icon}
              <h4 className="text-xl font-semibold mb-3 text-blue-600">{item.title}</h4>
              <p className="text-gray-600 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ServicesSection;
