import {
  Button
} from "/build/_shared/chunk-IXL2CDGS.js";
import {
  createHotContext
} from "/build/_shared/chunk-NW53SDWD.js";
import "/build/_shared/chunk-JR22VO6P.js";
import {
  require_jsx_dev_runtime
} from "/build/_shared/chunk-F4KNNEUR.js";
import {
  require_react
} from "/build/_shared/chunk-2Z2JGDFU.js";
import {
  __toESM
} from "/build/_shared/chunk-PZDJHGND.js";

// app/routes/buttons.tsx
var import_react = __toESM(require_react(), 1);
var import_jsx_dev_runtime = __toESM(require_jsx_dev_runtime(), 1);
if (!window.$RefreshReg$ || !window.$RefreshSig$ || !window.$RefreshRuntime$) {
  console.warn("remix:hmr: React Fast Refresh only works when the Remix compiler is running in development mode.");
} else {
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = (type, id) => {
    window.$RefreshRuntime$.register(type, '"app/routes/buttons.tsx"' + id);
  };
  window.$RefreshSig$ = window.$RefreshRuntime$.createSignatureFunctionForTransform;
}
var prevRefreshReg;
var prevRefreshSig;
var _s = $RefreshSig$();
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app/routes/buttons.tsx"
  );
  import.meta.hot.lastModified = "1738780086809.2278";
}
function ButtonDemo() {
  _s();
  const now = Math.floor(Date.now());
  const [timeoutAt] = (0, import_react.useState)(now + 2e4);
  const remainingTime = Math.max(0, timeoutAt - now);
  const variants = [["neutral", "neutralOutline"], ["amber", "amberOutline"], ["black", "blackOutline"], ["blue", "blueOutline"], ["rose", "roseOutline"], ["purple", "purpleOutline"], ["red", "redOutline"], ["emerald", "emeraldOutline"]];
  return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "p-8 space-y-8 bg-white", children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h2", { className: "text-lg font-semibold mb-4", children: "Button Variants with Timer" }, void 0, false, {
      fileName: "app/routes/buttons.tsx",
      lineNumber: 31,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "text-sm text-gray-500 mb-4", children: [
      "Timer starts with ",
      remainingTime,
      "s remaining and counts down"
    ] }, void 0, true, {
      fileName: "app/routes/buttons.tsx",
      lineNumber: 32,
      columnNumber: 7
    }, this),
    variants.map(([filled, outline]) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "space-y-2", children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "flex gap-4", children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Button, { variant: filled, timeoutAt, children: filled }, void 0, false, {
          fileName: "app/routes/buttons.tsx",
          lineNumber: 35,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Button, { variant: outline, timeoutAt, children: outline }, void 0, false, {
          fileName: "app/routes/buttons.tsx",
          lineNumber: 38,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "app/routes/buttons.tsx",
        lineNumber: 34,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "flex gap-4", children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Button, { variant: filled, children: "No Timer" }, void 0, false, {
          fileName: "app/routes/buttons.tsx",
          lineNumber: 43,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Button, { variant: filled, timeoutAt, disabled: true, children: "Disabled with Timer" }, void 0, false, {
          fileName: "app/routes/buttons.tsx",
          lineNumber: 44,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "app/routes/buttons.tsx",
        lineNumber: 42,
        columnNumber: 11
      }, this)
    ] }, filled, true, {
      fileName: "app/routes/buttons.tsx",
      lineNumber: 33,
      columnNumber: 44
    }, this))
  ] }, void 0, true, {
    fileName: "app/routes/buttons.tsx",
    lineNumber: 30,
    columnNumber: 10
  }, this);
}
_s(ButtonDemo, "MI982z0Ualry0ztsEhWXYReDhLA=");
_c = ButtonDemo;
var _c;
$RefreshReg$(_c, "ButtonDemo");
window.$RefreshReg$ = prevRefreshReg;
window.$RefreshSig$ = prevRefreshSig;
export {
  ButtonDemo as default
};
//# sourceMappingURL=/build/routes/buttons-LHAIIZI6.js.map
