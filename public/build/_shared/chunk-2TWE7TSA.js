var g=Object.create;var e=Object.defineProperty;var h=Object.getOwnPropertyDescriptor;var i=Object.getOwnPropertyNames;var j=Object.getPrototypeOf,k=Object.prototype.hasOwnProperty;var m=(a=>typeof require<"u"?require:typeof Proxy<"u"?new Proxy(a,{get:(b,c)=>(typeof require<"u"?require:b)[c]}):a)(function(a){if(typeof require<"u")return require.apply(this,arguments);throw new Error('Dynamic require of "'+a+'" is not supported')});var n=(a,b)=>()=>(a&&(b=a(a=0)),b);var o=(a,b)=>()=>(b||a((b={exports:{}}).exports,b),b.exports),p=(a,b)=>{for(var c in b)e(a,c,{get:b[c],enumerable:!0})},l=(a,b,c,f)=>{if(b&&typeof b=="object"||typeof b=="function")for(let d of i(b))!k.call(a,d)&&d!==c&&e(a,d,{get:()=>b[d],enumerable:!(f=h(b,d))||f.enumerable});return a};var q=(a,b,c)=>(c=a!=null?g(j(a)):{},l(b||!a||!a.__esModule?e(c,"default",{value:a,enumerable:!0}):c,a));export{m as a,n as b,o as c,p as d,q as e};
