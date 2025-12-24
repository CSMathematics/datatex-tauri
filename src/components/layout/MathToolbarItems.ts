export interface MathToolbarItem {
    id: string;
    text?: string;
    insert?: string;
    info?: string;
    icon?: string;
    shortcut?: string;
    type: 'insert' | 'menu' | 'separator';
    items?: MathToolbarItem[];
  }

  export const MATH_TOOLBAR_ITEMS: MathToolbarItem[] = [
    {
      id: "main/math",
      text: "Math",
      type: "menu",
      items: [
        { id: "mathmode", text: "Inline math - $...$", insert: "$%|%", info: "Math (in text style) within a paragraph of text", icon: "mathmode", shortcut: "Ctrl+Shift+M", type: "insert" },
        { id: "latexmathmode", text: "Inline math - \\(...\\)", insert: "\\( %| \\)", info: "Same as $...$ and the math environment", type: "insert" },
        { id: "displaymath", text: "Display math - \\[...\\]", insert: "\\[ %| \\]", info: "Math (in display style) apart from paragraph of text", shortcut: "Alt+Shift+M", type: "insert" },
        { id: "subscript", text: "Subscript - _{}", insert: "_{%|}", icon: "subscript", shortcut: "Ctrl+Shift+D", type: "insert" },
        { id: "superscript", text: "Superscript - ^{}", insert: "^{%|}", icon: "superscript", shortcut: "Ctrl+Shift+U", type: "insert" },
        { id: "frac", text: "Fraction - \\frac{}{}", insert: "\\frac{%<num%|%:translatable%>}{%<den%:translatable%>}", icon: "smallfrac", shortcut: "Alt+Shift+F", type: "insert" },
        { id: "dfrac", text: "Fraction - \\dfrac{}{}", insert: "\\dfrac{%<num%|%:translatable%>}{%<den%:translatable%>}", info: "\\dfrac (amsmath) always uses display style for the fraction", icon: "dfrac", shortcut: "Ctrl+Shift+F", type: "insert" },
        { id: "sqrt", text: "Square Root - \\sqrt{}", insert: "\\sqrt{%|}", icon: "sqrt", shortcut: "Ctrl+Shift+Q", type: "insert" },
        { id: "left", text: "\\left", insert: "\\left ", info: "Autosize opening delimiter", shortcut: "Ctrl+Shift+L", type: "insert" },
        { id: "right", text: "\\right", insert: "\\right ", info: "Autosize closing delimiter", shortcut: "Ctrl+Shift+R", type: "insert" },
        { id: "array", text: "\\begin{array}...\\end{array}", insert: "\\begin{array}{%<columns%>}%\n%<content%|%>%\n\\end{array}", info: "Tabular for math (used inside one of the other math environments)", type: "insert" },

        {
          id: "equations",
          text: "Math Equations",
          type: "menu",
          items: [
            { id: "equation", text: "env equation", insert: "\\begin{equation}%\n    %<eqn%>%\n\\end{equation}", info: "Single equation centered in a row", shortcut: "Ctrl+Shift+N", type: "insert" },
            { id: "align", text: "env align (amsmath)", insert: "\\begin{align}%\n    %<ralign%> & %<lalign%> \\\\%\n    %<ralign%> & %<lalign%>%\n\\end{align}", info: "Multiple equations aligned within columns", type: "insert" },
            { id: "alignat", text: "env alignat (amsmath)", insert: "\\begin{alignat}{%<ncols%>}%\n    %<ralign%> & %<lalign%>  & %<dist%>  %<ralign%> & %<lalign%> \\\\%\n    %<ralign%> & %<lalign%>  &       %<ralign%> & %<lalign%>%\n\\end{alignat}", info: "Multiple equations aligned within columns with customizable column spacing", type: "insert" },
            { id: "flalign", text: "env flalign (amsmath)", insert: "\\begin{flalign}%\n    %<ralign%> & %<lalign%>  &  %<ralign%> & %<lalign%> \\\\%\n    %<ralign%> & %<lalign%>  &  %<ralign%> & %<lalign%>%\n\\end{flalign}", info: "Multiple equations aligned within columns having column spacing to fill full line", type: "insert" },
            { id: "gather", text: "env gather (amsmath)", insert: "\\begin{gather}%\n    %<eqn1%> \\\\%\n    %<eqn2%>%\n\\end{gather}", info: "Multiple equations centered in rows", type: "insert" },
            { id: "multline", text: "env multline (amsmath)", insert: "\\begin{multline}%\n    %<eqn%> \\\\%\n        %<eqn%>%\n\\end{multline}", info: "Single equation split into multiple lines", type: "insert" },
            { id: "sep1", type: "separator" },
            { id: "equation*", text: "env equation* (amsmath)", insert: "\\begin{equation*}%\n    %<eqn%>%\n\\end{equation*}", info: "The equation* environment is an unnumbered equation environment.", type: "insert" },
            { id: "align*", text: "env align* (amsmath)", insert: "\\begin{align*}%\n    %<ralign%> & %<lalign%> \\\\%\n    %<ralign%> & %<lalign%>%\n\\end{align*}", info: "The align* environment is an unnumbered align environment.", type: "insert" },
            { id: "alignat*", text: "env alignat* (amsmath)", insert: "\\begin{alignat*}{%<ncols%>}%\n    %<ralign%> & %<lalign%>  & %<dist%>  %<ralign%> & %<lalign%> \\\\%\n    %<ralign%> & %<lalign%>  &       %<ralign%> & %<lalign%>%\n\\end{alignat*}", info: "The alignat* environment is an unnumbered alignat environment.", type: "insert" },
            { id: "flalign*", text: "env flalign* (amsmath)", insert: "\\begin{flalign*}%\n    %<ralign%> & %<lalign%>  &  %<ralign%> & %<lalign%> \\\\%\n    %<ralign%> & %<lalign%>  &  %<ralign%> & %<lalign%>%\n\\end{flalign*}", info: "The flalign* environment is an unnumbered flalign environment.", type: "insert" },
            { id: "gather*", text: "env gather* (amsmath)", insert: "\\begin{gather*}%\n    %<eqn1%> \\\\%\n    %<eqn2%>%\n\\end{gather*}", info: "The gather* environment is an unnumbered gather environment.", type: "insert" },
            { id: "multline*", text: "env multline* (amsmath)", insert: "\\begin{multline*}%\n    %<eqn%> \\\\%\n        %<eqn%>%\n\\end{multline*}", info: "The multline* environment is an unnumbered multline environment.", type: "insert" },
            { id: "sep2", type: "separator" },
            { id: "cases", text: "env cases (amsmath)", insert: "\\begin{cases}%\n    %<val1%>  &  \\text{%<cond1%>} \\\\%\n    %<val2%>  &  \\text{%<cond2%>}%\n\\end{cases}", info: "Distinction of cases (within other math env)", type: "insert" },
            { id: "split", text: "env split (amsmath)", insert: "\\begin{split}%\n    %<ralign%> & %<lalign%> \\\\%\n           & %<lalign%>%\n\\end{split}", info: "Single equation split into multiple aligned lines (within other math env)", type: "insert" },
          ]
        },

        {
          id: "functions",
          text: "Math Functions",
          type: "menu",
          items: [
            { id: "arccos", text: "\\arccos", insert: "\\arccos ", type: "insert" },
            { id: "arcsin", text: "\\arcsin", insert: "\\arcsin ", type: "insert" },
            { id: "arctan", text: "\\arctan", insert: "\\arctan ", type: "insert" },
            { id: "cos", text: "\\cos", insert: "\\cos ", type: "insert" },
            { id: "cosh", text: "\\cosh", insert: "\\cosh ", type: "insert" },
            { id: "cot", text: "\\cot", insert: "\\cot ", type: "insert" },
            { id: "coth", text: "\\coth", insert: "\\coth ", type: "insert" },
            { id: "csc", text: "\\csc", insert: "\\csc ", type: "insert" },
            { id: "deg", text: "\\deg", insert: "\\deg ", type: "insert" },
            { id: "det", text: "\\det", insert: "\\det ", type: "insert" },
            { id: "dim", text: "\\dim", insert: "\\dim ", type: "insert" },
            { id: "exp", text: "\\exp", insert: "\\exp ", type: "insert" },
            { id: "gcd", text: "\\gcd", insert: "\\gcd ", type: "insert" },
            { id: "hom", text: "\\hom", insert: "\\hom ", type: "insert" },
            { id: "inf", text: "\\inf", insert: "\\inf ", type: "insert" },
            { id: "ker", text: "\\ker", insert: "\\ker ", type: "insert" },
            { id: "lg", text: "\\lg", insert: "\\lg ", type: "insert" },
            { id: "lim", text: "\\lim", insert: "\\lim ", type: "insert" },
            { id: "liminf", text: "\\liminf", insert: "\\liminf ", type: "insert" },
            { id: "limsup", text: "\\limsup", insert: "\\limsup ", type: "insert" },
            { id: "ln", text: "\\ln", insert: "\\ln ", type: "insert" },
            { id: "log", text: "\\log", insert: "\\log ", type: "insert" },
            { id: "max", text: "\\max", insert: "\\max ", type: "insert" },
            { id: "min", text: "\\min", insert: "\\min ", type: "insert" },
            { id: "sec", text: "\\sec", insert: "\\sec ", type: "insert" },
            { id: "sin", text: "\\sin", insert: "\\sin ", type: "insert" },
            { id: "sinh", text: "\\sinh", insert: "\\sinh ", type: "insert" },
            { id: "sup", text: "\\sup", insert: "\\sup ", type: "insert" },
            { id: "tan", text: "\\tan", insert: "\\tan ", type: "insert" },
            { id: "tanh", text: "\\tanh", insert: "\\tanh ", type: "insert" },
          ]
        },

        {
          id: "definitions",
          text: "Math Definitions",
          type: "menu",
          items: [
            { id: "Corollary", text: "env Corollary (ntheorem)", insert: "\\begin{Corollary}%\n%|%\n\\end{Corollary}", info: "Needs \\usepackage[standard]{ntheorem}", type: "insert" },
            { id: "Definition", text: "env Definition (ntheorem)", insert: "\\begin{Definition}%\n%|%\n\\end{Definition}", info: "Needs \\usepackage[standard]{ntheorem}", type: "insert" },
            { id: "Example", text: "env Example (ntheorem)", insert: "\\begin{Example}%\n%|%\n\\end{Example}", info: "Needs \\usepackage[standard]{ntheorem}", type: "insert" },
            { id: "Lemma", text: "env Lemma (ntheorem)", insert: "\\begin{Lemma}%\n%|%\n\\end{Lemma}", info: "Needs \\usepackage[standard]{ntheorem}", type: "insert" },
            { id: "Proof", text: "env Proof (ntheorem)", insert: "\\begin{Proof}%\n%|%\n\\end{Proof}", info: "Needs \\usepackage[standard]{ntheorem}", type: "insert" },
            { id: "Proposition", text: "env Proposition (ntheorem)", insert: "\\begin{Proposition}%\n%|%\n\\end{Proposition}", info: "Needs \\usepackage[standard]{ntheorem}", type: "insert" },
            { id: "Remark", text: "env Remark (ntheorem)", insert: "\\begin{Remark}%\n%|%\n\\end{Remark}", info: "Needs \\usepackage[standard]{ntheorem}", type: "insert" },
            { id: "Theorem", text: "env Theorem (ntheorem)", insert: "\\begin{Theorem}%\n%|%\n\\end{Theorem}", info: "Needs \\usepackage[standard]{ntheorem}", type: "insert" },
          ]
        },

        {
          id: "fontstyles",
          text: "Math Font Styles",
          type: "menu",
          items: [
            { id: "mathrm", text: "Roman - \\mathrm{}", insert: "\\mathrm{%|}", icon: "font_mathrm", type: "insert" },
            { id: "mathit", text: "Italic - \\mathit{}", insert: "\\mathit{%|}", icon: "font_mathit", type: "insert" },
            { id: "mathbf", text: "Bold - \\mathbf{}", insert: "\\mathbf{%|}", icon: "font_mathbf", type: "insert" },
            { id: "mathsf", text: "Sans Serif - \\mathsf{}", insert: "\\mathsf{%|}", icon: "font_mathsf", type: "insert" },
            { id: "mathtt", text: "Typewriter - \\mathtt{}", insert: "\\mathtt{%|}", icon: "font_mathtt", type: "insert" },
            { id: "mathcal", text: "Calligraphic - \\mathcal{}", insert: "\\mathcal{%|}", icon: "font_mathcal", type: "insert" },
            { id: "mathbb", text: "Blackboard Bold - \\mathbb{} (amssymb)", insert: "\\mathbb{%|}", icon: "font_mathbb", type: "insert" },
            { id: "mathfrak", text: "Fraktur - \\mathfrak{} (amssymb)", insert: "\\mathfrak{%|}", icon: "font_mathfrak", type: "insert" },
          ]
        },

        {
          id: "grouping",
          text: "Math Stacking Symbols",
          type: "menu",
          items: [
            { id: "overline", text: "\\overline", insert: "\\overline{%<content%>}", type: "insert" },
            { id: "underline", text: "\\underline", insert: "\\underline{%<content%>}", type: "insert" },
            { id: "overbrace", text: "\\overbrace", insert: "\\overbrace{%<content%>}", type: "insert" },
            { id: "underbrace", text: "\\underbrace", insert: "\\underbrace{%<content%>}", type: "insert" },
            { id: "overleftarrow", text: "\\overleftarrow", insert: "\\overleftarrow{%<content%>}", type: "insert" },
            { id: "overrightarrow", text: "\\overrightarrow", insert: "\\overrightarrow{%<content%>}", type: "insert" },
            { id: "stackrel", text: "\\stackrel", insert: "\\stackrel{%<top symbol%>}{%<bottom symbol%>}", type: "insert" },
            { id: "overset", text: "\\overset (amsmath)", insert: "\\overset{%<top symbol%>}{%<symbol%>}", type: "insert" },
            { id: "underset", text: "\\underset (amsmath)", insert: "\\underset{%<bottom symbol%>}{%<symbol%>}", type: "insert" },
            { id: "sideset", text: "\\sideset (amsmath)", insert: "\\sideset{%<left ind+exp%>}{%<right ind+exp%>}", type: "insert" },
            { id: "prescript", text: "\\prescript (mathtools)", insert: "\\prescript{%<left exp%>}{%<left ind%>}{%<arg%>}", type: "insert" },
          ]
        },

        {
          id: "fontaccent",
          text: "Math Accents",
          type: "menu",
          items: [
            { id: "acute", text: "\\acute{}", insert: "\\acute{%|}", icon: "acute", type: "insert" },
            { id: "grave", text: "\\grave{}", insert: "\\grave{%|}", icon: "grave", type: "insert" },
            { id: "tilde", text: "\\tilde{}", insert: "\\tilde{%|}", icon: "tilde", type: "insert" },
            { id: "bar", text: "\\bar{}", insert: "\\bar{%|}", icon: "bar", type: "insert" },
            { id: "vec", text: "\\vec{}", insert: "\\vec{%|}", icon: "vec", type: "insert" },
            { id: "hat", text: "\\hat{}", insert: "\\hat{%|}", icon: "hat", type: "insert" },
            { id: "check", text: "\\check{}", insert: "\\check{%|}", icon: "check", type: "insert" },
            { id: "breve", text: "\\breve{}", insert: "\\breve{%|}", icon: "breve", type: "insert" },
            { id: "dot", text: "\\dot{}", insert: "\\dot{%|}", icon: "dot", type: "insert" },
            { id: "ddot", text: "\\ddot{}", insert: "\\ddot{%|}", icon: "ddot", type: "insert" },
          ]
        },

        {
          id: "fontspaces",
          text: "Math Spaces",
          type: "menu",
          items: [
            { id: "negative", text: "Negative - \\!", insert: "\\!", info: "Negative thin space", type: "insert" },
            { id: "small", text: "Thin - \\,", insert: "\\,", info: "3/18 of a \\quad", type: "insert" },
            { id: "medium", text: "Medium - \\:", insert: "\\:", info: "4/18 of a \\quad", type: "insert" },
            { id: "large", text: "Thick - \\;", insert: "\\;", info: "5/18 of a \\quad", type: "insert" },
            { id: "interword", text: "Interword - \\ ", insert: "\\ ", info: "regular whitespace", type: "insert" },
            { id: "quad", text: "One quad - \\quad", insert: "\\quad ", info: "The \\quad command inserts a horizontal space of 1em (1em being the width of M).", type: "insert" },
            { id: "qquad", text: "Two quads - \\qquad", insert: "\\qquad", info: "Twice the size of a \\quad", type: "insert" },
          ]
        }
      ]
    }
  ];
