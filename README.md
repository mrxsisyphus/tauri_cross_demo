# 🚀 Tauri Cross-Platform Todo Demo

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Tauri](https://img.shields.io/badge/Tauri-2.0-blue?logo=tauri)](https://tauri.app/)
[![Svelte](https://img.shields.io/badge/Svelte-5.0-ff3e00?logo=svelte)](https://svelte.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)

A premium, state-of-the-art cross-platform todo application demonstrating the power of **Tauri 2.0**. This demo showcases a single codebase running seamlessly across **Windows, macOS, Linux, Android, iOS, and Web**.

## ✨ Key Features

- **📱 True Cross-Platform**: One frontend, multiple native targets.
- **⚡ High Performance**: Ultra-lightweight Rust backend with a fast Svelte 5 frontend.
- **🎨 Modern UI/UX**: Built with Svelte 5 (Runes), Tailwind CSS v4, and shadcn-svelte for a premium look and feel.
- **🔄 Real-time Sync**: Includes a dedicated Axum-based Rust server for data synchronization.
- **📦 Local-first**: Robust local storage and state management.

## 🛠 Tech Stack

### Frontend

- **Framework**: [Svelte 5](https://svelte.dev/) (utilizing the latest Runes API)
- **Styling**: [Tailwind CSS v3.4](https://tailwindcss.com/) & [shadcn-svelte](https://shadcn-svelte.com/)
- **Runtime**: [Bun](https://bun.sh/) for lightning-fast development

### Backend & Native

- **Framework**: [Tauri 2.0](https://tauri.app/)
- **Logic**: Rust (Workspace-based architecture)
- **API**: [Axum](https://github.com/tokio-rs/axum) for the sync server
- **Database**: SQLite with `sqlx`

## 📁 Project Structure

```text
tauri_cross_demo/
├── app/                  # Frontend + Tauri Mobile/Desktop wrappers
│   ├── src/              # SvelteKit source (Runes)
│   ├── src-tauri/        # Tauri Rust core
│   └── static/           # Static assets
├── server/               # Axum sync server logic
├── .github/workflows/    # CI/CD (Android, iOS, Desktop builds)
├── Cargo.toml            # Root workspace configuration
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- [Rust](https://rustup.rs/) (latest stable)
- [Bun](https://bun.sh/)
- [Tauri CLI](https://tauri.app/v1/guides/getting-started/prerequisites)

### 1. Installation

```bash
# Clone the repository
git clone https://github.com/mrxsisyphus/tauri_cross_demo.git
cd tauri_cross_demo

# Install frontend dependencies
cd app
bun install
```

### 2. Development

| Target      | Command (run inside `app/`) |
| :---------- | :-------------------------- |
| **Desktop** | `bun run tauri:dev`         |
| **Web**     | `bun run dev`               |
| **Android** | `bun run tauri android dev` |
| **iOS**     | `bun run tauri ios dev`     |

### 3. Sync Server

```bash
cd server
cargo run
```

The server will be available at `http://localhost:3001`.

## 📦 Build & Release

We use GitHub Actions to automate the build process for all platforms. Artifacts are automatically attached to GitHub Releases.

```bash
# Example: Build for Android
cd app
bun run tauri android build
```

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<p align="center">
  Built with ❤️ by <a href="https://github.com/mrxsisyphus">mrx_sisyphus</a>
</p>
