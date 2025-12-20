# 🗺️ Ace Map

[![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)

**Ace Map** is an interactive map practice tool designed specifically for Class 10 CBSE students to master geographical locations through engaging, game-based learning.

## ✨ Features

- 🎮 **Interactive Game Mode** - Practice marking locations on an interactive map
- 📊 **Progress Tracking** - Track your score and time performance
- 🎯 **Multiple Difficulty Levels** - Choose from High, Medium, and Low strictness modes
- 📍 **Category-Based Learning** - Practice specific geographical categories
- ⏱️ **Timer System** - Challenge yourself with timed practice sessions
- 🎨 **Dark/Light Mode** - Comfortable viewing in any lighting condition
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile devices
- 🎉 **Results Sharing** - Share your achievements with encoded result URLs

## 🚀 Getting Started

### Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **pnpm** (v8 or higher) - Install with `npm install -g pnpm`

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/navithecoderboi/ace-map.git
cd ace-map
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Run the development server**

```bash
pnpm dev
```

4. **Open your browser**

Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

### Build for Production

To create an optimized production build:

```bash
pnpm build
pnpm start
```

## 🎮 How to Play

1. **Start the Game** - Click the "Start" button to begin
2. **Read the Location** - The location name will appear at the top
3. **Mark on Map** - Click on the map where you think the location is
4. **Submit** - Click "Submit" to check your answer
5. **View Result** - See if you were correct and move to the next location
6. **Complete & Share** - Finish all locations and share your results!

## 🛠️ Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) with App Router
- **UI Library:** [React 19](https://react.dev/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/)
- **UI Components:** [HeroUI](https://www.heroui.com/)
- **Map Library:** [MapLibre GL](https://maplibre.org/) with [react-map-gl](https://visgl.github.io/react-map-gl/)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **Code Quality:** [Biome](https://biomejs.dev/)
- **Package Manager:** [pnpm](https://pnpm.io/)

## 📁 Project Structure

```
ace-map/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── page.tsx           # Home page with results
│   │   ├── layout.tsx         # Root layout
│   │   ├── globals.css        # Global styles
│   │   └── game/              # Game page
│   │       └── page.tsx       # Main game interface
│   └── lib/
│       ├── assets/            # SVG components and icons
│       ├── components/        # React components
│       │   ├── game/         # Game-related components
│       │   │   ├── Game.tsx  # Main game component
│       │   │   ├── GameBar.tsx # Game controls and timer
│       │   │   ├── Main.tsx  # Game state management
│       │   │   └── Pin.tsx   # Map marker component
│       │   ├── BgBeams.tsx   # Background effects
│       │   ├── Flow.tsx      # Conditional rendering
│       │   ├── Navbar.tsx    # Navigation component
│       │   ├── Result.tsx    # Results display
│       │   └── Start.tsx     # Game start screen
│       ├── hooks/            # Custom React hooks
│       │   ├── useIsMounted.ts
│       │   ├── useLocalStorage.ts
│       │   └── useTheme.tsx
│       └── utils/            # Utility functions
│           ├── dom.ts        # DOM utilities
│           ├── game.ts       # Game logic and state
│           └── places.ts     # Location data
├── public/                   # Static assets
├── biome.json               # Biome configuration
├── next.config.ts           # Next.js configuration
├── tailwind.config.ts       # Tailwind configuration
├── tsconfig.json            # TypeScript configuration
└── package.json             # Project dependencies
```

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Ways to Contribute

- 🐛 **Report Bugs** - Found a bug? [Open an issue](https://github.com/navithecoderboi/ace-map/issues)
- 💡 **Suggest Features** - Have an idea? Share it with us!
- 📝 **Improve Documentation** - Help make our docs better
- 🌍 **Add Locations** - Contribute new geographical locations
- 🎨 **Design Improvements** - Enhance the UI/UX
- 🧪 **Write Tests** - Help improve code quality

### Development Workflow

1. **Fork the repository**

Click the "Fork" button at the top right of the repository page.

2. **Clone your fork**

```bash
git clone https://github.com/navithecoderboi/ace-map.git
cd ace-map
```

3. **Create a new branch**

```bash
git checkout -b feature/your-feature-name
```

4. **Install dependencies**

```bash
pnpm install
```

5. **Make your changes**

- Write clean, readable code
- Follow the existing code style
- Add comments where necessary
- Test your changes thoroughly

6. **Run linting and formatting**

```bash
pnpm lint
pnpm format
```

7. **Commit your changes**

```bash
git add .
git commit -m "feat: add your feature description"
```

Follow [Conventional Commits](https://www.conventionalcommits.org/) format:

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

8. **Push to your fork**

```bash
git push origin feature/your-feature-name
```

9. **Create a Pull Request**

- Go to the original repository
- Click "New Pull Request"
- Select your fork and branch
- Describe your changes clearly
- Link any related issues

### Adding New Locations

To add new geographical locations to the game:

1. Open [src/lib/utils/places.ts](src/lib/utils/places.ts)
2. Add your locations to the appropriate category array:

```typescript
{
    category: "Your Category",
    places: [
        {
            name: "Location Name",
            latitude: 12.3456,
            longitude: 78.9012
        },
        // Add more places...
    ]
}
```

3. Ensure coordinates are accurate (use [Google Maps](https://maps.google.com/) or similar)
4. Test the locations in the game

### Code Style Guidelines

- Use **TypeScript** for type safety
- Follow **React** best practices and hooks guidelines
- Use **functional components** with hooks
- Keep components **small and focused**
- Use **meaningful variable names**
- Add **JSDoc comments** for complex functions
- Prefer **const** over let when possible

### Testing Your Changes

Before submitting a PR:

```bash
# Run development server
pnpm dev

# Check for linting errors
pnpm lint

# Build the project
pnpm build
```

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**NaviTheCoderboi**

- GitHub: [@navithecoderboi](https://github.com/navithecoderboi)

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/) and [React](https://react.dev/)
- Maps powered by [MapLibre GL](https://maplibre.org/)
- UI components from [HeroUI](https://www.heroui.com/)
- Inspired by the need for better geography practice tools for students

## 🌟 Show Your Support

If you find this project helpful, please consider giving it a ⭐️ on GitHub!

---

<p align="center">Made with ❤️ for CBSE Class 10 Students</p>
