"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";

export default function AllSectionsPage() {
  // About Us state and effect
  const [aboutEntries, setAboutEntries] = useState([]);
  useEffect(() => {
    fetch("/api/about")
      .then((res) => res.json())
      .then((data) => {
        const sorted = data.sort((a, b) => a.position - b.position);
        setAboutEntries(sorted);
      });
  }, []);

  const aboutGrouped = [];
  const aboutSectionMap = {};
  aboutEntries.forEach((item) => {
    if (!aboutSectionMap[item.section]) {
      aboutSectionMap[item.section] = [];
      aboutGrouped.push([item.section, aboutSectionMap[item.section]]);
    }
    aboutSectionMap[item.section].push(item);
  });

  // Testimonials state and effect
  const [reviews, setReviews] = useState([]);
  useEffect(() => {
    const fetchApproved = async () => {
      try {
        const res = await fetch("/api/reviews");
        if (!res.ok) throw new Error("Failed to fetch reviews");

        const data = await res.json();
        const list = data.reviews ?? data;

        const approved = list
          .filter((r) => r.approved)
          .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

        setReviews(approved);
      } catch (err) {
        console.error(err);
      }
    };
    fetchApproved();
  }, []);

  const reviewsGrouped = [];
  const reviewsSectionMap = {};
  reviews.forEach((item) => {
    if (!reviewsSectionMap[item.section]) {
      reviewsSectionMap[item.section] = [];
      reviewsGrouped.push([item.section, reviewsSectionMap[item.section]]);
    }
    reviewsSectionMap[item.section].push(item);
  });

  // Team state and effect
  const [teamEntries, setTeamEntries] = useState([]);
  useEffect(() => {
    fetch("/api/team")
      .then((res) => res.json())
      .then((data) => {
        const sorted = data.sort((a, b) => a.position - b.position);
        setTeamEntries(sorted);
      });
  }, []);

  const teamGrouped = [];
  const teamSectionMap = {};
  teamEntries.forEach((item) => {
    if (!teamSectionMap[item.section]) {
      teamSectionMap[item.section] = [];
      teamGrouped.push([item.section, teamSectionMap[item.section]]);
    }
    teamSectionMap[item.section].push(item);
  });

  // Partners state and effect
  const [partners, setPartners] = useState([]);
  useEffect(() => {
    const fetchApprovedPartners = async () => {
      try {
        const res = await fetch("/api/partners");
        if (!res.ok) throw new Error("Failed to fetch partners");

        const data = await res.json();

        const approved = (data.partners ?? data)
          .filter((p) => p.approved)
          .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

        setPartners(approved);
      } catch (err) {
        console.error(err);
      }
    };

    fetchApprovedPartners();
  }, []);

    const [footerData, setFooterData] = useState({
      footerName: "",
    });
  
    useEffect(() => {
      const fetchFooter = async () => {
        const res = await fetch("/api/settings/footerdetails");
        const data = await res.json();
        setFooterData({
          footerName: data.footerName,
  
        });
      };
      fetchFooter();
    }, []);

    useEffect(() => {
      if (aboutEntries.length > 0) {
        aboutEntries.forEach((entry) => {
          console.log('Quill HTML content:', entry.description);
        });
      }
    }, [aboutEntries]);

    useEffect(() => {
      const navbar = document.getElementById("main-navbar");
      if (navbar) {
        const updateHeight = () => {
          const height = navbar.offsetHeight;
          document.documentElement.style.setProperty("--navbar-height", height + "px");
        };

        updateHeight();
        window.addEventListener("resize", updateHeight);

        return () => window.removeEventListener("resize", updateHeight);
      }
    }, []);


  return (
    <>
      <Navbar />
      
      {/* About Us Section */}

      <div 
        className="px-8 bg-gray-50 dark:bg-gray-50 pt-[calc(var(--navbar-height)+1rem)]"
        >
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-900">
              About Us
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-600">
              Learn more about our journey, mission, and the team behind our success
            </p>
          </div>

          {/* About Sections */}
          <div className="space-y-16">
            {aboutGrouped.map(([section, items]) => (
              <div key={section}>
                {/* Section Heading */}
                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8 text-center">
                  {section}
                </h2>

                <div className="space-y-10">
                  {items.map((entry) => (
                    <div
                      key={entry._id}
                      className="bg-gray-50 dark:bg-gray-50 overflow-hidden transform hover:shadow-lg transition-shadow duration-300"
                    >
                      {/* Text Content */}
                      <div className="px-6 py-6 space-y-4">
                        {entry.subheading && (
                          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-800">
                            {entry.subheading}
                          </h3>
                        )}

                        <div
                          className="quill-content text-gray-700 dark:text-gray-700 whitespace-pre-wrap leading-relaxed prose dark:prose-invert text-justify max-w-full"
                          dangerouslySetInnerHTML={{ __html: entry.description || "" }}
                        ></div>
                      </div>

                      {/* Images */}
                      {entry.image?.length > 0 && (
                        <div className="px-6 pb-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                          {entry.image.map((img, index) => (
                            <img
                              key={index}
                              src={img}
                              alt={`${entry.heading} - image ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg shadow-sm"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="py-16 bg-white dark:bg-white">
        <div className="max-w-6xl mx-auto px-6">
          {/* Section Header */}
          <div className="text-center mb-12">
            <p className="text-3xl font-semibold text-gray-900 dark:text-gray-900">
              Our Dedicated Team
            </p>
            <p className="mt-2 text-gray-600 dark:text-gray-600">
              Meet the people who make it all happen
            </p>
          </div>

          {/* Team Grid */}
          <div className="grid gap-10 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {teamGrouped.map(([section, items]) =>
              items.map((entry) => (
                <div
                  key={entry._id}
                  className="bg-gray-50 dark:bg-gray-50  overflow-hidden transform hover:scale-105 transition-transform duration-300"
                >
                  {/* Image */}
                  <div className="flex justify-center mt-6">
                    {entry.image?.length > 0 ? (
                      <img
                        src={entry.image[0]}
                        alt={entry.heading}
                        className="w-32 h-32 object-cover rounded-full border-4 border-white dark:border-gray-800 shadow-md"
                      />
                    ) : (
                      <div className="w-32 h-32 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-300 text-lg font-medium border-4 border-white dark:border-gray-800 shadow-md">
                        No Image
                      </div>
                    )}
                  </div>

                  {/* Text Content */}
                  <div className="px-6 py-6 text-center space-y-2">
                    {/* Section heading only once per section */}
                    {entry.heading && (
                      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-600">
                        {entry.heading}
                      </h2>
                    )}

                    {/* <h3 className="text-lg font-medium text-gray-600">
                      {entry.subheading}
                    </h3> */}

                    <div
                      className="text-gray-500 dark:text-gray-500 text-sm leading-relaxed prose dark:prose-invert max-w-full mx-auto"
                      dangerouslySetInnerHTML={{ __html: entry.description }}
                    ></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Partners Section */}
      <div className="py-20 bg-gray-50 dark:bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          {/* Section Header */}
          <div className="text-center mb-14">
            <h2 className="text-3xl font-semibold text-gray-900 dark:text-gray-900">
              Trusted Partners
            </h2>
            <p className="mt-3 text-gray-600 dark:text-gray-600 text-lg">
              We proudly collaborate with reputable brands and individuals worldwide.
            </p>
          </div>

          {/* Scrolling Logo Slider */}
          <div className="relative w-full overflow-hidden">
            {/* Gradient Fades - left & right */}
            <div className="absolute left-0 top-0 h-full w-24 bg-gray-50 dark:gray-50 z-10"></div>
            <div className="absolute right-0 top-0 h-full w-24 bg-gray-50 dark:gray-50 z-10"></div>

            {/* Slider Row */}
            <div className="flex items-center gap-14 animate-slide">
              {[...partners, ...partners].map((partner, index) => {
                const imageUrl = Array.isArray(partner.imageUrl)
                  ? partner.imageUrl[0]
                  : partner.imageUrl;

                return (
                  <div key={index} className="flex flex-col items-center group ">
                    <div className="w-28 h-28 rounded-full overflow-hidden shadow-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-center">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={partner.name || "Partner"}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full text-gray-500 dark:text-gray-300">
                          No Image
                        </div>
                      )}
                    </div>

                    <p className="mt-3 text-sm font-semibold text-gray-600 dark:text-gray-600">
                      {partner.name || partner.username}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CTA */}
          <div className="mt-20 max-w-3xl mx-auto text-center">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-900 mb-3">
              Want to partner with us?
            </h3>
            <p className="text-gray-700 dark:text-gray7300 text-lg">
              We're open to working with forward-thinking brands and individuals.
              Join our growing network of trusted partners.
            </p>

            <Link href="/contact">
              <button className="mt-6 px-7 py-3 bg-blue-700/80 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-md transition-all duration-300">
                Get in Touch
              </button>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </>

  );
}
