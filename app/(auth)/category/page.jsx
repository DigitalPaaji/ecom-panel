"use client";

import { base_url, img_url } from "@/app/components/urls";
import axios from "axios";
import React, { useEffect, useMemo, useState } from "react";
import {
  FaCloudUploadAlt,
  FaEdit,
  FaPlus,
  FaSave,
  FaTrash,
} from "react-icons/fa";
import { MdCancel } from "react-icons/md";
import { toast } from "react-toastify";

// key      -> field name used on CREATE (image / desktop / mobile)
// editKey  -> field name used on EDIT   (newimage / newdesktop / newmobile)
// oldKey   -> saved image path kept in edit state
const IMAGE_FIELDS = [
  {
    key: "image",
    editKey: "newimage",
    oldKey: "oldImage",
    label: "Category Image",
    hint: "Icon / thumbnail",
  },
  {
    key: "desktop",
    editKey: "newdesktop",
    oldKey: "oldDesktop",
    label: "Desktop Banner",
    hint: "Shown on desktop",
  },
  {
    key: "mobile",
    editKey: "newmobile",
    oldKey: "oldMobile",
    label: "Mobile Banner",
    hint: "Shown on mobile",
  },
];

const emptyNew = { name: "", image: null, desktop: null, mobile: null };

const emptyEdit = {
  id: "",
  name: "",
  image: null,
  desktop: null,
  mobile: null,
  oldImage: "",
  oldDesktop: "",
  oldMobile: "",
};

/* ---------- Reusable image upload field ---------- */
const ImageField = ({ label, hint, inputId, file, oldSrc, onChange, onClear }) => {
  const previewUrl = useMemo(
    () => (file ? URL.createObjectURL(file) : ""),
    [file]
  );

  // free memory when file changes / unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const src = previewUrl || oldSrc;

  return (
    <div className="col-span-1">
      <p className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
        {label} <span className="text-red-500">*</span>
      </p>

      {src ? (
        <div className="group relative h-44 w-full overflow-hidden rounded-xl border-2 border-slate-100 dark:border-slate-700">
          <img src={src} alt={label} className="h-full w-full object-cover" />

          <label
            htmlFor={inputId}
            className="absolute inset-0 flex cursor-pointer flex-col items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
          >
            <FaCloudUploadAlt className="mb-2 text-3xl text-white" />
            <span className="text-sm font-semibold text-white">
              Change image
            </span>
          </label>

          {/* remove newly selected file (reverts to saved image in edit mode) */}
          {file && (
            <button
              type="button"
              onClick={onClear}
              title="Remove selected file"
              className="absolute right-2 top-2 z-10 rounded-full bg-black/60 text-white transition-colors hover:text-red-500"
            >
              <MdCancel size={24} />
            </button>
          )}
        </div>
      ) : (
        <label
          htmlFor={inputId}
          className="group flex h-44 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-700/50"
        >
          <FaCloudUploadAlt className="mb-2 text-4xl text-slate-400 group-hover:text-rose-900" />
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Upload Image
          </p>
          <span className="mt-1 text-[10px] text-slate-400">{hint}</span>
          <span className="mt-1 text-[10px] text-red-500">* Required</span>
        </label>
      )}

      <input
        id={inputId}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => onChange(e.target.files?.[0] || null)}
      />
    </div>
  );
};

