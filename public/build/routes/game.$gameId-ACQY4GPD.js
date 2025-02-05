import {
  GameSocketProvider
} from "/build/_shared/chunk-4M6BCDK4.js";
import "/build/_shared/chunk-VVVWLK5W.js";
import {
  Outlet,
  useLoaderData
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
  __commonJS,
  __toESM
} from "/build/_shared/chunk-PZDJHGND.js";

// empty-module:~/services/socket.server
var require_socket = __commonJS({
  "empty-module:~/services/socket.server"(exports, module) {
    module.exports = {};
  }
});

// app/routes/game.$gameId.tsx
var import_node = __toESM(require_node(), 1);
var import_socket = __toESM(require_socket(), 1);
var import_jsx_dev_runtime = __toESM(require_jsx_dev_runtime(), 1);
if (!window.$RefreshReg$ || !window.$RefreshSig$ || !window.$RefreshRuntime$) {
  console.warn("remix:hmr: React Fast Refresh only works when the Remix compiler is running in development mode.");
} else {
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = (type, id) => {
    window.$RefreshRuntime$.register(type, '"app/routes/game.$gameId.tsx"' + id);
  };
  window.$RefreshSig$ = window.$RefreshRuntime$.createSignatureFunctionForTransform;
}
var prevRefreshReg;
var prevRefreshSig;
var _s = $RefreshSig$();
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app/routes/game.$gameId.tsx"
  );
  import.meta.hot.lastModified = "1738797745888.47";
}
function GameRoute() {
  _s();
  const {
    gameId,
    playerId,
    socketUrl,
    game
  } = useLoaderData();
  return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(GameSocketProvider, { gameId, playerId, socketUrl, game, children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "fixed top-0 bottom-0 left-[50%] w-full max-w-[480px] translate-x-[-50%] flex flex-col items-stretch justify-between", children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Outlet, { context: {
    playerId,
    hostId: game.hostId,
    status: game.status,
    pin: game.pin
  } }, void 0, false, {
    fileName: "app/routes/game.$gameId.tsx",
    lineNumber: 63,
    columnNumber: 9
  }, this) }, void 0, false, {
    fileName: "app/routes/game.$gameId.tsx",
    lineNumber: 62,
    columnNumber: 7
  }, this) }, void 0, false, {
    fileName: "app/routes/game.$gameId.tsx",
    lineNumber: 61,
    columnNumber: 10
  }, this);
}
_s(GameRoute, "0yAXoM5uXkKZoK4AV4L1QAYvhrs=", false, function() {
  return [useLoaderData];
});
_c = GameRoute;
var _c;
$RefreshReg$(_c, "GameRoute");
window.$RefreshReg$ = prevRefreshReg;
window.$RefreshSig$ = prevRefreshSig;
export {
  GameRoute as default
};
//# sourceMappingURL=/build/routes/game.$gameId-ACQY4GPD.js.map
