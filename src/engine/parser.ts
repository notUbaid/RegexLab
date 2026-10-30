import { AstNode, RegexToken } from './types';

export function parseAst(tokens: RegexToken[], pattern: string): AstNode {
  if (!tokens.length) {
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

  const root: AstNode = {
    id: 'ast-root',
    type: 'Expression',
    label: `/${pattern}/`,
    raw: pattern,
    start: 0,
    end: pattern.length,
    children: [],
  };

  const stack: AstNode[] = [root];

  for (let i = 0; i < tokens.length; i++) {
    const tok = tokens[i];
    const currentParent = stack[stack.length - 1];

    if (tok.type === 'group_open') {
      const groupNode: AstNode = {
        id: `ast-group-${tok.start}`,
        type: tok.title.includes('Look') ? 'Lookaround' : 'Group',
        label: tok.title,
        raw: tok.raw,
        start: tok.start,
        end: tok.end,
        groupIndex: tok.groupIndex,
        explanation: tok.explanation,
        children: [],
      };
      currentParent.children = currentParent.children || [];
      currentParent.children.push(groupNode);
      stack.push(groupNode);
      continue;
    }

    if (tok.type === 'group_close') {
      if (stack.length > 1) {
        const closed = stack.pop()!;
        closed.end = tok.end;
        closed.raw = pattern.slice(closed.start, closed.end);
      }
      continue;
    }

    // Quantifier wraps the previous sibling in current parent
    if (tok.type === 'quantifier') {
      const siblings = currentParent.children || [];
      if (siblings.length > 0) {
        const target = siblings.pop()!;
        const quantNode: AstNode = {
          id: `ast-quant-${tok.start}`,
          type: 'Quantifier',
          label: tok.title,
          raw: `${target.raw}${tok.raw}`,
          start: target.start,
          end: tok.end,
          explanation: tok.explanation,
          children: [target],
        };
        siblings.push(quantNode);
      }
      continue;
    }

    if (tok.type === 'alternation') {
      const altNode: AstNode = {
        id: `ast-alt-${tok.start}`,
        type: 'Alternative',
        label: 'OR Branch',
        raw: '|',
        start: tok.start,
        end: tok.end,
        explanation: 'Choice branch',
      };
      currentParent.children = currentParent.children || [];
      currentParent.children.push(altNode);
      continue;
    }

    // Leaf nodes: literals, character classes, anchors
    let nodeType = 'Literal';
    if (tok.category === 'character_class') nodeType = 'CharacterClass';
    else if (tok.category === 'anchor') nodeType = 'Anchor';

    const leafNode: AstNode = {
      id: `ast-node-${tok.start}`,
      type: nodeType,
      label: tok.title,
      raw: tok.raw,
      start: tok.start,
      end: tok.end,
      explanation: tok.explanation,
    };

    currentParent.children = currentParent.children || [];
    currentParent.children.push(leafNode);
  }

  return root;
}
