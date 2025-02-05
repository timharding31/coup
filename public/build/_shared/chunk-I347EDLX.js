import {
  createHotContext
} from "/build/_shared/chunk-NW53SDWD.js";
import {
  require_jsx_dev_runtime
} from "/build/_shared/chunk-F4KNNEUR.js";
import {
  __toESM
} from "/build/_shared/chunk-PZDJHGND.js";

// app/types/card.ts
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app/types/card.ts"
  );
  import.meta.hot.lastModified = "1738706162454.1152";
}
var CardType = {
  DUKE: "DUKE",
  ASSASSIN: "ASSASSIN",
  CONTESSA: "CONTESSA",
  CAPTAIN: "CAPTAIN",
  AMBASSADOR: "AMBASSADOR"
};

// app/components/PlayingCard.tsx
var import_jsx_dev_runtime = __toESM(require_jsx_dev_runtime(), 1);
if (!window.$RefreshReg$ || !window.$RefreshSig$ || !window.$RefreshRuntime$) {
  console.warn("remix:hmr: React Fast Refresh only works when the Remix compiler is running in development mode.");
} else {
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = (type, id) => {
    window.$RefreshRuntime$.register(type, '"app/components/PlayingCard.tsx"' + id);
  };
  window.$RefreshSig$ = window.$RefreshRuntime$.createSignatureFunctionForTransform;
}
var prevRefreshReg;
var prevRefreshSig;
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app/components/PlayingCard.tsx"
  );
  import.meta.hot.lastModified = "1738786236527.343";
}
var colorSchemes = {
  [CardType.AMBASSADOR]: "bg-gradient-to-br from-amber-200 to-amber-600",
  [CardType.ASSASSIN]: "bg-gradient-to-br from-emerald-900 to-black",
  [CardType.CAPTAIN]: "bg-gradient-to-br from-slate-600 to-gray-800",
  [CardType.CONTESSA]: "bg-gradient-to-br from-rose-400 to-orange-800",
  [CardType.DUKE]: "bg-gradient-to-br from-cyan-600 to-purple-800"
};
var decorativeElements = {
  [CardType.AMBASSADOR]: "border-amber-400",
  [CardType.ASSASSIN]: "border-emerald-800",
  [CardType.CAPTAIN]: "border-gray-600",
  [CardType.CONTESSA]: "border-rose-800",
  [CardType.DUKE]: "border-cyan-800"
};
var textColors = {
  [CardType.AMBASSADOR]: "text-amber-900",
  [CardType.ASSASSIN]: "text-emerald-400",
  [CardType.CAPTAIN]: "text-slate-300",
  [CardType.CONTESSA]: "text-teal-100",
  [CardType.DUKE]: "text-purple-900"
};
var PlayingCard = ({
  type: character,
  isRevealed
}) => {
  if (!character) {
    return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(FaceDownCard, {}, void 0, false, {
      fileName: "app/components/PlayingCard.tsx",
      lineNumber: 50,
      columnNumber: 12
    }, this);
  }
  return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "card-container rounded-xl", children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: `rounded-card w-full h-full nord-shadow relative overflow-hidden ${colorSchemes[character]}`, children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { "data-hide-lt-sm": true, className: "absolute top-2 left-4 px-[4cqi] flex flex-col items-start z-10", children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { className: `text-[12cqi] font-bold ${textColors[character]} font-odachi`, children: character.slice() }, void 0, false, {
      fileName: "app/components/PlayingCard.tsx",
      lineNumber: 56,
      columnNumber: 11
    }, this) }, void 0, false, {
      fileName: "app/components/PlayingCard.tsx",
      lineNumber: 55,
      columnNumber: 9
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { "data-hide-lt-sm": true, className: "absolute bottom-2 right-4 px-[4cqi] flex flex-col items-end rotate-180 z-10 mix-blend-exclusion", children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { className: `text-[12cqi] font-bold ${textColors[character]} font-odachi`, children: character.slice() }, void 0, false, {
      fileName: "app/components/PlayingCard.tsx",
      lineNumber: 61,
      columnNumber: 11
    }, this) }, void 0, false, {
      fileName: "app/components/PlayingCard.tsx",
      lineNumber: 60,
      columnNumber: 9
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { "data-hide-lt-sm": true, className: `absolute inset-4 border-4 ${decorativeElements[character]} rounded-lg opacity-40` }, void 0, false, {
      fileName: "app/components/PlayingCard.tsx",
      lineNumber: 65,
      columnNumber: 9
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "absolute bottom-0 left-0 w-full", children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("img", { src: `/images/${character.toLowerCase()}.png`, alt: character, className: "w-full object-contain mix-blend-hard-light scale-x-[-1]" }, void 0, false, {
      fileName: "app/components/PlayingCard.tsx",
      lineNumber: 68,
      columnNumber: 11
    }, this) }, void 0, false, {
      fileName: "app/components/PlayingCard.tsx",
      lineNumber: 67,
      columnNumber: 9
    }, this)
  ] }, void 0, true, {
    fileName: "app/components/PlayingCard.tsx",
    lineNumber: 53,
    columnNumber: 7
  }, this) }, void 0, false, {
    fileName: "app/components/PlayingCard.tsx",
    lineNumber: 52,
    columnNumber: 10
  }, this);
};
_c = PlayingCard;
var FaceDownCard = () => {
  return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "card-container", children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "rounded-card w-full h-full nord-shadow relative overflow-hidden", children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("svg", { className: "absolute inset-0 w-full h-full bg-nord-10 text-nord-9", viewBox: "0 0 60 80", children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("use", { href: "#card-back" }, void 0, false, {
    fileName: "app/components/PlayingCard.tsx",
    lineNumber: 78,
    columnNumber: 11
  }, this) }, void 0, false, {
    fileName: "app/components/PlayingCard.tsx",
    lineNumber: 77,
    columnNumber: 9
  }, this) }, void 0, false, {
    fileName: "app/components/PlayingCard.tsx",
    lineNumber: 76,
    columnNumber: 7
  }, this) }, void 0, false, {
    fileName: "app/components/PlayingCard.tsx",
    lineNumber: 75,
    columnNumber: 10
  }, this);
};
_c2 = FaceDownCard;
var _c;
var _c2;
$RefreshReg$(_c, "PlayingCard");
$RefreshReg$(_c2, "FaceDownCard");
window.$RefreshReg$ = prevRefreshReg;
window.$RefreshSig$ = prevRefreshSig;

export {
  CardType,
  PlayingCard
};
//# sourceMappingURL=/build/_shared/chunk-I347EDLX.js.map
