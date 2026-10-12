/* eslint-disable @typescript-eslint/no-require-imports -- Standalone browser regression test; no production dependencies added. */
const { chromium } = require('playwright');
const { loadEnvConfig } = require('@next/env');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
loadEnvConfig(process.cwd());
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ref = new URL(url).hostname.split('.')[0];
const user = {id:'77777777-7777-4777-8777-777777777777',aud:'authenticated',role:'authenticated',email:'moonboard-test@example.invalid',app_metadata:{provider:'email'},user_metadata:{}};
const start = new Date(); start.setDate(start.getDate()-11);
const fecha = `${start.getFullYear()}-${String(start.getMonth()+1).padStart(2,'0')}-${String(start.getDate()).padStart(2,'0')}`;
const output = path.join(os.tmpdir(),'chakana-moonboard-review');fs.mkdirSync(output,{recursive:true});
const token = [Buffer.from(JSON.stringify({alg:'HS256',typ:'JWT'})).toString('base64url'),Buffer.from(JSON.stringify({sub:user.id,exp:Math.floor(Date.now()/1000)+3600,role:'authenticated'})).toString('base64url'),'fixture'].join('.');
(async()=>{
  const browser=await chromium.launch({headless:true});
  try{
    for(const width of [1280,375]){
      const context=await browser.newContext({viewport:{width,height:900},timezoneId:'Europe/Madrid',reducedMotion:width===375?'reduce':'no-preference'});
      await context.addCookies([{name:'cookie_consent',value:'rejected',url:'http://localhost:3100'}]);
      await context.addInitScript(({ref,user,token})=>localStorage.setItem(`sb-${ref}-auth-token`,JSON.stringify({access_token:token,refresh_token:'fixture',expires_at:Math.floor(Date.now()/1000)+3600,expires_in:3600,token_type:'bearer',user})),{ref,user,token});
      // Every Supabase request is intercepted: no real profile, record or session is changed.
      await context.route(`${url}/**`,async route=>{
        const request=route.request();const pathname=new URL(request.url()).pathname;
        let body;
        if(pathname.endsWith('/auth/v1/user'))body=user;
        else if(pathname.endsWith('/rest/v1/perfiles')){
          const profile={user_id:user.id,fecha_inicio:fecha,avatar_url:null,rol:'user'};
          body=request.headers().accept?.includes('vnd.pgrst.object')?profile:[profile];
        }else if(pathname.endsWith('/rest/v1/fases_lunares'))body=[{nombre_fase:'Lectura de prueba',color:'purple',rango_inicio:0,rango_fin:30,mensaje:'Una pausa para observar cómo te sientes.'}];
        else if(pathname.endsWith('/rest/v1/registros'))body=[];
        else {await route.abort();return;}
        await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(body)});
      });
      const page=await context.newPage();const errors=[];page.on('pageerror',error=>errors.push(error.message));
      page.setDefaultTimeout(30000);
      console.log(`Checking ${width}px`);
      await page.goto('http://localhost:3100/moonboard',{timeout:120000});
      const enter=page.getByRole('button',{name:'Entrar en esta luna'});
      await enter.waitFor({timeout:120000});
      assert.equal(await page.getByRole('button',{name:'Seleccionar día 12, hoy'}).getAttribute('aria-pressed'),'true');
      const stages=page.getByRole('group',{name:'Explorar las cuatro etapas'}).getByRole('button');
      await stages.nth(2).click();
      assert.equal(await page.getByRole('button',{name:'Todavía por vivir'}).isDisabled(),true);
      await stages.nth(1).click();
      await page.getByRole('button',{name:'Seleccionar día 8',exact:true}).click();
      await enter.click();
      await page.locator('dialog[aria-labelledby="lunar-modal-title"]').waitFor();
      await page.keyboard.press('Escape');
      await page.locator('dialog[aria-labelledby="lunar-modal-title"]').waitFor({state:'detached'});
      console.log('Modal closed');
      assert.equal(await enter.evaluate(element=>element===document.activeElement),true);
      await page.getByRole('button',{name:'Volver a hoy · Día 12'}).click();
      await page.getByRole('group',{name:'Explorar las cuatro etapas'}).scrollIntoViewIfNeeded();
      if(width===375)assert.equal(await page.locator('canvas').count(),0,'reduced motion should not create a WebGL scene');
      else{
        await page.locator('canvas').waitFor();
        await page.getByRole('button',{name:'Pausar movimiento lunar'}).click();
        assert.equal(await page.getByRole('button',{name:'Activar movimiento lunar'}).getAttribute('aria-pressed'),'true');
      }
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`overflow at ${width}`);
      await page.locator('[data-still]').screenshot({path:path.join(output,`observatory-${width}.png`)});
      console.log('Layout captured');
      if(width===1280){
        const downloading=page.waitForEvent('download');await page.getByRole('button',{name:'Guardar postal lunar'}).click();
        const download=await downloading;await download.saveAs(path.join(output,'lunar-card.png'));
        assert.equal(download.suggestedFilename(),'mi-luna-mujer-chakana.png');
      }
      await page.getByText('Explorar el mapa completo de 28 días',{exact:true}).click();
      assert.equal(await page.locator('details button').count(),28);
      await page.getByRole('link',{name:'Volver a lo que has vivido'}).click();
      await page.waitForURL('**/registros',{timeout:120000});
      await page.waitForFunction(()=>!document.querySelector('[data-page-transition]'),{},{timeout:20000});
      assert.deepEqual(errors,[]);
      await context.close();
    }
    console.log(`PASS: day selection, future lock, modal/focus, pause, reduced motion, 28-day fallback, download, route transition and responsive layout. Screenshots: ${output}`);
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
