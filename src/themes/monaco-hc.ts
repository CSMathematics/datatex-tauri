// Definition of "DataTex High Contrast" theme for Monaco Editor
// Optimized for accessibility and color-blind users
export const dataTexHCTheme = {
  base: 'hc-black', // Based on High Contrast theme
  inherit: true,
  rules: [
    // === LaTeX Structural Commands ===
    { token: 'keyword.control.latex', foreground: 'FF0000', fontStyle: 'bold' }, // \documentclass, \begin, \end, etc. (red)
    { token: 'keyword.latex', foreground: 'FF0000' }, // Generic LaTeX commands
    { token: 'keyword.escape.latex', foreground: 'FF0000' }, // Escaped characters
    
    // === Environments ===
    { token: 'entity.name.type.environment.latex', foreground: '00FFFF' }, // Environment names (cyan)
    { token: 'entity.name.type.environment.math.latex', foreground: '00FFFF', fontStyle: 'italic' }, // Math environment names
    { token: 'entity.name.class.latex', foreground: '00FFFF' }, // Document class names
    { token: 'entity.name.package.latex', foreground: '00FFFF' }, // Package names (cyan)
    
    // === Sections ===
    { token: 'entity.name.section.latex', foreground: 'FFA500', fontStyle: 'bold' }, // Section commands (orange)
    { token: 'entity.name.section.content.latex', foreground: 'FFA500' }, // Section titles
    
    // === Formatting ===
    { token: 'entity.name.function.formatting.latex', foreground: 'FFA500' }, // \textbf, \textit, etc. (orange)
    { token: 'text.formatting.latex', foreground: 'FFFFFF' }, // Text inside formatting commands
    
    // === References ===
    { token: 'entity.name.reference.latex', foreground: '00FFFF', fontStyle: 'italic' }, // \label, \ref, \cite (cyan)
    { token: 'entity.name.reference.content.latex', foreground: '00FFFF' }, // Reference labels
    
    // === Functions ===
    { token: 'entity.name.function.latex', foreground: 'FFA500' }, // Other functions (orange)
    { token: 'entity.name.function.user.latex', foreground: 'FF0000' }, // User-defined commands (red)
    
    // === Math Mode ===
    { token: 'keyword.math.delimiter.latex', foreground: 'FFFF00', fontStyle: 'bold' }, // $ and $$ delimiters (yellow)
    { token: 'entity.name.function.math.latex', foreground: 'FFA500' }, // Math commands (orange)
    { token: 'keyword.math.latex', foreground: 'FF0000' }, // Other math keywords (red)
    { token: 'keyword.escape.math.latex', foreground: 'FF0000' }, // Escaped chars in math
    { token: 'keyword.operator.math.latex', foreground: 'FFFFFF' }, // Math operators (+, -, =)
    { token: 'keyword.operator.subscript.latex', foreground: 'FF0000' }, // _ and ^ (red)
    { token: 'constant.numeric.math.latex', foreground: '00FF00' }, // Numbers in math (green)
    { token: 'variable.math.latex', foreground: 'FFFFFF' }, // Variables (x, y, etc.)
    
    // Math delimiters (different colors for different levels)
    { token: 'delimiter.curly.math.latex', foreground: 'FFFF00' }, // {} in math (yellow)
    { token: 'delimiter.bracket.math.latex', foreground: 'FF00FF' }, // [] in math (magenta)
    { token: 'delimiter.parenthesis.math.latex', foreground: 'FFFFFF' }, // () in math (white)
    
    // === Comments ===
    { token: 'comment.line.latex', foreground: '00FF00', fontStyle: 'italic' }, // % Comments (green)
    { token: 'comment.content.latex', foreground: '00FF00', fontStyle: 'italic' },
    
    // === Numbers and Units ===
    { token: 'constant.numeric.latex', foreground: '00FF00' }, // Numbers and LaTeX lengths (green)
    
    // === Delimiters (outside math) ===
    { token: 'delimiter.curly.latex', foreground: 'FFFF00' }, // {} (yellow)
    { token: 'delimiter.bracket.latex', foreground: 'FF00FF' }, // [] (magenta)
    { token: 'delimiter.parenthesis.latex', foreground: 'FFFFFF' }, // () (white)
    
    // === Operators ===
    { token: 'keyword.operator.latex', foreground: 'FFFFFF' }, // &, ~, etc.
    
    // === Generic ===
    { token: 'meta.bracket.latex', foreground: 'FF00FF' }, // Optional arguments
    { token: 'meta.block.latex', foreground: 'FFFFFF' }, // Required arguments
    
    // Legacy compatibility
    { token: 'string', foreground: 'FFFF00' },
    { token: 'string.math', foreground: 'FFFF00' },
    { token: 'variable', foreground: '00FFFF' },
    { token: 'number', foreground: '00FF00' },
    { token: 'tag', foreground: 'FFFFFF' },
    { token: 'attribute.name', foreground: 'FFA500' }
  ],
  colors: {
    'editor.background': '#000000',
    'editor.foreground': '#FFFFFF',
    'editor.lineHighlightBackground': '#FFFFFF20',
    'editorCursor.foreground': '#FFFFFF',
    'editorWhitespace.foreground': '#7C7C7C',
    'editorIndentGuide.background': '#FFFFFF',
    'editorLineNumber.foreground': '#FFFFFF',
    'editorBracketMatch.background': '#FFFFFF30',
    'editorBracketMatch.border': '#FFFFFF'
  }
}
