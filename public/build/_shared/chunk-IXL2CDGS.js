import {
  createHotContext
} from "/build/_shared/chunk-NW53SDWD.js";
import {
  require_jsx_dev_runtime
} from "/build/_shared/chunk-F4KNNEUR.js";
import {
  require_react
} from "/build/_shared/chunk-2Z2JGDFU.js";
import {
  __toESM
} from "/build/_shared/chunk-PZDJHGND.js";

// app/components/Button.tsx
var import_react2 = __toESM(require_react(), 1);

// app/hooks/useMergedRefs.ts
var import_react = __toESM(require_react(), 1);
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app/hooks/useMergedRefs.ts"
  );
  import.meta.hot.lastModified = "1738740865865.213";
}
function useMergedRefs(...refs) {
  return (0, import_react.useCallback)((value) => {
    refs.forEach((ref) => {
      if (typeof ref === "function") {
        ref(value);
      } else if (ref != null) {
        ref.current = value;
      }
    });
  }, refs);
}

// app/components/Button.tsx
var import_jsx_dev_runtime = __toESM(require_jsx_dev_runtime(), 1);
if (!window.$RefreshReg$ || !window.$RefreshSig$ || !window.$RefreshRuntime$) {
  console.warn("remix:hmr: React Fast Refresh only works when the Remix compiler is running in development mode.");
} else {
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = (type, id) => {
    window.$RefreshRuntime$.register(type, '"app/components/Button.tsx"' + id);
  };
  window.$RefreshSig$ = window.$RefreshRuntime$.createSignatureFunctionForTransform;
}
var prevRefreshReg;
var prevRefreshSig;
var _s = $RefreshSig$();
var _s2 = $RefreshSig$();
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app/components/Button.tsx"
  );
  import.meta.hot.lastModified = "1738786222011.6914";
}
var variantStyles = {
  neutral: "bg-gray-600 text-white hover:bg-gray-700 hover:nord-shadow hover:-translate-y-0.5 active:bg-gray-800 active:translate-y-0 disabled:bg-gray-300",
  neutralOutline: "bg-white border-2 border-gray-600 text-gray-600 hover:nord-shadow hover:-translate-y-0.5 active:translate-y-0 disabled:border-gray-300 disabled:text-gray-400",
  amber: "bg-amber-500 text-white hover:bg-amber-600 hover:nord-shadow hover:-translate-y-0.5 active:bg-amber-700 active:translate-y-0 disabled:bg-amber-200",
  amberOutline: "bg-white border-2 border-amber-500 text-amber-500 hover:nord-shadow hover:-translate-y-0.5 active:translate-y-0 disabled:border-amber-200 disabled:text-amber-300",
  black: "bg-black text-white hover:bg-neutral-900 hover:nord-shadow hover:-translate-y-0.5 active:bg-neutral-950 active:translate-y-0 disabled:bg-neutral-400",
  blackOutline: "bg-white border-2 border-black text-black hover:nord-shadow hover:-translate-y-0.5 active:translate-y-0 disabled:border-neutral-400 disabled:text-neutral-500",
  blue: "bg-blue-600 text-white hover:bg-blue-700 hover:nord-shadow hover:-translate-y-0.5 active:bg-blue-800 active:translate-y-0 disabled:bg-blue-300",
  blueOutline: "bg-white border-2 border-blue-600 text-blue-600 hover:nord-shadow hover:-translate-y-0.5 active:translate-y-0 disabled:border-blue-300 disabled:text-blue-400",
  rose: "bg-rose-500 text-white hover:bg-rose-600 hover:nord-shadow hover:-translate-y-0.5 active:bg-rose-700 active:translate-y-0 disabled:bg-rose-200",
  roseOutline: "bg-white border-2 border-rose-500 text-rose-500 hover:nord-shadow hover:-translate-y-0.5 active:translate-y-0 disabled:border-rose-200 disabled:text-rose-300",
  purple: "bg-purple-600 text-white hover:bg-purple-700 hover:nord-shadow hover:-translate-y-0.5 active:bg-purple-800 active:translate-y-0 disabled:bg-purple-300",
  purpleOutline: "bg-white border-2 border-purple-600 text-purple-600 hover:nord-shadow hover:-translate-y-0.5 active:translate-y-0 disabled:border-purple-300 disabled:text-purple-400",
  red: "bg-floral-red text-white hover:grayscale-25 hover:nord-shadow hover:-translate-y-0.5 active:bg-red-950 active:translate-y-0 disabled:bg-red-300",
  redOutline: "bg-white border-2 border-floral-red text-floral-red hover:nord-shadow hover:-translate-y-0.5 active:translate-y-0 disabled:border-red-300 disabled:text-red-400",
  emerald: "bg-emerald-600 text-white hover:bg-emerald-700 hover:nord-shadow hover:-translate-y-0.5 active:bg-emerald-800 active:translate-y-0 disabled:bg-emerald-300",
  emeraldOutline: "bg-white border-2 border-emerald-600 text-emerald-600 hover:nord-shadow hover:-translate-y-0.5 active:translate-y-0 disabled:border-emerald-300 disabled:text-emerald-400",
  // Nord
  primary: "bg-nord-0 text-nord-6 hover:bg-nord-1 hover:nord-shadow hover:-translate-y-0.5 active:bg-nord-2 active:translate-y-0 disabled:bg-nord-3",
  // Frost
  secondary: "bg-nord-8 text-nord-0 hover:bg-nord-9 hover:nord-shadow hover:-translate-y-0.5 active:bg-nord-10 active:translate-y-0 disabled:bg-nord-3",
  // Nord Outline
  tertiary: "bg-nord-6 text-nord-0 border-2 border-nord-0 hover:bg-nord-5 hover:nord-shadow hover:-translate-y-0.5 active:translate-y-0 disabled:bg-nord-3",
  success: "bg-nord-14 text-nord-0 hover:bg-nord-14-dark hover:nord-shadow hover:-translate-y-0.5 active:bg-nord-14-dark active:translate-y-0 disabled:bg-[#b3ce9c]",
  danger: "bg-nord-11 text-white hover:bg-nord-11-dark hover:nord-shadow hover:-translate-y-0.5 active:bg-nord-11-dark active:translate-y-0 disabled:bg-[#cf717a]",
  warning: "bg-nord-13 text-nord-0 hover:bg-nord-13-dark hover:nord-shadow hover:-translate-y-0.5 active:bg-nord-13-dark active:translate-y-0 disabled:bg-[#fbdb9b]"
};
var sizeStyles = {
  default: "h-10 px-4 py-2",
  sm: "h-9 px-3",
  lg: "h-11 px-8",
  icon: "h-10 w-10"
};
var Sprite = (props) => {
  const size = props.size === "lg" ? 32 : 24;
  let viewBox;
  switch (props.sprite) {
    case "sword":
    case "skull":
    case "shield":
    case "steal":
    case "lock":
    case "challenge":
    case "exchange":
      viewBox = "-32 -32 64 64";
      break;
    case "token-1":
    case "token-2":
    case "token-3":
    case "check":
      viewBox = "0 0 256 256";
      break;
  }
  return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { className: "relative flex items-center justify-center h-full w-auto", children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("svg", { width: `${size}`, height: `${size}`, viewBox, children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("use", { href: `#${props.sprite}` }, void 0, false, {
    fileName: "app/components/Button.tsx",
    lineNumber: 101,
    columnNumber: 9
  }, this) }, void 0, false, {
    fileName: "app/components/Button.tsx",
    lineNumber: 100,
    columnNumber: 7
  }, this) }, void 0, false, {
    fileName: "app/components/Button.tsx",
    lineNumber: 99,
    columnNumber: 10
  }, this);
};
_c = Sprite;
var TimerBackground = ({
  timeoutAt,
  variant
}) => {
  _s();
  const [progress, setProgress] = (0, import_react2.useState)(0);
  (0, import_react2.useEffect)(() => {
    if (!timeoutAt) {
      return;
    }
    const updateProgress = () => {
      const total = 2e4;
      const now = Date.now();
      const remainingTime = timeoutAt - now;
      const elapsedTime = total - remainingTime;
      const calculated = elapsedTime / total * 100;
      setProgress(Math.min(100, Math.max(0, calculated)));
    };
    updateProgress();
    const interval = setInterval(updateProgress, 1e3);
    return () => clearInterval(interval);
  }, [timeoutAt]);
  let progressColor;
  switch (variant) {
    case "success":
      progressColor = "bg-nord-14-dark";
      break;
    case "warning":
      progressColor = "bg-nord-13-dark";
      break;
    case "danger":
      progressColor = "bg-nord-11-dark";
      break;
    case "primary":
      progressColor = "bg-nord-1";
      break;
    case "secondary":
      progressColor = "bg-nord-9";
      break;
    case "tertiary":
      progressColor = "bg-nord-5";
      break;
    case "neutral":
      progressColor = "bg-gray-700";
      break;
    case "amber":
      progressColor = "bg-amber-600";
      break;
    case "black":
      progressColor = "bg-neutral-900";
      break;
    case "blue":
      progressColor = "bg-blue-700";
      break;
    case "rose":
      progressColor = "bg-rose-600";
      break;
    case "purple":
      progressColor = "bg-purple-700";
      break;
    case "red":
      progressColor = "bg-red-900";
      break;
    case "emerald":
      progressColor = "bg-emerald-700";
      break;
    default:
      progressColor = "bg-gray-700";
      break;
  }
  return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "absolute inset-0", children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: `absolute inset-0 ${progressColor} transition-transform duration-1000 ease-linear`, "data-progress": progress, style: {
    transformOrigin: "left center",
    transform: `scaleX(${1 - progress / 100})`
    // Removed the 1 - since we want it to progress from 0 to 1
  } }, void 0, false, {
    fileName: "app/components/Button.tsx",
    lineNumber: 177,
    columnNumber: 7
  }, this) }, void 0, false, {
    fileName: "app/components/Button.tsx",
    lineNumber: 176,
    columnNumber: 10
  }, this);
};
_s(TimerBackground, "ZVQpwjU6Dz5R8VBOzPsnxGRmMVo=");
_c2 = TimerBackground;
var Button = _s2(import_react2.default.forwardRef(_c3 = _s2(({
  className = "",
  variant = "neutral",
  size = "default",
  timeoutAt,
  sprite = null,
  ...props
}, forwardedRef) => {
  _s2();
  const baseClasses = "relative inline-flex items-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 font-bold rounded-xl";
  const isOutline = variant.endsWith("Outline");
  const innerRef = (0, import_react2.useRef)(null);
  return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", { className: `${baseClasses} ${variantStyles[variant]} ${sizeStyles[size]} ${timeoutAt ? "overflow-hidden" : ""} ${className} ${sprite ? "justify-start gap-4" : "justify-center"}`, ref: useMergedRefs(forwardedRef, innerRef), ...props, children: [
    timeoutAt && !isOutline && /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(TimerBackground, { timeoutAt, variant }, void 0, false, {
      fileName: "app/components/Button.tsx",
      lineNumber: 198,
      columnNumber: 37
    }, this),
    sprite && /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Sprite, { sprite: props.disabled ? "lock" : sprite, size }, void 0, false, {
      fileName: "app/components/Button.tsx",
      lineNumber: 199,
      columnNumber: 20
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { className: "relative", children: props.children }, void 0, false, {
      fileName: "app/components/Button.tsx",
      lineNumber: 200,
      columnNumber: 9
    }, this)
  ] }, void 0, true, {
    fileName: "app/components/Button.tsx",
    lineNumber: 197,
    columnNumber: 10
  }, this);
}, "jqH43mZhdkZ6sG0m9dJyLwwo68o=", false, function() {
  return [useMergedRefs];
})), "jqH43mZhdkZ6sG0m9dJyLwwo68o=", false, function() {
  return [useMergedRefs];
});
_c4 = Button;
Button.displayName = "Button";
var _c;
var _c2;
var _c3;
var _c4;
$RefreshReg$(_c, "Sprite");
$RefreshReg$(_c2, "TimerBackground");
$RefreshReg$(_c3, "Button$React.forwardRef");
$RefreshReg$(_c4, "Button");
window.$RefreshReg$ = prevRefreshReg;
window.$RefreshSig$ = prevRefreshSig;

export {
  Button
};
//# sourceMappingURL=/build/_shared/chunk-IXL2CDGS.js.map
