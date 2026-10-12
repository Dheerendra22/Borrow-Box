# BorrowBox: MVP Brief

## Idea
BorrowBox is a MERN web app where students lend and borrow items (calculators, lab coats, sports gear, books, chargers) instead of buying things they need only once. Tagline: "Don't buy it, borrow it."

## Tech Stack (MERN only)
- MongoDB Atlas + Mongoose
- Express + Node.js
- React (Vite) + React Router + Axios
- Styling: Tailwind CSS + lucide-react icons
- Auth: JWT + bcryptjs
- Folders: /server and /client

## MVP Features (build ONLY these)
1. Register / Login with JWT
2. Add, view, and delete own items (image stored as an imageUrl text field)
3. Browse all items with search and category filter
4. Send a borrow request (cannot borrow own item, item must be Available)
5. Owner approves or rejects a request
6. Owner marks an item as Returned
7. Dashboard with 3 tabs: My Items, My Requests, Incoming Requests
8. "Overdue" label when dueDate has passed and request is still Approved

## Data Models
- User: name, email (unique), password (hashed), timestamps
- Item: owner (ref User), title, description, category, condition, imageUrl, status (Available | Borrowed), maxDays, timestamps
- BorrowRequest: item (ref Item), borrower (ref User), owner (ref User), fromDate, dueDate, message, status (Pending | Approved | Rejected | Returned), timestamps

## API Contract (frontend and backend MUST follow this exactly)
Every response uses this shape:
  Success: { "success": true, "message": "...", "data": ... }
  Error:   { "success": false, "message": "..." }

Endpoints (all under /api):
- POST /auth/register  → data: { user, token }
- POST /auth/login     → data: { user, token }
- GET  /auth/me        (protected) → data: user
- POST /items          (protected)
- GET  /items          (public) supports ?search= and ?category=, only returns items, newest first, owner populated with name
- GET  /items/mine     (protected)
- GET  /items/:id      (public) owner populated with name
- DELETE /items/:id    (protected, owner only, cannot delete if Borrowed)
- POST /requests       (protected) body: { itemId, fromDate, dueDate, message }
- GET  /requests/mine      (protected) requests I made, item populated
- GET  /requests/incoming  (protected) requests on my items, item and borrower populated
- PUT  /requests/:id/approve (protected, owner only)
- PUT  /requests/:id/reject  (protected, owner only)
- PUT  /requests/:id/return  (protected, owner only)

## Business Rules
- A user cannot request their own item.
- An item can be requested only when status is Available.
- A user cannot create a duplicate Pending request for the same item.
- dueDate must be after fromDate, and not more than the item's maxDays after fromDate.
- Approve: request becomes Approved, item becomes Borrowed, all other Pending requests for that item are auto-rejected.
- Reject: request becomes Rejected.
- Return: only allowed on Approved requests; request becomes Returned, item becomes Available.
- Only the item owner can approve, reject, or mark returned.

## Code Rules for the Agent
- Work on ONE phase at a time. Stop at the end of each phase and tell me exactly how to test it.
- Keep code simple, readable, and commented in plain English so a beginner can understand it.
- Server structure: config, models, controllers, routes, middleware, utils.
- Client structure: api, context, components, pages, hooks.
- Use .env for all secrets. Never hardcode them. Keep .env in .gitignore.
- Use a central error-handling middleware and async handlers on the server.
- Never add features outside the MVP list.
