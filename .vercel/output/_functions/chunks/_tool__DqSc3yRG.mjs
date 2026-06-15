import { c as createComponent } from './astro-component_CSgYXoL4.mjs';
import 'piccolore';
import { m as maybeRenderHead, o as renderComponent, k as renderTemplate, p as renderSlot, q as renderHead, h as addAttribute } from './entrypoint_47PPJcYG.mjs';
import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronDown, Shuffle, Hash, RotateCw, Search, Moon, Sun } from 'lucide-react';
import CodeMirror from '@uiw/react-codemirror';
import { css } from '@codemirror/lang-css';
import { html } from '@codemirror/lang-html';
import { javascript } from '@codemirror/lang-javascript';
import { json } from '@codemirror/lang-json';
import { EditorView } from '@codemirror/view';
import MiniSearch from 'minisearch';
import { pinyin } from 'pinyin-pro';

const toolCategories = [
  {
    id: "encoding",
    name: "编码/解码",
    description: "常见文本编码、解码和格式转换。",
    icon: "code"
  },
  {
    id: "crypto",
    name: "加密/安全",
    description: "令牌解析、密码生成和本地安全工具。",
    icon: "lock"
  },
  {
    id: "json",
    name: "JSON 工具",
    description: "JSON 格式化、压缩和结构处理。",
    icon: "file-json"
  }
];
const tools = [
  {
    id: "json",
    href: "/tools/json",
    name: "JSON 格式化",
    shortName: "JSON",
    description: "格式化、压缩和校验 JSON 文本。",
    category: "json",
    keywords: ["json", "format", "minify", "格式化", "压缩", "校验", "验证", "pretty", "beautify"],
    layout: "io"
  },
  {
    id: "jwt",
    href: "/tools/jwt",
    name: "JWT 解析",
    shortName: "JWT",
    description: "解析 header 和 payload，不执行签名校验。",
    category: "crypto",
    keywords: ["jwt", "token", "header", "payload", "令牌", "解码", "decode"],
    layout: "io"
  },
  {
    id: "base64",
    href: "/tools/base64",
    name: "Base64 编解码",
    shortName: "Base64",
    description: "处理 UTF-8 文本的 Base64 编码和解码。",
    category: "encoding",
    keywords: ["base64", "encode", "decode", "编码", "解码", "编解码", "b64"],
    layout: "io"
  },
  {
    id: "password",
    href: "/tools/password",
    name: "随机密码",
    shortName: "密码",
    description: "按长度和字符集生成随机密码。",
    category: "crypto",
    keywords: ["password", "random", "generate", "密码", "随机", "生成", "密码生成", "pin"],
    layout: "single"
  }
];
function getToolById(id) {
  return tools.find((tool) => tool.id === id);
}
function getCategoryById(id) {
  return toolCategories.find((category) => category.id === id);
}
function getToolsByCategory(id) {
  return tools.filter((tool) => tool.category === id);
}

function readOpenState() {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem("bytekit:tool-nav:open:v1") ?? "{}");
  } catch {
    return {};
  }
}
function readCollapsed() {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem("bytekit:tool-nav:collapsed:v1") === "true";
}
function ToolSidebar({ activeToolId, onSelectTool }) {
  const [openState, setOpenState] = useState(readOpenState);
  const [collapsed, setCollapsed] = useState(readCollapsed);
  const activeTool = tools.find((tool) => tool.id === activeToolId);
  const normalizedOpenState = useMemo(() => {
    const next = {};
    for (const category of toolCategories) {
      next[category.id] = openState[category.id] ?? category.id === activeTool?.category;
    }
    return next;
  }, [activeTool?.category, openState]);
  useEffect(() => {
    window.localStorage.setItem("bytekit:tool-nav:open:v1", JSON.stringify(normalizedOpenState));
  }, [normalizedOpenState]);
  useEffect(() => {
    window.localStorage.setItem("bytekit:tool-nav:collapsed:v1", String(collapsed));
  }, [collapsed]);
  function toggleCategory(categoryId) {
    setOpenState((current) => ({ ...current, [categoryId]: !normalizedOpenState[categoryId] }));
  }
  return /* @__PURE__ */ jsxs("aside", { suppressHydrationWarning: true, className: collapsed ? "tool-sidebar tool-sidebar--collapsed" : "tool-sidebar", "aria-label": "工具目录", children: [
    /* @__PURE__ */ jsxs(
      "button",
      {
        className: "tool-sidebar__head",
        type: "button",
        onClick: () => setCollapsed((value) => !value),
        "aria-label": collapsed ? "展开工具目录" : "收起工具目录",
        title: collapsed ? "展开工具目录" : "收起工具目录",
        children: [
          /* @__PURE__ */ jsx("span", { className: "tool-sidebar__title", children: "工具目录" }),
          /* @__PURE__ */ jsx(
            ChevronLeft,
            {
              size: 14,
              strokeWidth: 2.5,
              style: { transform: collapsed ? "rotate(180deg)" : "none", transition: "transform 0.25s ease" }
            }
          )
        ]
      }
    ),
    collapsed ? null : /* @__PURE__ */ jsx("div", { className: "tool-sidebar__groups", children: toolCategories.map((category) => {
      const categoryTools = getToolsByCategory(category.id);
      if (categoryTools.length === 0) return null;
      const isOpen = normalizedOpenState[category.id];
      return /* @__PURE__ */ jsxs("section", { className: "tool-sidebar__group", children: [
        /* @__PURE__ */ jsxs("button", { className: "tool-sidebar__group-toggle", type: "button", onClick: () => toggleCategory(category.id), children: [
          /* @__PURE__ */ jsx("span", { children: category.name }),
          /* @__PURE__ */ jsx(
            ChevronDown,
            {
              size: 14,
              strokeWidth: 2,
              style: { transform: isOpen ? "rotate(0deg)" : "rotate(-90deg)", transition: "transform 0.2s ease" }
            }
          )
        ] }),
        isOpen ? /* @__PURE__ */ jsx("div", { className: "tool-sidebar__links", children: categoryTools.map((tool) => /* @__PURE__ */ jsx(
          "button",
          {
            className: tool.id === activeToolId ? "tool-sidebar__link tool-sidebar__link--active" : "tool-sidebar__link",
            type: "button",
            onClick: () => onSelectTool(tool.id),
            children: tool.name
          },
          tool.id
        )) }) : null
      ] }, category.id);
    }) })
  ] });
}

