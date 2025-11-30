"use client";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";

export default function TeamPage() {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    fetch("/api/team")
      .then((res) => res.json())
      .then((data) => {
        const sorted = data.sort((a, b) => a.position - b.position);
        setEntries(sorted);
      });
  }, []);

  const grouped = [];
  const sectionMap = {};

  entries.forEach((item) => {
    if (!sectionMap[item.section]) {
      sectionMap[item.section] = [];
      grouped.push([item.section, sectionMap[item.section]]);
    }
    sectionMap[item.section].push(item);
  });

  return (
    <>
    <Navbar />
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-10">
      <h1 className="text-3xl font-bold text-center mb-4">Team</h1>

      {grouped.map(([section, items]) => (
        <div key={section}>
          <h2 className="text-2xl font-semibold border-b pb-2 mb-4 text-center">
            {items[0]?.heading}
          </h2>

          <div className="space-y-10">
            {items.map((entry) => (
              <div
                key={entry._id}
                className="flex flex-col items-center text-center border p-6 rounded-lg shadow-sm bg-white"
              >
                

                <h3 className="text-xl font-semibold text-gray-700 mb-2">{entry.subheading}</h3>


                <div
                  className="text-gray-700 mb-4 prose"
                  dangerouslySetInnerHTML={{ __html: entry.description }}
                ></div>



                {entry.image?.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-4 mt-4">
                    {entry.image.map((img, index) => (
                      <img
                        key={index}
                        src={img}
                        alt={`${entry.heading} - image ${index + 1}`}
                        className="w-32 h-32 object-cover rounded"
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
      {/* {grouped.map(([section, items]) => (
        <div key={section}>
          <h2 className="text-2xl font-semibold border-b pb-2 mb-4 text-center">
            {section}
          </h2>

          <div className="space-y-10">
            {items.map((entry) => (
              <div
                key={entry._id}
                className="flex flex-col items-center text-center border p-6 rounded-lg shadow-sm bg-white"
              >

                <h3 className="text-xl font-bold">{entry.heading}</h3>


                {entry.subheading && (
                  <p className="text-md text-gray-600 mb-2">{entry.subheading}</p>
                )}


                <p className="text-gray-700 whitespace-pre-line mb-4">
                  {entry.description}
                </p>


                {entry.image?.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-4 mt-4">
                    {entry.image.map((img, index) => (
                      <img
                        key={index}
                        src={img}
                        alt={`${entry.heading} - image ${index + 1}`}
                        className="w-32 h-32 object-cover rounded"
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))} */}
    </div>
    <Footer />
    </>
  );
}






















