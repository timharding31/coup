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

// app/routes/game.$gameId._index.tsx
var import_node = __toESM(require_node(), 1);
if (!window.$RefreshReg$ || !window.$RefreshSig$ || !window.$RefreshRuntime$) {
  console.warn("remix:hmr: React Fast Refresh only works when the Remix compiler is running in development mode.");
} else {
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = (type, id) => {
    window.$RefreshRuntime$.register(type, '"app/routes/game.$gameId._index.tsx"' + id);
  };
  window.$RefreshSig$ = window.$RefreshRuntime$.createSignatureFunctionForTransform;
}
var prevRefreshReg;
var prevRefreshSig;
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app/routes/game.$gameId._index.tsx"
  );
  import.meta.hot.lastModified = "1738792182995.7576";
}
function GameIndex() {
  return null;
}
_c = GameIndex;
var _c;
$RefreshReg$(_c, "GameIndex");
window.$RefreshReg$ = prevRefreshReg;
window.$RefreshSig$ = prevRefreshSig;
export {
  GameIndex as default
};
//# sourceMappingURL=/build/routes/game.$gameId._index-EDJLRE43.js.map