function Badge({ tone = "neutral", children, className }) {
  const classes = ["ui-badge", `ui-badge--${tone}`, className].filter(Boolean).join(" ");
  return /* @__PURE__ */ jsx("span", { className: classes, children });
}

function Button({ variant = "primary", size = "md", className, children, ...props }) {
  const classes = ["ui-button", `ui-button--${variant}`, `ui-button--${size}`, className].filter(Boolean).join(" ");
  return /* @__PURE__ */ jsx("button", { className: classes, type: "button", ...props, children });
}

const label = {
  copy: "复制",
  clear: "清空",
  copied: "已复制",
  cleared: "已清空",
  copyFailed: "复制失败",
  lines: "行",
  chars: "字符"
};
const languageExtensions = {
  text: [],
  json: [json()],
  javascript: [javascript()],
  html: [html()],
  css: [css()]
};
const basicSetup = {
  lineNumbers: true,
  foldGutter: true,
  highlightActiveLine: true,
  bracketMatching: true
};
function meta(value) {
  const lines = value === "" ? 0 : value.split("\n").length;
  return String(lines) + " " + label.lines + " / " + String(value.length) + " " + label.chars;
}
function statusTone(status) {
  if (status === "success") return "success";
  if (status === "error") return "danger";
  return "neutral";
}
function editorHeight(minHeight) {
  if (!minHeight || minHeight === "default") return "var(--editor-height-default)";
  if (minHeight === "compact") return "var(--editor-height-compact)";
  return minHeight;
}
function CodeEditor({
  title,
  value,
  onChange,
  language = "text",
  status = "neutral",
  statusText,
  message,
  messageTone = "neutral",
  error,
  minHeight = "default",
  className
}) {
  const [notice, setNotice] = useState("");
  const extensions = useMemo(() => [EditorView.lineWrapping, ...languageExtensions[language]], [language]);
  const isEmpty = value.length === 0;
  const editorMessage = error ?? message;
  const editorMessageTone = error ? "error" : messageTone;
  const editorMessageClassName = "code-editor__message code-editor__message--" + editorMessageTone;
  const editorStyle = { "--code-editor-min-height": editorHeight(minHeight) };
  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 1400);
    return () => window.clearTimeout(timer);
  }, [notice]);
  async function copyValue() {
    if (isEmpty) return;
    try {
      await navigator.clipboard.writeText(value);
      setNotice(label.copied);
    } catch {
      setNotice(label.copyFailed);
    }
  }
  function clearValue() {
    onChange("");
    setNotice(label.cleared);
  }
  return /* @__PURE__ */ jsxs("div", { className: ["code-editor", className].filter(Boolean).join(" "), style: editorStyle, children: [
    /* @__PURE__ */ jsxs("div", { className: "code-editor__toolbar", children: [
      /* @__PURE__ */ jsxs("div", { className: "code-editor__title-group", children: [
        /* @__PURE__ */ jsx("span", { className: "code-editor__title", children: title }),
        /* @__PURE__ */ jsx("span", { className: "code-editor__meta", children: meta(value) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "code-editor__actions", children: [
        statusText ? /* @__PURE__ */ jsx(Badge, { tone: statusTone(status), children: statusText }) : null,
        notice ? /* @__PURE__ */ jsx("span", { className: "code-editor__action-status", children: notice }) : null,
        /* @__PURE__ */ jsx(Button, { variant: "secondary", size: "sm", disabled: isEmpty, onClick: copyValue, children: label.copy }),
        /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", disabled: isEmpty, onClick: clearValue, children: label.clear })
      ] })
    ] }),
    editorMessage ? /* @__PURE__ */ jsx("div", { className: editorMessageClassName, children: editorMessage }) : null,
    /* @__PURE__ */ jsx(
      CodeMirror,
      {
        className: "code-editor__surface",
        value,
        basicSetup,
        extensions,
        onChange
      }
    )
  ] });
}

function useToolStorage(key, initialState) {
  const [state, setState] = useState(() => {
    if (typeof window === "undefined") return initialState;
    try {
      const stored = window.localStorage.getItem(key);
      return stored ? { ...initialState, ...JSON.parse(stored) } : initialState;
    } catch {
      return initialState;
    }
  });
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch {
    }
  }, [key, state]);
  return [state, setState];
}

