import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import Card from "../components/Card";
import Badge from "../components/Badge";
import Button from "../components/Button";
import EmptyState from "../components/EmptyState";
import Modal from "../components/Modal";
import toast from "react-hot-toast";
import { formatDate, isOverdue, daysLeft } from "../utils/dateHelpers";
import {
  Package,
  Send,
  Inbox,
  AlertTriangle,
  Clock,
  User,
  Mail,
  Trash2,
  CheckCircle,
  XCircle,
  RotateCcw,
  ExternalLink,
  PlusCircle,
  MessageSquare,
  Calendar,
} from "lucide-react";

const VALID_TABS = ["items", "my-requests", "incoming"];

export default function Dashboard() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Tab State synced with URL query (?tab=...)
  const currentTab = searchParams.get("tab") || "items";
  const activeTab = VALID_TABS.includes(currentTab) ? currentTab : "items";

  const setActiveTab = (tab) => {
    setSearchParams({ tab });
  };

  // Data States
  const [myItems, setMyItems] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Action Loading state tracking which item/request is currently busy
  const [processingId, setProcessingId] = useState(null);

  // Delete Modal State
  const [itemToDelete, setItemToDelete] = useState(null);

  // Fetch all dashboard data concurrently
  const loadDashboardData = async (isSilent = false) => {
    if (!isSilent) setLoading(true);

    try {
      const [itemsRes, myReqsRes, incomingRes] = await Promise.all([
        api.get("/items/mine"),
        api.get("/requests/mine"),
        api.get("/requests/incoming"),
      ]);

      if (itemsRes.data?.success) setMyItems(itemsRes.data.data || []);
      if (myReqsRes.data?.success) setMyRequests(myReqsRes.data.data || []);
      if (incomingRes.data?.success) setIncomingRequests(incomingRes.data.data || []);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      toast.error(
        err.response?.data?.message ||
          err.userFriendlyMessage ||
          "Failed to load dashboard data. Please try again."
      );
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // ── Actions ─────────────────────────────────────────────────────────

  // 1. Delete Item
  const handleDeleteItem = async () => {
    if (!itemToDelete) return;

    setProcessingId(itemToDelete._id);
    try {
      const res = await api.delete(`/items/${itemToDelete._id}`);
      toast.success(res.data?.message || "Item deleted successfully!");
      setItemToDelete(null);
      await loadDashboardData(true);
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          err.userFriendlyMessage ||
          "Failed to delete item."
      );
    } finally {
      setProcessingId(null);
    }
  };

  // 2. Approve Request
  const handleApprove = async (requestId) => {
    setProcessingId(requestId);
    try {
      const res = await api.put(`/requests/${requestId}/approve`);
      toast.success(res.data?.message || "Request approved!");
      await loadDashboardData(true);
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          err.userFriendlyMessage ||
          "Failed to approve request."
      );
    } finally {
      setProcessingId(null);
    }
  };

  // 3. Reject Request
  const handleReject = async (requestId) => {
    setProcessingId(requestId);
    try {
      const res = await api.put(`/requests/${requestId}/reject`);
      toast.success(res.data?.message || "Request rejected.");
      await loadDashboardData(true);
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          err.userFriendlyMessage ||
          "Failed to reject request."
      );
    } finally {
      setProcessingId(null);
    }
  };

  // 4. Return Request
  const handleReturn = async (requestId) => {
    setProcessingId(requestId);
    try {
      const res = await api.put(`/requests/${requestId}/return`);
      toast.success(res.data?.message || "Item marked as returned!");
      await loadDashboardData(true);
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          err.userFriendlyMessage ||
          "Failed to mark as returned."
      );
    } finally {
      setProcessingId(null);
    }
  };

  // Compute live pending incoming count
  const pendingIncomingCount = incomingRequests.filter((r) => r.status === "Pending").length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 w-full space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-950/10">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <span className="text-xs uppercase tracking-wider font-semibold text-emerald-300 bg-emerald-400/20 px-3 py-1 rounded-full border border-emerald-400/30">
              Personal Dashboard
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Hello, {user?.name || "Student"} 👋
            </h1>
            <p className="text-indigo-200 text-xs sm:text-sm max-w-lg">
              Manage your listed items, your borrow requests, and approve loan inquiries from peers.
            </p>
          </div>

          <div>
            <Link to="/add-item">
              <Button size="sm" className="bg-white text-indigo-900 hover:bg-slate-100 font-semibold shadow-md">
                <PlusCircle className="w-4 h-4 mr-1.5" /> List New Item
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 3 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Stat 1: My Items */}
        <button
          onClick={() => setActiveTab("items")}
          className="text-left cursor-pointer focus:outline-none"
        >
          <Card
            hoverEffect
            className={`p-5 transition-all ${
              activeTab === "items" ? "ring-2 ring-indigo-600 bg-indigo-50/20" : ""
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                My Listed Items
              </span>
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Package className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-extrabold text-slate-900">
                {loading ? "..." : myItems.length}
              </span>
              <span className="text-xs text-slate-400 ml-2">items online</span>
            </div>
          </Card>
        </button>

        {/* Stat 2: My Requests */}
        <button
          onClick={() => setActiveTab("my-requests")}
          className="text-left cursor-pointer focus:outline-none"
        >
          <Card
            hoverEffect
            className={`p-5 transition-all ${
              activeTab === "my-requests" ? "ring-2 ring-indigo-600 bg-indigo-50/20" : ""
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Requests I Sent
              </span>
              <div className="w-9 h-9 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                <Send className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-extrabold text-slate-900">
                {loading ? "..." : myRequests.length}
              </span>
              <span className="text-xs text-slate-400 ml-2">total loans requested</span>
            </div>
          </Card>
        </button>

        {/* Stat 3: Incoming Pending Requests */}
        <button
          onClick={() => setActiveTab("incoming")}
          className="text-left cursor-pointer focus:outline-none"
        >
          <Card
            hoverEffect
            className={`p-5 transition-all ${
              activeTab === "incoming" ? "ring-2 ring-indigo-600 bg-indigo-50/20" : ""
            } ${pendingIncomingCount > 0 ? "border-amber-200 bg-amber-50/20" : ""}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Action Needed
              </span>
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  pendingIncomingCount > 0
                    ? "bg-amber-100 text-amber-700 font-bold"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                <Inbox className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div>
                <span className="text-3xl font-extrabold text-slate-900">
                  {loading ? "..." : pendingIncomingCount}
                </span>
                <span className="text-xs text-slate-400 ml-2">pending approval</span>
              </div>
              {pendingIncomingCount > 0 && (
                <span className="text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                  Respond now
                </span>
              )}
            </div>
          </Card>
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-8 -mb-px">
          <button
            onClick={() => setActiveTab("items")}
            className={`py-3.5 px-1 border-b-2 font-semibold text-sm transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === "items"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
            }`}
          >
            <Package className="w-4 h-4" />
            My Items ({myItems.length})
          </button>

          <button
            onClick={() => setActiveTab("my-requests")}
            className={`py-3.5 px-1 border-b-2 font-semibold text-sm transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === "my-requests"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
            }`}
          >
            <Send className="w-4 h-4" />
            My Requests ({myRequests.length})
          </button>

          <button
            onClick={() => setActiveTab("incoming")}
            className={`py-3.5 px-1 border-b-2 font-semibold text-sm transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === "incoming"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
            }`}
          >
            <Inbox className="w-4 h-4" />
            Incoming Requests ({incomingRequests.length})
            {pendingIncomingCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            )}
          </button>
        </nav>
      </div>

      {/* Tab Content Loading Skeleton */}
      {loading && (
        <div className="space-y-4 animate-pulse">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="p-6">
              <div className="flex gap-4">
                <div className="w-20 h-20 bg-slate-200 rounded-xl" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-slate-200 rounded w-1/3" />
                  <div className="h-3 bg-slate-200 rounded w-1/4" />
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ── TAB 1: MY ITEMS ────────────────────────────────────────── */}
      {!loading && activeTab === "items" && (
        <div className="space-y-4">
          {myItems.length === 0 ? (
            <EmptyState
              icon={Package}
              title="You haven't listed any items yet"
              text="Put your idle calculators, textbooks, sports gear, or lab equipment to good use."
              action={
                <Link to="/add-item">
                  <Button size="sm">
                    <PlusCircle className="w-4 h-4 mr-1.5" /> List Your First Item
                  </Button>
                </Link>
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myItems.map((item) => (
                <Card key={item._id} className="flex flex-col justify-between overflow-hidden">
                  <div>
                    <div className="aspect-[16/9] w-full bg-slate-100 relative">
                      <img
                        src={item.imageUrl || "https://placehold.co/400x300"}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = "https://placehold.co/400x300";
                        }}
                      />
                      <div className="absolute top-3 right-3 shadow-sm">
                        <Badge status={item.status} />
                      </div>
                      <div className="absolute bottom-3 left-3">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-white/95 text-slate-800 shadow-sm">
                          {item.category}
                        </span>
                      </div>
                    </div>

                    <div className="p-5 space-y-2">
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>{item.condition} Condition</span>
                        <span>Max {item.maxDays}d</span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-base line-clamp-1">
                        {item.title}
                      </h3>
                      {item.description && (
                        <p className="text-xs text-slate-500 line-clamp-2">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                    <Link to={`/items/${item._id}`}>
                      <Button variant="secondary" size="sm">
                        <ExternalLink className="w-3.5 h-3.5 mr-1" /> View Listing
                      </Button>
                    </Link>

                    <Button
                      variant="danger"
                      size="sm"
                      disabled={item.status === "Borrowed" || processingId === item._id}
                      onClick={() => setItemToDelete(item)}
                      title={
                        item.status === "Borrowed"
                          ? "Cannot delete while currently borrowed"
                          : "Delete item"
                      }
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: MY REQUESTS (SENT BY ME) ────────────────────────── */}
      {!loading && activeTab === "my-requests" && (
        <div className="space-y-4">
          {myRequests.length === 0 ? (
            <EmptyState
              icon={Send}
              title="You haven't requested any items"
              text="Need a calculator or textbook? Browse items shared by campus peers and send a request."
              action={
                <Link to="/items">
                  <Button size="sm">
                    <ExternalLink className="w-4 h-4 mr-1.5" /> Browse Items
                  </Button>
                </Link>
              }
            />
          ) : (
            <div className="space-y-4">
              {myRequests.map((req) => {
                const overdue = isOverdue(req.dueDate, req.status);
                const remaining = daysLeft(req.dueDate);

                return (
                  <Card key={req._id} className="p-5 sm:p-6 transition-all hover:border-slate-200">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      {/* Left: Item Thumbnail & Info */}
                      <div className="flex items-start gap-4 min-w-0">
                        <img
                          src={req.item?.imageUrl || "https://placehold.co/100x100"}
                          alt={req.item?.title || "Item"}
                          className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover bg-slate-100 flex-shrink-0 border border-slate-200/80"
                          onError={(e) => {
                            e.target.src = "https://placehold.co/100x100";
                          }}
                        />

                        <div className="space-y-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-bold text-slate-900 text-base truncate">
                              {req.item?.title || "Unknown Item"}
                            </h3>
                            <Badge status={req.status} />
                            {overdue && <Badge status="Overdue" />}
                          </div>

                          <p className="text-xs text-slate-500 flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            Owner: <span className="font-semibold text-slate-700">{req.owner?.name || "Student"}</span>
                          </p>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-1">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              {formatDate(req.fromDate)} – {formatDate(req.dueDate)}
                            </span>

                            {req.status === "Approved" && (
                              <span
                                className={`font-semibold flex items-center gap-1 ${
                                  overdue ? "text-rose-600 font-bold" : "text-indigo-600"
                                }`}
                              >
                                <Clock className="w-3.5 h-3.5" />
                                {remaining}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: View Link */}
                      <div className="flex-shrink-0 self-end sm:self-center">
                        {req.item?._id && (
                          <Link to={`/items/${req.item._id}`}>
                            <Button variant="ghost" size="sm">
                              View Item <ExternalLink className="w-3.5 h-3.5 ml-1" />
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>

                    {/* Borrower's note if any */}
                    {req.message && (
                      <div className="mt-3.5 pt-3 border-t border-slate-100 text-xs text-slate-600 flex items-start gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                        <span className="italic">"{req.message}"</span>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 3: INCOMING REQUESTS (ON MY ITEMS) ──────────────────── */}
      {!loading && activeTab === "incoming" && (
        <div className="space-y-4">
          {incomingRequests.length === 0 ? (
            <EmptyState
              icon={Inbox}
              title="No incoming requests yet"
              text="When other students request to borrow your listed items, they will appear right here for approval."
              action={
                <Link to="/add-item">
                  <Button size="sm">
                    <PlusCircle className="w-4 h-4 mr-1.5" /> List More Items
                  </Button>
                </Link>
              }
            />
          ) : (
            <div className="space-y-4">
              {incomingRequests.map((req) => {
                const overdue = isOverdue(req.dueDate, req.status);
                const remaining = daysLeft(req.dueDate);
                const isProcessing = processingId === req._id;

                return (
                  <Card key={req._id} className="p-5 sm:p-6 transition-all hover:border-slate-200">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                      {/* Left & Middle: Details */}
                      <div className="flex items-start gap-4 min-w-0">
                        <img
                          src={req.item?.imageUrl || "https://placehold.co/100x100"}
                          alt={req.item?.title || "Item"}
                          className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover bg-slate-100 flex-shrink-0 border border-slate-200/80"
                          onError={(e) => {
                            e.target.src = "https://placehold.co/100x100";
                          }}
                        />

                        <div className="space-y-1.5 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-bold text-slate-900 text-base truncate">
                              {req.item?.title || "Item"}
                            </h3>
                            <Badge status={req.status} />
                            {overdue && <Badge status="Overdue" />}
                          </div>

                          {/* Borrower Contact Information */}
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
                            <span className="flex items-center gap-1 font-semibold text-slate-800">
                              <User className="w-3.5 h-3.5 text-indigo-600" />
                              {req.borrower?.name || "Student"}
                            </span>
                            <a
                              href={`mailto:${req.borrower?.email}`}
                              className="flex items-center gap-1 text-indigo-600 hover:underline"
                            >
                              <Mail className="w-3.5 h-3.5" />
                              {req.borrower?.email}
                            </a>
                          </div>

                          {/* Date Range & Remaining */}
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-0.5">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              {formatDate(req.fromDate)} – {formatDate(req.dueDate)}
                            </span>

                            {req.status === "Approved" && (
                              <span
                                className={`font-semibold flex items-center gap-1 ${
                                  overdue ? "text-rose-600 font-bold" : "text-indigo-600"
                                }`}
                              >
                                <Clock className="w-3.5 h-3.5" />
                                {remaining}
                              </span>
                            )}
                          </div>

                          {/* Message snippet */}
                          {req.message && (
                            <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 italic">
                              "{req.message}"
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right: Owner Action Buttons */}
                      <div className="flex flex-wrap items-center gap-2 flex-shrink-0 self-end lg:self-center">
                        {/* Pending: Approve or Reject */}
                        {req.status === "Pending" && (
                          <>
                            <Button
                              size="sm"
                              disabled={isProcessing}
                              isLoading={isProcessing}
                              onClick={() => handleApprove(req._id)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" /> Approve
                            </Button>

                            <Button
                              variant="danger"
                              size="sm"
                              disabled={isProcessing}
                              isLoading={isProcessing}
                              onClick={() => handleReject(req._id)}
                            >
                              <XCircle className="w-4 h-4 mr-1" /> Reject
                            </Button>
                          </>
                        )}

                        {/* Approved: Mark as Returned */}
                        {req.status === "Approved" && (
                          <Button
                            size="sm"
                            disabled={isProcessing}
                            isLoading={isProcessing}
                            onClick={() => handleReturn(req._id)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200"
                          >
                            <RotateCcw className="w-4 h-4 mr-1.5" /> Mark Returned
                          </Button>
                        )}

                        {/* Rejected & Returned: Static status notes */}
                        {req.status === "Returned" && (
                          <span className="text-xs text-slate-500 font-medium px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200/60">
                            Completed & Returned
                          </span>
                        )}

                        {req.status === "Rejected" && (
                          <span className="text-xs text-rose-600 font-medium px-3 py-1.5 bg-rose-50 rounded-xl border border-rose-200/60">
                            Request Declined
                          </span>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Delete Item Confirmation Modal */}
      <Modal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        title="Delete Item Listing"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 leading-relaxed">
            Are you sure you want to delete{" "}
            <span className="font-bold text-slate-900">"{itemToDelete?.title}"</span>? All pending borrow requests for this item will also be removed. This cannot be undone.
          </p>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setItemToDelete(null)}
              disabled={!!processingId}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              isLoading={!!processingId}
              onClick={handleDeleteItem}
            >
              Confirm Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
