// Dashboard.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { certificates } from "./certificates";
import "./App.css";

export default function Dashboard() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const filtered = certificates.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="app">
      <h1>Certificate Services</h1>

      <input
        className="search"
        placeholder="Search certificate..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="card-grid">
        {filtered.map((c) => (
          <div key={c.id} className="card" onClick={() => navigate(c.path)}>
            <h3>{c.title}</h3>
            <p>{c.description}</p>
          </div>
        ))}

        {filtered.length === 0 && <p>No certificates found</p>}
      </div>
    </div>
  );
}
