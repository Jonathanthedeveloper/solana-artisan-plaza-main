# Contributing to Solana Artisan Plaza

Thank you for your interest in contributing to Solana Artisan Plaza! We welcome contributions from developers of all skill levels. This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Git
- A Solana wallet (Phantom, Solflare, etc.)
- Basic knowledge of React, TypeScript, and Solana development

### Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/your-username/solana-artisan-plaza.git
   cd solana-artisan-plaza
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

## 📋 Development Workflow

### 1. Choose an Issue
- Check our [Issues](https://github.com/your-repo/issues) page
- Look for issues labeled `good first issue` or `help wanted`
- Comment on the issue to indicate you're working on it

### 2. Create a Branch
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/issue-number-description
```

### 3. Make Changes
- Follow the existing code style
- Write clear, concise commit messages
- Test your changes thoroughly
- Update documentation if needed

### 4. Commit and Push
```bash
git add .
git commit -m "feat: add new feature description"
git push origin feature/your-feature-name
```

### 5. Create a Pull Request
- Go to GitHub and create a Pull Request
- Fill out the PR template
- Link to any related issues
- Request review from maintainers

## 🛠️ Development Guidelines

### Code Style
- Use TypeScript for all new code
- Follow the existing naming conventions
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused

### Component Structure
```typescript
// Good: Clear component structure
interface Props {
  title: string;
  onClick: () => void;
}

export function MyComponent({ title, onClick }: Props) {
  return (
    <div>
      <h1>{title}</h1>
      <button onClick={onClick}>Click me</button>
    </div>
  );
}
```

### State Management
- Use React Query for server state
- Use local state for UI state
- Avoid prop drilling with context when appropriate

### Error Handling
```typescript
// Good: Proper error handling
try {
  const result = await someAsyncOperation();
  // Handle success
} catch (error) {
  console.error('Operation failed:', error);
  // Handle error appropriately
}
```

## 🧪 Testing

### Running Tests
```bash
npm run test
npm run test:watch
npm run test:coverage
```

### Testing Guidelines
- Write tests for new features
- Test both success and error cases
- Mock external dependencies
- Aim for good test coverage

## 📚 Documentation

### Code Documentation
- Add JSDoc comments for public APIs
- Document complex business logic
- Keep README files up to date

### Commit Messages
Follow conventional commit format:
```
feat: add new NFT creation feature
fix: resolve wallet connection issue
docs: update API documentation
style: format code with prettier
refactor: simplify NFT minting logic
test: add tests for wallet adapter
```

## 🔧 Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run preview         # Preview production build

# Code Quality
npm run lint            # Run ESLint
npm run lint:fix        # Fix ESLint issues
npm run type-check      # Run TypeScript type checking
npm run format          # Format code with Prettier

# Database
npm run supabase:start  # Start Supabase local development
npm run supabase:reset  # Reset Supabase database
```

## 🎨 UI/UX Guidelines

### Design System
- Use the existing shadcn/ui components
- Follow the glass-morphism design theme
- Maintain consistent spacing and colors
- Ensure responsive design

### Accessibility
- Add proper ARIA labels
- Ensure keyboard navigation
- Maintain good color contrast
- Test with screen readers

## 🚨 Issue Reporting

### Bug Reports
- Use the bug report template
- Include steps to reproduce
- Provide browser and OS information
- Include console errors

### Feature Requests
- Use the feature request template
- Describe the problem you're solving
- Provide mockups if possible
- Consider implementation complexity

## 📞 Communication

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and general discussion
- **Discord**: For real-time chat (if available)

## 🎯 Code of Conduct

We are committed to providing a welcoming and inclusive environment. Please:
- Be respectful and inclusive
- Focus on constructive feedback
- Help newcomers learn and contribute
- Report any unacceptable behavior

## 📋 Pull Request Checklist

- [ ] Tests pass
- [ ] Code follows style guidelines
- [ ] Documentation updated
- [ ] Commit messages are clear
- [ ] PR description explains changes
- [ ] Related issues linked
- [ ] Reviewed by at least one maintainer

## 🙏 Recognition

Contributors will be recognized in:
- GitHub repository contributors list
- Release notes
- Project documentation

Thank you for contributing to Solana Artisan Plaza! 🎨✨
