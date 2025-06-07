import{j as e}from"./iframe-EZHYw-9M.js";import{T as m,I as S}from"./image-carousel-DTLxZyxw.js";import"./utils-RNG9xHR-.js";import"./button-DpIVyQ9l.js";import"./createLucideIcon-BvNyJPxX.js";const y={title:"Content/HTML Slides",component:m,parameters:{layout:"centered"}},a=[{name:"React",description:"UI Framework"},{name:"Node.js",description:"Backend"},{name:"MongoDB",description:"Database"},{name:"Express",description:"Web Framework"},{name:"GraphQL",description:"API Layer"},{name:"Tailwind",description:"CSS Framework"}],t=()=>e.jsx("div",{className:"max-w-xl mx-auto bg-gray-800 text-white aspect-video p-4",children:e.jsx(m,{title:"Example Tech Stack",technologies:a})}),s=()=>e.jsx("div",{className:"max-w-3xl mx-auto",children:e.jsx(S,{items:[{type:"html",component:"TechStack",props:{title:"Example Tech Stack",technologies:a},alt:"Tech stack example"},{type:"image",src:"slides/tucker/beached_balls.png",alt:"Example image"}]})}),c=()=>e.jsx("div",{className:"max-w-3xl mx-auto",children:e.jsx(S,{items:[{type:"image",src:"slides/tucker/beached_balls.png",alt:"Image example"},{type:"html",component:"TechStack",props:{title:"Interactive Component",technologies:a},alt:"Tech stack example"},{type:"video",src:"slides/tucker/designing_stuff.mp4",alt:"Video example"}]})}),l=()=>e.jsxs("div",{className:"flex flex-col gap-4",children:[e.jsxs("div",{className:"w-full",children:[e.jsx("h3",{className:"text-sm font-medium mb-2",children:"Desktop (large):"}),e.jsx("div",{className:"max-w-4xl mx-auto bg-gray-800 text-white aspect-video",children:e.jsx(m,{title:"Desktop View",technologies:a})})]}),e.jsxs("div",{className:"w-full",children:[e.jsx("h3",{className:"text-sm font-medium mb-2",children:"Tablet (medium):"}),e.jsx("div",{className:"max-w-md mx-auto bg-gray-800 text-white aspect-video",children:e.jsx(m,{title:"Tablet View",technologies:a})})]}),e.jsxs("div",{className:"w-full",children:[e.jsx("h3",{className:"text-sm font-medium mb-2",children:"Mobile (small):"}),e.jsx("div",{className:"max-w-xs mx-auto bg-gray-800 text-white aspect-video",children:e.jsx(m,{title:"Mobile View",technologies:a})})]})]});t.__docgenInfo={description:"",methods:[],displayName:"TechStackComponent"};s.__docgenInfo={description:"",methods:[],displayName:"HtmlSlideInCarousel"};c.__docgenInfo={description:"",methods:[],displayName:"MixedContentCarousel"};l.__docgenInfo={description:"",methods:[],displayName:"ResponsiveTechStack"};var i,o,n;t.parameters={...t.parameters,docs:{...(i=t.parameters)==null?void 0:i.docs,source:{originalSource:`() => <div className="max-w-xl mx-auto bg-gray-800 text-white aspect-video p-4">
    <TechStack title="Example Tech Stack" technologies={exampleTechStack} />
  </div>`,...(n=(o=t.parameters)==null?void 0:o.docs)==null?void 0:n.source}}};var r,d,p;s.parameters={...s.parameters,docs:{...(r=s.parameters)==null?void 0:r.docs,source:{originalSource:`() => <div className="max-w-3xl mx-auto">
    <ImageCarousel items={[{
    type: "html",
    component: "TechStack",
    props: {
      title: "Example Tech Stack",
      technologies: exampleTechStack
    },
    alt: "Tech stack example"
  }, {
    type: "image",
    src: "slides/tucker/beached_balls.png",
    alt: "Example image"
  }]} />
  </div>`,...(p=(d=s.parameters)==null?void 0:d.docs)==null?void 0:p.source}}};var x,h,g;c.parameters={...c.parameters,docs:{...(x=c.parameters)==null?void 0:x.docs,source:{originalSource:`() => <div className="max-w-3xl mx-auto">
    <ImageCarousel items={[{
    type: "image",
    src: "slides/tucker/beached_balls.png",
    alt: "Image example"
  }, {
    type: "html",
    component: "TechStack",
    props: {
      title: "Interactive Component",
      technologies: exampleTechStack
    },
    alt: "Tech stack example"
  }, {
    type: "video",
    src: "slides/tucker/designing_stuff.mp4",
    alt: "Video example"
  }]} />
  </div>`,...(g=(h=c.parameters)==null?void 0:h.docs)==null?void 0:g.source}}};var u,v,k;l.parameters={...l.parameters,docs:{...(u=l.parameters)==null?void 0:u.docs,source:{originalSource:`() => <div className="flex flex-col gap-4">
    <div className="w-full">
      <h3 className="text-sm font-medium mb-2">Desktop (large):</h3>
      <div className="max-w-4xl mx-auto bg-gray-800 text-white aspect-video">
        <TechStack title="Desktop View" technologies={exampleTechStack} />
      </div>
    </div>
    
    <div className="w-full">
      <h3 className="text-sm font-medium mb-2">Tablet (medium):</h3>
      <div className="max-w-md mx-auto bg-gray-800 text-white aspect-video">
        <TechStack title="Tablet View" technologies={exampleTechStack} />
      </div>
    </div>
    
    <div className="w-full">
      <h3 className="text-sm font-medium mb-2">Mobile (small):</h3>
      <div className="max-w-xs mx-auto bg-gray-800 text-white aspect-video">
        <TechStack title="Mobile View" technologies={exampleTechStack} />
      </div>
    </div>
  </div>`,...(k=(v=l.parameters)==null?void 0:v.docs)==null?void 0:k.source}}};const j=["TechStackComponent","HtmlSlideInCarousel","MixedContentCarousel","ResponsiveTechStack"];export{s as HtmlSlideInCarousel,c as MixedContentCarousel,l as ResponsiveTechStack,t as TechStackComponent,j as __namedExportsOrder,y as default};
