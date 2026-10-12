/**
 * Date helper utilities for BorrowBox
 */

// Format ISO date string into readable format: "Oct 14, 2026"
export const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

// Returns true if the request is Approved and the dueDate has passed
export const isOverdue = (dueDate, status) => {
  if (status !== "Approved" || !dueDate) return false;

  const due = new Date(dueDate);
  due.setHours(23, 59, 59, 999); // allow the full due day before flagging overdue

  const now = new Date();
  return now > due;
};

// Calculates human-readable time remaining for an Approved loan
export const daysLeft = (dueDate) => {
  if (!dueDate) return "";

  const due = new Date(dueDate);
  due.setHours(23, 59, 59, 999);

  const now = new Date();
  const diffMs = due - now;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const overdueDays = Math.abs(diffDays);
    return `${overdueDays} ${overdueDays === 1 ? "day" : "days"} overdue`;
  }
  if (diffDays === 0) {
    return "Due today";
  }
  if (diffDays === 1) {
    return "1 day left";
  }
  return `${diffDays} days left`;
};
