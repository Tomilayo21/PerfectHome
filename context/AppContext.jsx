'use client';

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { ShoppingCart } from "lucide-react";

export const AppContext = createContext();
export const useAppContext = () => useContext(AppContext);

export const AppContextProvider = ({ children }) => {
  const { data: session, status } = useSession();
  const router = useRouter();

  // -------------------- Auth --------------------
  const [currentUser, setCurrentUser] = useState(null);

  const loginUser = async (email, password) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");

      if (data.user && data.token) {
        const mongoUser = {
          ...data.user,
          _id: data.user._id, // ensure Mongo _id is included
        };

        setCurrentUser(mongoUser);
        setCartItems(data.user.cartItems || {});
        localStorage.setItem("currentUser", JSON.stringify(mongoUser));
        localStorage.setItem("authToken", data.token);

        return { success: true, user: mongoUser, token: data.token };
      }

      throw new Error("Invalid login response");
    } catch (err) {
      throw err;
    }
  };

  const signupUser = async (formData) => {
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Signup failed");
      return data.user;
    } catch (err) {
      throw err;
    }
  };

  const logoutUser = () => {
    setCurrentUser(null);
    setCartItems({});
    localStorage.removeItem("currentUser");
    localStorage.removeItem("authToken");
  };

  // -------------------- Persist Auth --------------------
  useEffect(() => {
    const savedUser = localStorage.getItem("currentUser");
    const savedToken = localStorage.getItem("authToken");

    if (savedUser && savedToken && savedUser !== "undefined") {
      try {
        const parsedUser = JSON.parse(savedUser);
        if (!parsedUser._id) {
          console.error("Mongo _id missing in savedUser");
        } else {
          setCurrentUser(parsedUser); // now API will receive a valid userId
        }
      } catch (err) {
        console.error("Failed to parse savedUser:", err);
        localStorage.removeItem("currentUser");
      }
    }
  }, []);


  // -------------------- Theme & Layout --------------------
  const [currency, setCurrency] = useState("$");
  const [themeColor, setThemeColor] = useState("#f97316");
  const [secondaryColor, setSecondaryColor] = useState("#000000");
  const [tertiaryColor, setTertiaryColor] = useState("#ffffff");
  const [themeMode, setThemeMode] = useState("system");
  const [contrastMode, setContrastMode] = useState(false);
  const [layoutStyle, setLayoutStyle] = useState("default");
  const [previewLayoutStyle, setPreviewLayoutStyle] = useState(null);
  const [layout, setLayout] = useState("grid");
  const [fontSize, setFontSize] = useState("medium");
  const [previewFontSize, setPreviewFontSize] = useState(null);
  const effectiveLayout = previewLayoutStyle || layoutStyle;
  const effectiveFontSize = previewFontSize || fontSize;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("currency");
    if (saved) setCurrency(saved);
  }, []);
  useEffect(() => localStorage.setItem("currency", currency), [currency]);

  useEffect(() => {
    const savedTheme = localStorage.getItem("themeColor");
    const savedSecondary = localStorage.getItem("secondaryColor");
    const savedTertiary = localStorage.getItem("tertiaryColor");
    if (savedTheme) setThemeColor(savedTheme);
    if (savedSecondary) setSecondaryColor(savedSecondary);
    if (savedTertiary) setTertiaryColor(savedTertiary);
  }, []);
  useEffect(() => localStorage.setItem("themeColor", themeColor), [themeColor]);
  useEffect(() => localStorage.setItem("secondaryColor", secondaryColor), [secondaryColor]);
  useEffect(() => localStorage.setItem("tertiaryColor", tertiaryColor), [tertiaryColor]);

  useEffect(() => {
    const saved = localStorage.getItem("themeMode") || "light";
    setThemeMode(saved);

    // ✅ Immediately apply light mode before anything renders
    document.documentElement.classList.remove("dark");
    document.documentElement.classList.add("light");
  }, []);


  useEffect(() => {
    const isDark = themeMode === "dark";
    document.documentElement.classList.toggle("dark", isDark);

    const root = document.documentElement;
    if (isDark) {
      root.style.setProperty("--background", "#0f0f0f");
      root.style.setProperty("--foreground", "#ffffff");
    } else {
      root.style.setProperty("--background", "#ffffff");
      root.style.setProperty("--foreground", "#000000");
    }

    localStorage.setItem("themeMode", themeMode);
  }, [themeMode]);

  useEffect(() => {
    const saved = localStorage.getItem("contrastMode") === "true";
    setContrastMode(saved);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("high-contrast", contrastMode);
    localStorage.setItem("contrastMode", contrastMode);
  }, [contrastMode]);

  // -------------------- Products & Cart --------------------
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState({});

  useEffect(() => {
    async function fetchData() {
      try {
        const { data } = await axios.get("/api/product/list");
        if (data.success) setProducts(data.products);
        else toast.error(data.message);
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false); // ✅ Important: mark loading done
      }
    }
    fetchData();
  }, []);
  
  useEffect(() => {
    const savedCart = localStorage.getItem("cartItems");
    if (savedCart) setCartItems(JSON.parse(savedCart));
  }, []);
  
  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));

    // If user is logged in, update MongoDB
    if (status === "authenticated") {
      const updateDBCart = async () => {
        try {
          await axios.post(
            "/api/cart/update",
            { cartData: cartItems },
            { headers: { Authorization: `Bearer ${session.user.id}` } }
          );
        } catch (err) {
          console.error("Failed to update cart in DB:", err);
        }
      };

      updateDBCart();
    }
  }, [cartItems, status, session]);

  const addToCart = async (product) => {
    const itemId = product._id;
    let cartData = structuredClone(cartItems);
    cartData[itemId] = (cartData[itemId] || 0) + 1;
    setCartItems(cartData);

    toast.custom(
      (t) => (
        <div
          className={`max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg flex items-center gap-3 p-4 transform transition-all duration-300 ${
            t.visible ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"
          }`}
        >
          <ShoppingCart className="text-orange-500" size={20} />
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Item added to cart</p>
        </div>
      ),
      { duration: 2000, position: "top-right" }
    );
  };

  const updateCartQuantity = (productId, quantity) => {
    const updated = { ...cartItems };
    if (quantity <= 0) delete updated[productId];
    else updated[productId] = quantity;
    setCartItems(updated);
  };

  const getCartCount = () => Object.values(cartItems).reduce((a, b) => a + b, 0);

  const getCartAmount = () => {
    let total = 0;
    for (const itemId in cartItems) {
      const product = products.find((p) => p._id === itemId);
      if (product) total += (product.offerPrice || 0) * cartItems[itemId];
    }
    return Math.round(total * 100) / 100;
  };

    // -------------------- Properties --------------------
  const [properties, setProperties] = useState([]);

 const fetchProperties = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/property/list");
      const data = res.data;

      // ✅ Handle both array and object responses
      if (Array.isArray(data)) {
        setProperties(data);
      } else if (data.success) {
        setProperties(data.properties || []);
      } else {
        toast.error(data.message || "Failed to fetch properties");
      }
    } catch (err) {
      console.error("Error fetching properties:", err);
      toast.error("Failed to load properties");
    } finally {
      setLoading(false); // ✅ always end loading
    }
  };


  const value = {
    currentUser,
    loginUser,
    signupUser,
    logoutUser,
    currency,
    setCurrency,
    themeColor,
    setThemeColor,
    secondaryColor,
    setSecondaryColor,
    tertiaryColor,
    setTertiaryColor,
    themeMode,
    setThemeMode,
    contrastMode,
    setContrastMode,
    layout,
    setLayout,
    layoutStyle: effectiveLayout,
    setLayoutStyle,
    fontSize: effectiveFontSize,
    setFontSize,
    previewFontSize,
    setPreviewFontSize,
    previewLayoutStyle,
    setPreviewLayoutStyle,
    products,
    setProducts,
    cartItems,
    setCartItems,
    addToCart,
    updateCartQuantity,
    getCartCount,
    getCartAmount,
    loading,
    properties,      
    setProperties,
    fetchProperties
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
