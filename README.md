# 💳 Card Manager (Gerenciador de Cartões)

> **A modern, powerful, and intuitive way to manage your credit card expenses, installments, and debtors.**

![Project Banner](https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&q=80&w=1000&ixlib=rb-4.0.3)
*(Representative image - Replace with actual screenshot)*

## 🚀 Overview

**Card Manager** is a React-based web application designed to help you take control of your finances. It solves the complexity of managing multiple credit cards, tracking installment plans, and monitoring debts from friends or family members who share your card.

With a sleek, dark-themed UI and real-time data synchronization via Supabase, it offers a premium user experience for financial tracking.

## ✨ Key Features

-   **📊 Interactive Dashboard**: Real-time overview of your credit limits, total debts, and upcoming invoices.
-   **💳 Multi-Card Management**: seamless switching between different credit cards with custom colors and limits.
-   **👥 Debtor Tracking**: Keep track of people who use your card. See exactly how much they owe and how many installments are left.
-   **📅 Smart Invoice Projection**: Automatically calculates future invoices based on installment plans for the next 12 months.
-   **🛒 Purchase Management**: Easy-to-use form for adding new purchases with automatic installment calculation.
-   **☁️ Cloud Sync**: All data is securely stored in the cloud using **Supabase**, accessible from any device.

## 🛠️ Tech Stack

This project was built using the latest modern web technologies to ensure performance, scalability, and developer experience.

*   **Frontend Framework**: [React 19](https://react.dev/)
*   **Build Tool**: [Vite](https://vitejs.dev/) - Blazing fast build times.
*   **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) - Utility-first CSS framework for rapid UI development.
*   **Backend / Database**: [Supabase](https://supabase.com/) - Open Source Firebase alternative (PostgreSQL).
*   **Icons**: [Lucide React](https://lucide.dev/) - Beautiful, consistent icons.
*   **Routing**: [React Router](https://reactrouter.com/)

## 🏁 Getting Started

### Prerequisites

-   Node.js (v18+)
-   npm or yarn

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/VictorDevloaper/card_manager.git
    cd card_manager
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables**
    Create a `.env` file in the root directory and add your Supabase credentials:
    ```env
    VITE_SUPABASE_URL=your_supabase_project_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  **Run the development server**
    ```bash
    npm run dev
    ```

## 🚀 Deployment

The application is optimized for deployment on static hosting services like **Render**, **Vercel**, or **Netlify**.

**Build Command:**
```bash
npm run build
```

**Output Directory:**
`dist`

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

<p align="center">
  Made with ❤️ by <strong>VictorDevloaper</strong>
</p>
