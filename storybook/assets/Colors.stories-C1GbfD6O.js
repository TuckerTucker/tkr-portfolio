import{j as e}from"./iframe-CdFfq58S.js";const s=()=>{const d={primary:"#613CB0",secondary:"#FF8800",nutrien:"#3b5f18",worldplay:"#00a4e4",shaw:"#0488c1",accent:"#00A3FF",background:"#F5F5F5",card:"#FFFFFF",text:"#333333"};return e.jsxs("div",{children:[e.jsx("h1",{className:"text-2xl font-heading mb-4",children:"Theme Colors"}),e.jsx("div",{className:"grid grid-cols-2 md:grid-cols-4 gap-4",children:Object.entries(d).map(([a,r])=>e.jsxs("div",{className:"border border-gray-300 rounded p-4 shadow-sm",children:[e.jsx("div",{className:"h-20 w-full rounded mb-2",style:{backgroundColor:r}}),e.jsx("p",{className:"font-semibold capitalize",children:a}),e.jsx("p",{className:"text-sm text-gray-600",children:r}),e.jsxs("p",{className:`text-sm text-${a}`,children:["Example Text (text-",a,")"]}),e.jsx("div",{className:`mt-1 p-1 rounded bg-${a}`,children:e.jsxs("p",{className:"text-xs text-white mix-blend-difference",children:["Example BG (bg-",a,")"]})})]},a))})]})};s.storyName="Colors";const c={title:"Theme/Colors",component:s};s.__docgenInfo={description:"",methods:[],displayName:"ThemeColors"};var n,t,o;s.parameters={...s.parameters,docs:{...(n=s.parameters)==null?void 0:n.docs,source:{originalSource:`() => {
  const colors = {
    primary: "#613CB0",
    secondary: "#FF8800",
    nutrien: "#3b5f18",
    worldplay: "#00a4e4",
    shaw: "#0488c1",
    accent: "#00A3FF",
    background: "#F5F5F5",
    card: "#FFFFFF",
    text: "#333333"
  };
  return <div>
      <h1 className="text-2xl font-heading mb-4">Theme Colors</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(colors).map(([name, hex]) => <div key={name} className="border border-gray-300 rounded p-4 shadow-sm">
            <div className="h-20 w-full rounded mb-2" style={{
          backgroundColor: hex
        }}></div>
            <p className="font-semibold capitalize">{name}</p>
            <p className="text-sm text-gray-600">{hex}</p>
            <p className={\`text-sm text-\${name}\`}>Example Text (text-{name})</p>
            <div className={\`mt-1 p-1 rounded bg-\${name}\`}>
              <p className="text-xs text-white mix-blend-difference">Example BG (bg-{name})</p>
            </div>
          </div>)}
      </div>
    </div>;
}`,...(o=(t=s.parameters)==null?void 0:t.docs)==null?void 0:o.source}}};const m=["ThemeColors"];export{s as ThemeColors,m as __namedExportsOrder,c as default};
