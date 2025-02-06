import {
  PlayingCard
} from "/build/_shared/chunk-2JM7HPKM.js";
import {
  Button
} from "/build/_shared/chunk-B3U5MCW4.js";
import {
  GameSocketContext
} from "/build/_shared/chunk-WPFTEBEM.js";
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

// app/hooks/socket.ts
var import_react = __toESM(require_react(), 1);
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app/hooks/socket.ts"
  );
  import.meta.hot.lastModified = "1738359036508.8594";
}
function useGameSocket() {
  const gameSocket = (0, import_react.useContext)(GameSocketContext);
  if (!gameSocket) {
    throw new Error("useGameSocket must be used within a GameSocketProvider");
  }
  return gameSocket;
}
function useGame() {
  return useGameSocket().game;
}

// app/components/OpponentHand.tsx
var import_jsx_dev_runtime = __toESM(require_jsx_dev_runtime(), 1);
if (!window.$RefreshReg$ || !window.$RefreshSig$ || !window.$RefreshRuntime$) {
  console.warn("remix:hmr: React Fast Refresh only works when the Remix compiler is running in development mode.");
} else {
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = (type, id) => {
    window.$RefreshRuntime$.register(type, '"app/components/OpponentHand.tsx"' + id);
  };
  window.$RefreshSig$ = window.$RefreshRuntime$.createSignatureFunctionForTransform;
}
var prevRefreshReg;
var prevRefreshSig;
var _s = $RefreshSig$();
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app/components/OpponentHand.tsx"
  );
}
var OpponentHand = ({
  username,
  influence,
  coins,
  isCurrentPlayer = false
}) => {
  _s();
  const game = useGame();
  return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(import_jsx_dev_runtime.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("ul", { children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("li", { className: "inline-flex items-center gap-1", children: [
        isCurrentPlayer && /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { className: "inline-block rounded-full bg-nord-13 w-2 h-2" }, void 0, false, {
          fileName: "app/components/OpponentHand.tsx",
          lineNumber: 35,
          columnNumber: 31
        }, this),
        "Username: ",
        username
      ] }, void 0, true, {
        fileName: "app/components/OpponentHand.tsx",
        lineNumber: 34,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("li", { children: [
        "Coins: ",
        coins
      ] }, void 0, true, {
        fileName: "app/components/OpponentHand.tsx",
        lineNumber: 38,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "app/components/OpponentHand.tsx",
      lineNumber: 33,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: `grid grid-cols-${influence.length} gap-2`, children: influence.map((card) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(PlayingCard, { isFaceDown: !game || game.status === "WAITING", ...card }, card.id, false, {
      fileName: "app/components/OpponentHand.tsx",
      lineNumber: 41,
      columnNumber: 32
    }, this)) }, void 0, false, {
      fileName: "app/components/OpponentHand.tsx",
      lineNumber: 40,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "app/components/OpponentHand.tsx",
    lineNumber: 32,
    columnNumber: 10
  }, this);
};
_s(OpponentHand, "QwigEaWsAAkx4/Sjvd0zS0oWOoQ=", false, function() {
  return [useGame];
});
_c = OpponentHand;
var _c;
$RefreshReg$(_c, "OpponentHand");
window.$RefreshReg$ = prevRefreshReg;
window.$RefreshSig$ = prevRefreshSig;

// app/components/PlayerHand.tsx
var import_jsx_dev_runtime2 = __toESM(require_jsx_dev_runtime(), 1);
if (!window.$RefreshReg$ || !window.$RefreshSig$ || !window.$RefreshRuntime$) {
  console.warn("remix:hmr: React Fast Refresh only works when the Remix compiler is running in development mode.");
} else {
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = (type, id) => {
    window.$RefreshRuntime$.register(type, '"app/components/PlayerHand.tsx"' + id);
  };
  window.$RefreshSig$ = window.$RefreshRuntime$.createSignatureFunctionForTransform;
}
var prevRefreshReg;
var prevRefreshSig;
var _s2 = $RefreshSig$();
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app/components/PlayerHand.tsx"
  );
  import.meta.hot.lastModified = "1738798437485.3433";
}
var PlayerHand = ({
  influence,
  coins
}) => {
  _s2();
  const game = useGame();
  return /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("div", { className: "grid grid-rows-[auto_auto] px-2 pb-2", children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("div", { children: [
      "Coins: ",
      coins
    ] }, void 0, true, {
      fileName: "app/components/PlayerHand.tsx",
      lineNumber: 45,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("div", { className: `grid grid-cols-${influence.length} gap-2`, children: influence.map((card) => /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)(PlayingCard, { isFaceDown: !game || game.status === "WAITING", ...card }, card.id, false, {
      fileName: "app/components/PlayerHand.tsx",
      lineNumber: 47,
      columnNumber: 32
    }, this)) }, void 0, false, {
      fileName: "app/components/PlayerHand.tsx",
      lineNumber: 46,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "app/components/PlayerHand.tsx",
    lineNumber: 44,
    columnNumber: 10
  }, this);
};
_s2(PlayerHand, "QwigEaWsAAkx4/Sjvd0zS0oWOoQ=", false, function() {
  return [useGame];
});
_c2 = PlayerHand;
var _c2;
$RefreshReg$(_c2, "PlayerHand");
window.$RefreshReg$ = prevRefreshReg;
window.$RefreshSig$ = prevRefreshSig;

// app/components/GameTable.tsx
var import_jsx_dev_runtime3 = __toESM(require_jsx_dev_runtime(), 1);
if (!window.$RefreshReg$ || !window.$RefreshSig$ || !window.$RefreshRuntime$) {
  console.warn("remix:hmr: React Fast Refresh only works when the Remix compiler is running in development mode.");
} else {
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = (type, id) => {
    window.$RefreshRuntime$.register(type, '"app/components/GameTable.tsx"' + id);
  };
  window.$RefreshSig$ = window.$RefreshRuntime$.createSignatureFunctionForTransform;
}
var prevRefreshReg;
var prevRefreshSig;
var _s3 = $RefreshSig$();
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app/components/GameTable.tsx"
  );
}
var GameTable = ({
  playerId,
  status,
  onStartGame,
  children
}) => {
  _s3();
  const {
    game
  } = useGameSocket();
  if (!game)
    return null;
  const myIndex = game.players.findIndex((p) => p.id === playerId);
  const myself = game.players[myIndex];
  const currentPlayer = game.players[game.currentPlayerIndex];
  const opponents = game.players.slice(myIndex + 1).concat(game.players.slice(0, myIndex));
  return /* @__PURE__ */ (0, import_jsx_dev_runtime3.jsxDEV)("div", { className: "w-full h-full flex flex-col items-stretch justify-betweeen gap-2 relative", children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime3.jsxDEV)("div", { className: "flex-auto grid grid-cols-4 grid-rows-[auto_auto_auto] gap-4", children: opponents.map((opponent, index) => /* @__PURE__ */ (0, import_jsx_dev_runtime3.jsxDEV)("div", { className: `col-span-2 ${getOpponentClasses(index, opponents.length)}`, children: /* @__PURE__ */ (0, import_jsx_dev_runtime3.jsxDEV)(OpponentHand, { ...opponent, isCurrentPlayer: currentPlayer.id === opponent.id }, void 0, false, {
      fileName: "app/components/GameTable.tsx",
      lineNumber: 44,
      columnNumber: 13
    }, this) }, opponent.id, false, {
      fileName: "app/components/GameTable.tsx",
      lineNumber: 43,
      columnNumber: 45
    }, this)) }, void 0, false, {
      fileName: "app/components/GameTable.tsx",
      lineNumber: 42,
      columnNumber: 7
    }, this),
    myself != null && /* @__PURE__ */ (0, import_jsx_dev_runtime3.jsxDEV)("div", { className: "flex-none relative", children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime3.jsxDEV)(PlayerHand, { ...myself }, void 0, false, {
        fileName: "app/components/GameTable.tsx",
        lineNumber: 48,
        columnNumber: 11
      }, this),
      status === "WAITING" && onStartGame && /* @__PURE__ */ (0, import_jsx_dev_runtime3.jsxDEV)("div", { className: "absolute inset-0 flex items-center justify-center", children: /* @__PURE__ */ (0, import_jsx_dev_runtime3.jsxDEV)(Button, { type: "button", variant: "success", onClick: () => onStartGame(), children: "Start Game" }, void 0, false, {
        fileName: "app/components/GameTable.tsx",
        lineNumber: 50,
        columnNumber: 15
      }, this) }, void 0, false, {
        fileName: "app/components/GameTable.tsx",
        lineNumber: 49,
        columnNumber: 51
      }, this)
    ] }, void 0, true, {
      fileName: "app/components/GameTable.tsx",
      lineNumber: 47,
      columnNumber: 26
    }, this),
    children
  ] }, void 0, true, {
    fileName: "app/components/GameTable.tsx",
    lineNumber: 41,
    columnNumber: 10
  }, this);
};
_s3(GameTable, "mGsf/c/cvtt7w3v1G/bokU0ihh8=", false, function() {
  return [useGameSocket];
});
_c3 = GameTable;
function getOpponentClasses(index, total) {
  switch (total) {
    case 5:
      return [
        "row-start-3",
        // bottom left
        "row-start-2",
        // middle left
        "col-start-2 row-start-1",
        // top center
        "col-start-3 row-start-2",
        // middle right
        "col-start-3 row-start-3"
        // bottom right
      ][index];
    case 4:
      return [
        "row-start-3",
        // bottom left
        "row-start-2",
        // middle left
        "col-start-3 row-start-2",
        // middle right
        "col-start-3 row-start-1"
        // bottom right
      ][index];
    case 3:
      return [
        "row-start-2",
        // middle left
        "col-start-2",
        // top center
        "col-start-3 row-start-2"
        // middle right
      ][index];
    case 2:
      return [
        "row-start-2",
        // middle left
        "col-start-3 row-start-2"
        // middle right
      ][index];
    case 1:
      return "col-start-2 row-start-1";
    default:
      return "";
  }
}
var _c3;
$RefreshReg$(_c3, "GameTable");
window.$RefreshReg$ = prevRefreshReg;
window.$RefreshSig$ = prevRefreshSig;

export {
  useGameSocket,
  GameTable
};
//# sourceMappingURL=/build/_shared/chunk-XGTG7WRK.js.map
