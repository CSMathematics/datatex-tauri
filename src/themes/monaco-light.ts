// Definition of "DataTex Light" theme for Monaco Editor
export const dataTexLightTheme = {
  base: 'vs', // Based on VSCode Light theme
  inherit: true,
  rules: [
    // === LaTeX Structural Commands ===
    { token: 'keyword.control.latex', foreground: 'AF00DB', fontStyle: 'bold' }, // \documentclass, \begin, \end, etc.
    { token: 'keyword.latex', foreground: 'AF00DB' }, // Generic LaTeX commands
    { token: 'keyword.escape.latex', foreground: 'AF00DB' }, // Escaped characters
    
    // === Environments ===
    { token: 'entity.name.type.environment.latex', foreground: '267F99' }, // Environment names (teal)
    { token: 'entity.name.type.environment.math.latex', foreground: '267F99', fontStyle: 'italic' }, // Math environment names
    { token: 'entity.name.class.latex', foreground: '001080' }, // Document class names
    { token: 'entity.name.package.latex', foreground: '001080' }, // Package names (dark blue)
    
    // === Sections ===
    { token: 'entity.name.section.latex', foreground: '795E26', fontStyle: 'bold' }, // Section commands (brown)
    { token: 'entity.name.section.content.latex', foreground: '795E26' }, // Section titles
    
    // === Formatting ===
    { token: 'entity.name.function.formatting.latex', foreground: '795E26' }, // \textbf, \textit, etc.
    { token: 'text.formatting.latex', foreground: '000000' }, // Text inside formatting commands
    
    // === References ===
    { token: 'entity.name.reference.latex', foreground: '0000FF', fontStyle: 'italic' }, // \label, \ref, \cite
    { token: 'entity.name.reference.content.latex', foreground: '0000FF' }, // Reference labels
    
    // === Functions ===
    { token: 'entity.name.function.latex', foreground: '795E26' }, // Other functions
    { token: 'entity.name.function.user.latex', foreground: 'AF00DB' }, // User-defined commands
    
    // === Math Mode ===
    { token: 'keyword.math.delimiter.latex', foreground: 'A31515', fontStyle: 'bold' }, // $ and $$ delimiters
    { token: 'entity.name.function.math.latex', foreground: '795E26' }, // Math commands (\frac, \sum, \alpha)
    { token: 'keyword.math.latex', foreground: 'AF00DB' }, // Other math keywords
    { token: 'keyword.escape.math.latex', foreground: 'AF00DB' }, // Escaped chars in math
    { token: 'keyword.operator.math.latex', foreground: '000000' }, // Math operators (+, -, =)
    { token: 'keyword.operator.subscript.latex', foreground: 'AF00DB' }, // _ and ^
    { token: 'constant.numeric.math.latex', foreground: '098658' }, // Numbers in math
    { token: 'variable.math.latex', foreground: '000000' }, // Variables (x, y, etc.)
    
    // Math delimiters
    { token: 'delimiter.curly.math.latex', foreground: '0000FF' }, // {} in math
    { token: 'delimiter.bracket.math.latex', foreground: 'AF00DB' }, // [] in math
    { token: 'delimiter.parenthesis.math.latex', foreground: '000000' }, // () in math
    
    // === Comments ===
    { token: 'comment.line.latex', foreground: '008000', fontStyle: 'italic' }, // % Comments
    { token: 'comment.content.latex', foreground: '008000', fontStyle: 'italic' },
    
    // === Numbers and Units ===
    { token: 'constant.numeric.latex', foreground: '098658' }, // Numbers and LaTeX lengths
    
    // === Delimiters (outside math) ===
    { token: 'delimiter.curly.latex', foreground: '0000FF' }, // {}
    { token: 'delimiter.bracket.latex', foreground: 'AF00DB' }, // []
    { token: 'delimiter.parenthesis.latex', foreground: '000000' }, // ()
    
    // === Operators ===
    { token: 'keyword.operator.latex', foreground: '000000' }, // &, ~, etc.
    
    // === Generic ===
    { token: 'meta.bracket.latex', foreground: 'AF00DB' }, // Optional arguments
    { token: 'meta.block.latex', foreground: '000000' }, // Required arguments
    
    // Legacy compatibility
    { token: 'string', foreground: 'A31515' },
    { token: 'string.math', foreground: 'A31515' },
    { token: 'variable', foreground: '001080' },
    { token: 'number', foreground: '098658' },
    { token: 'tag', foreground: '800000' },
    { token: 'attribute.name', foreground: 'FF0000' }
  ],
  colors: {
    'editor.background': '#FFFFFF',
    'editor.foreground': '#000000',
    'editor.lineHighlightBackground': '#E8E8E8',
    'editorCursor.foreground': '#000000',
    'editorWhitespace.foreground': '#D4D4D4',
    'editorIndentGuide.background': '#D3D3D3',
    'editorLineNumber.foreground': '#2B91AF',
    'editorBracketMatch.background': '#E8E8E8',
    'editorBracketMatch.border': '#888888'
  }
}
