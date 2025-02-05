import {
  PlayingCard
} from "/build/_shared/chunk-MZVCNLDW.js";
import {
  Button
} from "/build/_shared/chunk-B3U5MCW4.js";
import {
  CardType
} from "/build/_shared/chunk-VVVWLK5W.js";
import {
  require_jsx_dev_runtime
} from "/build/_shared/chunk-F4KNNEUR.js";
import {
  require_react
} from "/build/_shared/chunk-2Z2JGDFU.js";
import {
  createHotContext
} from "/build/_shared/chunk-NW53SDWD.js";
import "/build/_shared/chunk-JR22VO6P.js";
import {
  __toESM
} from "/build/_shared/chunk-PZDJHGND.js";

// app/routes/ui.tsx
var import_react = __toESM(require_react(), 1);
var import_jsx_dev_runtime = __toESM(require_jsx_dev_runtime(), 1);
if (!window.$RefreshReg$ || !window.$RefreshSig$ || !window.$RefreshRuntime$) {
  console.warn("remix:hmr: React Fast Refresh only works when the Remix compiler is running in development mode.");
} else {
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = (type, id) => {
    window.$RefreshRuntime$.register(type, '"app/routes/ui.tsx"' + id);
  };
  window.$RefreshSig$ = window.$RefreshRuntime$.createSignatureFunctionForTransform;
}
var prevRefreshReg;
var prevRefreshSig;
var _s = $RefreshSig$();
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app/routes/ui.tsx"
  );
  import.meta.hot.lastModified = "1738785075919.637";
}
function ButtonDemo() {
  _s();
  const [timeoutAt] = (0, import_react.useState)(Date.now() + 2e4);
  const variants = ["primary", "secondary", "tertiary", "success", "warning", "danger"];
  return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "p-8 space-y-8", children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h2", { className: "text-xl text-nord-6 font-bold", children: "Buttons" }, void 0, false, {
      fileName: "app/routes/ui.tsx",
      lineNumber: 31,
      columnNumber: 7
    }, this),
    variants.map((variant) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "space-y-2", children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "flex gap-4", children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Button, { variant, children: variant }, void 0, false, {
          fileName: "app/routes/ui.tsx",
          lineNumber: 34,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Button, { variant, timeoutAt, children: [
          variant,
          " (w/ Timer)"
        ] }, void 0, true, {
          fileName: "app/routes/ui.tsx",
          lineNumber: 35,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "app/routes/ui.tsx",
        lineNumber: 33,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "flex gap-4", children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Button, { variant, disabled: true, children: "Disabled" }, void 0, false, {
        fileName: "app/routes/ui.tsx",
        lineNumber: 40,
        columnNumber: 13
      }, this) }, void 0, false, {
        fileName: "app/routes/ui.tsx",
        lineNumber: 39,
        columnNumber: 11
      }, this)
    ] }, variant, true, {
      fileName: "app/routes/ui.tsx",
      lineNumber: 32,
      columnNumber: 32
    }, this)),
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h2", { className: "mt-2 text-xl text-nord-6 font-bold", children: "Cards" }, void 0, false, {
      fileName: "app/routes/ui.tsx",
      lineNumber: 45,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "mt-4 px-2 grid grid-cols-2 md:grid-cols-5 gap-2", children: [
      Object.values(CharacterCards).map((card) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(PlayingCard, { id: card.type, ...card }, void 0, false, {
        fileName: "app/routes/ui.tsx",
        lineNumber: 47,
        columnNumber: 52
      }, this)),
      new Array(5).fill(null).map((_, i) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(PlayingCard, { id: `face-down-${i}`, type: null }, `face-down-${i}`, false, {
        fileName: "app/routes/ui.tsx",
        lineNumber: 48,
        columnNumber: 48
      }, this))
    ] }, void 0, true, {
      fileName: "app/routes/ui.tsx",
      lineNumber: 46,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "app/routes/ui.tsx",
    lineNumber: 30,
    columnNumber: 10
  }, this);
}
_s(ButtonDemo, "4eqOhcumZfRXARxjJK9uu12r07I=");
_c = ButtonDemo;
var CharacterCards = {
  [CardType.DUKE]: {
    type: "DUKE",
    isRevealed: true
  },
  [CardType.ASSASSIN]: {
    type: "ASSASSIN",
    isRevealed: true
  },
  [CardType.CONTESSA]: {
    type: "CONTESSA",
    isRevealed: true
  },
  [CardType.CAPTAIN]: {
    type: "CAPTAIN",
    isRevealed: true
  },
  [CardType.AMBASSADOR]: {
    type: "AMBASSADOR",
    isRevealed: true
  }
};
var _c;
$RefreshReg$(_c, "ButtonDemo");
window.$RefreshReg$ = prevRefreshReg;
window.$RefreshSig$ = prevRefreshSig;
export {
  ButtonDemo as default
};
//# sourceMappingURL=/build/routes/ui-B3CS273E.js.map
