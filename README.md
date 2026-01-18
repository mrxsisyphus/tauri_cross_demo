# Tauri Cross-Platform Todo Demo

A cross-platform todo application demonstrating Tauri 2.0's capabilities across Windows, macOS, Linux, Android, iOS, and Web platforms.

## Tech Stack

### Frontend
- **Svelte 5** with Runes
- **SvelteKit** (SPA mode)
- **Tailwind CSS v4**
- **shadcn-svelte** for UI components
- **TypeScript**
- **Vite** + **Bun** for development

### Backend
- **Rust** with Cargo Workspace
- **Tauri 2.0** for desktop/mobile apps
- **Axum** for sync server

## Project Structure

```
tauri_cross_demo/
├── app/                          # Frontend + Tauri app
│   ├── src/                      # SvelteKit source
│   │   ├── lib/                  # Shared components and utilities
│   │   │   ├── components/       # UI components
│   │   │   ├── stores/           # Svelte stores
│   │   │   └── types/            # TypeScript types
│   │   └── routes/               # SvelteKit routes
│   ├── src-tauri/                # Tauri Rust backend
│   │   └── src/                  # Rust source code
│   ├── static/                   # Static assets
│   ├── package.json
│   ├── svelte.config.js
│   ├── vite.config.ts
│   └── tailwind.config.ts
├── server/                       # Axum sync server
│   └── src/                      # Server source code
├── .github/
│   └── workflows/                # GitHub Actions
├── Cargo.toml                    # Workspace root
└── README.md
```

## Prerequisites

- [Rust](https://rustup.rs/) (latest stable)
- [Bun](https://bun.sh/) (v1.0+)
- [Tauri CLI](https://tauri.app/v1/guides/getting-started/prerequisites)

For mobile development:
- **Android**: Android Studio, Android SDK, NDK
- **iOS**: Xcode (macOS only)

## Getting Started

### 1. Install Dependencies

```bash
# Install frontend dependencies
cd app
bun install

# Install Rust dependencies (handled by cargo)
cd ..
cargo build
```

### 2. Development

#### Desktop Development
```bash
cd app
bun run tauri:dev
```

#### Web Development
```bash
cd app
bun run dev
```

#### Android Development
```bash
cd app
bun run tauri android dev
```

#### iOS Development (macOS only)
```bash
cd app
bun run tauri ios dev
```

### 3. Sync Server

```bash
cd server
cargo run
```

The server runs on `http://localhost:3001`

## Building for Production

### Desktop
```bash
cd app
bun run tauri build
```

### Android
```bash
cd app
bun run tauri android build
```

### iOS
```bash
cd app
bun run tauri ios build
```

## GitHub Actions

The project includes GitHub Actions workflows for:
- Cross-platform builds (Windows, macOS, Linux)
- Android APK builds
- iOS IPA builds (requires macOS runner)
- Automatic release creation

## License

MIT
