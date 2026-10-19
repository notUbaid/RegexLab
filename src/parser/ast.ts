/**
 * ============================================================================
 * RegexLab - Abstract Syntax Tree (AST) Builder
 * ============================================================================
 * 
 * Welcome! In this file, we convert our flat list of tokens into a hierarchical
 * "Tree" structure called an Abstract Syntax Tree (AST).
 * 
 * WHAT IS AN AST?
 * Think of an AST like a family tree or an organizational chart for your code.
 * In a regular expression like `(a|b)+`:
 * 
 *   Expression (Root)
 *      └── Quantifier (+)
 *             └── Group ()
 *                    ├── Literal (a)
 *                    ├── Alternation (|)
 *                    └── Literal (b)
 * 
 * WHY DO WE NEED AN AST?
 * A flat list of tokens doesn't easily tell us which elements are inside a group
 * or which token a quantifier (like `+` or `*`) is modifying. The AST makes
 * this parent-child relationship completely clear!
 */

import { AstNode } from '../types/regex';
import { tokenizeRegex } from './tokenizer';

/**
 * Builds an Abstract Syntax Tree (AST) from a raw regular expression string.
 * 
 * @param pattern - The raw regular expression pattern to parse
 * @returns The root AstNode of the generated tree
 * 
 * @example
 * ```typescript
 * const ast = buildRegexAst('^a+b$');
 * console.log(ast.children?.length); // 3 (Anchor, Quantifier wrapping 'a', Anchor)
 * ```
 */
