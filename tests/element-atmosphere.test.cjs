/* eslint-disable @typescript-eslint/no-require-imports -- Browser regression harness using the existing TypeScript, webpack and Playwright dependencies. */
// Run: node --test tests/element-atmosphere.test.cjs
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const ts = require('typescript');
const { chromium } = require('playwright');
const webpackRuntime = require('next/dist/compiled/webpack/webpack');

let browser;
let bundle;
let temporary;

before(async () => {
  temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'element-atmosphere-'));
  const source = fs.readFileSync('src/app/ciclo/ElementAtmosphere.tsx', 'utf8');
  fs.writeFileSync(path.join(temporary, 'component.js'), ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2020 },
  }).outputText);
  fs.writeFileSync(path.join(temporary, 'entry.js'), `
    const React = require('react');
    const { createRoot } = require('react-dom/client');
    const Atmosphere = require('./component').default;
    const root = createRoot(document.getElementById('root'));
    window.renderAtmosphere = (mood, still) => root.render(
      React.createElement(React.StrictMode, null, React.createElement(Atmosphere, { mood, still }))
    );
    window.unmountAtmosphere = () => root.unmount();
  `);
  webpackRuntime.init();
  await new Promise((resolve, reject) => {
    const compiler = webpackRuntime.webpack({
      mode: 'development', devtool: false, entry: path.join(temporary, 'entry.js'),
      output: { path: temporary, filename: 'bundle.js' },
      resolve: { modules: [path.resolve('node_modules')] },
    });
    compiler.run((error, stats) => compiler.close(() => {
      if (error || stats.hasErrors()) reject(error || new Error(stats.toString({ all: false, errors: true })));
      else resolve();
    }));
  });
  bundle = fs.readFileSync(path.join(temporary, 'bundle.js'), 'utf8');
  browser = await chromium.launch({ headless: true });
});

after(async () => {
  await browser?.close();
  if (temporary) fs.rmSync(temporary, { recursive: true, force: true });
});

async function fixture(t, failure) {
  const page = await browser.newPage({ viewport: { width: 800, height: 600 } });
  t.after(() => page.close());
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  t.after(() => assert.deepEqual(errors, []));
  await page.setContent('<style>body{margin:0;background:#0f0509}canvas{display:block;width:100vw;height:100vh}</style><div id="root"></div>');
  await page.evaluate(failure => {
    window.stats = { draws: 0, alpha: 0, time: 0, programs: new Set(), buffers: new Set(), shaders: new Set() };
    const prototype = WebGLRenderingContext.prototype;
    for (const [resource, collection] of [['Program', 'programs'], ['Buffer', 'buffers'], ['Shader', 'shaders']]) {
      const create = prototype[`create${resource}`];
      const remove = prototype[`delete${resource}`];
      prototype[`create${resource}`] = function (...args) {
        const value = create.apply(this, args);
        if (value) window.stats[collection].add(value);
        return value;
      };
      prototype[`delete${resource}`] = function (value) {
        window.stats[collection].delete(value);
        return remove.call(this, value);
      };
    }
    const draw = prototype.drawArrays;
    prototype.drawArrays = function (...args) {
      draw.apply(this, args);
      window.stats.draws++;
      window.stats.time = this.getUniform(this.getParameter(this.CURRENT_PROGRAM), this.getUniformLocation(this.getParameter(this.CURRENT_PROGRAM), 'uTime'));
      const pixels = new Uint8Array(this.drawingBufferWidth * this.drawingBufferHeight * 4);
      this.readPixels(0, 0, this.drawingBufferWidth, this.drawingBufferHeight, this.RGBA, this.UNSIGNED_BYTE, pixels);
      window.stats.alpha = pixels.reduce((sum, value, i) => sum + (i % 4 === 3 ? value : 0), 0);
    };
    if (failure === 'unavailable') {
      const getContext = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (type, ...args) {
        return type === 'webgl' ? null : getContext.call(this, type, ...args);
      };
    }
    if (failure === 'shader') {
      const shaderSource = prototype.shaderSource;
      prototype.shaderSource = function (shader) { shaderSource.call(this, shader, 'invalid shader'); };
    }
  }, failure);
  await page.addScriptTag({ content: bundle });
  return page;
}