function encodeBase64(input) {
  try {
    const bytes = new TextEncoder().encode(input);
    let binary = "";
    for (const byte of bytes) {
      binary += String.fromCharCode(byte);
    }
    return { ok: true, output: btoa(binary) };
  } catch {
    return { ok: false, error: "Base64 编码失败。" };
  }
}
function decodeBase64(input) {
  try {
    const binary = atob(input.trim());
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return { ok: true, output: new TextDecoder().decode(bytes) };
  } catch {
    return { ok: false, error: "请输入合法的 Base64 内容。" };
  }
}

function IoWorkbench({ input, actions, output, ariaLabel }) {
  return /* @__PURE__ */ jsxs("section", { className: "io-workbench", "aria-label": ariaLabel, children: [
    /* @__PURE__ */ jsx("div", { className: "io-workbench__toolbar", "aria-label": "操作", children: actions }),
    /* @__PURE__ */ jsxs("div", { className: "io-workbench__panes", children: [
      /* @__PURE__ */ jsx("div", { className: "io-workbench__pane io-workbench__pane--input", children: input }),
      /* @__PURE__ */ jsx("div", { className: "io-workbench__pane io-workbench__pane--output", children: output })
    ] })
  ] });
}
function GeneratorPanel({ controls, result, actions, ariaLabel }) {
  return /* @__PURE__ */ jsxs("section", { className: "generator-panel", "aria-label": ariaLabel, children: [
    /* @__PURE__ */ jsx("div", { className: "generator-panel__controls", children: controls }),
    /* @__PURE__ */ jsxs("div", { className: "generator-panel__result", children: [
      result,
      actions ? /* @__PURE__ */ jsx("div", { className: "generator-panel__actions", children: actions }) : null
    ] })
  ] });
}

const text$2 = {
  tool: "Base64 编解码工具",
  input: "输入",
  output: "输出",
  encode: "编码",
  decode: "解码",
  success: "已转换",
  fail: "转换失败"
};
function Base64Codec() {
  const [state, setState] = useToolStorage("bytekit:tool:base64:v1", {
    input: "Bytekit",
    output: "",
    lastAction: "encode"
  });
  const { input, output, lastAction } = state;
  const setInput = (value) => setState((current) => ({ ...current, input: value }));
  function runAction(action) {
    const result = action === "encode" ? encodeBase64(input) : decodeBase64(input);
    setState((current) => ({
      ...current,
      lastAction: action,
      output: result.ok ? result.output : current.output
    }));
  }
  const encodeResult = useMemo(() => encodeBase64(input), [input]);
  return /* @__PURE__ */ jsx(
    IoWorkbench,
    {
      ariaLabel: text$2.tool,
      actions: /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(Button, { variant: "primary", onClick: () => runAction("encode"), children: text$2.encode }),
        /* @__PURE__ */ jsx(Button, { variant: "secondary", onClick: () => runAction("decode"), children: text$2.decode })
      ] }),
      input: /* @__PURE__ */ jsx(CodeEditor, { title: text$2.input, value: input, onChange: setInput, language: "text" }),
      output: /* @__PURE__ */ jsx(CodeEditor, { title: text$2.output, value: output, language: "text", status: encodeResult.ok ? "success" : "error", statusText: encodeResult.ok ? text$2.success : text$2.fail, error: encodeResult.ok ? void 0 : encodeResult.error })
    }
  );
}

function formatJson(input, indent = 2) {
  const trimmed = input.trim();
  if (!trimmed) {
    return { ok: false, error: "请输入 JSON 内容。" };
  }
  try {
    const parsed = JSON.parse(trimmed);
    return { ok: true, output: JSON.stringify(parsed, null, indent) };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "JSON 解析失败。"
    };
  }
}
function minifyJson(input) {
  const trimmed = input.trim();
  if (!trimmed) {
    return { ok: false, error: "请输入 JSON 内容。" };
  }
  try {
    const parsed = JSON.parse(trimmed);
    return { ok: true, output: JSON.stringify(parsed) };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "JSON 解析失败。"
    };
  }
}
function unescapeJson(input) {
  if (!input.trim()) {
    return { ok: false, error: "请输入内容。" };
  }
  try {
    let result = input;
    result = result.replace(/\\\\n/g, "\n");
    result = result.replace(/\\\\r/g, "\r");
    result = result.replace(/\\\\t/g, "	");
    result = result.replace(/\\\\"/g, '"');
    result = result.replace(/\\\\\\\\/g, "\\");
    return { ok: true, output: result };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "去转义失败。"
    };
  }
}
function escapeJson(input) {
  if (!input.trim()) {
    return { ok: false, error: "请输入内容。" };
  }
  try {
    let result = input;
    result = result.replace(/\\/g, "\\\\");
    result = result.replace(/"/g, '\\"');
    result = result.replace(/\n/g, "\\n");
    result = result.replace(/\r/g, "\\r");
    result = result.replace(/\t/g, "\\t");
    return { ok: true, output: result };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "转义失败。"
    };
  }
}

