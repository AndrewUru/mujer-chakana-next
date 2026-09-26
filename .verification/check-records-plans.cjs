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
  const data = path.includes('/rest/v1/registros') ? [{id:'preview-1',fecha:'2026-09-20',emociones:'En calma',energia:4,creatividad:3,espiritualidad:5,notas:'Hoy me di tiempo para escuchar y descansar.',mensaje:'Honrar tu ritmo tambi\u00e9n es avanzar.'},{id:'preview-2',fecha:'2026-08-12',emociones:'Esperanzada',energia:3,creatividad:5,espiritualidad:4}] : path.endsWith('/auth/v1/user') ? user : path.includes('/rest/v1/perfiles') ? (route.request().headers().accept?.includes('object') ? profile : [profile]) : [];
  await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(data)});
 });
 await context.route('https://www.paypal.com/**', route=>route.fulfill({status:200,contentType:'application/javascript',body:`window.paypal={Buttons:()=>({render:(selector)=>{const b=document.createElement('button');b.textContent='PayPal (vista de prueba)';b.style.cssText='width:100%;padding:16px;background:#ffc439;color:#172c4c;border:0;border-radius:5px';document.querySelector(selector).appendChild(b)}})};`}));
 const page=await context.newPage(); const errors=[];page.on('pageerror',e=>errors.push(e.message));

 for(const route of ['registros','suscripcion']) {
  await page.setViewportSize({width:1440,height:1000});
  await page.goto(`http://localhost:3000/${route}`);
  if(route==='registros') await page.getByText('En calma',{exact:true}).waitFor();
  else await page.getByText('PayPal (vista de prueba)',{exact:true}).first().waitFor();
  await page.screenshot({path:`.verification/${route}-desktop.png`,fullPage:true});
  await page.setViewportSize({width:390,height:844});
  await page.screenshot({path:`.verification/${route}-mobile.png`,fullPage:true});
  if(route==='registros') {
    await page.locator('select').selectOption({label:'agosto de 2026'});
    if(await page.locator('article').count()!==1) throw Error('Month filter failed');
    await page.getByRole('button',{name:/Eliminar registro/}).click();
    await page.getByRole('dialog').waitFor();
    await page.keyboard.press('Escape');
    if(await page.locator('dialog[open]').count()) throw Error('Dialog Escape failed');
  }
  console.log(JSON.stringify({route,overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)}));
 }
 console.log(JSON.stringify({errors}));
 await browser.close();
})();