async function render(page, mood, still) {
  const draws = await page.evaluate(() => window.stats.draws);
  await page.evaluate(({ mood, still }) => window.renderAtmosphere(mood, still), { mood, still });
  await page.waitForFunction(draws => window.stats.draws > draws && window.stats.alpha > 0, draws);
}

async function settle(page) {
  await page.evaluate(() => new Promise(resolve => {
    let frames = 0;
    const tick = () => ++frames === 5 ? resolve() : requestAnimationFrame(tick);
    requestAnimationFrame(tick);
  }));
}

test('StrictMode renders all four elements, reuses the canvas and releases GPU resources', async t => {
  const page = await fixture(t);
  await render(page, 'agua', true);
  await page.evaluate(() => { window.firstCanvas = document.querySelector('canvas'); });
  for (const mood of ['tierra', 'fuego', 'aire', 'agua']) {
    await render(page, mood, true);
    assert.equal(await page.evaluate(() => document.querySelector('canvas') === window.firstCanvas), true);
    assert.deepEqual(await page.evaluate(() => [window.stats.programs.size, window.stats.buffers.size, window.stats.shaders.size]), [1, 1, 0]);
  }
  await page.evaluate(() => window.unmountAtmosphere());
  assert.deepEqual(await page.evaluate(() => [window.stats.programs.size, window.stats.buffers.size, window.stats.shaders.size]), [0, 0, 0]);
  const draws = await page.evaluate(() => window.stats.draws);
  await settle(page);
  assert.equal(await page.evaluate(() => window.stats.draws), draws);
});

test('motion can be stopped and resumed, and a static canvas redraws after resizing', async t => {
  const page = await fixture(t);
  await render(page, 'agua', false);
  await page.waitForFunction(() => window.stats.time > 40);
  await render(page, 'agua', true);
  await settle(page);
  const draws = await page.evaluate(() => window.stats.draws);
  await settle(page);
  assert.equal(await page.evaluate(() => window.stats.draws), draws);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForFunction(draws => window.stats.draws > draws, draws);
  assert.deepEqual(await page.locator('canvas').evaluate(canvas => [canvas.width, canvas.height]), [195, 422]);
  await page.setViewportSize({ width: 3840, height: 2160 });
  await page.waitForFunction(() => document.querySelector('canvas').width === 960);
  await render(page, 'agua', false);
  await page.waitForFunction(() => window.stats.time > 40);
});

test('the effect recovers after actual WebGL context loss', async t => {
  const page = await fixture(t);
  await render(page, 'fuego', true);
  await page.evaluate(() => new Promise(resolve => {
    const canvas = document.querySelector('canvas');
    window.contextExtension = canvas.getContext('webgl').getExtension('WEBGL_lose_context');
    canvas.addEventListener('webglcontextlost', () => resolve(), { once: true });
    window.contextExtension.loseContext();
  }));
  const draws = await page.evaluate(() => window.stats.draws);
  await page.evaluate(() => window.contextExtension.restoreContext());
  await page.waitForFunction(draws => window.stats.draws > draws && window.stats.alpha > 0, draws);
});

test('visibility changes pause and resume animation', async t => {
  const page = await fixture(t);
  await render(page, 'aire', false);
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  const draws = await page.evaluate(() => window.stats.draws);
  await settle(page);
  assert.equal(await page.evaluate(() => window.stats.draws), draws);
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: false });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await page.waitForFunction(draws => window.stats.draws > draws, draws);
});

for (const failure of ['unavailable', 'shader']) {
  test(`WebGL ${failure} degrades without crashing or leaking resources`, async t => {
    const page = await fixture(t, failure);
    await page.evaluate(() => window.renderAtmosphere('agua', false));
    await page.waitForSelector('canvas');
    await settle(page);
    assert.deepEqual(await page.evaluate(() => [window.stats.draws, window.stats.programs.size, window.stats.buffers.size, window.stats.shaders.size]), [0, 0, 0, 0]);
    await page.evaluate(() => window.unmountAtmosphere());
  });
}
