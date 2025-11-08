"use client";
import React, { useState, useEffect } from "react";
import HeaderSlider from "@/components/HeaderSlider";
import HomeProducts from "@/components/HomeProducts";
import Banner from "@/components/Banner";
import NewsLetter from "@/components/NewsLetter";
import FeaturedProduct from "@/components/FeaturedProduct";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Loading from "@/components/Loading";
import { useAppContext } from "@/context/AppContext";
import LandingPage from "@/components/LandingPage";
import PromoBanner from "@/components/PromoBanner";
import FadeInWhenVisible from "@/components/animations/FadeInWhenVisible";
import SlideInWhenVisible from "@/components/animations/SlideInWhenVisible";
import ParallaxFadeIn from "@/components/animations/ParallaxFadeIn";
import AnimatedInView from "@/components/animations/AnimatedInView";
import TrendingProducts from "@/components/TrendingProducts";
import Categories from "@/components/Categories";
import HomePage from "../components/HomePage";
import PropertySlider from "@/components/PropertySlider";
import PropertyCard from "@/components/PropertyCard";
import AddProperty from "@/components/AddProperty";
import AddProductPanel from "@/components/admin/settings/products/AddProductPanel";
import PropertyListPanel from "@/components/admin/PropertyListPanel";

const Home = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { themeMode } = useAppContext(); // ✅ from context

  useEffect(() => {
    // ✅ Sync dark/light mode directly from AppContext
    if (themeMode === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [themeMode]);

  useEffect(() => {
    // ✅ Inject Elfsight script
    const script = document.createElement("script");
    script.src = "https://static.elfsight.com/platform/platform.js";
    script.async = true;
    document.body.appendChild(script);

    // ✅ Simulate data fetch
    const fetchData = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        setLoading(false);
      } catch (err) {
        setError("Failed to load data");
        setLoading(false);
      }
    };
    fetchData();

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-[70vh] space-y-4">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <p className="text-red-600 text-xl font-semibold">{error}</p>
      </div>
    );
  }

  // return (
  //   <div className="min-h-[200vh] bg-background text-foreground transition-colors duration-300">
  //     <Navbar />
  //     {/* <PromoBanner /> */}


  //     <div className="px-6 md:px-16 lg:px-0 mt-16">
        
  //       <FadeInWhenVisible>
  //       <HeaderSlider />
  //       </FadeInWhenVisible>

  //       <TrendingProducts />

  //       <FadeInWhenVisible>
  //       {/* <HomeProducts /> 
  //       */}
  //       <Categories />
  //       </FadeInWhenVisible>
  //       {/* <FeaturedProduct /> */}

  //       <SlideInWhenVisible>
  //       <Banner />
  //       </SlideInWhenVisible>

  //       <ParallaxFadeIn>
  //       <NewsLetter />
  //       </ParallaxFadeIn>

  //       {/* <LandingPage /> */}
  //     </div>

  //     <AnimatedInView>
  //     <Footer />
  //     </AnimatedInView>

  //     {/* Elfsight Chatbot Embed */}
  //     <div
  //       style={{
  //         transform: "scale(0.8)",
  //         transformOrigin: "bottom right",
  //         position: "fixed",
  //         bottom: "20px",
  //         right: "20px",
  //         zIndex: 9999,
  //       }}
  //     >
  //       <div
  //         className="elfsight-app-8c11fe9a-bb8d-49e6-a42c-a065429443e6"
  //         data-elfsight-app-lazy
  //       ></div>
  //     </div>
  //   </div>
  // );
  return(
    <>
      <Navbar />
      <HeaderSlider />
      <PropertySlider />
      <AddProperty />
      <PropertyListPanel />
      {/* <HomePage /> */}
    </>
  )
};

export default Home;
