import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Button from "../components/Button";
import Input from "../components/Input";
import Select from "../components/Select";
import Textarea from "../components/Textarea";
import Card from "../components/Card";
import toast from "react-hot-toast";
import { PlusCircle, Image as ImageIcon, ArrowLeft, Clock, ShieldCheck } from "lucide-react";

const CATEGORIES = [
  "Electronics",
  "Books",
  "Lab Equipment",
  "Sports",
  "Stationery",
  "Clothing",
  "Other",
];

const CONDITIONS = ["New", "Good", "Fair"];

const DEFAULT_IMAGE_PLACEHOLDER =
  "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&h=600&fit=crop";

export default function AddItem() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Electronics");
  const [condition, setCondition] = useState("Good");
  const [maxDays, setMaxDays] = useState(7);
  const [imageUrl, setImageUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Sync image preview when imageUrl changes
  const handleImageUrlChange = (e) => {
    const val = e.target.value;
    setImageUrl(val);
    setPreviewUrl(val.trim() || "");
  };

  const validate = () => {
    const errs = {};
    if (!title.trim()) errs.title = "Item title is required";
    if (!category) errs.category = "Category is required";
    if (!condition) errs.condition = "Condition is required";

    const days = Number(maxDays);
    if (isNaN(days) || days < 1 || days > 30) {
      errs.maxDays = "Borrow period must be between 1 and 30 days";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        category,
        condition,
        maxDays: Number(maxDays),
        ...(imageUrl.trim() && { imageUrl: imageUrl.trim() }),
      };

      const response = await api.post("/items", payload);
      if (response.data?.success) {
        toast.success(response.data.message || "Item listed successfully!");
        const newItem = response.data.data;
        navigate(`/items/${newItem._id}`);
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to list item. Please try again.";
      toast.error(msg);
      setErrors((prev) => ({ ...prev, form: msg }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
      {/* Top Navigation */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 transition cursor-pointer mb-3"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
        </button>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          List an Item to Lend
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Share your calculator, textbook, or gear with other students on campus.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Column */}
        <div className="lg:col-span-2">
          <Card className="p-6 sm:p-8">
            {errors.form && (
              <div className="p-3.5 mb-6 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium">
                {errors.form}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Title */}
              <Input
                label="Item Title *"
                placeholder="e.g. Casio FX-991EX Scientific Calculator"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errors.title) setErrors((prev) => ({ ...prev, title: "" }));
                }}
                error={errors.title}
                required
              />

              {/* Category & Condition */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Category *"
                  options={CATEGORIES}
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  error={errors.category}
                />

                <Select
                  label="Condition *"
                  options={CONDITIONS}
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  error={errors.condition}
                />
              </div>

              {/* Borrow Duration */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">
                  Maximum Borrow Duration (Days) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={maxDays}
                    onChange={(e) => {
                      setMaxDays(e.target.value);
                      if (errors.maxDays) setErrors((prev) => ({ ...prev, maxDays: "" }));
                    }}
                    className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-slate-900 text-sm pl-10 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 ${
                      errors.maxDays ? "border-rose-500" : "border-slate-200"
                    }`}
                    required
                  />
                  <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                </div>
                <p className="text-xs text-slate-400">
                  Students can request this item for up to {maxDays || 7} days per borrow.
                </p>
                {errors.maxDays && <p className="text-xs text-rose-500">{errors.maxDays}</p>}
              </div>

              {/* Image URL */}
              <div className="space-y-1.5">
                <Input
                  label="Image URL (Optional)"
                  placeholder="https://images.unsplash.com/..."
                  value={imageUrl}
                  onChange={handleImageUrlChange}
                  error={errors.imageUrl}
                />
                <p className="text-xs text-slate-400">
                  Paste a direct link to an image. Leave empty to use a default placeholder.
                </p>
              </div>

              {/* Description */}
              <Textarea
                label="Description & Notes"
                rows={4}
                placeholder="Mention size, edition, included accessories, or pickup spot on campus..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

              {/* Submit Button */}
              <Button
                type="submit"
                isLoading={isLoading}
                className="w-full justify-center text-base py-3"
              >
                <PlusCircle className="w-5 h-5 mr-1.5" /> Publish Item
              </Button>
            </form>
          </Card>
        </div>

        {/* Live Preview Column */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Live Preview Card
          </h3>
          <Card className="overflow-hidden border border-slate-200/80 shadow-md">
            <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
              <img
                src={previewUrl || DEFAULT_IMAGE_PLACEHOLDER}
                alt="Preview"
                onError={(e) => {
                  e.target.src = DEFAULT_IMAGE_PLACEHOLDER;
                }}
                className="w-full h-full object-cover"
              />
              <span className="absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 shadow-sm">
                Available
              </span>
              <span className="absolute bottom-3 left-3 text-xs font-medium px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-md text-slate-800 shadow-sm">
                {category}
              </span>
            </div>
            <div className="p-4 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                  {condition} Condition
                </span>
                <span>Max {maxDays || 7} days</span>
              </div>
              <h4 className="font-bold text-slate-900 text-sm line-clamp-1">
                {title || "Your Item Title Here"}
              </h4>
              <p className="text-xs text-slate-500 line-clamp-2">
                {description || "Item description will show here for borrowers to review."}
              </p>
            </div>
          </Card>

          <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-xs text-indigo-700 space-y-1.5">
            <div className="flex items-center gap-1.5 font-semibold">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>Campus Community Guidelines</span>
            </div>
            <p className="text-indigo-900/80 leading-relaxed">
              Ensure all items are safe, clean, and in working condition. You always retain ownership and approve who borrows your item.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
