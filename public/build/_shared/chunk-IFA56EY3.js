import{a as x,b as s}from"/build/_shared/chunk-WPWRVLZN.js";import{e as o}from"/build/_shared/chunk-2TWE7TSA.js";var a=o(x(),1),e=o(s(),1),b={default:"h-10 px-4 py-2",sm:"h-9 px-3",lg:"h-11 px-8"},y={primary:"bg-nord-6 text-nord-0 border-2 border-nord-0 focus:border-nord-8 placeholder-nord-3",secondary:"bg-nord-5 text-nord-0 border-2 border-nord-8 focus:border-nord-9 placeholder-nord-3",minimal:"bg-nord-4 text-nord-0 border-2 border-transparent focus:border-nord-8 placeholder-nord-3"},I=a.default.forwardRef(({className:l="font-medium",variant:i="primary",size:p="default",error:r,label:n,type:c="text",required:d,...t},u)=>{let f="w-full transition-all duration-200 focus:outline-none rounded-xl",m=r?"border-nord-11 focus:border-nord-11":"";return(0,e.jsxs)("div",{className:"flex flex-col gap-2",children:[n&&(0,e.jsxs)("label",{className:"text-nord-6 font-medium text-sm",children:[n,d&&(0,e.jsx)("span",{className:"text-nord-11",children:" *"})]}),(0,e.jsx)("input",{ref:u,className:`
            ${f} 
            ${y[i]} 
            ${b[p]} 
            ${m}
            ${l}
          `,type:c,required:d,...t}),r&&t.id&&(0,e.jsx)("span",{className:"text-nord-11 text-sm",id:`${t.id}-error`,children:r})]})});I.displayName="TextInput";export{I as a};
