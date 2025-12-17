
# PerfWatch 🚀

**Real-Time Web Performance Monitoring System**

PerfWatch is a real-time web performance monitoring system that observes how a web application behaves while it is running. It tracks request latency, failures, throughput, and system load, and visualizes everything live through an interactive dashboard.

In simple terms, it works like a **heart monitor for web applications**.

---

## 🔥 Key Features

### Real-Time Monitoring

* Live tracking of API requests
* Measures latency, error rate, and request volume
* Instant UI updates using WebSockets

### Interactive Dashboard

* Live request feed (success, slow, failed requests)
* Network waterfall visualization
* Real-time performance alerts
* Dark-mode SaaS-style UI

### PerfWatch Client SDK

* Lightweight JavaScript SDK
* Tracks API calls automatically
* Captures request duration, status, and memory usage
* Automatic batching and periodic flushing
* Auto-reconnects when backend restarts

### Smart Alerts

* High latency detection
* Error rate spike alerts
* Memory usage warnings

---
## 📸 Screenshots

### Live Overview Dashboard
<img width="1896" height="923" alt="Screenshot 2025-12-17 174834" src="https://github.com/user-attachments/assets/fe33dc86-ed98-4c5c-99fe-26b2f28ad544" />

### Error Spike Detection & Alerts
<img width="1892" height="927" alt="Screenshot 2025-12-17 174940" src="https://github.com/user-attachments/assets/9b5b38bb-7afb-46d0-9185-97b5deda126f" />


### Error Traces
<img width="1919" height="928" alt="Screenshot 2025-12-17 175139" src="https://github.com/user-attachments/assets/ab0ee357-7579-4b0e-8dee-d6c52c516a9d" />


### Request Explorer
<img width="1897" height="923" alt="Screenshot 2025-12-17 175219" src="https://github.com/user-attachments/assets/ea748549-c1a9-4dfd-b1c7-07a0c50069a6" />


### SDK Integration Panel
<img width="1917" height="926" alt="Screenshot 2025-12-17 175232" src="https://github.com/user-attachments/assets/f4a768e3-defa-45b9-a72d-cd84f93b209d" />


### Latency Distribution
<img width="1893" height="927" alt="Screenshot 2025-12-17 175320" src="https://github.com/user-attachments/assets/59e2d6ee-1760-44cc-9fe2-e7ea43c2b8c9" />


---
## 🏗 Architecture Overview

Browser Application
→ PerfWatch SDK
→ REST API (`/api/metrics`)
→ Express Server
→ WebSocket Broadcast
→ React Dashboard (Live Updates)

---

## 🧰 Tech Stack

**Frontend**

* React + Vite
* Tailwind CSS
* Framer Motion
* WebSockets
* Custom React Hooks

**Backend**

* Node.js
* Express
* WebSocket (`ws`)
* REST API

**SDK**

* Vanilla JavaScript
* Browser Performance APIs
* Auto batching & reconnect logic

---

## 🚀 Getting Started

### 1. Start Backend Server

```bash
cd server
npm install
npm start
```

Server runs at:

```
http://localhost:4000
```

---

### 2. Start Frontend Dashboard

```bash
cd client
npm install
npm run dev
```

Dashboard runs at:

```
http://localhost:3000
```

---

### 3. Enable Real-Time Mode

* Switch **Data Source → Real**
* Turn **Live Mode → ON**
* Generate traffic using the SDK or browser console

---

## 🧪 Testing Real-Time Monitoring

### Manual Test (Browser Console)

```js
window.PerfWatchInstance
  .trackRequest("/demo-test", { method: "GET" })
  .end(200);
```

### Simulate Errors

```js
setInterval(() => {
  window.PerfWatchInstance
    .trackRequest("/fail", { method: "POST" })
    .end(500);
}, 500);
```

Expected results:

* Live feed updates instantly
* Waterfall bars appear
* Error rate increases
* Alert popups trigger automatically

---

## 📦 SDK Usage Example

```js
const tracker = window.PerfWatchInstance
  .trackRequest("/api/data", { method: "GET" });

tracker.end(200);
```

---


## 📌 Future Improvements

* Persistent storage for metrics
* Authentication & multi-project support
* Server-side performance monitoring
* Cloud deployment
* Exportable performance reports

---

## 👨‍💻 Author

**Utpal Raj**
GitHub: [https://github.com/utpal16raj09](https://github.com/utpal16raj09)

---

MIT License

Copyright (c) 2025 Utpal Raj
