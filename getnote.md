# Documentation: Get Note Functionality

This document explains the implementation of the "Get Note" feature, which allows the application to retrieve data from two different database systems: **MongoDB** and **Supabase (PostgreSQL)**.

## 1. Overview
The "Get Note" functionality is part of **Phase 3 (Database Integration)** and **Phase 4 (Separation of Concerns)**. It demonstrates how the same API can serve data from different storage engines using a unified controller-route structure.

## 2. Route Definition
The routes are defined in `src/routes/v2/notes.routes.js`.

### MongoDB Route
- **Endpoint:** `GET /api/v2/notes`
- **Controller:** `getNotes`
- **Access:** Public

### Supabase (PostgreSQL) Route
- **Endpoint:** `GET /api/v2/notes/pg`
- **Controller:** `getNotesPG`
- **Access:** Public

---

## 3. Controller Implementation
The logic resides in `src/modules/notes/notes.v2.controller.js`.

### MongoDB Implementation (`getNotes`)
Uses **Mongoose** to interact with the MongoDB collection.
```javascript
export const getNotes = async (req, res, next) => {
    try {
        const notes = await Note.find();
        return res.status(200).json({ success: true, data: notes });
    } catch (err) {
        next(err); // Passes error to Centralized Error Handler (Phase 5)
    }
};
```

### Supabase Implementation (`getNotesPG`)
Uses the **Supabase Client** to perform a SQL query.
```javascript
const PG_SELECT = "id, title, content, isCompleted:is_completed, created_at, updated_at";

export const getNotesPG = async (req, res, next) => {
    try {
        const { data, error } = await supabase.from("notes").select(PG_SELECT);

        if (error) throw error;

        return res.status(200).json({ success: true, data });
    } catch (err) {
        next(err);
    }
};
```

---

## 4. Architectural Patterns Used

### A. Separation of Concerns (SoC)
The logic for *what* to do (Controller) is separated from *where* the request comes from (Route). This makes the code modular and easier to maintain.

### B. Dual-Database Competency
The application demonstrates the ability to handle:
- **NoSQL (MongoDB):** Flexible document-based storage using Mongoose ODM.
- **SQL (PostgreSQL):** Relational data storage using Supabase's PostgREST interface.

### C. Error Handling
Both functions use the `try...catch` block and pass any caught errors to `next(err)`. This triggers the **Centralized Error Handling** (Phase 5), ensuring the client always receives a clean, structured error response instead of a server crash.

## 5. Summary
The "Get Note" feature is a perfect example of a modern, scalable backend. It is clean, handles errors gracefully, and is ready to be expanded with more complex logic like filtering or pagination.
