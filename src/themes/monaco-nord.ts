// Nord theme for Monaco Editor - matches dark-nord UI theme
// Based on Nord color palette: https://www.nordtheme.com/
export const nordTheme = {
  base: "vs-dark" as const,
  inherit: true,
  rules: [
    // === LaTeX Structural Commands ===
    { token: "keyword.control.latex", foreground: "81A1C1", fontStyle: "bold" }, // Nord9 - \\documentclass, \\begin, \\end
    { token: "keyword.latex", foreground: "81A1C1" }, // Nord9 - Generic LaTeX commands
    { token: "keyword.escape.latex", foreground: "81A1C1" }, // Nord9 - Escaped characters

    // === Environments ===
    { token: "entity.name.type.environment.latex", foreground: "8FBCBB" }, // Nord7 - Environment names
    {
      token: "entity.name.type.environment.math.latex",
      foreground: "8FBCBB",
      fontStyle: "italic",
    },
    { token: "entity.name.class.latex", foreground: "88C0D0" }, // Nord8 - Document class names
    { token: "entity.name.package.latex", foreground: "88C0D0" }, // Nord8 - Package names

    // === Sections ===
    {
      token: "entity.name.section.latex",
      foreground: "EBCB8B",
      fontStyle: "bold",
    }, // Nord13 - Section commands
    { token: "entity.name.section.content.latex", foreground: "EBCB8B" },

    // === Formatting ===
    { token: "entity.name.function.formatting.latex", foreground: "88C0D0" }, // Nord8
    { token: "text.formatting.latex", foreground: "ECEFF4" }, // Nord6 - White text

    // === References ===
    {
      token: "entity.name.reference.latex",
      foreground: "5E81AC",
      fontStyle: "italic",
    }, // Nord10
    { token: "entity.name.reference.content.latex", foreground: "5E81AC" },

    // === Functions ===
    { token: "entity.name.function.latex", foreground: "88C0D0" }, // Nord8
    { token: "entity.name.function.user.latex", foreground: "D08770" }, // Nord12 - User-defined

    // === Math Mode ===
    {
      token: "keyword.math.delimiter.latex",
      foreground: "D08770",
      fontStyle: "bold",
    }, // Nord12 - $ delimiters
    { token: "entity.name.function.math.latex", foreground: "B48EAD" }, // Nord15 - Math commands
    { token: "keyword.math.latex", foreground: "B48EAD" }, // Nord15
    { token: "keyword.escape.math.latex", foreground: "81A1C1" }, // Nord9
    { token: "keyword.operator.math.latex", foreground: "ECEFF4" }, // Nord6 - Operators
    { token: "keyword.operator.subscript.latex", foreground: "81A1C1" }, // Nord9 - _ and ^
    { token: "constant.numeric.math.latex", foreground: "B48EAD" }, // Nord15 - Numbers
    { token: "variable.math.latex", foreground: "ECEFF4" }, // Nord6 - Variables

    // Math delimiters
    { token: "delimiter.curly.math.latex", foreground: "EBCB8B" }, // Nord13
    { token: "delimiter.bracket.math.latex", foreground: "88C0D0" }, // Nord8
    { token: "delimiter.parenthesis.math.latex", foreground: "A3BE8C" }, // Nord14

    // === Comments ===
    { token: "comment.line.latex", foreground: "616E88", fontStyle: "italic" }, // Nord3 Bright
    {
      token: "comment.content.latex",
      foreground: "616E88",
      fontStyle: "italic",
    },

    // === Numbers and Units ===
    { token: "constant.numeric.latex", foreground: "B48EAD" }, // Nord15

    // === Delimiters (outside math) ===
    { token: "delimiter.curly.latex", foreground: "EBCB8B" }, // Nord13
    { token: "delimiter.bracket.latex", foreground: "88C0D0" }, // Nord8
    { token: "delimiter.parenthesis.latex", foreground: "A3BE8C" }, // Nord14

    // === Operators ===
    { token: "keyword.operator.latex", foreground: "ECEFF4" }, // Nord6

    // === Generic ===
    { token: "meta.bracket.latex", foreground: "88C0D0" },
    { token: "meta.block.latex", foreground: "A3BE8C" },

    // Legacy compatibility
    { token: "string", foreground: "A3BE8C" }, // Nord14 - Green
    { token: "string.math", foreground: "A3BE8C" },
    { token: "variable", foreground: "ECEFF4" },
    { token: "number", foreground: "B48EAD" },
    { token: "tag", foreground: "8FBCBB" },
    { token: "attribute.name", foreground: "D08770" },
  ],
  colors: {
    "editor.background": "#2E3440", // Nord0
    "editor.foreground": "#D8DEE9", // Nord4
    "editor.lineHighlightBackground": "#3B4252", // Nord1
    "editorCursor.foreground": "#D8DEE9", // Nord4
    "editorWhitespace.foreground": "#4C566A", // Nord3
    "editorIndentGuide.background": "#434C5E", // Nord2
    "editorLineNumber.foreground": "#4C566A", // Nord3
    "editorBracketMatch.background": "#434C5E", // Nord2
    "editorBracketMatch.border": "#88C0D0", // Nord8
    "editor.selectionBackground": "#434C5E", // Nord2
  },
};
