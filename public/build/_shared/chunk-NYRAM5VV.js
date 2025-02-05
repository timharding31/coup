import {
  require_jsx_dev_runtime
} from "/build/_shared/chunk-F4KNNEUR.js";
import {
  require_react
} from "/build/_shared/chunk-2Z2JGDFU.js";
import {
  createHotContext
} from "/build/_shared/chunk-NW53SDWD.js";
import {
  __toESM
} from "/build/_shared/chunk-PZDJHGND.js";

// app/components/TextInput.tsx
var import_react = __toESM(require_react(), 1);
var import_jsx_dev_runtime = __toESM(require_jsx_dev_runtime(), 1);
if (!window.$RefreshReg$ || !window.$RefreshSig$ || !window.$RefreshRuntime$) {
  console.warn("remix:hmr: React Fast Refresh only works when the Remix compiler is running in development mode.");
} else {
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = (type, id) => {
    window.$RefreshRuntime$.register(type, '"app/components/TextInput.tsx"' + id);
  };
  window.$RefreshSig$ = window.$RefreshRuntime$.createSignatureFunctionForTransform;
}
var prevRefreshReg;
var prevRefreshSig;
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app/components/TextInput.tsx"
  );
  import.meta.hot.lastModified = "1738787561972.732";
}
var sizeStyles = {
  default: "h-10 px-4 py-2",
  sm: "h-9 px-3",
  lg: "h-11 px-8"
};
var variantStyles = {
  primary: "bg-nord-6 text-nord-0 border-2 border-nord-0 focus:border-nord-8 placeholder-nord-3",
  secondary: "bg-nord-5 text-nord-0 border-2 border-nord-8 focus:border-nord-9 placeholder-nord-3",
  minimal: "bg-nord-4 text-nord-0 border-2 border-transparent focus:border-nord-8 placeholder-nord-3"
};
var TextInput = import_react.default.forwardRef(_c = ({
  className = "font-medium",
  variant = "primary",
  size = "default",
  error,
  label,
  type = "text",
  required,
  ...props
}, ref) => {
  const baseClasses = "w-full transition-all duration-200 focus:outline-none rounded-xl";
  const errorClasses = error ? "border-nord-11 focus:border-nord-11" : "";
  return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "flex flex-col gap-2", children: [
    label && /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("label", { className: "text-nord-6 font-medium text-sm", children: [
      label,
      required && /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { className: "text-nord-11", children: " *" }, void 0, false, {
        fileName: "app/components/TextInput.tsx",
        lineNumber: 47,
        columnNumber: 26
      }, this)
    ] }, void 0, true, {
      fileName: "app/components/TextInput.tsx",
      lineNumber: 45,
      columnNumber: 19
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("input", { ref, className: `
            ${baseClasses} 
            ${variantStyles[variant]} 
            ${sizeStyles[size]} 
            ${errorClasses}
            ${className}
          `, type, required, ...props }, void 0, false, {
      fileName: "app/components/TextInput.tsx",
      lineNumber: 49,
      columnNumber: 9
    }, this),
    error && props.id && /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { className: "text-nord-11 text-sm", id: `${props.id}-error`, children: error }, void 0, false, {
      fileName: "app/components/TextInput.tsx",
      lineNumber: 56,
      columnNumber: 31
    }, this)
  ] }, void 0, true, {
    fileName: "app/components/TextInput.tsx",
    lineNumber: 44,
    columnNumber: 10
  }, this);
});
_c2 = TextInput;
TextInput.displayName = "TextInput";
var _c;
var _c2;
$RefreshReg$(_c, "TextInput$React.forwardRef");
$RefreshReg$(_c2, "TextInput");
window.$RefreshReg$ = prevRefreshReg;
window.$RefreshSig$ = prevRefreshSig;

export {
  TextInput
};
//# sourceMappingURL=/build/_shared/chunk-NYRAM5VV.js.map
