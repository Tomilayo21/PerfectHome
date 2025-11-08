'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppContext } from "@/context/AppContext";
import { ShoppingCart, Package, Tag, ArrowRight } from "lucide-react";
import { assets } from "@/assets/assets";



const FeaturedProduct = () => {
  const { id } = useParams();
  const router = useRouter();
  const { products, addToCart } = useAppContext();

  const [mainImage, setMainImage] = useState(null);
  const [productData, setProductData] = useState(null);

  const fetchProductData = async () => {
    const product = products.find((product) => product._id === id);

    if (!product || !product.visible) {
      router.push("/not-found"); // Redirect if product is not visible
      return;
    }

    setProductData(product);
    if (product.image?.length > 0) {
      setMainImage(product.image[0]);
    }
  };

  useEffect(() => {
    if (id && products.length > 0) {
      fetchProductData();
    }
  }, [id, products.length]);

  return (

    // <div className="flex flex-col items-center">
    //   {/* Product Details */}
    //   {productData && (
    //     <div className="w-full max-w-5xl mt-10 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-md overflow-hidden">
    //       {/* Header */}
    //       <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
    //         <Package className="w-6 h-6 text-orange-600" />
    //         <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
    //           {productData.name}
    //         </h1>
    //       </div>

    //       {/* Product Image */}
    //       <div className="p-6">
    //         {mainImage ? (
    //           <img
    //             src={mainImage}
    //             alt={productData.name}
    //             className="w-full h-[400px] object-cover rounded-xl shadow-sm"
    //           />
    //         ) : (
    //           <div className="w-full h-[400px] flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-xl">
    //             <Tag className="w-12 h-12 text-gray-400" />
    //           </div>
    //         )}
    //       </div>

    //       {/* Product Info */}
    //       <div className="px-6 pb-6 space-y-4">
    //         <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
    //           {productData.description}
    //         </p>
    //         <p className="text-2xl font-bold text-orange-600">${productData.price}</p>

    //         <button
    //           onClick={() => addToCart(productData._id)}
    //           className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white text-lg font-medium rounded-xl shadow-md transition"
    //         >
    //           <ShoppingCart className="w-5 h-5" />
    //           Add to Cart
    //         </button>
    //       </div>
    //     </div>
    //   )}

    //   {/* Featured Products */}
    //   <div className="mt-16 w-full max-w-6xl">
    //     <div className="flex flex-col items-center">
    //       <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
    //         Featured <span className="text-orange-600">Products</span>
    //       </h2>
    //       <div className="w-28 h-1 bg-orange-600 mt-3 rounded-full"></div>
    //     </div>

    //     <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8 mt-12 px-4">
    //       {products
    //         .filter((product) => product.visible)
    //         .filter((product) => product._id !== id)
    //         .slice(0, 5)
    //         .map((product) => (
    //           <div
    //             key={product._id}
    //             className="relative group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 shadow-sm hover:shadow-lg transition duration-300 flex flex-col"
    //           >
    //             {/* Product Image */}
    //             <div className="overflow-hidden rounded-xl">
    //               {product.image[0] ? (
    //                 <img
    //                   src={product.image[0]}
    //                   alt={product.name}
    //                   className="w-full h-48 object-cover transform group-hover:scale-105 transition duration-300"
    //                 />
    //               ) : (
    //                 <div className="w-full h-48 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-xl">
    //                   <Package className="w-10 h-10 text-gray-400" />
    //                 </div>
    //               )}
    //             </div>

    //             {/* Product Info */}
    //             <div className="mt-4 flex flex-col flex-grow">
    //               <p className="font-semibold text-lg text-gray-800 dark:text-white truncate">
    //                 {product.name}
    //               </p>
    //               <button
    //                 onClick={() => router.push(`/product/${product._id}`)}
    //                 className="mt-3 inline-flex items-center justify-center w-full px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-lg transition duration-300"
    //               >
    //                 View Product
    //               </button>
    //             </div>
    //           </div>
    //         ))}
    //     </div>
    //   </div>
    // </div>

    <div className="flex flex-col items-center">
      {/* Product Details */}
      {productData && (
        <div className="w-full max-w-6xl mt-10 relative group">
          {/* Product Image */}
          {mainImage ? (
            <img
              src={mainImage}
              alt={productData.name}
              className="w-full h-[500px] object-cover rounded-2xl shadow-md group-hover:brightness-75 transition duration-300"
            />
          ) : (
            <div className="w-full h-[500px] flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-2xl">
              <Tag className="w-14 h-14 text-gray-400" />
            </div>
          )}

          {/* Overlay Info */}
          <div className="absolute bottom-10 left-10 space-y-3 text-white max-w-xl transition duration-300 group-hover:-translate-y-3">
            <div className="flex items-center gap-2">
              <Package className="w-6 h-6 text-orange-400" />
              <h1 className="text-3xl font-bold">{productData.name}</h1>
            </div>
            <p className="text-sm lg:text-base leading-6 line-clamp-3">
              {productData.description}
            </p>
            <p className="text-2xl font-bold text-orange-400">
              ${productData.price}
            </p>
            <button
              onClick={() => addToCart(productData._id)}
              className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 px-6 py-3 rounded-lg text-white text-sm font-medium transition"
            >
              <ShoppingCart className="w-5 h-5" />
              Add to Cart
            </button>
          </div>
        </div>
      )}

      {/* Featured Products */}
      <div className="mt-20 w-full max-w-6xl">
        {/* Section Heading */}
        <div className="flex flex-col items-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Featured <span className="text-orange-600">Products</span>
          </h2>
          <div className="w-24 h-1 bg-orange-600 mt-3 rounded-full"></div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mt-12 px-4">
          {products
            .filter((p) => p.visible && p._id !== id)
            .slice(0, 10) // up to 10 to fill grid nicely
            .map((product) => (
              <div
                key={product._id}
                className="relative group rounded-xl overflow-hidden shadow-md bg-white dark:bg-gray-900"
              >
                {/* Image */}
                {product.image[0] ? (
                  <img
                    src={product.image[0]}
                    alt={product.name}
                    className="w-full h-48 object-cover group-hover:brightness-75 transition duration-300"
                  />
                ) : (
                  <div className="w-full h-48 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                    <Package className="w-8 h-8 text-gray-400" />
                  </div>
                )}

                {/* Overlay Content */}
                <div className="absolute bottom-4 left-4 right-4 text-white space-y-1 transition duration-300 group-hover:-translate-y-2">
                  <p className="font-semibold text-sm md:text-base truncate 
                    bg-gradient-to-r from-black/60 to-gray-800/40 
                    backdrop-blur-sm px-2 py-1 rounded-md inline-block">
                    {product.name}
                  </p>

                  <button
                    onClick={() => router.push(`/product/${product._id}`)}
                    className="flex items-center gap-1.5 bg-orange-600 hover:bg-orange-700 px-3 py-1.5 rounded-md text-xs md:text-sm"
                  >
                    View <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>

    </div>


  );
};

export default FeaturedProduct;
