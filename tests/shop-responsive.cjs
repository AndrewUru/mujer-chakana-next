/* eslint-disable @typescript-eslint/no-require-imports -- CommonJS module hooks render the real TypeScript components without an extra bundler. */
// Visual component harness: fixtures only, never a fallback for the live catalog.
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const Module = require('node:module');
const assert = require('node:assert/strict');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { chromium } = require('playwright');
const cache = new Map();
function load(file) {
  const filename = path.resolve(file);
  if (cache.has(filename)) return cache.get(filename).exports;
  const loaded = new Module(filename, module); cache.set(filename, loaded);
  loaded.filename=filename; loaded.paths=module.paths;
  loaded.require=id=>{
    if(id.endsWith('.css')) return {__esModule:true,default:new Proxy({},{get:(_,key)=>String(key)})};
    if(id==='next/link') return {__esModule:true,default:({children,...props})=>React.createElement('a',props,children)};
    if(id==='next/image') return {__esModule:true,default:({fill,priority,sizes,...props})=>React.createElement('img',{...props,sizes,loading:priority?'eager':'lazy',style:fill?{position:'absolute',width:'100%',height:'100%'}:undefined})};
    if(id.startsWith('@/')||id.startsWith('.')){
      const base=id.startsWith('@/')?path.resolve('src',id.slice(2)):path.resolve(path.dirname(filename),id);
      const target=[base,base+'.tsx',base+'.ts'].find(candidate=>fs.existsSync(candidate)&&fs.statSync(candidate).isFile());
      if(target)return load(target);
    }
    return require(id);
  };
  loaded._compile(ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText,filename);
  return loaded.exports;
}
const ArtworkCard=load('src/components/shop/ArtworkCard.tsx').default;
const VariantEditor=load('src/components/shop/admin/VariantEditor.tsx').default;
const ImageEditor=load('src/components/shop/admin/ImageEditor.tsx').default;
const e=React.createElement;
const products=Array.from({length:14},(_,index)=>({id:String(index),name:`Obra ${String(index+1).padStart(2,'0')}`,slug:`obra-${index+1}`,author:'Samari',main_image_path:null,images:[],variants:[{active:true,price_cents:2200}]}));
const gallery=e('main',{className:'page'},e('div',{className:'container'},e('nav',{className:'topline'},e('a',{href:'#'},'Ginergética / Tienda'),e('a',{href:'#'},'Mi carrito')),e('header',{className:'hero'},e('p',{className:'eyebrow'},'Una galería para habitar'),e('h1',null,'Arte de',e('br'),e('em',null,'Samari.')),e('div',{className:'heroNote'},e('span',null,'La obra continúa contigo.'),e('p',null,'Ilustraciones del universo de Ginergética. Una invitación a detener la mirada.'))),e('section',{className:'gallery'},products.map((product,index)=>e(ArtworkCard,{key:product.id,product,index})))));
const variants=[{id:'a4',product_id:'test',name:'A4',width_cm:21,height_cm:29.7,price_cents:2200,active:true,sort_order:0},{id:'a3',product_id:'test',name:'A3',width_cm:29.7,height_cm:42,price_cents:3200,active:true,sort_order:1}];
const admin=e('div',{className:'admin-workspace'},e('main',{className:'admin-page shop-admin'},e('h1',null,'Nueva ilustración'),e('div',{className:'shop-savebar'},e('span',null,'Tienes cambios sin guardar'),e('button',{className:'admin-button primary'},'Guardar cambios')),e('div',{className:'shop-form'},e(ImageEditor,{images:[],mainPath:null,onChange(){},onMainChange(){},async onUpload(){}}),e(VariantEditor,{productId:'test',variants,onChange(){}}))));
const output=process.env.SHOP_SCREENSHOT_DIR||path.join(os.tmpdir(),'ginergetica-shop-review');fs.mkdirSync(output,{recursive:true});
(async()=>{
  const browser=await chromium.launch({headless:true});
  try{
    for(const [name,component,cssFiles] of [['gallery',gallery,['src/components/shop/shop.module.css']],['admin',admin,['src/app/admin/admin.css','src/app/admin/tienda/shop-admin.css']]]){
      for(const width of [375,1280]){
        const page=await browser.newPage({viewport:{width,height:900}});
        const css=cssFiles.map(file=>fs.readFileSync(file,'utf8')).join('\n');
        await page.setContent(`<!doctype html><html lang="es"><head><meta charset="utf-8"><style>:root{--font-display:Georgia;--font-body:Arial}*{box-sizing:border-box}body{margin:0;font-family:Arial,sans-serif}button,input,select,textarea{font:inherit}a{color:inherit}${css}</style></head><body>${renderToStaticMarkup(component)}</body></html>`);
        assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${name} overflow at ${width}px`);
        await page.screenshot({path:path.join(output,`${name}-${width}.png`),fullPage:true});
        await page.screenshot({path:path.join(output,`${name}-${width}-top.png`)});
        if(name==='gallery') assert.equal(await page.locator('article').count(),14);
        if(name==='admin') assert.equal(await page.getByRole('button',{name:'Añadir tamaño'}).count(),1);
        await page.close();
      }
    }
    console.log(`PASS: gallery and editor controls at 375px and 1280px. Screenshots: ${output}`);
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
