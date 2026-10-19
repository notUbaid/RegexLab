# RegexLab Coding Standards & Best Practices

This document outlines the engineering guidelines, TypeScript patterns, and architectural conventions adhered to in RegexLab. Every developer and contributor must follow these standards.

---

## 1. Core Principles

### 1.1 Readability First
- Code is read 10x more often than it is written.
- Write self-documenting code with clear, descriptive variable and function names.
- Always include beginner-friendly explanatory comments on complex parsing or algorithmic logic.

### 1.2 Keep It Simple (KISS)
- Choose the simplest solution that works cleanly.
- Avoid over-engineering, premature abstractions, or speculative generalizations.
- Code should be accessible to a student or beginner reading TypeScript for the first time.

### 1.3 Strict Immutability
- **NEVER mutate objects or arrays directly**:
  ```typescript
  // AVOID: Direct mutation
  state.builderBlocks.push(newBlock);
  user.name = 'Alice';

  // RECOMMENDED: Pure immutable copy
  return {
    ...state,
    builderBlocks: [...state.builderBlocks, newBlock]
  };
  ```

### 1.4 Absolute Ban on the `any` Type
- Never use the `any` escape hatch.
- Use explicit interfaces, union types, generics, or `unknown` with type guards:
  ```typescript
  // AVOID
  catch (err: any) { console.log(err.message); }

  // RECOMMENDED
  catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.log(message);
  }
  ```

### 1.5 Early Returns (Avoid Deep Nesting)
- Use guard clauses and return early to keep function bodies flat and readable:
  ```typescript
  // AVOID: Deep nesting
  function process(item) {
    if (item) {
      if (item.isValid) {
        if (!item.isExpired) {
          // logic
        }
      }
    }
  }

  // RECOMMENDED: Flat guard clauses
  function process(item) {
    if (!item) return;
    if (!item.isValid) return;
    if (item.isExpired) return;
    // clean logic here
  }
  ```

### 1.6 No Magic Numbers
- Always declare named constants with clear descriptive names:
  ```typescript
  // AVOID
  if (steps.length > 500) return;
  setTimeout(tick, 40);

  // RECOMMENDED
  const MAX_RECORDED_SIMULATION_STEPS = 500;
  const AUDIO_CLICK_DURATION_SECONDS = 0.04;
  ```

---

## 2. JSDoc & Commenting Conventions

All exported functions, types, and stores must include clear JSDoc blocks with `@param`, `@returns`, and `@example`:

```typescript
/**
 * Translates a regular expression pattern into an array of human-readable explanation blocks.
 * 
 * @param pattern - The raw regex pattern string
 * @returns Array of explanation blocks formatted for beginner readability
 * 
 * @example
 * ```typescript
 * const blocks = translateRegexToHuman('^\\d{4}$');
 * console.log(blocks[0].summary); // "Asserts position at the beginning of the string"
 * ```
 */
export function translateRegexToHuman(pattern: string): ExplanationBlock[] {
  // ...
}
```

---

## 3. React & Component Guidelines

1. **Functional Components with Typed Props**: Always declare an explicit interface for component props.
2. **Custom Hooks for Reusable Logic**: Extract stateful operations into focused custom hooks prefixed with `use`.
3. **Accessibility (a11y)**: Interactive controls must be keyboard accessible, provide `aria-label` or `title` tooltips, and support focus rings.
4. **Tailwind CSS Styling**: Use utility classes directly. Maintain design tokens from CSS variables (`var(--color-bg)`, `var(--color-primary)`).