const text$1 = {
  tool: "JSON 格式化工具",
  input: "输入",
  output: "输出",
  format: "格式化",
  minify: "压缩",
  unescape: "去转义",
  escape: "转义",
  valid: "有效 JSON",
  invalid: "解析失败"
};
function JsonFormatter() {
  const [state, setState] = useToolStorage("bytekit:tool:json:v1", {
    input: '{\n  "name": "bytekit"\n}',
    output: "",
    lastAction: "format"
  });
  const { input, output, lastAction } = state;
  const setInput = (value) => setState((current) => ({ ...current, input: value }));
  function runAction(action) {
    let result;
    switch (action) {
      case "format":
        result = formatJson(input, 2);
        break;
      case "minify":
        result = minifyJson(input);
        break;
      case "unescape":
        result = unescapeJson(input);
        break;
      case "escape":
        result = escapeJson(input);
        break;
    }
    setState((current) => ({
      ...current,
      lastAction: action,
      output: result.ok ? result.output : current.output
    }));
  }
  const formatResult = useMemo(() => formatJson(input, 2), [input]);
  return /* @__PURE__ */ jsx(
    IoWorkbench,
    {
      ariaLabel: text$1.tool,
      actions: /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(Button, { variant: "primary", onClick: () => runAction("format"), children: text$1.format }),
        /* @__PURE__ */ jsx(Button, { variant: "secondary", onClick: () => runAction("minify"), children: text$1.minify }),
        /* @__PURE__ */ jsx(Button, { variant: "secondary", onClick: () => runAction("unescape"), children: text$1.unescape }),
        /* @__PURE__ */ jsx(Button, { variant: "secondary", onClick: () => runAction("escape"), children: text$1.escape })
      ] }),
      input: /* @__PURE__ */ jsx(CodeEditor, { title: text$1.input, value: input, onChange: setInput, language: "json" }),
      output: /* @__PURE__ */ jsx(CodeEditor, { title: text$1.output, value: output, language: "json", status: formatResult.ok ? "success" : "error", statusText: formatResult.ok ? text$1.valid : text$1.invalid, error: formatResult.ok ? void 0 : formatResult.error })
    }
  );
}

function decodeBase64Url(segment) {
  const normalized = segment.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(normalized.length + (4 - normalized.length % 4) % 4, "=");
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}
function parseJsonSegment(segment, name) {
  try {
    return JSON.parse(decodeBase64Url(segment));
  } catch {
    throw new Error(`${name} 不是合法的 JSON。`);
  }
}
function decodeJwt(token) {
  const parts = token.trim().split(".");
  if (parts.length < 2 || parts.length > 3 || !parts[0] || !parts[1]) {
    return { ok: false, error: "JWT 应包含 header、payload 和可选 signature。" };
  }
  try {
    return {
      ok: true,
      header: parseJsonSegment(parts[0], "Header"),
      payload: parseJsonSegment(parts[1], "Payload"),
      signature: parts[2] ?? "",
      hasSignature: Boolean(parts[2])
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "JWT 解析失败。"
    };
  }
}

const text = {
  tool: "JWT 解析工具",
  result: "解析结果",
  waiting: "等待输入",
  success: "解析成功",
  fail: "解析失败",
  empty: "空状态",
  json: "JSON 结果",
  auto: "输入后自动解析",
  emptyMessage: "输入 JWT 后显示 header 和 payload。",
  decode: "解析"
};
function formatResult(result) {
  if (!result.ok) return "";
  return JSON.stringify({ header: result.header, payload: result.payload, hasSignature: result.hasSignature }, null, 2);
}
function JwtDecoder() {
  const [state, setState] = useToolStorage("bytekit:tool:jwt:v1", {
    token: ""
  });
  const { token } = state;
  const setToken = (value) => setState((current) => ({ ...current, token: value }));
  const result = useMemo(() => decodeJwt(token), [token]);
  const isEmpty = token.trim() === "";
  const output = isEmpty || !result.ok ? "" : formatResult(result);
  return /* @__PURE__ */ jsx(
    IoWorkbench,
    {
      ariaLabel: text.tool,
      actions: /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(Button, { variant: "primary", disabled: isEmpty || !result.ok, children: text.decode }),
        /* @__PURE__ */ jsx("span", { style: { fontSize: "0.8125rem", color: "var(--muted)" }, children: text.auto }),
        /* @__PURE__ */ jsx(Badge, { tone: isEmpty ? "neutral" : result.ok ? "success" : "danger", children: isEmpty ? text.empty : result.ok ? text.success : text.fail })
      ] }),
      input: /* @__PURE__ */ jsx(CodeEditor, { title: "JWT", value: token, onChange: setToken, language: "text", status: isEmpty ? "neutral" : result.ok ? "success" : "error", statusText: isEmpty ? text.waiting : result.ok ? text.success : text.fail }),
      output: /* @__PURE__ */ jsx(CodeEditor, { title: text.result, value: output, language: "json", status: isEmpty ? "neutral" : result.ok ? "success" : "error", statusText: isEmpty ? text.waiting : result.ok ? text.json : text.fail, message: isEmpty ? text.emptyMessage : void 0, error: result.ok ? void 0 : result.error })
    }
  );
}

