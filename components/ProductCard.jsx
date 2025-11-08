"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/context/AppContext";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import toast from "react-hot-toast";
import { Heart, Star, XCircle, ShoppingCart, AlertTriangle } from "lucide-react";

const fetcher = (url) => fetch(url).then((res) => res.json());

const ProductCard = ({ product }) => {
  if (product.visible === false) return null;

  const router = useRouter();
  const { currency, addToCart } = useAppContext();

  const { data: session } = useSession(); 
  const user = session?.user;

  const [loading, setLoading] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const pressTimer = useRef(null);


  // ------------------ Long Press Modal ------------------
  const handleLongPressStart = () => {
    pressTimer.current = setTimeout(() => setShowModal(true), 500);
  };
  const handleLongPressEnd = () => {
    clearTimeout(pressTimer.current);
    setShowModal(false);
  };


  // ------------------ Fetch Favorites ------------------
  useEffect(() => {
    const checkFavorite = async () => {
      if (!user?.id) return; // ✅ use NextAuth user
      try {
        const res = await fetch(`/api/favorites?userId=${user.id}`);
        if (!res.ok) return;
        const data = await res.json();
        const found = data.find((f) => f.productId._id === product._id);
        setIsFavorite(!!found);
      } catch (err) {
        console.error("Favorite fetch failed:", err);
      }
    };
    checkFavorite();
  }, [user?.id, product._id]);

  // ------------------ Toggle Favorite ------------------
  const toggleFavorite = async (e) => {
    e.stopPropagation();
    if (!user) {
      toast.custom(
        (t) => (
          <div
            className={`max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg flex items-center gap-3 p-4 transform transition-all duration-300 border-l-4 border-red-500 ${
              t.visible ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"
            }`}
          >
            <AlertTriangle className="text-red-500 shrink-0" size={20} />
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Please login to add items as favorite
            </p>
          </div>
        ),
        {
          duration: 2500,
          position: "top-right",
        }
      );
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product._id,
          userId: user.id,
        }),
      });

      if (res.ok) {
        setIsFavorite(!isFavorite);

        toast.custom(
          (t) => (
            <div
              className={`${
                t.visible ? "animate-enter" : "animate-leave"
              } max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto flex items-center gap-2 p-4`}
            >
              {isFavorite ? (
                <XCircle className="text-red-500" size={20} />
              ) : (
                <Heart className="text-orange-500 fill-orange-500" size={20} />
              )}
              <p className="text-sm font-normal text-black dark:text-white">
                {!isFavorite ? "Added to favorites" : "Removed from favorites"}
              </p>
            </div>
          ),
          { duration: 2000 }
        );
      } else {
        toast.error("Failed to update favorites");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // ------------------ Reviews ------------------
  const { data: reviews = [] } = useSWR(
    `/api/reviews?productId=${product._id}`,
    fetcher
  );
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  // ------------------ Navigation ------------------
  const handleCardClick = () => {
    router.push("/product/" + product._id);
    scrollTo(0, 0);
  };

  // ------------------ Add to Cart ------------------
  const handleAddToCart = () => {
    if (loading) return;
    if (!user) {
      toast.custom(
        (t) => (
          <div
            className={`max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg flex items-center gap-3 p-4 transform transition-all duration-300 border-l-4 border-red-500 ${
              t.visible ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"
            }`}
          >
            <AlertTriangle className="text-red-500 shrink-0" size={20} />
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Please login to add items to your cart
            </p>
          </div>
        ),
        {
          duration: 2500,
          position: "top-right",
        }
      );
      return;
    }
    addToCart(product);
  };

  return (
    <div>
      <div
        onClick={handleCardClick}
        onMouseDown={handleLongPressStart}
        onTouchStart={handleLongPressStart}
        onMouseUp={handleLongPressEnd}
        onMouseLeave={handleLongPressEnd}
        onTouchEnd={handleLongPressEnd}
        className="group flex flex-col max-w-[240px] w-full cursor-pointer 
                  rounded-2xl bg-white dark:bg-gray-900 
                  transition-all hover:shadow-md hover:scale-[1.02] overflow-hidden"
      >
        {/* === Image Section === */}
        <div className="relative h-56 w-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
          <Image
            src={product.image[0]}
            alt={product.name}
            width={400}
            height={400}
            className="w-[80%] h-auto object-contain transition-transform duration-300 group-hover:scale-105"
          />

          {/* Favorite Button */}
          <button
            onClick={toggleFavorite}
            className="absolute top-3 right-3 bg-white/90 dark:bg-gray-700/90 p-2 rounded-full hover:scale-110 transition"
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart
              size={16}
              className={isFavorite ? "text-orange-500 fill-orange-500" : "text-gray-500"}
            />
          </button>
        </div>
      </div>

      {/* === Details Section === */}
      <div className="mt-4 flex flex-col flex-1 gap-1 text-gray-900 dark:text-white">
        <h3 className="text-base font-semibold text-gray-700 uppercase truncate">
          {product.name}
        </h3>

        {/* Price / Rating / Cart */}
        <div className="flex items-center justify-between mt-auto">
          <div>
            <p className="text-base font-medium text-gray-600">
              {currency}
              {Number(product.offerPrice).toLocaleString()}
            </p>

            <div className="flex items-center mt-2 gap-1 text-xs text-gray-500">
              {[...Array(5)].map((_, i) => {
                const ratingValue = i + 1;
                const fullStar = avgRating >= ratingValue;
                const halfStar = avgRating >= ratingValue - 0.5 && avgRating < ratingValue;

                return (
                  <div key={i} className="relative">
                    {/* Full Star */}
                    <Star
                      className={`w-4 h-4 ${
                        fullStar ? "fill-orange-500 text-orange-500" : "fill-gray-300 text-gray-300"
                      }`}
                    />

                    {/* Half Star Overlay */}
                    {halfStar && (
                      <div className="absolute inset-0 overflow-hidden w-1/2">
                        <Star className="w-4 h-4 fill-orange-500 text-orange-500" />
                      </div>
                    )}
                  </div>
                );
              })}

              <span className="ml-1 text-[11px] text-gray-500">{avgRating.toFixed(1)}</span>
            </div>


            {product.stock <= 10 && product.stock > 0 && (
              <p className="text-[11px] text-gray-500 font-medium mt-2">
                Only {product.stock} left!
              </p>
            )}

            {/* Add to Cart Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAddToCart();
              }}
              disabled={product.stock === 0}
              className={`mt-3 px-3 py-1.5 rounded-md border flex items-center gap-1 justify-center text-sm font-medium transition-colors
                ${
                  product.stock === 0
                    ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                    : "bg-grey-600 hover:bg-gray-50 text-black"
                }`}
              aria-label={product.stock === 0 ? "Sold Out" : "Add to Cart"}
            >
              {product.stock === 0 ? (
                <span className="text-[11px] font-normal">Sold</span>
              ) : (
                <>
                  <ShoppingCart size={14} /> <span>Add to Cart</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>

  );
};

export default ProductCard;
