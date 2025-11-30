"use client";

import React, { useState, useEffect } from "react";
import Script from "next/script";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BlogSection from "@/components/BlogSection";
import Loading from "@/components/Loading";
import HeroSection from "@/components/HeroSection";
import PropertySlider from "@/components/PropertySlider";
import AboutSection from "@/components/AboutSection";
import ServicesSection from "@/components/ServicesSection";
import ContactCTA from "@/components/ContactCTA";
import NewsLetter from "@/components/NewsLetter";
import MobileMenuDrawer from "@/components/MobileMenuDrawer";
import WhatsAppWidget from "@/components/WhatsAppWidget";


const Home = () => {
  const [loading, setLoading] = useState(true);
  const [aboutGrouped, setAboutGrouped] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchAbout = async () => {
      try {
        const res = await fetch("/api/about");
        if (!res.ok) throw new Error("Failed to fetch about data");

        const data = await res.json();

        const sorted = data.sort((a, b) => a.position - b.position);

        const grouped = [];
        const sectionMap = {};

        sorted.forEach((item) => {
          if (!sectionMap[item.section]) {
            sectionMap[item.section] = [];
            grouped.push([item.section, sectionMap[item.section]]);
          }
          sectionMap[item.section].push(item);
        });

        setAboutGrouped(grouped);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    fetchAbout();
  }, []);

  // Refresh widget AFTER script loads
  useEffect(() => {
    setTimeout(() => {
      if (typeof window !== "undefined" && window.Elfsight) {
        window.Elfsight.refresh();
      }
    }, 1500);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-[70vh] space-y-4">
        <Loading />
      </div>
    );
  }

  return (
    <>
      <Navbar 
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />
      <MobileMenuDrawer
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />
      <HeroSection />
      <PropertySlider />
      <AboutSection aboutGrouped={aboutGrouped} />

      <div id="services">
        <ServicesSection />
      </div>

      <ContactCTA />
      <NewsLetter />
      <BlogSection />
      <Footer />

      <WhatsAppWidget />
    </>
  );
};

export default Home;
