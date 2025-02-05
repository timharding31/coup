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
import "/build/_shared/chunk-2Z2JGDFU.js";
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

// app/routes/_auth.login.tsx
var import_node = __toESM(require_node(), 1);
var import_jsx_dev_runtime = __toESM(require_jsx_dev_runtime(), 1);
if (!window.$RefreshReg$ || !window.$RefreshSig$ || !window.$RefreshRuntime$) {
  console.warn("remix:hmr: React Fast Refresh only works when the Remix compiler is running in development mode.");
} else {
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = (type, id) => {
    window.$RefreshRuntime$.register(type, '"app/routes/_auth.login.tsx"' + id);
  };
  window.$RefreshSig$ = window.$RefreshRuntime$.createSignatureFunctionForTransform;
}
var prevRefreshReg;
var prevRefreshSig;
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app/routes/_auth.login.tsx"
  );
  import.meta.hot.lastModified = "1738791352214.6218";
}
function Login() {
  return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "flex flex-col items-stretch gap-2 w-full max-w-[800px] p-4 m-auto", children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Form, { method: "post", className: "contents", children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(TextInput, { name: "username", placeholder: "Enter your username", required: true }, void 0, false, {
      fileName: "app/routes/_auth.login.tsx",
      lineNumber: 79,
      columnNumber: 9
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Button, { variant: "secondary", type: "submit", children: "Login" }, void 0, false, {
      fileName: "app/routes/_auth.login.tsx",
      lineNumber: 80,
      columnNumber: 9
    }, this)
  ] }, void 0, true, {
    fileName: "app/routes/_auth.login.tsx",
    lineNumber: 78,
    columnNumber: 7
  }, this) }, void 0, false, {
    fileName: "app/routes/_auth.login.tsx",
    lineNumber: 77,
    columnNumber: 10
  }, this);
}
_c = Login;
var _c;
$RefreshReg$(_c, "Login");
window.$RefreshReg$ = prevRefreshReg;
window.$RefreshSig$ = prevRefreshSig;
export {
  Login as default
};
//# sourceMappingURL=/build/routes/_auth.login-A54NTYGP.js.map