const CHARSETS = {
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{};:,.<>?"
};
function randomIndex(max) {
  const values = new Uint32Array(1);
  crypto.getRandomValues(values);
  return values[0] % max;
}
function shuffle(chars) {
  for (let index = chars.length - 1; index > 0; index -= 1) {
    const next = randomIndex(index + 1);
    [chars[index], chars[next]] = [chars[next], chars[index]];
  }
  return chars;
}
function generatePassword(options) {
  const mode = options.mode ?? "random";
  if (!Number.isInteger(options.length) || options.length < 4 || options.length > 128) {
    return { ok: false, error: "密码长度必须在 4 到 128 之间。" };
  }
  if (mode === "pin") {
    const chars2 = [];
    while (chars2.length < options.length) {
      chars2.push(CHARSETS.numbers[randomIndex(CHARSETS.numbers.length)]);
    }
    return { ok: true, password: chars2.join("") };
  }
  const enabledSets = [
    options.lowercase && CHARSETS.lowercase,
    options.uppercase && CHARSETS.uppercase,
    options.numbers && CHARSETS.numbers,
    options.symbols && CHARSETS.symbols
  ].filter(Boolean);
  if (enabledSets.length === 0) {
    return { ok: false, error: "至少选择一种字符集。" };
  }
  if (options.length < enabledSets.length) {
    return { ok: false, error: "密码长度不能小于字符集数量。" };
  }
  const pool = enabledSets.join("");
  const chars = enabledSets.map((set) => set[randomIndex(set.length)]);
  while (chars.length < options.length) {
    chars.push(pool[randomIndex(pool.length)]);
  }
  return { ok: true, password: shuffle(chars).join("") };
}

const modeOptions = [
  { value: "random", label: "随机", icon: Shuffle },
  { value: "pin", label: "PIN", icon: Hash }
];
const optionLabels = {
  lowercase: "小写字母",
  uppercase: "大写字母",
  numbers: "数字",
  symbols: "符号"
};
function renderPassword(value) {
  return Array.from(value).map((char, index) => {
    const type = /\d/.test(char) ? "number" : /[a-z]/i.test(char) ? "letter" : "symbol";
    return /* @__PURE__ */ jsx("span", { className: "password-output__char password-output__char--" + type, children: char }, char + "-" + String(index));
  });
}
function PasswordGenerator() {
  const [state, setState] = useToolStorage("bytekit:tool:password:v1", {
    mode: "random",
    length: 16,
    lowercase: true,
    uppercase: true,
    numbers: true,
    symbols: true
  });
  const { mode, length, lowercase, uppercase, numbers, symbols } = state;
  const [nonce, setNonce] = useState(0);
  const [notice, setNotice] = useState("");
  const result = useMemo(
    () => generatePassword({ mode, length, lowercase, uppercase, numbers, symbols }),
    [mode, length, lowercase, uppercase, numbers, symbols, nonce]
  );
  const output = result.ok ? result.password : "";
  function updateSetting(key, value) {
    setState((current) => ({ ...current, [key]: value }));
  }
  async function copyPassword() {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setNotice("已复制");
    } catch {
      setNotice("复制失败");
    }
  }
  function switchMode(nextMode) {
    setState((current) => ({
      ...current,
      mode: nextMode,
      length: nextMode === "pin" ? 6 : Math.max(current.length, 12)
    }));
    setNonce((value) => value + 1);
  }
  const controls = /* @__PURE__ */ jsxs("div", { className: "password-card password-card--controls", children: [
    /* @__PURE__ */ jsxs("div", { className: "password-card__section", children: [
      /* @__PURE__ */ jsx("h2", { className: "password-card__title", children: "选择密码类型" }),
      /* @__PURE__ */ jsx("div", { className: "password-mode-tabs", role: "tablist", "aria-label": "密码类型", children: modeOptions.map((item) => {
        const Icon = item.icon;
        return /* @__PURE__ */ jsxs(
          "button",
          {
            className: mode === item.value ? "password-mode-tabs__item password-mode-tabs__item--active" : "password-mode-tabs__item",
            type: "button",
            onClick: () => switchMode(item.value),
            "aria-selected": mode === item.value,
            children: [
              /* @__PURE__ */ jsx(Icon, { size: 17, strokeWidth: 2, "aria-hidden": "true" }),
              item.label
            ]
          },
          item.value
        );
      }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "password-card__section", children: [
      /* @__PURE__ */ jsx("h2", { className: "password-card__title", children: "自定义新密码" }),
      /* @__PURE__ */ jsxs("div", { className: "password-length-row", children: [
        /* @__PURE__ */ jsx("label", { className: "password-length-row__label", htmlFor: "password-length", children: "字符" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            id: "password-length",
            className: "password-range",
            type: "range",
            min: 4,
            max: mode === "pin" ? 12 : 128,
            value: length,
            onChange: (event) => updateSetting("length", Number(event.target.value))
          }
        ),
        /* @__PURE__ */ jsx(
          "input",
          {
            className: "password-length-input",
            type: "number",
            min: 4,
            max: mode === "pin" ? 12 : 128,
            value: length,
            onChange: (event) => updateSetting("length", Number(event.target.value)),
            "aria-label": "密码长度"
          }
        )
      ] }),
      mode === "random" ? /* @__PURE__ */ jsx("div", { className: "password-choice-grid", "aria-label": "字符集", children: [
        ["lowercase", lowercase],
        ["uppercase", uppercase],
        ["numbers", numbers],
        ["symbols", symbols]
      ].map(([key, checked]) => /* @__PURE__ */ jsxs("label", { className: "inline-check", children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "checkbox",
            checked,
            onChange: (event) => updateSetting(key, event.target.checked)
          }
        ),
        optionLabels[key]
      ] }, key)) }) : null
    ] })
  ] });
  const resultPanel = /* @__PURE__ */ jsxs("div", { className: "password-card password-card--result", children: [
    /* @__PURE__ */ jsxs("div", { className: "password-card__title-row", children: [
      /* @__PURE__ */ jsx("h2", { className: "password-card__title", children: "生成密码" }),
      notice ? /* @__PURE__ */ jsx("span", { className: "password-notice", children: notice }) : null
    ] }),
    /* @__PURE__ */ jsx("div", { className: result.ok ? "password-output" : "password-output password-output--error", children: result.ok ? renderPassword(output) : result.error })
  ] });
  const actions = /* @__PURE__ */ jsxs("div", { className: "password-card__actions", children: [
    /* @__PURE__ */ jsx(Button, { disabled: !result.ok || !output, onClick: copyPassword, children: "复制密码" }),
    /* @__PURE__ */ jsxs(Button, { variant: "secondary", onClick: () => setNonce((value) => value + 1), children: [
      /* @__PURE__ */ jsx(RotateCw, { size: 17, strokeWidth: 2, "aria-hidden": "true" }),
      "刷新密码"
    ] })
  ] });
  return /* @__PURE__ */ jsx(GeneratorPanel, { ariaLabel: "随机密码工具", controls, result: resultPanel, actions });
}

