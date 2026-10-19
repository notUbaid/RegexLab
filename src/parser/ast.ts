import { AstNode } from '../types/regex';
import { tokenizeRegex } from './tokenizer';

export function buildRegexAst(pattern: string): AstNode {
  if (!pattern) {
    return {
      id: 'ast-root',
      type: 'Expression',
      label: 'Empty Pattern',
      raw: '',
      start: 0,
      end: 0,
      children: [],
    };
  }

  const tokens = tokenizeRegex(pattern);

  // Group tokens into a tree structure
  const root: AstNode = {
    id: 'ast-root',
    type: 'Expression',
    label: `Pattern: /${pattern}/`,
    raw: pattern,
    start: 0,
    end: pattern.length,
    children: [],
  };

  // Stack of node containers (for groups)
  const nodeStack: AstNode[] = [root];

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const currentParent = nodeStack[nodeStack.length - 1];

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
      if (!currentParent.children) currentParent.children = [];
      currentParent.children.push(groupNode);
      nodeStack.push(groupNode);
      continue;
    }

    if (token.category === 'group-close') {
      if (nodeStack.length > 1) {
        const closedGroup = nodeStack.pop();
        if (closedGroup) {
          closedGroup.end = token.end;
          closedGroup.raw = pattern.slice(closedGroup.start, token.end);
        }
      }
      continue;
    }

    if (token.category === 'quantifier') {
      // Attach quantifier to the last child in current parent
      if (currentParent.children && currentParent.children.length > 0) {
        const targetNode = currentParent.children[currentParent.children.length - 1];
        const quantNode: AstNode = {
          id: `ast-${token.id}`,
          type: 'Quantifier',
          label: token.title,
          raw: token.raw,
          start: targetNode.start,
          end: token.end,
          children: [targetNode],
          meta: token.quantifier,
        };
        // Replace target with quantifier wrapping target
        currentParent.children[currentParent.children.length - 1] = quantNode;
      }
      continue;
    }

    if (token.category === 'alternation') {
      const altNode: AstNode = {
        id: `ast-${token.id}`,
        type: 'Disjunction',
        label: 'Alternation (OR)',
        raw: token.raw,
        start: token.start,
        end: token.end,
      };
      if (!currentParent.children) currentParent.children = [];
      currentParent.children.push(altNode);
      continue;
    }

    if (token.category === 'anchor') {
      const anchorNode: AstNode = {
        id: `ast-${token.id}`,
        type: 'Anchor',
        label: token.title,
        raw: token.raw,
        start: token.start,
        end: token.end,
      };
      if (!currentParent.children) currentParent.children = [];
      currentParent.children.push(anchorNode);
      continue;
    }

    if (token.category === 'char-class') {
      const classNode: AstNode = {
        id: `ast-${token.id}`,
        type: 'CharacterClass',
        label: token.title,
        raw: token.raw,
        start: token.start,
        end: token.end,
        meta: { detail: token.detail },
      };
      if (!currentParent.children) currentParent.children = [];
      currentParent.children.push(classNode);
      continue;
    }

    // Literals or Escapes
    const litNode: AstNode = {
      id: `ast-${token.id}`,
      type: 'Literal',
      label: token.title,
      raw: token.raw,
      start: token.start,
      end: token.end,
    };
    if (!currentParent.children) currentParent.children = [];
    currentParent.children.push(litNode);
  }

  return root;
}
