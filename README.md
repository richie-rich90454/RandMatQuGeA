# RandMatQuGeA (Random Math Question Generator App) 🧮 available at [math.richardsblogs.com](https://math.richardsblogs.com)

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/richie-rich90454/random-math-question-generator-app?style=social)](https://github.com/richie-rich90454/random-math-question-generator-app)
[![Live Demo](https://img.shields.io/badge/demo-live-green.svg)](https://math.richardsblogs.com/)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tauri](https://img.shields.io/badge/tauri-%2324C8DB.svg?style=for-the-badge&logo=tauri&logoColor=%23FFFFFF)](https://tauri.app/)
[![Rust](https://img.shields.io/badge/rust-%23000000.svg?style=for-the-badge&logo=rust&logoColor=white)](https://www.rust-lang.org/)
[![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
![Offline First](https://img.shields.io/badge/offline-first-success)
![Lightweight](https://img.shields.io/badge/binary-lightweight-blue)

A comprehensive, free online math question generator built with TypeScript that helps students practice algebra, calculus, trigonometry, and more with instant answer verification. Available as both a web application and cross-platform desktop app. Perfect for students, educators, and anyone looking to improve their math skills!

## ✨ Key Features

- **📚 45+ Math Topics**: Comprehensive coverage from basic arithmetic to advanced calculus
- **⚡ Instant Feedback**: Real-time answer checking with detailed explanations
- **📱 Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **🎯 Progressive Difficulty**: Questions adapt to different skill levels
- **🔢 Math Notation Support**: Beautiful mathematical rendering with MathJax
- **🎲 Unlimited Questions**: Generate endless practice problems
- **💡 Educational Focus**: Designed specifically for learning and practice
- **🖥️ Cross-Platform Desktop App**: Native desktop application built with Tauri (Windows, macOS, Linux with Linux support coming soon)
- **🔒 Type Safety**: Built with TypeScript for robust, maintainable code
- **🧩 Modular Architecture**: Organized into focused modules for each math category

### ❓ Why Not Just Use AI Generated Questions/Answers?

- No distractions or potentially hallucinated answers
- Unlimited structured practice
- Instant correctness verification
- Works offline as a desktop app
- Fully open-source & transparent

## 🖥️ Why a Desktop App?

- Works fully offline
- No browser distractions
- Faster startup and lower memory usage than Electron apps
- Secure sandboxing with Rust + Tauri
- Ideal for focused study sessions

## 📦 Install (No Node.js/Rust environment Required)

Download the latest installer from **GitHub Releases**:

- Windows: `.exe`
- macOS: `.dmg`
- Linux: `.AppImage` / `.deb` (coming soon)

➡️ https://github.com/richie-rich90454/random-math-question-generator-app/releases

### Supported Math Topics (45+ Topics)

| Category | Topics |
|----------|--------|
| **Arithmetic** | Addition, Subtraction, Multiplication, Division, Whole Number Place Value, Number Line Ordering, Divisibility Rules, Prime Numbers, GCF/LCM |
| **Algebra** | Logarithms (Basic, Change of Base, Equations, Properties), Exponents (Basic, Solve, Laws, Growth, Compare), Factorials, Series (Arithmetic/Geometric Sums, Convergence, nth Term), Roots, Fractions (Add, Subtract, Multiply, Divide, Simplify, Convert), Percents (Percent of, Increase, Decrease, Interest, Markup), Ratio & Proportion, Unit Conversion (Length, Area, Volume, Multi-step), Expression Evaluation, Number Sets, Properties of Operations, Order of Operations |
| **Equations & Inequalities** | Linear Equations (One-step, Two-step, Both Sides, Parentheses, Literal), Linear Word Problems, Quadratic Equations (Factoring, Complete Square, Quadratic Formula, Discriminant), Linear Inequalities, Quadratic Inequalities, Rational Inequalities, Systems of 2x2 Equations, Systems of 3x3 Equations |
| **Polynomials & Graphing** | Polynomial Operations (Add, Subtract, Multiply), Polynomial Division, Factoring (GCF, Trinomials, Difference of Squares, Sum/Difference of Cubes), Function Concepts (Domain, Range, Notation, Evaluate), Linear Graphing (Slope, Intercepts, Equation from Points, Parallel/Perpendicular), Non-Linear Graphing (Parabolas, Absolute Value, Square Root, Transformations), Variation (Direct, Inverse, Joint) |
| **Radicals & Exponents** | Radical Simplification (Add, Subtract, Multiply, Divide, Rationalize), Radical Equations, Rational Exponents, Exponent Rules (Product, Quotient, Power, Negative, Zero), Scientific Notation, Complex Numbers (Add, Subtract, Multiply, Divide, Powers of i) |
| **Calculus** | Derivatives (Polynomial, Trigonometric, Exponential, Logarithmic, Product, Quotient, Chain, Implicit, Higher Order, Motion), Integrals (Polynomial, Trigonometric, Exponential, Logarithmic, Substitution, Definite, Initial Value, Area, Motion), Limits, Related Rates (Ladder, Cone) |
| **Linear Algebra** | Matrix Operations (Add, Subtract, Multiply, Inverse, Transpose, Scalar Multiplication, Power, Row Echelon), Systems via Matrices, Vector Operations (Magnitude, Direction, Unit Vector, Dot Product, Angle, Projection, Parametric Equations, Polar/Cartesian Conversion, Polar Graphs, Motion, De Moivre's Theorem) |
| **Trigonometry** | Sine (Evaluate, Solve, Amplitude, Period, Phase Shift, Law of Sines, Unit Circle, Identity), Cosine (Evaluate, Solve, Amplitude, Period, Phase Shift, Law of Cosines, Identity), Tangent, Cosecant, Secant, Cotangent, Inverse Trig, Trig Equations, Trig Graphs |
| **Discrete Mathematics** | Permutations (Basic, Equation, Word, Circular, Identical, With Replacement), Combinations (Basic, Equation, Word, Complement, Paths, Multiset), Probability (Basic, Conditional, Independent, Mutually Exclusive, Bayes, Binomial, Expected Value, Complement, Permutation/Combination, Geometric), Statistics (Mean, Median, Mode, Range, Stem-and-Leaf, Box Plot, Standard Deviation) |
| **Geometry** | Area (Circle, Rectangle, Triangle, Sector), Volume (Sphere, Cylinder, Cone, Pyramid, Cube), Surface Area (Cube), Triangles (Pythagorean Theorem, Similar Triangles, Classification), Perimeter, Arc Length, Distance Formula, Angle Relations |

## 🚀 Quick Start

### Live Demo
Try it now: **[https://math.richardsblogs.com/](https://math.richardsblogs.com/)**

### Local Installation (Web Version)

```bash
# Clone the repository
git clone https://github.com/richie-rich90454/random-math-question-generator-app.git
cd random_math_question_generator

# Install dependencies
npm install

# Start the development server
npm run dev
```

Then open [http://localhost:1331](http://localhost:1331) in your browser.

### Desktop App Development

```bash
# Install Tauri CLI globally (if not already installed)
npm install -g @tauri-apps/cli

# Start Tauri development (runs both web dev server and desktop app)
npm run tauri dev

# Build desktop application for your platform
npm run tauri build
```

## 🎯 How to Use

1. **Select a Topic**: Choose from 45+ math categories organized by subject
2. **Generate Question**: Click "Generate Question" to get a new problem
3. **Enter Answer**: Type your solution in the answer box
4. **Check Answer**: Click "Check Answer" or press `Shift+Enter` for instant feedback
5. **Learn**: Review the correct answer and explanation

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3 (Custom Properties), TypeScript (ES2020)
- **Math Rendering**: [MathJax](https://www.mathjax.org/) for beautiful mathematical notation
- **Build Tool**: [Vite](https://vitejs.dev/) with TypeScript support for fast development and optimized builds
- **Math Engine**: [Math.js](https://mathjs.org/) for complex calculations with TypeScript definitions
- **Desktop Framework**: [Tauri](https://tauri.app/) with Rust for secure, lightweight native applications
- **Type Safety**: TypeScript with strict configuration for robust code maintenance
- **Build Tools**: Terser for minification, CSSNano for CSS optimization
- **Package Manager**: npm with Node.js

## 📁 Project Structure

```
random_math_question_generator/
├── src/                          # Source code directory
│   ├── index.html               # Main web application interface
│   ├── script.ts                # Core application logic (TypeScript)
│   ├── style.css                # Responsive styling
│   ├── robots.txt               # Search engine directives
│   ├── sitemap.xml              # SEO sitemap
│   ├── types/                   # TypeScript type definitions
│   │   └── global.d.ts          # Global type declarations
│   ├── modules/                 # Modular math question generators (TypeScript)
│   │   ├── Algebra/             # Algebraic operations (split into 5 focused files)
│   │   │   ├── algebraUtils.ts
│   │   │   ├── algebraBasics.ts
│   │   │   ├── algebraAdvanced.ts
│   │   │   ├── algebraEquations.ts
│   │   │   ├── algebraGraphingPolynomials.ts
│   │   │   └── index.ts
│   │   ├── Arithmetic/          # Basic arithmetic (split into 3 files)
│   │   │   ├── arithmeticUtils.ts
│   │   │   ├── arithmeticBasic.ts
│   │   │   ├── arithmeticAdvanced.ts
│   │   │   └── index.ts
│   │   ├── Calculus/            # Calculus problems (split into 4 files)
│   │   │   ├── calculusUtils.ts
│   │   │   ├── calculusDerivatives.ts
│   │   │   ├── calculusIntegrals.ts
│   │   │   ├── calculusLimitsRelated.ts
│   │   │   └── index.ts
│   │   ├── LinearAlgebra/       # Matrix and vector operations (split into 3 files)
│   │   │   ├── linearAlgebraUtils.ts
│   │   │   ├── linearAlgebraMatrix.ts
│   │   │   ├── linearAlgebraVector.ts
│   │   │   └── index.ts
│   │   ├── Trigonometry/        # Trigonometric functions (split into 4 files)
│   │   │   ├── trigUtils.ts
│   │   │   ├── trigBasic.ts
│   │   │   ├── trigReciprocal.ts
│   │   │   ├── trigAdvanced.ts
│   │   │   └── index.ts
│   │   ├── DiscreteMathematics/ # Combinatorics and probability (split into 4 files)
│   │   │   ├── discreteUtils.ts
│   │   │   ├── discretePermutationsCombinations.ts
│   │   │   ├── discreteProbability.ts
│   │   │   ├── discreteStatistics.ts
│   │   │   └── index.ts
│   │   └── Geometry/            # Geometry problems (split into 6 files)
│   │       ├── geometryUtils.ts
│   │       ├── geometryVisualization.ts
│   │       ├── geometryArea.ts
│   │       ├── geometryVolume.ts
│   │       ├── geometryTriangles.ts
│   │       ├── geometryMisc.ts
│   │       └── index.ts
│   ├── components/              # UI components
│   ├── utils/                   # Utility functions
│   └── assets/                  # Static assets
├── src-tauri/                   # Tauri desktop application
│   ├── src/                     # Rust source code
│   ├── Cargo.toml               # Rust dependencies
│   ├── tauri.conf.json          # Tauri configuration
│   ├── build.rs                 # Build script
│   └── icons/                   # Application icons
├── public/                      # Public assets
│   ├── favicon.ico              # Desktop application icon
│   ├── favicon.png              # Web application icon
│   ├── apple-touch-icon.png     # iOS app icon
│   ├── NotoSans-VariableFont_wdth_wght.ttf # Custom font
│   └── mathjax/                 # MathJax library
├── plans/                       # Development plans and documentation
│   ├── typescript-migration-plan.md      # TypeScript migration plan
│   └── typescript-migration-checklist.md # Migration implementation checklist
├── dist/                        # Build output directory
├── vite.config.ts               # Vite build configuration (TypeScript)
├── tsconfig.json                # TypeScript configuration
├── tsconfig.node.json           # TypeScript configuration for Node
├── package.json                 # Project configuration and dependencies
├── package-lock.json            # Dependency lock file
├── LICENSE                      # Apache 2.0 License
├── CODE_OF_CONDUCT.md           # Community guidelines
├── OFL-Noto_Sans.txt            # Font license
├── .github/                     # GitHub Actions workflows
│   └── workflows/
│       ├── release.yml          # Automated release build workflow
│       └── TEST_INSTRUCTIONS.md # Workflow testing instructions
└── README.md                    # This file
```

## 🎨 Features in Detail

### Smart Answer Checking
- Supports multiple correct answer formats
- Handles mathematical equivalences using Math.js
- Provides detailed feedback with TypeScript type safety
- Supports keyboard shortcuts

### Educational Design
- Progressive difficulty levels
- Clear mathematical notation with MathJax
- Instant feedback for learning
- Mobile-friendly interface

### Performance Optimized
- Fast server response times
- Optimized bundle sizes with Vite and TypeScript
- Efficient math calculations
- Responsive design

### Cross-Platform Desktop App
- Native performance with Tauri
- Small bundle sizes
- Secure sandboxing
- Windows, macOS, and Linux support

### TypeScript Benefits
- **Type Safety**: Catch errors at compile time rather than runtime
- **Better IDE Support**: Enhanced autocomplete, refactoring, and documentation
- **Improved Maintainability**: Clear type definitions make code easier to understand
- **Modern Development**: Leverages latest ECMAScript features with type checking

### Modular Architecture
- **Organized by Subject**: Each math category has its own module directory
- **Focused Files**: Large modules split into smaller, focused files for better maintainability
- **Reusable Utilities**: Common functions extracted into utility files
- **Clear Exports**: Each module has an index.ts that exports all public functions

## 🚀 Deployment

### Web Deployment
The application is ready for deployment on any static hosting platform:
- Vercel, Netlify, GitHub Pages
- AWS S3, Google Cloud Storage, Azure Static Websites
- Any static hosting service

### Desktop Application Build
Build cross-platform desktop apps with Tauri:

```bash
# Build for current platform
npm run tauri build

# Build for specific platform (requires cross-compilation setup)
npm run tauri build -- --target x86_64-pc-windows-msvc
npm run tauri build -- --target x86_64-apple-darwin
npm run tauri build -- --target x86_64-unknown-linux-gnu
```

### TypeScript Development
```bash
# Type checking
npm run build:typescript

# Development with hot reload
npm run dev

# Production build
npm run build
```

### Automated Releases with GitHub Actions
The project includes a GitHub Actions workflow that automatically builds and packages the application for all platforms when a new release is created.

**Supported Platforms:**
- **Windows**: 32-bit & 64-bit (.exe installers)
- **macOS**: Intel x64 & Apple Silicon (.dmg bundles)
- **Linux**: 32-bit, 64-bit, ARM64 (.AppImage & .deb packages)

**How to create a release:**
1. Go to GitHub repository → Releases → Create a new release
2. Create a tag (e.g., `v3.0.1`)
3. Add release title and description
4. Click "Publish release"

The workflow will automatically:
- Build the web application
- Build desktop apps for all 7 platforms
- Generate release notes with download links
- Upload all artifacts to the release

**Cost**: FREE for public repositories (uses ~105 minutes of GitHub Actions time per release)

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Report Bugs**: Open an issue with detailed descriptions
2. **Suggest Features**: Share your ideas for new math topics or features
3. **Improve Documentation**: Help make the project more accessible
4. **Submit Code**: Fork the repo and create pull requests

### Development Setup
```bash
git clone https://github.com/richie-rich90454/random-math-question-generator-app.git
cd random_math_question_generator
npm install

# For web development
npm run dev

# For desktop app development
npm run tauri dev

# For TypeScript type checking
npm run build:typescript
```

## 📊 Project Stats

- **45+** Math topics supported
- **3000+** Lines of educational TypeScript code
- **7** Major math categories (Arithmetic, Algebra, Calculus, Linear Algebra, Trigonometry, Discrete Math, Geometry)
- **25+** Module files organized by subject
- **Unlimited** Question combinations
- **Instant** Answer verification
- **Cross-platform** Desktop application
- **TypeScript** for robust development

## 🌟 Why Star This Project?

- **🎓 Educational Value**: Helps students learn math effectively
- **🚀 Performance**: Fast, responsive, and reliable
- **📱 Accessibility**: Works on all devices and platforms
- **🔧 Well-Maintained**: Regular updates and improvements
- **🎯 Practical**: Real-world educational tool
- **📚 Comprehensive**: Covers high school to college-level math
- **🖥️ Native Desktop**: Lightweight, secure desktop application
- **🔒 Type Safe**: Built with TypeScript for reliability
- **🧩 Modular**: Well-organized codebase that's easy to understand and contribute to

## 📄 License

This project is licensed under the Apache License 2.0. See the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Live Demo**: [https://math.richardsblogs.com/](https://math.richardsblogs.com/)
- **GitHub Repository**: [https://github.com/richie-rich90454/random-math-question-generator-app](https://github.com/richie-rich90454/random-math-question-generator-app)
- **Main Website**: [https://www.richardsblogs.com](https://www.richardsblogs.com)
- **Tauri Framework**: [https://tauri.app/](https://tauri.app/)
- **Vite Build Tool**: [https://vitejs.dev/](https://vitejs.dev/)
- **TypeScript**: [https://www.typescriptlang.org/](https://www.typescriptlang.org/)

---

⭐ **If you find this project helpful, please consider giving it a star!** ⭐

Your support helps more people discover this valuable learning tool and encourages further development.