export function buildRegexAst(pattern: string): AstNode {
  // Step 1: Handle the edge case of an empty pattern
  if (!pattern) {
    return {
      id: 'ast-root-empty',
      type: 'Expression',
      label: 'Empty Pattern',
      raw: '',
      start: 0,
      end: 0,
      children: [],
    };
  }

  // Step 2: Convert the pattern into a flat array of tokens
  const tokens = tokenizeRegex(pattern);

  // Step 3: Create the top-level "Root" container node of our tree
  const rootNode: AstNode = {
    id: 'ast-root',
    type: 'Expression',
    label: `Pattern: /${pattern}/`,
    raw: pattern,
    start: 0,
    end: pattern.length,
    children: [],
  };

  /**
   * We use a "Stack" to track nested parent nodes.
   * Whenever we see a group open `(`, we push the new group onto the stack
   * so all subsequent tokens become children of this group.
   * When we see `)`, we pop the group off the stack!
   */
  const parentNodeStack: AstNode[] = [rootNode];

  // Helper function to safely get the current active parent container
  const getCurrentParent = (): AstNode => {
    return parentNodeStack[parentNodeStack.length - 1];
  };

  // Step 4: Iterate through all tokens and insert them into the tree
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const currentParent = getCurrentParent();

    // Ensure the parent's children array exists
    if (!currentParent.children) {
      currentParent.children = [];
    }

    // ------------------------------------------------------------------------
    // CASE A: GROUPS & LOOKAROUNDS (Start of a nested container)
    // ------------------------------------------------------------------------
    if (token.category === 'group-open' || token.category === 'lookaround') {
      const groupNode: AstNode = {
        id: `ast-${token.id}`,
        type: token.category === 'lookaround' ? 'Lookaround' : 'Group',
        label: token.title,
        raw: token.raw,
        start: token.start,
        end: token.end,
        children: [],
        meta: {
          groupIndex: token.groupIndex,
          groupName: token.groupName,
        },
      };

      // Add the new group as a child of the current container
      currentParent.children.push(groupNode);

      // Push this group onto our stack so subsequent tokens become its children
      parentNodeStack.push(groupNode);
      continue;
    }

    // ------------------------------------------------------------------------
    // CASE B: GROUP CLOSE `)` (Exit current nested container)
    // ------------------------------------------------------------------------
    if (token.category === 'group-close') {
      // Never pop the root node (ensure stack depth > 1)
      if (parentNodeStack.length > 1) {
        const closedGroupNode = parentNodeStack.pop();

        if (closedGroupNode) {
          // Update the group node's end position and raw string to include the ')'
          closedGroupNode.end = token.end;
          closedGroupNode.raw = pattern.slice(closedGroupNode.start, token.end);
        }
      }
      continue;
    }

    // ------------------------------------------------------------------------
    // CASE C: QUANTIFIERS (*, +, ?, {n,m})
    // ------------------------------------------------------------------------
    if (token.category === 'quantifier') {
      // Quantifiers modify the immediately preceding sibling element!
      if (currentParent.children.length > 0) {
        const targetElement = currentParent.children[currentParent.children.length - 1];

        // Create a Quantifier node that WRAPS the target element as its child
        const quantifierNode: AstNode = {
          id: `ast-${token.id}`,
          type: 'Quantifier',
          label: token.title,
          raw: `${targetElement.raw}${token.raw}`,
          start: targetElement.start,
          end: token.end,
          children: [targetElement],
          meta: token.quantifier,
        };

        // Replace the target element in the parent's list with this new wrapping quantifier
        currentParent.children[currentParent.children.length - 1] = quantifierNode;
      }
      continue;
    }

    // ------------------------------------------------------------------------
    // CASE D: ALTERNATION (Logical OR `|`)
    // ------------------------------------------------------------------------
    if (token.category === 'alternation') {
      const alternationNode: AstNode = {
        id: `ast-${token.id}`,
        type: 'Disjunction',
        label: 'Alternation (OR)',
        raw: token.raw,
        start: token.start,
        end: token.end,
      };

      currentParent.children.push(alternationNode);
      continue;
    }

    // ------------------------------------------------------------------------
    // CASE E: ANCHORS (^, $, \b, \B)
    // ------------------------------------------------------------------------
    if (token.category === 'anchor') {
      const anchorNode: AstNode = {
        id: `ast-${token.id}`,
        type: 'Anchor',
        label: token.title,
        raw: token.raw,
        start: token.start,
        end: token.end,
      };

      currentParent.children.push(anchorNode);
      continue;
    }

    // ------------------------------------------------------------------------
    // CASE F: CHARACTER CLASSES ([a-z], \d, \w, etc.)
    // ------------------------------------------------------------------------
    if (token.category === 'char-class') {
      const classNode: AstNode = {
        id: `ast-${token.id}`,
        type: 'CharacterClass',
        label: token.title,
        raw: token.raw,
        start: token.start,
        end: token.end,
        meta: {
          detail: token.detail,
        },
      };

      currentParent.children.push(classNode);
      continue;
    }

    // ------------------------------------------------------------------------
    // CASE G: LITERAL CHARACTERS & ESCAPES
    // ------------------------------------------------------------------------
    const literalNode: AstNode = {
      id: `ast-${token.id}`,
      type: 'Literal',
      label: token.title,
      raw: token.raw,
      start: token.start,
      end: token.end,
    };

    currentParent.children.push(literalNode);
  }

  return rootNode;
}

/**
 * Counts the total number of nodes in an AST tree recursively.
 * 
 * @param node - The starting AST node (usually the root)
 * @returns Total count of all nodes and descendant nodes
 */
export function countAstNodes(node: AstNode): number {
  if (!node.children || node.children.length === 0) {
    return 1;
  }

  let count = 1;
  for (const child of node.children) {
    count += countAstNodes(child);
  }

  return count;
}

/**
 * Computes the maximum depth of an AST tree.
 * 
 * @param node - The root AST node
 * @returns Tree depth (1 for leaf node, 2 for node with children, etc.)
 */
export function getAstMaxDepth(node: AstNode): number {
  if (!node.children || node.children.length === 0) {
    return 1;
  }

  let maxChildDepth = 0;
  for (const child of node.children) {
    const childDepth = getAstMaxDepth(child);
    if (childDepth > maxChildDepth) {
      maxChildDepth = childDepth;
    }
  }

  return 1 + maxChildDepth;
}
