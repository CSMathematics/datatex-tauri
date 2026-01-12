// Monokai Vivid theme for Monaco Editor - matches dark-monokai UI theme
export const monokaiTheme = {
  base: "vs-dark" as const,
  inherit: true,
  rules: [
    // === LaTeX Structural Commands ===
    { token: "keyword.control.latex", foreground: "F92672", fontStyle: "bold" }, // Pink - \\documentclass, \\begin, \\end
    { token: "keyword.latex", foreground: "F92672" }, // Pink - Generic LaTeX commands
    { token: "keyword.escape.latex", foreground: "F92672" }, // Pink - Escaped characters

    // === Environments ===
    { token: "entity.name.type.environment.latex", foreground: "A6E22E" }, // Green - Environment names
    {
      token: "entity.name.type.environment.math.latex",
      foreground: "A6E22E",
      fontStyle: "italic",
    },
    { token: "entity.name.class.latex", foreground: "66D9EF" }, // Blue - Document class names
    { token: "entity.name.package.latex", foreground: "66D9EF" }, // Blue - Package names

    // === Sections ===
    {
      token: "entity.name.section.latex",
      foreground: "E6DB74",
      fontStyle: "bold",
    }, // Yellow - Section commands
    { token: "entity.name.section.content.latex", foreground: "E6DB74" },

    // === Formatting ===
    { token: "entity.name.function.formatting.latex", foreground: "A6E22E" }, // Green
    { token: "text.formatting.latex", foreground: "F8F8F2" }, // White text

    // === References ===
    {
      token: "entity.name.reference.latex",
      foreground: "66D9EF",
      fontStyle: "italic",
    }, // Blue
    { token: "entity.name.reference.content.latex", foreground: "66D9EF" },

    // === Functions ===
    { token: "entity.name.function.latex", foreground: "A6E22E" }, // Green
    { token: "entity.name.function.user.latex", foreground: "FD971F" }, // Orange - User-defined

    // === Math Mode ===
    {
      token: "keyword.math.delimiter.latex",
      foreground: "E6DB74",
      fontStyle: "bold",
    }, // Yellow - $ delimiters
    { token: "entity.name.function.math.latex", foreground: "AE81FF" }, // Purple - Math commands
    { token: "keyword.math.latex", foreground: "AE81FF" }, // Purple
    { token: "keyword.escape.math.latex", foreground: "F92672" }, // Pink
    { token: "keyword.operator.math.latex", foreground: "F8F8F2" }, // White operators
    { token: "keyword.operator.subscript.latex", foreground: "F92672" }, // Pink - _ and ^
    { token: "constant.numeric.math.latex", foreground: "AE81FF" }, // Purple - Numbers
    { token: "variable.math.latex", foreground: "F8F8F2" }, // White - Variables

    // Math delimiters
    { token: "delimiter.curly.math.latex", foreground: "E6DB74" }, // Yellow
    { token: "delimiter.bracket.math.latex", foreground: "66D9EF" }, // Blue
    { token: "delimiter.parenthesis.math.latex", foreground: "A6E22E" }, // Green

    // === Comments ===
    { token: "comment.line.latex", foreground: "75715E", fontStyle: "italic" }, // Gray
    {
      token: "comment.content.latex",
      foreground: "75715E",
      fontStyle: "italic",
    },

    // === Numbers and Units ===
    { token: "constant.numeric.latex", foreground: "AE81FF" }, // Purple

    // === Delimiters (outside math) ===
    { token: "delimiter.curly.latex", foreground: "E6DB74" }, // Yellow
    { token: "delimiter.bracket.latex", foreground: "66D9EF" }, // Blue
    { token: "delimiter.parenthesis.latex", foreground: "A6E22E" }, // Green

    // === Operators ===
    { token: "keyword.operator.latex", foreground: "F8F8F2" }, // White

    // === Generic ===
    { token: "meta.bracket.latex", foreground: "66D9EF" },
    { token: "meta.block.latex", foreground: "A6E22E" },

    // Legacy compatibility
    { token: "string", foreground: "E6DB74" }, // Yellow
    { token: "string.math", foreground: "E6DB74" },
    { token: "variable", foreground: "F8F8F2" },
    { token: "number", foreground: "AE81FF" },
    { token: "tag", foreground: "A6E22E" },
    { token: "attribute.name", foreground: "FD971F" },
  ],
  colors: {
    "editor.background": "#272822",
    "editor.foreground": "#F8F8F2",
    "editor.lineHighlightBackground": "#3E3D32",
    "editorCursor.foreground": "#F8F8F0",
    "editorWhitespace.foreground": "#464741",
    "editorIndentGuide.background": "#464741",
    "editorLineNumber.foreground": "#90908A",
    "editorBracketMatch.background": "#49483E",
    "editorBracketMatch.border": "#888888",
    "editor.selectionBackground": "#49483E",
  },
};
