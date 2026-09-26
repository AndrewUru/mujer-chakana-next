const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
 const env = fs.readFileSync('.env.local','utf8');
 const url = env.match(/^NEXT_PUBLIC_SUPABASE_URL=(.+)$/m)[1].trim().replace(/^['"]|['"]$/g,'');
 const host = new URL(url).hostname;
 const key = `sb-${host.split('.')[0]}-auth-token`;
 const user = {id:'00000000-0000-4000-8000-000000000001',aud:'authenticated',role:'authenticated',email:'vista@example.test',app_metadata:{provider:'email'},user_metadata:{},created_at:new Date().toISOString()};
 const session = {access_token:'ui-preview-token',refresh_token:'ui-preview-refresh',token_type:'bearer',expires_in:3600,expires_at:Math.floor(Date.now()/1000)+3600,user};
 const profile = {user_id:user.id,display_name:'Marina',email:user.email,avatar_url:null,fecha_inicio:'2026-09-20',tipo_plan:'gratuito',suscripcion_activa:false};
 const browser = await chromium.launch({headless:true});
 const context = await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
 await context.addCookies([{name:'cookie_consent',value:'rejected',url:'http://localhost:3000'}]);
 await context.addInitScript(({key,session})=>localStorage.setItem(key,JSON.stringify(session)),{key,session});
 await context.route(`https://${host}/**`, async route => {
  const path = new URL(route.request().url()).pathname;
  if(route.request().method()!=='GET') return route.fulfill({status:400,contentType:'application/json',body:JSON.stringify({message:'Preview does not write data'})});
  const data = path.endsWith('/auth/v1/user') ? user : path.includes('/rest/v1/perfiles') ? (route.request().headers().accept?.includes('object') ? profile : [profile]) : [];
  await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(data)});
 });
 const page=await context.newPage(); const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://localhost:3000/setup');
 await page.getByLabel('Tu nombre o seud').waitFor();

 await page.screenshot({path:'.verification/setup-desktop.png',fullPage:true});
 await page.setViewportSize({width:390,height:844});
 await page.screenshot({path:'.verification/setup-mobile.png',fullPage:true});
 console.log(JSON.stringify({route:page.url(),name:await page.locator('#profile-name').inputValue(),date:await page.locator('#cycle-start').inputValue(),overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),errors}));
 await browser.close();
})();
