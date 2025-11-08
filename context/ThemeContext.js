// "use client";
// import { createContext, useContext, useEffect, useState } from "react";

// const ThemeContext = createContext();

// export const ThemeProvider = ({ children }) => {
//   const [theme, setTheme] = useState("light");

//   useEffect(() => {
//     const stored = localStorage.getItem("theme");
//     if (stored === "dark") {
//       document.documentElement.classList.add("dark");
//       setTheme("dark");
//     }
//   }, []);

//   const toggleTheme = () => {
//     const root = document.documentElement;
//     if (theme === "light") {
//       root.classList.add("dark");
//       localStorage.setItem("theme", "dark");
//       setTheme("dark");
//     } else {
//       root.classList.remove("dark");
//       localStorage.setItem("theme", "light");
//       setTheme("light");
//     }
//   };

//   return (
//     <ThemeContext.Provider value={{ theme, toggleTheme }}>
//       {children}
//     </ThemeContext.Provider>
//   );
// };

// export const useTheme = () => useContext(ThemeContext);



















// "use client";
// import { createContext, useContext, useEffect, useState } from "react";

// const ThemeContext = createContext();

// export const ThemeProvider = ({ children }) => {
//   const [theme, setTheme] = useState("light");

//   // On mount, load theme from localStorage or system preference
//   useEffect(() => {
//     const stored = localStorage.getItem("theme");
//     if (stored) {
//       setTheme(stored);
//       if (stored === "dark") document.documentElement.classList.add("dark");
//     } else {
//       const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
//       if (prefersDark) {
//         document.documentElement.classList.add("dark");
//         setTheme("dark");
//       }
//     }
//   }, []);

//   const toggleTheme = () => {
//     const root = document.documentElement;
//     if (theme === "light") {
//       root.classList.add("dark");
//       localStorage.setItem("theme", "dark");
//       setTheme("dark");
//     } else {
//       root.classList.remove("dark");
//       localStorage.setItem("theme", "light");
//       setTheme("light");
//     }
//   };

//   return (
//     <ThemeContext.Provider value={{ theme, toggleTheme }}>
//       {children}
//     </ThemeContext.Provider>
//   );
// };

// export const useTheme = () => useContext(ThemeContext);
