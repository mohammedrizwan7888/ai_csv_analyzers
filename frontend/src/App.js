import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  BarChart,
  Bar,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [file, setFile] = useState(null);
  const [fileId, setFileId] = useState("");
  const [summary, setSummary] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [chartColumn, setChartColumn] = useState("");
  const [insights, setInsights] = useState([]);
  const [history, setHistory] = useState([]);
  const [selectedColumn, setSelectedColumn] = useState("");


  const cardStyle = {
    background: darkMode ? "#1e1e1e" : "#fff",
    color: darkMode ? "#fff" : "#000",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: darkMode
      ? "0 4px 10px rgba(255,255,255,0.05)"
      : "0 4px 10px rgba(0,0,0,0.08)",
    marginBottom: "20px",
  };
  const handleUpload = async () => {
    if (!file) {
      alert("Please select CSV file first");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);

      // Upload CSV
      const uploadRes = await fetch("http://127.0.0.1:8000/api/upload", {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadRes.json();
      const uploadedFileId = uploadData.file_id;
      setFileId(uploadedFileId);

      // Analyze CSV
      const analyzeRes = await fetch(
        `http://127.0.0.1:8000/api/analyze/${uploadedFileId}`,
        { method: "POST" }
      );
      const analyzeData = await analyzeRes.json();
      setSummary(analyzeData.summary);

      // Chart Data
      const chartRes = await fetch(
        `http://127.0.0.1:8000/api/charts/${uploadedFileId}`
      );
      const chartJson = await chartRes.json();

      console.log("Chart JSON:", chartJson);

      setChartData(chartJson.data || []);
      setChartColumn(chartJson.chart_column || "");
      setSelectedColumn(chartJson.chart_column || "");

      // AI Insights
      const insightRes = await fetch(
        `http://127.0.0.1:8000/api/insights/${uploadedFileId}`
      );
      const insightJson = await insightRes.json();
      setInsights(insightJson.insights || []);

      // Upload History
      const historyRes = await fetch("http://127.0.0.1:8000/api/history");
      const historyJson = await historyRes.json();
      setHistory(historyJson.history || []);
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    }
  };


  return (
    <div
      style={{
        padding: "30px",
        fontFamily: "Arial",
        background: darkMode ? "#121212" : "#f5f7fb",
        color: darkMode ? "#ffffff" : "#000000",
        minHeight: "100vh",
        transition: "0.3s",
      }}
    >
       {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h1>AI CSV Analyzer Dashboard 📊</h1>

        <button
          onClick={() => setDarkMode(!darkMode)}
          style={{
            padding: "8px 12px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
          }}
        >
          {darkMode ? "☀ Light" : "🌙 Dark"}
        </button>
      </div>

      {/* FILE UPLOAD */}
      <div style={cardStyle}>
        {/* hidden input */}
        <input
          id="fileInput"
          type="file"
          accept=".csv"
          style={{ display: "none" }}
          onChange={(e) => setFile(e.target.files[0])}
        />

        {/* choose file button */}
        <button
          onClick={() => document.getElementById("fileInput").click()}
          style={{
            padding: "10px 16px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            marginRight: "10px",
          }}
        >
          Choose File 📁
        </button>

        {/* upload button */}
        <button
          onClick={handleUpload}
          style={{
            padding: "10px 16px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
          }}
        >
          Upload & Analyze 🚀
        </button>

        {/* file name */}
        {file && <p style={{ marginTop: "10px" }}>Selected: {file.name}</p>}
      </div>

      {/* FILE ID BUTTON STYLE */}
      {fileId && (
        <div style={{ marginTop: "20px" }}>
          <button
            style={{
              padding: "10px 16px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              width: "100%",
              background: darkMode ? "#333" : "#ddd",
              color: darkMode ? "#fff" : "#000",
            }}
          >
            File Uploaded ✅ | ID: {fileId}
          </button>
        </div>
      )}

      {/* Dropdown */}
      {chartData.length > 0 && (
        <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
          <div style={cardStyle}>
            <h3>Total {selectedColumn}</h3>
            <p>
              {chartData.reduce((sum, item) => sum + (item[selectedColumn] || 0), 0)}
            </p>
          </div>

          <div style={cardStyle}>
            <h3>Average</h3>
            <p>
              {(
                chartData.reduce((sum, item) => sum + (item[selectedColumn] || 0), 0) /
                chartData.length
              ).toFixed(2)}
            </p>
          </div>

          <div style={cardStyle}>
            <h3>Max</h3>
            <p>
              {Math.max(...chartData.map((item) => item[selectedColumn] || 0))}
            </p>
          </div>
        </div>
      )}
      {chartData.length > 0 && (
        <div style={cardStyle}>
          <h2>{selectedColumn} Bar Chart 📊</h2>

          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={chartData[0]?.date ? "date" : "index"} />
              <YAxis />
              <Tooltip />
              <Bar dataKey={selectedColumn} />
              fill={darkMode ? "#00ffcc" : "#8884d8"}
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      {chartData.length > 0 && (
        <div style={cardStyle}>
          <h3>Best Day 🏆</h3>
          {(() => {
            const best = chartData.reduce((prev, curr) =>
              curr[selectedColumn] > prev[selectedColumn] ? curr : prev
            );
            return (
              <p>
                {best.date || best.index} → {best[selectedColumn]}
              </p>
            );
          })()}
        </div>
      )}



      {/* Graph */}
      {chartData.length > 0 && selectedColumn && (
        <div style={cardStyle}>
          <h2>{selectedColumn} Trend 📈</h2>

          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />

              <Line
                type="monotone"
                dataKey={selectedColumn}
                stroke={darkMode ? "#00ffcc" : "#8884d8"}
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Insights */}
      {insights.length > 0 && (
        <div style={cardStyle}>
          <h2>AI Insights 🤖</h2>
          <ul>
            {insights.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Export */}
      {fileId && (
        <div style={cardStyle}>
          <a
            href={`http://127.0.0.1:8000/api/export/${fileId}`}
            target="_blank"
            rel="noreferrer"
          >
            <button
              style={{
                padding: "10px 16px",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
              }}
            >
              Download Report 📥
            </button>
          </a>
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div style={cardStyle}>
          <h2>Upload History 🕘</h2>
          <ul>
            {history.map((item, index) => (
              <li key={index}>
                {item.filename} → {item.file_id}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}