const toolComponents = {
  base64: Base64Codec,
  json: JsonFormatter,
  jwt: JwtDecoder,
  password: PasswordGenerator
};

function getToolIdFromPath() {
  if (typeof window === "undefined") return "";
  const match = window.location.pathname.match(/^\/tools\/([^/]+)/);
  return match?.[1] ?? "";
}
function ToolApp({ initialToolId }) {
  const [activeToolId, setActiveToolId] = useState(initialToolId);
  const activeToolIdRef = useRef(activeToolId);
  const activeTool = useMemo(() => getToolById(activeToolId) ?? tools[0], [activeToolId]);
  const ToolComponent = toolComponents[activeTool.id];
  useEffect(() => {
    activeToolIdRef.current = activeToolId;
  }, [activeToolId]);
  const selectTool = useCallback((toolId) => {
    const nextTool = getToolById(toolId);
    if (!nextTool || toolId === activeToolIdRef.current) return;
    setActiveToolId(toolId);
    window.history.pushState({ toolId }, "", nextTool.href);
    document.title = `${nextTool.name} - Bytekit`;
  }, []);
  useEffect(() => {
    function handlePopState() {
      const nextToolId = getToolIdFromPath();
      if (getToolById(nextToolId)) setActiveToolId(nextToolId);
    }
    function handleSelectTool(event) {
      const customEvent = event;
      selectTool(customEvent.detail.toolId);
    }
    window.addEventListener("popstate", handlePopState);
    window.addEventListener("bytekit:select-tool", handleSelectTool);
    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("bytekit:select-tool", handleSelectTool);
    };
  }, [selectTool]);
  return /* @__PURE__ */ jsxs("div", { className: "tool-app-shell", children: [
    /* @__PURE__ */ jsx(ToolSidebar, { activeToolId: activeTool.id, onSelectTool: selectTool }),
    /* @__PURE__ */ jsxs("section", { className: "tool-app-content", children: [
      /* @__PURE__ */ jsx("header", { className: "tool-app-head", children: /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "page-title", children: activeTool.name }),
        /* @__PURE__ */ jsx("p", { className: "page-desc", children: activeTool.description })
      ] }) }),
      ToolComponent ? /* @__PURE__ */ jsx(ToolComponent, {}) : /* @__PURE__ */ jsx("div", { className: "state-box", children: "工具组件未注册。" })
    ] })
  ] });
}

