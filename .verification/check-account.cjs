const { chromium } = require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true});
 const context=await browser.newContext({viewport:{width:1366,height:900},reducedMotion:'reduce'});
 await context.addCookies([{name:'cookie_consent',value:'rejected',url:'http://localhost:3000'}]);
 await context.route('**/auth/v1/**',route=>route.abort());
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 for(const route of ['register','recuperar','actualizar-clave','update-password']) {
  await page.goto(`http://localhost:3000/auth/${route}`);
  await page.locator('form').waitFor();
  await page.waitForFunction(() => [...document.querySelectorAll('main')].some(e => e.getBoundingClientRect().height > 0));
  await page.screenshot({path:`.verification/${route}-desktop.png`,fullPage:true});
  await page.setViewportSize({width:390,height:844});
  await page.screenshot({path:`.verification/${route}-mobile.png`,fullPage:true});
  if(route==='actualizar-clave'){
   await page.locator('input[type=password]').nth(0).fill('example-one');
   await page.locator('input[type=password]').nth(1).fill('example-two');
   await page.getByRole('button',{name:'Guardar contrase',exact:false}).click();
   await page.getByRole('alert').waitFor();
  }
  console.log(JSON.stringify({route,overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),title:await page.locator('h1').innerText()}));
  await page.setViewportSize({width:1366,height:900});
 }
 console.log(JSON.stringify({errors}));await browser.close();
})();
