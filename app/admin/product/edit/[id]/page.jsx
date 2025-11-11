'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { assets } from '@/assets/assets';

export default function EditProduct() {
  const { id } = useParams();
  const router = useRouter();

  const [product, setProduct] = useState({
    name: '',
    description: '',
    category: 'Earphone',
    color: '',
    brand: '',
    price: 0,
    offerPrice: 0,
    stock: 0,
    images: [],
  });

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [files, setFiles] = useState([]);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/product/${id}`);
        if (!res.ok) throw new Error('Failed to fetch product');
        const data = await res.json();

        // Initialize form state with fetched data
        setProduct({
          name: data.name || '',
          description: data.description || '',
          category: data.category || 'Earphone',
          color: data.color || '',
          brand: data.brand || '',
          price: data.price || 0,
          offerPrice: data.offerPrice || 0,
          stock: data.stock || 0,
          images: data.images || [],
        });

        setFiles(data.images || []);
      } catch (error) {
        toast.error('Failed to load product');
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchProduct();
  }, [id]);

  // Handle image change
  function handleImageChange(e, index) {
    const newFiles = [...files];
    newFiles[index] = e.target.files[0];
    setFiles(newFiles);
  }

  // Handle generic input change
  function handleChange(e) {
    const { name, value } = e.target;

    // For numeric inputs convert to number
    if (['price', 'offerPrice', 'stock'].includes(name)) {
      setProduct((prev) => ({ ...prev, [name]: Number(value) }));
    } else {
      setProduct((prev) => ({ ...prev, [name]: value }));
    }
  }

  async function handleUpdate(e) {
    e.preventDefault();
    setUpdating(true);

    try {
      // You might want to handle file uploads here before sending
      // but assuming your backend handles files as base64 or multipart elsewhere

      const res = await fetch(`/api/product/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...product, images: files }),
      });

      if (!res.ok) throw new Error('Update failed');
      toast.success('Product updated successfully');
      router.push('/admin/product-list');
    } catch (error) {
      toast.error('Update failed');
    } finally {
      setUpdating(false);
    }
  }

  if (loading) return <p className="p-4 text-gray-600">Loading product...</p>;

  return (
    <div className="flex-1 min-h-screen flex flex-col justify-between">
      <form onSubmit={handleUpdate} className="md:p-10 p-4 space-y-5 max-w-lg">
        {/* Product Images */}
        {/* <div>
          <p className="text-base font-medium">Product Image</p>
          <div className="flex flex-wrap items-center gap-3 mt-2">
            {[...Array(4)].map((_, index) => (
              <label key={index} htmlFor={`image${index}`}>
                <input
                  type="file"
                  id={`image${index}`}
                  name={`image${index}`}
                  hidden
                  onChange={(e) => handleImageChange(e, index)}
                />
                <Image
                  className="max-w-24 cursor-pointer"
                  src={
                    files[index]
                      ? typeof files[index] === 'string'
                        ? files[index]
                        : URL.createObjectURL(files[index])
                      : assets.upload_area
                  }
                  alt={`Product image ${index + 1}`}
                  width={100}
                  height={100}
                />
              </label>
            ))}
          </div>
        </div> */}

        {/* Product Name */}
        <div className="flex flex-col gap-1">
          <label className="text-base font-medium">Product Name</label>
          <input
            type="text"
            name="name"
            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
            value={product.name}
            onChange={handleChange}
            required
          />
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1">
          <label className="text-base font-medium">Description</label>
          <textarea
            rows={4}
            name="description"
            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40 resize-none"
            value={product.description}
            onChange={handleChange}
            required
          />
        </div>

        {/* Category, Color, Brand, Prices, Stock */}
        <div className="flex flex-wrap gap-4">
          <div className="flex flex-col gap-1 w-32">
            <label className="text-base font-medium">Category</label>
            <select
              name="category"
              className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
              value={product.category}
              onChange={handleChange}
            >
              <option value="Earphone">Earphone</option>
              <option value="Headphone">Headphone</option>
              <option value="Watch">Watch</option>
              <option value="Smartphone">Smartphone</option>
              <option value="Laptop">Laptop</option>
              <option value="Camera">Camera</option>
              <option value="Accessories">Accessories</option>
            </select>
          </div>

          <div className="flex flex-col gap-1 w-32">
            <label className="text-base font-medium">Color</label>
            <select
              name="color"
              className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
              value={product.color}
              onChange={handleChange}
            >
              <option value="">Select</option>
              <option value="Red">Red</option>
              <option value="Black">Black</option>
              <option value="Blue">Blue</option>
              <option value="White">White</option>
              <option value="Gray">Gray</option>
              <option value="Green">Green</option>
              <option value="Yellow">Yellow</option>
              <option value="Purple">Purple</option>
              <option value="Pink">Pink</option>
              <option value="Gold">Gold</option>
              <option value="Silver">Silver</option>
            </select>
          </div>

          <div className="flex flex-col gap-1 w-32">
            <label className="text-base font-medium">Brand</label>
            <input
              type="text"
              name="brand"
              value={product.brand}
              onChange={handleChange}
              className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
            />
          </div>

          <div className="flex flex-col gap-1 w-32">
            <label className="text-base font-medium">Original Price</label>
            <input
              type="number"
              name="price"
              value={product.price}
              onChange={handleChange}
              className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
              required
            />
          </div>

          <div className="flex flex-col gap-1 w-32">
            <label className="text-base font-medium">Discount Price</label>
            <input
              type="number"
              name="offerPrice"
              value={product.offerPrice}
              onChange={handleChange}
              className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
              required
            />
          </div>

          <div className="flex flex-col gap-1 w-32">
            <label className="text-base font-medium">Stock</label>
            <input
              type="number"
              name="stock"
              value={product.stock}
              onChange={handleChange}
              className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
              required
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="px-8 py-2.5 bg-blue-600 text-white font-medium rounded disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={updating}
        >
          {updating ? 'Updating...' : 'Update Product'}
        </button>
      </form>
    </div>
  );
}
