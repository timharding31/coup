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

// app/routes/_auth.logout.tsx
var import_node = __toESM(require_node(), 1);
var import_react2 = __toESM(require_react(), 1);
var import_jsx_dev_runtime = __toESM(require_jsx_dev_runtime(), 1);
if (!window.$RefreshReg$ || !window.$RefreshSig$ || !window.$RefreshRuntime$) {
  console.warn("remix:hmr: React Fast Refresh only works when the Remix compiler is running in development mode.");
} else {
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = (type, id) => {
    window.$RefreshRuntime$.register(type, '"app/routes/_auth.logout.tsx"' + id);
  };
  window.$RefreshSig$ = window.$RefreshRuntime$.createSignatureFunctionForTransform;
}
var prevRefreshReg;
var prevRefreshSig;
var _s = $RefreshSig$();
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app/routes/_auth.logout.tsx"
  );
  import.meta.hot.lastModified = "1738791610682.2324";
}
function Logout() {
  _s();
  const formRef = (0, import_react2.useRef)(null);
  (0, import_react2.useEffect)(() => {
    const timout = setTimeout(() => {
      formRef.current?.submit();
    }, 2e3);
    return () => clearTimeout(timout);
  }, []);
  return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "flex flex-col items-stretch gap-4 w-full max-w-[800px] py-24 px-4 mx-auto", children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Form, { ref: formRef, method: "post", className: "contents", children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h1", { className: "text-nord-6 font-bold text-4xl", children: "Just a moment..." }, void 0, false, {
      fileName: "app/routes/_auth.logout.tsx",
      lineNumber: 68,
      columnNumber: 9
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", { className: "text-nord-6 text-xl", children: "Logging you out" }, void 0, false, {
      fileName: "app/routes/_auth.logout.tsx",
      lineNumber: 69,
      columnNumber: 9
    }, this)
  ] }, void 0, true, {
    fileName: "app/routes/_auth.logout.tsx",
    lineNumber: 67,
    columnNumber: 7
  }, this) }, void 0, false, {
    fileName: "app/routes/_auth.logout.tsx",
    lineNumber: 66,
    columnNumber: 10
  }, this);
}
_s(Logout, "tWkBqXdviTvDZU5Xns358AVz/g8=");
_c = Logout;
var _c;
$RefreshReg$(_c, "Logout");
window.$RefreshReg$ = prevRefreshReg;
window.$RefreshSig$ = prevRefreshSig;
export {
  Logout as default
};
//# sourceMappingURL=/build/routes/_auth.logout-MGE5QHB2.js.map
