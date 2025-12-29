/**
 * LaTeX Theme Configuration
 * 
 * This module provides interfaces and utilities for customizing
 * LaTeX syntax highlighting colors in the Monaco Editor.
 */

export interface LatexThemeConfig {
  // === Structural Commands ===
  /** Color for structural commands like \documentclass, \begin, \end */
  structuralCommands?: string;
  
  /** Color for escaped characters like \\, \_, \$ */
  escapedCharacters?: string;
  
  // === Environments and Packages ===
  /** Color for environment names in \begin{...} and \end{...} */
  environmentNames?: string;
  
  /** Color for math environment names (equation, align, etc.) */
  mathEnvironmentNames?: string;
  
  /** Color for package names in \usepackage{...} */
  packageNames?: string;
  
  /** Color for document class names in \documentclass{...} */
  classNames?: string;
  
  // === Sections and Structure ===
  /** Color for sectioning commands (\section, \chapter, etc.) */
  sectionCommands?: string;
  
  /** Color for section titles */
  sectionTitles?: string;
  
  // === Formatting ===
  /** Color for text formatting commands (\textbf, \textit, etc.) */
  formattingCommands?: string;
  
  // === References ===
  /** Color for reference commands (\label, \ref, \cite, etc.) */
  referenceCommands?: string;
  
  /** Color for reference labels */
  referenceLabels?: string;
  
  // === Math Mode ===
  /** Color for math delimiters ($, $$, \[, \]) */
  mathDelimiters?: string;
  
  /** Color for math commands (\frac, \sum, \alpha, etc.) */
  mathCommands?: string;
  
  /** Color for math operators (+, -, =, \times, etc.) */
  mathOperators?: string;
  
  /** Color for subscript and superscript (_, ^) */
  mathSubscriptSuperscript?: string;
  
  /** Color for numbers in math mode */
  mathNumbers?: string;
  
  /** Color for variables in math mode */
  mathVariables?: string;
  
  /** Color for curly braces in math mode {} */
  mathBracesCurly?: string;
  
  /** Color for square brackets in math mode [] */
  mathBracesSquare?: string;
  
  /** Color for parentheses in math mode () */
  mathBracesParentheses?: string;
  
  // === Comments ===
  /** Color for LaTeX comments (%) */
  comments?: string;
  
  // === Numbers and Units ===
  /** Color for numbers and units (12pt, 3.5cm, etc.) */
  numbers?: string;
  
  // === Delimiters (outside math) ===
  /** Color for curly braces {} */
  curlyBraces?: string;
  
  /** Color for square brackets [] */
  squareBrackets?: string;
  
  /** Color for parentheses () */
  parentheses?: string;
  
  // === User-Defined Macros ===
  /** Color for user-defined commands from \newcommand */
  userMacros?: string;
}

/**
 * Apply custom theme configuration to Monaco Editor
 * 
 * @param monaco Monaco editor instance
 * @param themeName Name of the base theme ('datatex-dark', 'datatex-light', 'datatex-hc')
 * @param config Custom color configuration
 */
