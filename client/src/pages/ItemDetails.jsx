import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import Card from "../components/Card";
import Badge from "../components/Badge";
import Button from "../components/Button";
import Modal from "../components/Modal";
import Textarea from "../components/Textarea";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Clock,
  User,
  Trash2,
  Calendar,
  Send,
  Lock,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

const FALLBACK_IMAGE =
  "https://placehold.co/800x600/e2e8f0/64748b?text=No+Image+Available";

// Helper: Format Date to YYYY-MM-DD for HTML date inputs
const formatDateInput = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function ItemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Request form state
  const todayStr = formatDateInput(new Date());
  const tomorrowStr = formatDateInput(new Date(Date.now() + 86400000));

  const [fromDate, setFromDate] = useState(tomorrowStr);
  const [dueDate, setDueDate] = useState("");
  const [message, setMessage] = useState("");
  const [requestError, setRequestError] = useState("");
  const [requestSuccess, setRequestSuccess] = useState(false);

  // Fetch Item details
  useEffect(() => {
    let isActive = true;

    const fetchItem = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(`/items/${id}`);
        if (isActive && response.data?.success) {
          const fetchedItem = response.data.data;
          setItem(fetchedItem);

          // Prepopulate dueDate based on maxDays
          const defaultDue = new Date(Date.now() + 86400000 + (fetchedItem.maxDays || 3) * 86400000);
          setDueDate(formatDateInput(defaultDue));
        }
      } catch (err) {
        if (isActive) {
          console.error("Failed to load item:", err);
          setError(
            err.response?.data?.message ||
              err.userFriendlyMessage ||
              "Cannot reach server. Please try again."
          );
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    fetchItem();

    return () => {
      isActive = false;
    };
  }, [id]);

  // Handle Delete Item
  const handleDeleteItem = async () => {
    setIsActionLoading(true);
    try {
      const response = await api.delete(`/items/${id}`);
      toast.success(response.data?.message || "Item deleted successfully!");
      navigate("/items", { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to delete item.";
      toast.error(msg);
      setIsDeleteModalOpen(false);
    } finally {
      setIsActionLoading(false);
    }
  };

  // Handle Borrow Request Submit
  const handleBorrowRequest = async (e) => {
    e.preventDefault();
    setRequestError("");

    if (!fromDate || !dueDate) {
      setRequestError("Please specify both fromDate and dueDate.");
      return;
    }

    const start = new Date(fromDate);
    const end = new Date(dueDate);

    if (end <= start) {
      setRequestError("Due date must be after the start date.");
      return;
    }

    const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    if (diffDays > item.maxDays) {
      setRequestError(
        `Borrow period cannot exceed ${item.maxDays} days for this item (you selected ${diffDays} days).`
      );
      return;
    }

    setIsActionLoading(true);
    try {
      const payload = {
        itemId: item._id,
        fromDate,
        dueDate,
        message: message.trim(),
      };

      const response = await api.post("/requests", payload);
      if (response.data?.success) {
        toast.success(response.data.message || "Borrow request sent successfully!");
        setRequestSuccess(true);
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Could not send borrow request.";
      toast.error(msg);
      setRequestError(msg);
    } finally {
      setIsActionLoading(false);
    }
  };

  // Determine viewer relationship
  const isOwner =
    isAuthenticated &&
    user &&
    item &&
    (item.owner?._id === user._id || item.owner === user._id);

  const isAvailable = item?.status === "Available";
  const isBorrowed = item?.status === "Borrowed";

  // Calculate max allowable due date based on chosen fromDate
  const maxDueDate = fromDate
    ? formatDateInput(new Date(new Date(fromDate).getTime() + (item?.maxDays || 7) * 86400000))
    : "";

  // 1. Loading Skeleton
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full animate-pulse space-y-6">
        <div className="h-4 bg-slate-200 rounded w-28" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="aspect-[4/3] bg-slate-200 rounded-3xl" />
          <div className="space-y-4">
            <div className="h-8 bg-slate-200 rounded w-3/4" />
            <div className="h-4 bg-slate-200 rounded w-1/4" />
            <div className="h-20 bg-slate-200 rounded w-full" />
            <div className="h-12 bg-slate-200 rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  // 2. 404 / Error State
  if (error || !item) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Item Not Found</h2>
        <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">
          {error || "The item you are looking for does not exist or may have been removed."}
        </p>
        <Link to="/items">
          <Button variant="secondary">Browse All Items</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full space-y-8">
      {/* Back Link */}
      <div>
        <Link
          to="/items"
          className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to browse
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
        {/* Left Column: Image & Badges */}
        <div className="space-y-4">
          <div className="relative aspect-[4/3] w-full rounded-3xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-md">
            <img
              src={item.imageUrl || FALLBACK_IMAGE}
              alt={item.title}
              onError={(e) => {
                e.target.src = FALLBACK_IMAGE;
              }}
              className="w-full h-full object-cover"
            />
            {/* Status Badge */}
            <div className="absolute top-4 right-4 shadow-sm">
              <Badge status={item.status} className="text-sm px-3 py-1" />
            </div>

            {/* Category Chip */}
            <div className="absolute bottom-4 left-4">
              <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white/95 backdrop-blur-md text-slate-800 shadow-sm border border-white/60">
                {item.category}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Details & Action Decision Box */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100">
                {item.condition} Condition
              </span>
              <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" /> Max {item.maxDays} days per borrow
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {item.title}
            </h1>
          </div>

          {/* Owner details */}
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-slate-100 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <User className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-400 font-medium">Item Owner</p>
              <p className="text-sm font-semibold text-slate-800 truncate">
                {item.owner?.name || "Fellow Student"}
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Description & Notes
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line bg-white p-4 rounded-2xl border border-slate-100">
              {item.description || "No specific details provided by the owner."}
            </p>
          </div>

          {/* Action Decision Engine Box */}
          <Card className="p-6 border-slate-200/90 bg-slate-50/50 shadow-sm space-y-4">
            {/* Case 1: Viewer is Logged Out */}
            {!isAuthenticated && (
              <div className="space-y-3">
                <p className="text-sm text-slate-600">
                  Interested in borrowing this item? Sign in or register to request it from{" "}
                  <span className="font-semibold text-slate-800">{item.owner?.name}</span>.
                </p>
                <Button
                  onClick={() => navigate("/login", { state: { from: { pathname: `/items/${id}` } } })}
                  className="w-full justify-center text-base py-3"
                >
                  Log In to Borrow
                </Button>
              </div>
            )}

            {/* Case 2: Viewer is the Owner */}
            {isAuthenticated && isOwner && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-indigo-700 text-sm font-semibold">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span>This is your listed item</span>
                  </div>
                  <Badge status={item.status} />
                </div>

                {isBorrowed ? (
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 text-amber-800 text-xs">
                    This item is currently out on loan and cannot be deleted until it is returned.
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">
                    You can manage or delete this item whenever it is not actively borrowed.
                  </p>
                )}

                <Button
                  variant="danger"
                  disabled={isBorrowed}
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="w-full justify-center"
                >
                  <Trash2 className="w-4 h-4 mr-1.5" />
                  {isBorrowed ? "Cannot Delete (Currently Borrowed)" : "Delete Item Listing"}
                </Button>
              </div>
            )}

            {/* Case 3: Viewer is Another User & Item is Borrowed */}
            {isAuthenticated && !isOwner && isBorrowed && (
              <div className="space-y-3 text-center py-2">
                <div className="w-10 h-10 mx-auto rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Lock className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-800 text-sm">Currently Borrowed</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Another student currently has this item. Check back soon once it has been returned!
                </p>
                <Button variant="secondary" disabled className="w-full justify-center opacity-70">
                  Item Unavailable
                </Button>
              </div>
            )}

            {/* Case 4: Viewer is Another User & Item is Available */}
            {isAuthenticated && !isOwner && isAvailable && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Available for loan
                  </span>
                  <span className="text-slate-500">Free to borrow</span>
                </div>
                <Button
                  onClick={() => {
                    setRequestSuccess(false);
                    setIsRequestModalOpen(true);
                  }}
                  className="w-full justify-center text-base py-3"
                >
                  <Send className="w-4 h-4 mr-1.5" /> Request to Borrow
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Confirmation Modal: Delete Item */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Item Listing"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 leading-relaxed">
            Are you sure you want to delete <span className="font-bold text-slate-900">"{item.title}"</span>? Any pending borrow requests for this item will also be removed. This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="secondary"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isActionLoading}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              isLoading={isActionLoading}
              onClick={handleDeleteItem}
            >
              Confirm Delete
            </Button>
          </div>
        </div>
      </Modal>

      {/* Borrow Request Modal */}
      <Modal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        title={`Borrow: ${item.title}`}
        maxWidth="max-w-lg"
      >
        {requestSuccess ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Request Sent Successfully!</h3>
            <p className="text-sm text-slate-600 max-w-sm mx-auto">
              Your request was sent to <span className="font-semibold">{item.owner?.name}</span>. You can track its status under the "My Requests" tab on your Dashboard.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <Button variant="secondary" onClick={() => setIsRequestModalOpen(false)}>
                Close
              </Button>
              <Button onClick={() => navigate("/dashboard")}>
                View My Requests
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleBorrowRequest} className="space-y-4">
            <p className="text-xs text-slate-500">
              Pick the dates you need this item. The owner will review your request.
            </p>

            {requestError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {requestError}
              </div>
            )}

            {/* Dates Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700">
                  Borrow From *
                </label>
                <div className="relative">
                  <input
                    type="date"
                    min={todayStr}
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                    required
                  />
                  <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700">
                  Return Due Date *
                </label>
                <div className="relative">
                  <input
                    type="date"
                    min={fromDate || todayStr}
                    max={maxDueDate}
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                    required
                  />
                  <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-400">
              Maximum borrow period: <span className="font-semibold text-slate-600">{item.maxDays} days</span> from start date.
            </p>

            {/* Message Box */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <label className="font-medium text-slate-700">Message to Owner (Optional)</label>
                <span className="text-slate-400">{message.length}/200</span>
              </div>
              <Textarea
                rows={3}
                maxLength={200}
                placeholder="Hi, I need this for my end-term exam. I'll take good care of it!"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsRequestModalOpen(false)}
                disabled={isActionLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                isLoading={isActionLoading}
              >
                Submit Request
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
