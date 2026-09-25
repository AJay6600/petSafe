# 🐾 PetSafe — Smart QR Pet Protection Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Spring Boot](https://img.shields.io/badge/Backend-Spring%20Boot%203-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![Vite React](https://img.shields.io/badge/Frontend-Vite%20%2B%20React%2018-61dafb.svg)](https://reactjs.org/)
[![Deployment](https://img.shields.io/badge/Deployed-Vercel%20%2B%20Render-black.svg)](https://vercel.com)

**PetSafe** is an open-source, privacy-first pet safety platform designed to reconnect lost pets with their families in seconds. Using smart QR code technology, real-time GPS location pinning, and a built-in WhatsApp-style live chat, anyone with a smartphone can help rescue a lost pet without installing any app.

---

## 🎬 Marketing & Product Demo Video

> Watch how PetSafe turns any smartphone into an instant rescue tool.

https://github.com/AJay6600/petSafe/raw/main/assets/demo.mp4

<video src="https://github.com/AJay6600/petSafe/raw/main/assets/demo.mp4" controls="controls" style="max-width: 100%;">
</video>


---

## 🌟 Key Features

* **📷 Smart QR Code Profiles**: Instant scanning with any smartphone camera — zero app installation required.
* **📍 1-Tap GPS Location Sharing**: Good Samaritans can share their live location coordinates with a single click.
* **💬 Real-Time Live Chat**: WhatsApp-style messaging between the Finder and Pet Owner with embedded GPS map location pins.
* **🔒 Privacy Control Center**: Pet owners customize what contact info is visible to the public.
* **📄 Printable Multi-Pet QR Emergency Sheets**: Generate high-res PDF sheets (via Apache PDFBox) containing QR codes for all family pets.
* **📢 Community Missing Pet Search Board**: Public gallery of lost pets for instant community reporting.
* **📊 Analytics Dashboard**: Admin suite for monitoring platform activity, registered pets, and reunification metrics.

---

## 🛠️ Tech Stack & Architecture

### **Frontend**
* **Framework**: React 18 + Vite (TypeScript)
* **Styling**: TailwindCSS + Ant Design + Lucide Icons
* **State Management & Routing**: React Router v6 + TanStack Query

### **Backend**
* **Framework**: Java 17 + Spring Boot 3
* **QR & PDF Engine**: ZXing (Zebra Crossing) + Apache PDFBox
* **Database**: Dual-Engine (MySQL / Automatic H2 In-Memory Fallback)
* **Containerization**: Docker Multi-Stage Build

---

## 🚀 Quick Start Guide

### Prerequisites
* Java 17 JDK & Maven 3.8+
* Node.js 18+ & npm

### 1. Run Backend locally
```bash
cd backend
mvn spring-boot:run
```
*(Backend runs on `http://localhost:8080`)*

### 2. Run Frontend locally
```bash
cd frontend
npm install
npm run dev
```
*(Frontend runs on `http://localhost:5173`)*

---

## 🌐 Production Deployment

* **Backend**: Hosted on [Render](https://render.com) using Docker runtime (`backend/Dockerfile`).
* **Frontend**: Hosted on [Vercel](https://vercel.com) using Vite React preset (`frontend/vercel.json`).

---

## 📜 License

Distributed under the MIT License.