export function applyLatexThemeConfig(
  monaco: any,
  themeName: string,
  config: LatexThemeConfig
): void {
  const rules: any[] = [];
  
  // Map config properties to token scopes
  if (config.structuralCommands) {
    rules.push(
      { token: 'keyword.control.latex', foreground: config.structuralCommands },
      { token: 'keyword.latex', foreground: config.structuralCommands }
    );
  }
  
  if (config.escapedCharacters) {
    rules.push({ token: 'keyword.escape.latex', foreground: config.escapedCharacters });
  }
  
  if (config.environmentNames) {
    rules.push({ token: 'entity.name.type.environment.latex', foreground: config.environmentNames });
  }
  
  if (config.mathEnvironmentNames) {
    rules.push({ token: 'entity.name.type.environment.math.latex', foreground: config.mathEnvironmentNames });
  }
  
  if (config.packageNames) {
    rules.push({ token: 'entity.name.package.latex', foreground: config.packageNames });
  }
  
  if (config.classNames) {
    rules.push({ token: 'entity.name.class.latex', foreground: config.classNames });
  }
  
  if (config.sectionCommands) {
    rules.push({ token: 'entity.name.section.latex', foreground: config.sectionCommands });
  }
  
  if (config.sectionTitles) {
    rules.push({ token: 'entity.name.section.content.latex', foreground: config.sectionTitles });
  }
  
  if (config.formattingCommands) {
    rules.push({ token: 'entity.name.function.formatting.latex', foreground: config.formattingCommands });
  }
  
  if (config.referenceCommands) {
    rules.push({ token: 'entity.name.reference.latex', foreground: config.referenceCommands });
  }
  
  if (config.referenceLabels) {
    rules.push({ token: 'entity.name.reference.content.latex', foreground: config.referenceLabels });
  }
  
  if (config.mathDelimiters) {
    rules.push({ token: 'keyword.math.delimiter.latex', foreground: config.mathDelimiters });
  }
  
  if (config.mathCommands) {
    rules.push({ token: 'entity.name.function.math.latex', foreground: config.mathCommands });
  }
  
  if (config.mathOperators) {
    rules.push({ token: 'keyword.operator.math.latex', foreground: config.mathOperators });
  }
  
  if (config.mathSubscriptSuperscript) {
    rules.push({ token: 'keyword.operator.subscript.latex', foreground: config.mathSubscriptSuperscript });
  }
  
  if (config.mathNumbers) {
    rules.push({ token: 'constant.numeric.math.latex', foreground: config.mathNumbers });
  }
  
  if (config.mathVariables) {
    rules.push({ token: 'variable.math.latex', foreground: config.mathVariables });
  }
  
  if (config.mathBracesCurly) {
    rules.push({ token: 'delimiter.curly.math.latex', foreground: config.mathBracesCurly });
  }
  
  if (config.mathBracesSquare) {
    rules.push({ token: 'delimiter.bracket.math.latex', foreground: config.mathBracesSquare });
  }
  
  if (config.mathBracesParentheses) {
    rules.push({ token: 'delimiter.parenthesis.math.latex', foreground: config.mathBracesParentheses });
  }
  
  if (config.comments) {
    rules.push(
      { token: 'comment.line.latex', foreground: config.comments },
      { token: 'comment.content.latex', foreground: config.comments }
    );
  }
  
  if (config.numbers) {
    rules.push({ token: 'constant.numeric.latex', foreground: config.numbers });
  }
  
  if (config.curlyBraces) {
    rules.push({ token: 'delimiter.curly.latex', foreground: config.curlyBraces });
  }
  
  if (config.squareBrackets) {
    rules.push({ token: 'delimiter.bracket.latex', foreground: config.squareBrackets });
  }
  
  if (config.parentheses) {
    rules.push({ token: 'delimiter.parenthesis.latex', foreground: config.parentheses });
  }
  
  if (config.userMacros) {
    rules.push({ token: 'entity.name.function.user.latex', foreground: config.userMacros });
  }
  
  // Update the theme with custom rules
  monaco.editor.defineTheme(`${themeName}-custom`, {
    base: themeName.indexOf('light') >= 0 ? 'vs' : themeName.indexOf('hc') >= 0 ? 'hc-black' : 'vs-dark',
    inherit: true,
    rules: rules,
    colors: {}
  });
}

/**
 * Preset theme configurations
 */
export const PRESET_CONFIGS = {
  /** Vibrant colors for dark theme */
  vibrantDark: {
    structuralCommands: 'D134BF',
    mathCommands: '3FBCB0',
    mathDelimiters: 'FF6347',
    comments: '90EE90'
  } as LatexThemeConfig,
  
  /** Pastel colors for light theme */
  pastelLight: {
    structuralCommands: '9370DB',
    mathCommands: 'DAA520',
    mathDelimiters: 'DC143C',
    comments: '228B22'
  } as LatexThemeConfig,
  
  /** Monochrome theme */
  monochrome: {
    structuralCommands: '808080',
    environmentNames: 'A0A0A0',
    mathCommands: '606060',
    comments: 'C0C0C0'
  } as LatexThemeConfig
};