const CategoryPage = () => {
  const [newCategoryData, setNewCategoryData] = useState(emptyNew);
  const [editCategoryData, setEditCategoryData] = useState(emptyEdit);

  const [allCategory, setAllCategory] = useState([]);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);

  const isEditing = Boolean(editCategoryData.id);

  const resetFileInputs = (prefix) => {
    IMAGE_FIELDS.forEach(({ key }) => {
      const input = document.getElementById(`${prefix}-category-${key}`);
      if (input) input.value = "";
    });
  };

  /* ---------- Create ---------- */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newCategoryData.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    for (const { key, label } of IMAGE_FIELDS) {
      if (!newCategoryData[key]) {
        toast.error(`${label} is required`);
        return;
      }
    }

    try {
      setCreating(true);

      const formData = new FormData();
      formData.append("name", newCategoryData.name.trim());
      formData.append("image", newCategoryData.image);
      formData.append("desktop", newCategoryData.desktop);
      formData.append("mobile", newCategoryData.mobile);

      const response = await axios.post(
        `${base_url}/category/create`,
        formData
      );

      if (response.data.success) {
        const createdCategory = response.data.data || response.data.category;

        toast.success(response.data.message || "Category created");

        if (createdCategory) {
          setAllCategory((prev) => [...prev, createdCategory]);
        } else {
          await getCategory();
        }

        setNewCategoryData(emptyNew);
        resetFileInputs("create");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to create category"
      );
    } finally {
      setCreating(false);
    }
  };

  /* ---------- Read ---------- */
  const getCategory = async () => {
    try {
      const response = await axios.get(`${base_url}/category/get-all`);

      if (response.data.success) {
        setAllCategory(response.data.data || []);
      }
    } catch (error) {
      setAllCategory([]);
      toast.error(
        error.response?.data?.message || "Failed to fetch categories"
      );
    }
  };

  /* ---------- Edit ---------- */
  const openEditCategory = (category) => {
    setEditCategoryData({
      id: category._id,
      name: category.name,
      image: null,
      desktop: null,
      mobile: null,
      oldImage: category.image || "",
      oldDesktop: category.desktop || "",
      oldMobile: category.mobile || "",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditCategoryData(emptyEdit);
    resetFileInputs("edit");
  };

  const updateCategory = async (e) => {
    e.preventDefault();

    if (!editCategoryData.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    // Each image must exist: either an already-saved one or a newly picked one
    for (const { key, label, oldKey } of IMAGE_FIELDS) {
      if (!editCategoryData[key] && !editCategoryData[oldKey]) {
        toast.error(`${label} is required`);
        return;
      }
    }

    try {
      setUpdating(true);

      const formData = new FormData();
      formData.append("name", editCategoryData.name.trim());

      // Only send files that were actually changed.
      // Edit route expects: newimage, newdesktop, newmobile
      IMAGE_FIELDS.forEach(({ key, editKey }) => {
        if (editCategoryData[key]) {
          formData.append(editKey, editCategoryData[key]);
        }
      });

      const response = await axios.put(
        `${base_url}/category/edit/${editCategoryData.id}`,
        formData
      );

      if (response.data.success) {
        const updatedCategory = response.data.category || response.data.data;

        if (updatedCategory) {
          setAllCategory((prev) =>
            prev.map((item) =>
              item._id === editCategoryData.id
                ? { ...item, ...updatedCategory }
                : item
            )
          );
        } else {
          await getCategory();
        }

        toast.success(
          response.data.message || "Category updated successfully"
        );
        cancelEdit();
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update category"
      );
    } finally {
      setUpdating(false);
    }
  };

  /* ---------- Delete ---------- */
  const deleteCategory = async (id) => {
    const confirmed = window.confirm(
      "Delete this category? Products inside might be affected."
    );

    if (!confirmed) return;

    try {
      const response = await axios.delete(`${base_url}/category/delete/${id}`);

      if (response.data.success) {
        setAllCategory((prev) => prev.filter((item) => item._id !== id));

        if (editCategoryData.id === id) {
          cancelEdit();
        }

        toast.success(response.data.message || "Category deleted");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to delete category"
      );
    }
  };

  useEffect(() => {
    getCategory();
  }, []);

  /* ---------- Field handlers ---------- */
  const setFile = (key, file) => {
    if (isEditing) {
      setEditCategoryData((prev) => ({ ...prev, [key]: file }));
    } else {
      setNewCategoryData((prev) => ({ ...prev, [key]: file }));
    }
  };

  const clearFile = (key, inputId) => {
    setFile(key, null);
    const input = document.getElementById(inputId);
    if (input) input.value = "";
  };

  return (
    <div className="min-h-screen bg-white p-6 transition-colors duration-300 dark:bg-black">
      <div className="mx-auto">
        {/* Create/Edit form */}
        <form
          onSubmit={isEditing ? updateCategory : handleSubmit}
          className="mb-10 flex flex-col gap-6 rounded-2xl border border-slate-200 bg-gray-100 p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800"
        >
          {/* Title row */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {isEditing ? "Edit Category" : "Add Category"}
            </h2>

            {isEditing && (
              <button
                type="button"
                onClick={cancelEdit}
                className="flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-red-500"
              >
                <MdCancel size={20} />
                Cancel
              </button>
            )}
          </div>

          {/* Images: image / desktop / mobile */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {IMAGE_FIELDS.map(({ key, label, hint, oldKey }) => {
              const mode = isEditing ? "edit" : "create";
              const inputId = `${mode}-category-${key}`;
              const data = isEditing ? editCategoryData : newCategoryData;

              return (
                <ImageField
                  key={`${mode}-${editCategoryData.id}-${key}`}
                  label={label}
                  hint={hint}
                  inputId={inputId}
                  file={data[key]}
                  oldSrc={
                    isEditing && editCategoryData[oldKey]
                      ? `${img_url}${editCategoryData[oldKey]}`
                      : ""
                  }
                  onChange={(file) => setFile(key, file)}
                  onClear={() => clearFile(key, inputId)}
                />
              );
            })}
          </div>

          {/* Details */}
          <div className="flex flex-col gap-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Category Name <span className="text-red-500">*</span>
              </label>

              <input
                type="text"
                required
                placeholder="Enter category name..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition-all focus:ring-2 focus:ring-rose-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                value={isEditing ? editCategoryData.name : newCategoryData.name}
                onChange={(e) => {
                  const value = e.target.value;
                  if (isEditing) {
                    setEditCategoryData((prev) => ({ ...prev, name: value }));
                  } else {
                    setNewCategoryData((prev) => ({ ...prev, name: value }));
                  }
                }}
              />
            </div>

            <button
              type="submit"
              disabled={creating || updating}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-900 px-8 py-3 font-bold text-white shadow-lg shadow-rose-900/20 transition-all hover:bg-rose-800 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 md:w-max"
            >
              {isEditing ? (
                <>
                  <FaSave size={14} />
                  {updating ? "Updating..." : "Update Category"}
                </>
              ) : (
                <>
                  <FaPlus size={14} />
                  {creating ? "Creating..." : "Add Category"}
                </>
              )}
            </button>
          </div>
        </form>

        {/* Category list */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {allCategory.length > 0 ? (
            allCategory.map((item, index) => (
              <div
                key={item._id || index}
                className={`flex items-center gap-4 rounded-2xl border bg-gray-100 p-3 shadow-sm transition-all hover:shadow-md dark:bg-slate-800 ${
                  editCategoryData.id === item._id
                    ? "border-rose-800 ring-2 ring-rose-800/20"
                    : "border-slate-200 dark:border-slate-700"
                }`}
              >
                <img
                  src={`${img_url}${item.image}`}
                  alt={item.name}
                  className="h-16 w-16 rounded-full border-2 border-slate-100 object-cover shadow-inner dark:border-slate-700"
                />

                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-sm font-bold text-slate-800 dark:text-white">
                    {item.name}
                  </p>

                  <span className="mt-1 inline-block rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-900 dark:bg-rose-900/20 dark:text-rose-400">
                    {item.product?.length || 0} Products
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => openEditCategory(item)}
                    title="Edit category"
                    className="cursor-pointer rounded-xl p-2.5 text-slate-400 transition-all hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20"
                  >
                    <FaEdit size={16} />
                  </button>

                  <button
                    type="button"
                    onClick={() => deleteCategory(item._id)}
                    title="Delete category"
                    className="cursor-pointer rounded-xl p-2.5 text-slate-400 transition-all hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
                  >
                    <FaTrash size={16} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full rounded-2xl border-2 border-dashed border-slate-200 py-20 text-center text-slate-400 dark:border-slate-700">
              No categories available yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;