function toPinyinSearchText(value) {
  const chineseSegments = value.match(/[㐀-鿿]+/g) ?? [];
  const pinyinTokens = chineseSegments.flatMap((segment) => {
    const full = pinyin(segment, { toneType: "none", type: "array" });
    const initials = pinyin(segment, { pattern: "first", toneType: "none", type: "array" });
    return [full.join(" "), full.join(""), initials.join("")];
  });
  return pinyinTokens.filter(Boolean).join(" ");
}
const documents = tools.map((tool) => {
  const category = getCategoryById(tool.category)?.name ?? "";
  const keywords = tool.keywords.join(" ");
  const searchSource = [tool.name, tool.shortName, tool.description, keywords, category].join(" ");
  return {
    id: tool.id,
    name: tool.name,
    shortName: tool.shortName,
    description: tool.description,
    keywords,
    category,
    pinyin: toPinyinSearchText(searchSource),
    href: tool.href
  };
});
function ToolSearch({ variant = "header" }) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef(null);
  const resultsRef = useRef(null);
  const queryRef = useRef(query);
  const isFocusedRef = useRef(isFocused);
  const activeIndexRef = useRef(activeIndex);
  const resultsLengthRef = useRef(0);
  queryRef.current = query;
  isFocusedRef.current = isFocused;
  activeIndexRef.current = activeIndex;
  const miniSearch = useMemo(() => {
    const index = new MiniSearch({
      fields: ["name", "shortName", "keywords", "pinyin", "description", "category"],
      storeFields: ["id", "name", "description", "category", "href"],
      searchOptions: {
        boost: { name: 5, shortName: 4, keywords: 3, pinyin: 1 },
        prefix: true,
        fuzzy: 0.2
      }
    });
    index.addAll(documents);
    return index;
  }, []);
  const normalizedQuery = query.trim();
  const results = normalizedQuery ? miniSearch.search(normalizedQuery).slice(0, 8) : [];
  const showResults = isFocused && normalizedQuery.length > 0;
  resultsLengthRef.current = results.length;
  useEffect(() => {
    setActiveIndex(-1);
  }, [normalizedQuery]);
  useEffect(() => {
    if (showResults && results.length > 0 && activeIndex === -1) {
      setActiveIndex(0);
    }
  }, [showResults, results.length]);
  const selectTool = useCallback((href) => {
    const match = href.match(/^\/tools\/([^/]+)/);
    const toolId = match?.[1];
    const currentToolPath = window.location.pathname.startsWith("/tools/");
    if (currentToolPath && toolId) {
      window.dispatchEvent(new CustomEvent("bytekit:select-tool", { detail: { toolId } }));
      return;
    }
    window.location.href = href;
  }, []);
  useEffect(() => {
    if (activeIndex < 0 || !resultsRef.current) return;
    const items = resultsRef.current.querySelectorAll('[role="option"]');
    items[activeIndex]?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);
  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    function handleKeyDown(e) {
      const hasResults = isFocusedRef.current && resultsLengthRef.current > 0;
      if (!hasResults) return;
      switch (e.key) {
        case "ArrowDown": {
          e.preventDefault();
          setActiveIndex((prev) => (prev + 1) % resultsLengthRef.current);
          break;
        }
        case "ArrowUp": {
          e.preventDefault();
          setActiveIndex((prev) => prev <= 0 ? resultsLengthRef.current - 1 : prev - 1);
          break;
        }
        case "Enter": {
          if (activeIndexRef.current >= 0 && activeIndexRef.current < resultsLengthRef.current) {
            e.preventDefault();
            const normalizedQ = queryRef.current.trim();
            if (normalizedQ) {
              const currentResults = miniSearch.search(normalizedQ).slice(0, 8);
              const selected = currentResults[activeIndexRef.current];
              if (selected) {
                selectTool(String(selected.href));
                setQuery("");
                setActiveIndex(-1);
                input.blur();
              }
            }
          }
          break;
        }
        case "Escape": {
          setActiveIndex(-1);
          input.blur();
          break;
        }
      }
    }
    input.addEventListener("keydown", handleKeyDown);
    return () => input.removeEventListener("keydown", handleKeyDown);
  }, [miniSearch, selectTool]);
  useEffect(() => {
    function handleGlobalKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    }
    document.addEventListener("keydown", handleGlobalKeyDown);
    return () => document.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);
  const isMac = typeof navigator !== "undefined" && (navigator.platform?.includes("Mac") || navigator.userAgentData?.platform === "macOS");
  const shortcutHint = isMac ? "⌘K" : "Ctrl+K";
  const listId = `tool-search-list-${variant}`;
  const activeId = activeIndex >= 0 && activeIndex < results.length ? `tool-search-option-${results[activeIndex]?.id}` : void 0;
  return /* @__PURE__ */ jsxs("div", { className: `tool-search tool-search--${variant}`, children: [
    /* @__PURE__ */ jsxs("label", { className: "tool-search__field", children: [
      /* @__PURE__ */ jsx(Search, { size: 18, strokeWidth: 2, "aria-hidden": "true" }),
      /* @__PURE__ */ jsx(
        "input",
        {
          ref: inputRef,
          type: "text",
          value: query,
          onChange: (event) => setQuery(event.target.value),
          onFocus: () => setIsFocused(true),
          onBlur: () => setTimeout(() => setIsFocused(false), 150),
          placeholder: variant === "hero" ? `搜索工具（${shortcutHint}）` : "搜索工具...",
          "aria-label": "搜索工具",
          "aria-expanded": showResults && results.length > 0,
          "aria-controls": listId,
          "aria-activedescendant": activeId,
          role: "combobox",
          autoComplete: "off"
        }
      ),
      !query ? /* @__PURE__ */ jsx("kbd", { className: "tool-search__shortcut", children: shortcutHint }) : null
    ] }),
    showResults ? /* @__PURE__ */ jsx("div", { ref: resultsRef, className: "tool-search__results", id: listId, role: "listbox", children: results.length > 0 ? results.map((result, index) => /* @__PURE__ */ jsxs(
      "button",
      {
        id: `tool-search-option-${result.id}`,
        className: `tool-search__result${index === activeIndex ? " tool-search__result--active" : ""}`,
        type: "button",
        role: "option",
        "aria-selected": index === activeIndex,
        onMouseDown: (event) => {
          event.preventDefault();
          selectTool(String(result.href));
          setQuery("");
        },
        children: [
          /* @__PURE__ */ jsx("span", { className: "tool-search__result-main", children: String(result.name) }),
          /* @__PURE__ */ jsxs("span", { className: "tool-search__result-meta", children: [
            String(result.category),
            " · ",
            String(result.description)
          ] })
        ]
      },
      result.id
    )) : /* @__PURE__ */ jsx("div", { className: "tool-search__empty", children: "没有匹配的工具" }) }) : null
  ] });
}

