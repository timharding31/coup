import {
  GameTable
} from "/build/_shared/chunk-QDTFOTHS.js";
import "/build/_shared/chunk-MZVCNLDW.js";
import "/build/_shared/chunk-B3U5MCW4.js";
import "/build/_shared/chunk-4M6BCDK4.js";
import "/build/_shared/chunk-VVVWLK5W.js";
import {
  Form,
  useOutletContext
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

// app/routes/game.$gameId.waiting.tsx
var import_node = __toESM(require_node(), 1);
var import_react2 = __toESM(require_react(), 1);
var import_jsx_dev_runtime = __toESM(require_jsx_dev_runtime(), 1);
if (!window.$RefreshReg$ || !window.$RefreshSig$ || !window.$RefreshRuntime$) {
  console.warn("remix:hmr: React Fast Refresh only works when the Remix compiler is running in development mode.");
} else {
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = (type, id) => {
    window.$RefreshRuntime$.register(type, '"app/routes/game.$gameId.waiting.tsx"' + id);
  };
  window.$RefreshSig$ = window.$RefreshRuntime$.createSignatureFunctionForTransform;
}
var prevRefreshReg;
var prevRefreshSig;
var _s = $RefreshSig$();
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app/routes/game.$gameId.waiting.tsx"
  );
  import.meta.hot.lastModified = "1738797716951.2144";
}
function GameWaiting() {
  _s();
  const {
    playerId,
    hostId,
    status,
    pin
  } = useOutletContext();
  const formRef = (0, import_react2.useRef)(null);
  return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(import_jsx_dev_runtime.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "text-nord-6 text-xl p-2", children: [
      "PIN: ",
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("strong", { children: pin }, void 0, false, {
        fileName: "app/routes/game.$gameId.waiting.tsx",
        lineNumber: 55,
        columnNumber: 14
      }, this)
    ] }, void 0, true, {
      fileName: "app/routes/game.$gameId.waiting.tsx",
      lineNumber: 54,
      columnNumber: 7
    }, this),
    playerId === hostId && /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Form, { method: "post", className: "flex-none", ref: formRef }, void 0, false, {
      fileName: "app/routes/game.$gameId.waiting.tsx",
      lineNumber: 57,
      columnNumber: 31
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "flex-auto", children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(GameTable, { playerId, status: "WAITING", onStartGame: playerId === hostId ? () => formRef.current?.submit() : null }, void 0, false, {
      fileName: "app/routes/game.$gameId.waiting.tsx",
      lineNumber: 59,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "app/routes/game.$gameId.waiting.tsx",
      lineNumber: 58,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "app/routes/game.$gameId.waiting.tsx",
    lineNumber: 53,
    columnNumber: 10
  }, this);
}
_s(GameWaiting, "8c1rOZpxp43pR+qy+Tya+NGkaeI=", false, function() {
  return [useOutletContext];
});
_c = GameWaiting;
var _c;
$RefreshReg$(_c, "GameWaiting");
window.$RefreshReg$ = prevRefreshReg;
window.$RefreshSig$ = prevRefreshSig;
export {
  GameWaiting as default
};
//# sourceMappingURL=/build/routes/game.$gameId.waiting-DQL7XBXT.js.map
