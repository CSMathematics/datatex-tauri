// Ορισμός του "DataTex Dark" θέματος για τον Monaco Editor
export const dataTexDarkTheme = {
  base: 'vs-dark', // Βασίζεται στο Dark theme του VSCode
  inherit: true,
  rules: [
    // === LaTeX Structural Commands ===
    { token: 'keyword.control.latex', foreground: 'C586C0', fontStyle: 'bold' }, // \documentclass, \begin, \end, etc.
    { token: 'keyword.latex', foreground: 'C586C0' }, // Generic LaTeX commands
    { token: 'keyword.escape.latex', foreground: 'C586C0' }, // Escaped characters
    
    // === Environments ===
    { token: 'entity.name.type.environment.latex', foreground: '4EC9B0' }, // Environment names (turquoise)
    { token: 'entity.name.type.environment.math.latex', foreground: '4EC9B0', fontStyle: 'italic' }, // Math environment names
    { token: 'entity.name.class.latex', foreground: '9CDCFE' }, // Document class names
    { token: 'entity.name.package.latex', foreground: '9CDCFE' }, // Package names (light blue)
    
    // === Sections ===
    { token: 'entity.name.section.latex', foreground: 'DCDCAA', fontStyle: 'bold' }, // Section commands (yellow)
    { token: 'entity.name.section.content.latex', foreground: 'DCDCAA' }, // Section titles
    
    // === Formatting ===
    { token: 'entity.name.function.formatting.latex', foreground: 'DCDCAA' }, // \textbf, \textit, etc.
    { token: 'text.formatting.latex', foreground: 'D4D4D4' }, // Text inside formatting commands
    
    // === References ===
    { token: 'entity.name.reference.latex', foreground: '9CDCFE', fontStyle: 'italic' }, // \label, \ref, \cite
    { token: 'entity.name.reference.content.latex', foreground: '9CDCFE' }, // Reference labels
    
    // === Functions ===
    { token: 'entity.name.function.latex', foreground: 'DCDCAA' }, // Other functions
    { token: 'entity.name.function.user.latex', foreground: 'C586C0' }, // User-defined commands
    
    // === Math Mode ===
    { token: 'keyword.math.delimiter.latex', foreground: 'CE9178', fontStyle: 'bold' }, // $ and $$ delimiters
    { token: 'entity.name.function.math.latex', foreground: '3FBCB0' }, // Math commands (\frac, \sum, \alpha)
    { token: 'keyword.math.latex', foreground: '3FBCB0' }, // Other math keywords
    { token: 'keyword.escape.math.latex', foreground: 'C586C0' }, // Escaped chars in math
    { token: 'keyword.operator.math.latex', foreground: '19B873' }, // Math operators (+, -, =)
    { token: 'keyword.operator.subscript.latex', foreground: 'C586C0' }, // _ and ^
    { token: 'constant.numeric.math.latex', foreground: '19B873' }, // Numbers in math
    { token: 'variable.math.latex', foreground: '19B873' }, // Variables (x, y, etc.)
    
    // Math delimiters
    { token: 'delimiter.curly.math.latex', foreground: 'FFD700' }, // {} in math
    { token: 'delimiter.bracket.math.latex', foreground: 'DA70D6' }, // [] in math
    { token: 'delimiter.parenthesis.math.latex', foreground: 'D4D4D4' }, // () in math
    
    // === Comments ===
    { token: 'comment.line.latex', foreground: '6A9955', fontStyle: 'italic' }, // % Comments
    { token: 'comment.content.latex', foreground: '6A9955', fontStyle: 'italic' },
    
    // === Numbers and Units ===
    { token: 'constant.numeric.latex', foreground: 'B5CEA8' }, // Numbers and LaTeX lengths
    
    // === Delimiters (outside math) ===
    { token: 'delimiter.curly.latex', foreground: 'FFD700' }, // {}
    { token: 'delimiter.bracket.latex', foreground: 'DA70D6' }, // []
    { token: 'delimiter.parenthesis.latex', foreground: 'D4D4D4' }, // ()
    
    // === Operators ===
    { token: 'keyword.operator.latex', foreground: 'D4D4D4' }, // &, ~, etc.
    
    // === Generic ===
    { token: 'meta.bracket.latex', foreground: 'DA70D6' }, // Optional arguments
    { token: 'meta.block.latex', foreground: 'D4D4D4' }, // Required arguments
    
    // Legacy compatibility
    { token: 'string', foreground: 'CE9178' },
    { token: 'string.math', foreground: 'CE9178' },
    { token: 'variable', foreground: '9CDCFE' },
    { token: 'number', foreground: 'B5CEA8' },
    { token: 'tag', foreground: '4EC9B0' },
    { token: 'attribute.name', foreground: 'DCDCAA' }
  ],
  colors: {
    'editor.background': '#1f1f1f', // Το σκούρο γκρι του VSCode
    'editor.foreground': '#D4D4D4',
    'editor.lineHighlightBackground': '#2a2a2a', // Η γραμμή που έχεις τον κέρσορα
    'editorCursor.foreground': '#A6E22E', // Πράσινος κέρσορας
    'editorWhitespace.foreground': '#3B3A32',
    'editorIndentGuide.background': '#404040',
    'editorLineNumber.foreground': '#858585',
    'editorBracketMatch.background': '#3B3B3B',
    'editorBracketMatch.border': '#888888'
  }
}
