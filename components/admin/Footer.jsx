import React from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";

const Footer = () => {
    const { themeMode } = ( useAppContext );
  

  // Select logo based on theme
  const logoSrc = themeMode === "dark" ? "/cusceda___.png" : "/cusceda__.png";

  // Get current year dynamically
  const currentYear = new Date().getFullYear();

  return (
    <div className="flex md:flex-row flex-col-reverse items-center justify-between text-left w-full px-10">
      <div className="flex items-center gap-4">
        <Image
          src={logoSrc}
          alt="Cusceda Logo"
          width={128}
          height={128}
          className="w-28 md:w-32 cursor-pointer"
          priority
        />
        <div className="hidden md:block h-7 w-px bg-gray-500/60"></div>
        <p className="py-4 text-center text-xs md:text-sm text-gray-500">
          Copyright {currentYear} © Cusceda All Rights Reserved.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <a href="#">
          <Image src={assets.facebook_icon} alt="facebook_icon" />
        </a>
        <a href="#">
          <Image src={assets.twitter_icon} alt="twitter_icon" />
        </a>
        <a href="#">
          <Image src={assets.instagram_icon} alt="instagram_icon" />
        </a>
      </div>
    </div>
  );
};

export default Footer;
