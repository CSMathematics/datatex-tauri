# Advanced LaTeX Syntax Highlighting - Examples and Guide

## Overview

Το DataTex περιλαμβάνει ένα προηγμένο σύστημα syntax highlighting για LaTeX με:
- **11 λεπτομερείς κατηγορίες tokens** για όλα τα στοιχεία LaTeX
- **Ειδικό highlighting για math mode** με αυτόματη αναγνώριση
- **3 επαγγελματικά themes** (Dark, Light, High-Contrast)
- **Σύστημα παραμετροποίησης** για custom χρώματα

## Token Scopes Reference

### Structural Commands
**Scope:** `keyword.control.latex`  
**Χρώμα (Dark):** Purple/Magenta `#C586C0`

```latex
\documentclass{article}
\usepackage{amsmath}
\begin{document}
\end{document}
```

### Environment Names
**Scope:** `entity.name.type.environment.latex`  
**Χρώμα (Dark):** Turquoise `#4EC9B0`

```latex
\begin{itemize}
\begin{equation}
\begin{align}
```

### Package Names
**Scope:** `entity.name.package.latex`  
**Χρώμα (Dark):** Light Blue `#9CDCFE`

```latex
\usepackage{amsmath}
\usepackage{graphicx}
\documentclass{article}  % 'article' is highlighted
```

### Sectioning Commands
**Scope:** `entity.name.section.latex`  
**Χρώμα (Dark):** Yellow `#DCDCAA`

```latex
\section{Introduction}
\subsection{Background}
\chapter{Main Content}
```

### Formatting Commands
**Scope:** `entity.name.function.formatting.latex`  
**Χρώμα (Dark):** Yellow `#DCDCAA`

```latex
\textbf{bold text}
\textit{italic text}
\emph{emphasized}
```

### References
**Scope:** `entity.name.reference.latex`  
**Χρώμα (Dark):** Light Blue `#9CDCFE` (italic)

```latex
\label{eq:important}
\ref{eq:important}
\cite{author2023}
\pageref{sec:intro}
```

### Math Commands
**Scope:** `entity.name.function.math.latex`  
**Χρώμα (Dark):** Yellow `#DCDCAA`

```latex
$\frac{a}{b}$
$\sum_{i=1}^{n}$
$\alpha + \beta$
$\int_0^\infty e^{-x} dx$
```

### Math Operators
**Scope:** `keyword.operator.math.latex`  
**Χρώμα (Dark):** Light Gray `#D4D4D4`

```latex
$x + y = z$
$a \times b$
$x^2 - 1$
```

### Comments
**Scope:** `comment.line.latex`  
**Χρώμα (Dark):** Green `#6A9955` (italic)

```latex
% This is a comment
% TODO: Add more examples
```

### Numbers and Units
**Scope:** `constant.numeric.latex`  
**Χρώμα (Dark):** Light Green `#B5CEA8`

```latex
\vspace{12pt}
\hspace{3.5cm}
\fontsize{14pt}{16pt}
```

### Delimiters

#### Curly Braces
**Scope:** `delimiter.curly.latex`  
**Χρώμα (Dark):** Gold `#FFD700`

#### Square Brackets
**Scope:** `delimiter.bracket.latex`  
**Χρώμα (Dark):** Orchid `#DA70D6`

#### Parentheses
**Scope:** `delimiter.parenthesis.latex`  
**Χρώμα (Dark):** Light Gray `#D4D4D4`

## Comprehensive Example

