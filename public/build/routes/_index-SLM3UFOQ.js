import {
  TextInput
} from "/build/_shared/chunk-NYRAM5VV.js";
import {
  Button
} from "/build/_shared/chunk-B3U5MCW4.js";
import {
  Form
} from "/build/_shared/chunk-5FAD4KYH.js";
import "/build/_shared/chunk-PLT55Z5M.js";
import {
  require_jsx_dev_runtime
} from "/build/_shared/chunk-F4KNNEUR.js";
import {
  require_react
} from "/build/_shared/chunk-2Z2JGDFU.js";
import {
  require_node
} from "/build/_shared/chunk-NBEH4DGX.js";
import {
  createHotContext
} from "/build/_shared/chunk-NW53SDWD.js";
import "/build/_shared/chunk-JR22VO6P.js";
import {
  __toESM
} from "/build/_shared/chunk-PZDJHGND.js";

// app/routes/_index.tsx
var import_node = __toESM(require_node(), 1);
var import_react3 = __toESM(require_react(), 1);

// app/components/PinInput.tsx
var import_react = __toESM(require_react(), 1);
var import_jsx_dev_runtime = __toESM(require_jsx_dev_runtime(), 1);
if (!window.$RefreshReg$ || !window.$RefreshSig$ || !window.$RefreshRuntime$) {
  console.warn("remix:hmr: React Fast Refresh only works when the Remix compiler is running in development mode.");
} else {
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = (type, id) => {
    window.$RefreshRuntime$.register(type, '"app/components/PinInput.tsx"' + id);
  };
  window.$RefreshSig$ = window.$RefreshRuntime$.createSignatureFunctionForTransform;
}
var prevRefreshReg;
var prevRefreshSig;
var _s = $RefreshSig$();
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app/components/PinInput.tsx"
  );
  import.meta.hot.lastModified = "1738787498094.511";
}
var PinInput = ({
  value,
  onChange,
  error,
  label,
  ...inputProps
}) => {
  _s();
  const [focused, setFocused] = (0, import_react.useState)(false);
  const inputRef = (0, import_react.useRef)(null);
  const handleChange = (e) => {
    const newValue = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4);
    onChange(newValue);
  };
  const displayValue = value.padEnd(4, "\u2022");
  return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "relative", children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(TextInput, { ref: inputRef, value, onChange: handleChange, onFocus: () => setFocused(true), onBlur: () => setFocused(false), className: "text-center tracking-[1em] font-bold", maxLength: 4, pattern: "[A-Z0-9]*", autoComplete: "off", spellCheck: false, error, label, size: "lg", ...inputProps }, void 0, false, {
      fileName: "app/components/PinInput.tsx",
      lineNumber: 40,
      columnNumber: 7
    }, this),
    !focused && value.length < 4 && /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "absolute inset-0 flex items-center justify-center pointer-events-none", style: {
      marginTop: label ? "34px" : "0"
    }, children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "flex gap-4", children: Array.from({
      length: 4
    }).map((_, index) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { className: `
                  w-4 h-4 rounded-full 
                  ${index < value.length ? "bg-nord-8" : "bg-nord-3"}
                ` }, index, false, {
      fileName: "app/components/PinInput.tsx",
      lineNumber: 48,
      columnNumber: 30
    }, this)) }, void 0, false, {
      fileName: "app/components/PinInput.tsx",
      lineNumber: 45,
      columnNumber: 11
    }, this) }, void 0, false, {
      fileName: "app/components/PinInput.tsx",
      lineNumber: 42,
      columnNumber: 40
    }, this)
  ] }, void 0, true, {
    fileName: "app/components/PinInput.tsx",
    lineNumber: 39,
    columnNumber: 10
  }, this);
};
_s(PinInput, "zJA/JXynid6Cz9SaiU3RIOIK700=");
_c = PinInput;
var _c;
$RefreshReg$(_c, "PinInput");
window.$RefreshReg$ = prevRefreshReg;
window.$RefreshSig$ = prevRefreshSig;

// app/routes/_index.tsx
var import_jsx_dev_runtime2 = __toESM(require_jsx_dev_runtime(), 1);
if (!window.$RefreshReg$ || !window.$RefreshSig$ || !window.$RefreshRuntime$) {
  console.warn("remix:hmr: React Fast Refresh only works when the Remix compiler is running in development mode.");
} else {
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = (type, id) => {
    window.$RefreshRuntime$.register(type, '"app/routes/_index.tsx"' + id);
  };
  window.$RefreshSig$ = window.$RefreshRuntime$.createSignatureFunctionForTransform;
}
var prevRefreshReg;
var prevRefreshSig;
var _s2 = $RefreshSig$();
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app/routes/_index.tsx"
  );
  import.meta.hot.lastModified = "1738791349572.9065";
}
var meta = () => {
  return [{
    title: ""
  }, {
    name: "description",
    content: ""
  }];
};
function Index() {
  _s2();
  const [pin, setPin] = (0, import_react3.useState)("");
  return /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("div", { className: "flex flex-col items-stretch gap-8 w-full max-w-[800px] p-4 m-auto", children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)(Form, { method: "post", className: "contents", children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("input", { type: "hidden", name: "intent", value: "create" }, void 0, false, {
        fileName: "app/routes/_index.tsx",
        lineNumber: 91,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)(Button, { variant: "secondary", type: "submit", children: "Create new game" }, void 0, false, {
        fileName: "app/routes/_index.tsx",
        lineNumber: 92,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "app/routes/_index.tsx",
      lineNumber: 90,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("div", { className: "text-nord-6 text-center", children: "\u2014 or \u2014" }, void 0, false, {
      fileName: "app/routes/_index.tsx",
      lineNumber: 97,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)(Form, { method: "post", children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("input", { type: "hidden", name: "intent", value: "join" }, void 0, false, {
        fileName: "app/routes/_index.tsx",
        lineNumber: 100,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("div", { className: "flex flex-col items-stretch gap-2", children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)(PinInput, { name: "pin", value: pin, onChange: setPin, required: true }, void 0, false, {
          fileName: "app/routes/_index.tsx",
          lineNumber: 102,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)(Button, { variant: "primary", type: "submit", children: "Join by PIN" }, void 0, false, {
          fileName: "app/routes/_index.tsx",
          lineNumber: 103,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "app/routes/_index.tsx",
        lineNumber: 101,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "app/routes/_index.tsx",
      lineNumber: 99,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "app/routes/_index.tsx",
    lineNumber: 89,
    columnNumber: 10
  }, this);
}
_s2(Index, "ckTUeThNO5ujnfDny4OgbNBJ+NQ=");
_c2 = Index;
var _c2;
$RefreshReg$(_c2, "Index");
window.$RefreshReg$ = prevRefreshReg;
window.$RefreshSig$ = prevRefreshSig;
export {
  Index as default,
  meta
};
//# sourceMappingURL=/build/routes/_index-SLM3UFOQ.js.map