function getInitialTheme() {
  if (typeof window === "undefined") return "light";
  const current = document.documentElement.dataset.theme;
  return current === "dark" ? "dark" : "light";
}
function ThemeToggle() {
  const [theme, setTheme] = useState(getInitialTheme);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("bytekit-theme", theme);
  }, [theme]);
  function toggleTheme() {
    setTheme((current) => current === "dark" ? "light" : "dark");
  }
  return /* @__PURE__ */ jsx(
    Button,
    {
      variant: "ghost",
      size: "sm",
      className: "theme-toggle",
      onClick: toggleTheme,
      "aria-label": theme === "dark" ? "切换到浅色模式" : "切换到深色模式",
      title: theme === "dark" ? "切换到浅色模式" : "切换到深色模式",
      children: theme === "dark" ? /* @__PURE__ */ jsx(Moon, { size: 17, strokeWidth: 2, "aria-hidden": "true" }) : /* @__PURE__ */ jsx(Sun, { size: 17, strokeWidth: 2, "aria-hidden": "true" })
    }
  );
}

const $$AppHeader = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<header class="site-header"> <div class="site-header__inner"> <a class="brand" href="/" aria-label="Bytekit 首页"> <span class="brand__mark">B</span> <span class="brand__body"> <span class="brand__text">Bytekit</span> <span class="brand__caption">开发工具</span> </span> </a> <div class="site-header__search"> ${renderComponent($$result, "ToolSearch", ToolSearch, { "client:load": true, "variant": "header", "client:component-hydration": "load", "client:component-path": "E:/code/Cooooing/bytekit/src/components/search/ToolSearch", "client:component-export": "default" })} </div> <div class="site-header__actions"> ${renderComponent($$result, "ThemeToggle", ThemeToggle, { "client:load": true, "client:component-hydration": "load", "client:component-path": "E:/code/Cooooing/bytekit/src/components/shell/ThemeToggle", "client:component-export": "default" })} </div> </div> </header>`;
}, "E:/code/Cooooing/bytekit/src/components/shell/AppHeader.astro", void 0);

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$BaseLayout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$BaseLayout;
  const { title, description = "Bytekit 开发工具站" } = Astro2.props;
  return renderTemplate(_a || (_a = __template([`<html lang="zh-CN" data-theme="light"> <head><script>
			(() => {
				try {
					const stored = window.localStorage.getItem('bytekit-theme');
					const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
					document.documentElement.dataset.theme = stored || (systemDark ? 'dark' : 'light');
				} catch {
					document.documentElement.dataset.theme = 'light';
				}
			})();
		<\/script><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><link rel="icon" href="/favicon.ico"><meta name="description"`, '><meta name="generator"', "><title>", "</title>", "</head> <body> ", ' <main class="site-main"> ', " </main> </body></html>"])), addAttribute(description, "content"), addAttribute(Astro2.generator, "content"), title, renderHead(), renderComponent($$result, "AppHeader", $$AppHeader, {}), renderSlot($$result, $$slots["default"]));
}, "E:/code/Cooooing/bytekit/src/layouts/BaseLayout.astro", void 0);

const prerender = false;
const $$tool = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$tool;
  const { tool: toolId } = Astro2.params;
  const tool = getToolById(toolId ?? "");
  if (!tool) {
    return new Response("工具不存在", { status: 404 });
  }
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": `${tool.name} - Bytekit`, "description": tool.description }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "ToolApp", ToolApp, { "client:load": true, "initialToolId": tool.id, "client:component-hydration": "load", "client:component-path": "E:/code/Cooooing/bytekit/src/components/tools/ToolApp", "client:component-export": "default" })} ` })}`;
}, "E:/code/Cooooing/bytekit/src/pages/tools/[tool].astro", void 0);

const $$file = "E:/code/Cooooing/bytekit/src/pages/tools/[tool].astro";
const $$url = "/tools/[tool]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$tool,
	file: $$file,
	prerender,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