```latex
% Advanced LaTeX Document Example
% Demonstrates all token categories

\documentclass[12pt]{article}
\usepackage{amsmath}
\usepackage{graphicx}

\newcommand{\mycommand}[1]{\textbf{#1}}

\begin{document}

\section{Introduction}
\label{sec:intro}

This is regular text with \textbf{bold} and \textit{italic} formatting.
We can also use \emph{emphasis} for important points.

\subsection{Mathematical Content}

Inline math: $x = \frac{-b \pm \sqrt{b^2-4ac}}{2a}$

Display math using equation environment:
\begin{equation}
  \int_0^\infty e^{-x^2} dx = \frac{\sqrt{\pi}}{2}
  \label{eq:gaussian}
\end{equation}

Multi-line equations with alignment:
\begin{align}
  E &= mc^2 \label{eq:einstein} \\
  F &= ma \\
  p &= mv
\end{align}

Greek letters: $\alpha, \beta, \gamma, \Delta, \Sigma, \Omega$

Mathematical operators: $x + y \times z \div w = \sum_{i=1}^{n} a_i$

See equation~\ref{eq:gaussian} on page~\pageref{eq:gaussian}.

\subsection{Citations}

According to \cite{author2023}, this is important.

\section{Figures and Tables}

\begin{figure}[h]
  \centering
  \includegraphics[width=0.8\textwidth]{example.png}
  \caption{Example figure}
  \label{fig:example}
\end{figure}

Custom spacing: \vspace{12pt} and \hspace{3.5cm}

\end{document}
```

## Math Mode Highlighting

Το σύστημα αναγνωρίζει αυτόματα τα παρακάτω math modes:

### Inline Math
```latex
$x + y = z$                    % Dollar signs
\( a^2 + b^2 = c^2 \)         % Escaped parentheses
```

### Display Math
```latex
$$
  \int_0^1 f(x) dx
$$

\[
  \sum_{i=1}^{n} i = \frac{n(n+1)}{2}
\]
```

### Math Environments
```latex
\begin{equation}
  E = mc^2
\end{equation}

\begin{align}
  x &= a + b \\
  y &= c + d
\end{align}

\begin{gather}
  first equation \\
  second equation
\end{gather}

\begin{matrix}
  a & b \\
  c & d
\end{matrix}
```

## Math Token Categories

### Commands
- **Greek letters:** `\alpha`, `\beta`, `\Gamma`, `\Delta`
- **Fractions:** `\frac{num}{den}`, `\dfrac`, `\tfrac`
- **Roots:** `\sqrt{x}`, `\sqrt[n]{x}`
- **Operators:** `\sum`, `\prod`, `\int`, `\lim`
- **Functions:** `\sin`, `\cos`, `\log`, `\exp`
- **Arrows:** `\rightarrow`, `\Leftarrow`, `\longleftrightarrow`
- **Relations:** `\leq`, `\geq`, `\equiv`, `\approx`
- **Binary ops:** `\times`, `\cdot`, `\oplus`, `\cup`, `\cap`

### Operators and Symbols
```latex
$+ - = < > / * | : !$
```

### Delimiters
```latex
$\left( \frac{x}{y} \right)$
$\left[ a + b \right]$
$\left\{ x \mid x > 0 \right\}$
```

### Subscripts and Superscripts
```latex
$x_i^2$
$\sum_{i=1}^{n} a_i$
```

## Color Themes

### Dark Theme (datatex-dark)
Βασισμένο στο VS Code Dark+ με vibrant χρώματα:
- **Structural:** Purple `#C586C0`
- **Environments:** Turquoise `#4EC9B0`
- **Math Commands:** Yellow `#DCDCAA`
- **Comments:** Green `#6A9955`
- **Delimiters:** Gold/Orchid/Gray

### Light Theme (datatex-light)
Professional light theme με high readability:
- **Structural:** Purple `#AF00DB`
- **Environments:** Teal `#267F99`
- **Math Commands:** Brown `#795E26`
- **Comments:** Green `#008000`

### High-Contrast Theme (datatex-hc)
Accessibility-focused για color-blind users:
- **Structural:** Red `#FF0000`
- **Environments:** Cyan `#00FFFF`
- **Math Commands:** Orange `#FFA500`
- **Comments:** Green `#00FF00`
- **Math Delimiters:** Yellow `#FFFF00`

## Customization

### Using the Configuration API

```typescript
import { applyLatexThemeConfig, LatexThemeConfig } from './themes/latex-theme-config';

// Define custom colors
const customConfig: LatexThemeConfig = {
  structuralCommands: 'FF1493',  // Deep pink
  mathCommands: 'FFD700',        // Gold
  mathDelimiters: 'FF6347',      // Tomato
  comments: '90EE90'             // Light green
};

// Apply to Monaco editor
applyLatexThemeConfig(monaco, 'datatex-dark', customConfig);
```

### Preset Configurations

```typescript
import { PRESET_CONFIGS } from './themes/latex-theme-config';

// Use vibrant dark preset
applyLatexThemeConfig(monaco, 'datatex-dark', PRESET_CONFIGS.vibrantDark);

// Use pastel light preset
applyLatexThemeConfig(monaco, 'datatex-light', PRESET_CONFIGS.pastelLight);

// Use monochrome preset
applyLatexThemeConfig(monaco, 'datatex-dark', PRESET_CONFIGS.monochrome);
```

### Individual Token Customization

```typescript
const config: LatexThemeConfig = {
  // Only customize specific tokens
  mathBracesCurly: 'FFFF00',      // Yellow for {}
  mathBracesSquare: 'FF00FF',     // Magenta for []
  mathBracesParentheses: 'FFFFFF' // White for ()
};
```

## Performance Optimization

### Regex Patterns
- Χρήση atomic groups για αποφυγή backtracking
- Lazy quantifiers όπου είναι δυνατόν
- Caching για frequently used patterns

### Tokenization Strategy
- Lazy tokenization για μεγάλα αρχεία
- Incremental parsing για real-time updates
- Scope granularity optimized για balance μεταξύ detail και performance

### Best Practices
1. **Avoid deeply nested states** - Το tokenizer χρησιμοποιεί shallow state machine
2. **Limit lookahead** - Regex patterns χωρίς excessive lookahead/lookbehind
3. **Cache results** - Monaco caches tokenization results automatically

## Compatibility

### LaTeX Workshop Extension
Τα scopes είναι συμβατά με VS Code LaTeX Workshop:
- Standard TextMate grammar conventions
- Compatible scope naming
- No conflicts με existing extensions

### Monaco Editor Features
- **Bracket matching** για `{}`, `[]`, `()`
- **Auto-closing pairs** για delimiters και `$`
- **Folding** για `\begin{...}` / `\end{...}` environments
- **Code completion** για common LaTeX commands

## Technical Implementation

### TextMate Grammar (Monarch)
Το Monaco Editor χρησιμοποιεί Monarch grammar system (TextMate-style):
- Declarative syntax για tokenization rules
- State machine για context-aware parsing
- Fast και efficient για real-time highlighting

### Why Not Tree-sitter?
- Monaco Editor έχει built-in support για TextMate
- Tree-sitter απαιτεί additional dependencies
- LaTeX είναι σχετικά σταθερή γλώσσα
- TextMate είναι αρκετά powerful για LaTeX

## Troubleshooting

### Colors Not Showing
1. Βεβαιωθείτε ότι το theme είναι loaded: `monaco.editor.setTheme('datatex-dark')`
2. Ελέγξτε ότι η γλώσσα είναι registered: `monaco.languages.register({ id: 'my-latex' })`
3. Verify tokenizer is set: `monaco.languages.setMonarchTokensProvider('my-latex', latexLanguage)`

### Math Mode Not Highlighted
1. Ελέγξτε matching delimiters (`$...$`, `\[...\]`, etc.)
2. Verify math environment names στο `mathEnvironments` array
3. Check for escaped characters που μπορεί να break το parsing

### Performance Issues
1. Reduce scope granularity αν needed
2. Limit regex complexity
3. Consider disabling highlighting για very large files (>10,000 lines)

## Future Enhancements

### Semantic Highlighting
- Integration με LaTeX Language Server (texlab)
- Dynamic highlighting για user-defined macros
- Context-aware completions

### Advanced Features
- Syntax validation
- Error detection
- Live preview integration
- Custom package support (TikZ, pgfplots, etc.)
