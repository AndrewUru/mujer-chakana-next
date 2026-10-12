const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const Module = require('node:module');
function load(file) {
  const filename = path.resolve(file);
  const mod = new Module(filename, module);
  mod.paths = module.paths;
  mod._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText, filename);
  return mod.exports;
}
const { parseCart } = load('src/lib/shop/cart.ts');
const { validateProduct, fromPrice, slugify } = load('src/lib/shop/types.ts');
const id = '12345678-1234-1234-1234-123456789012';
test('cart rejects tampering, duplicate variants and unbounded quantities', () => {
  for (const input of [null, {}, [{variantId: id, quantity: 0}], [{variantId: id, quantity: 21}], [{variantId: id, quantity: 1.1}], [{variantId: 'bad', quantity: 1}], [{variantId: id, quantity: 1}, {variantId: id, quantity: 2}]]) assert.throws(() => parseCart(input));
  assert.deepEqual(parseCart([{variantId: id, quantity: 2, price_cents: 1}]), [{variantId: id, quantity: 2}]);
});
test('prices come from active variants and slug generation is stable', () => {
  assert.equal(fromPrice({variants: [{active:false,price_cents:100},{active:true,price_cents:3200},{active:true,price_cents:2200}]}),2200);
  assert.equal(fromPrice({variants:[]}),null);
  assert.equal(slugify('  Ilustración / de Samarí  '),'ilustracion-de-samari');
});
test('real publication requires original cover, alt text and active variant', () => {
  const product = {name:'Obra',slug:'obra',author:'Samari',status:'published',is_demo:false,main_image_path:'image',images:[],variants:[]};
  assert.match(validateProduct(product),/tamaño/);
  product.variants=[{name:'A4',width_cm:21,height_cm:29.7,price_cents:2200,active:true}];
  assert.match(validateProduct(product),/imagen original/);
  product.images=[{storage_path:'image',image_type:'mockup',alt_text:'Obra en pared'}];
  assert.match(validateProduct(product),/imagen original/);
  product.images[0].image_type='original';
  assert.equal(validateProduct(product),null);
  product.variants[0].price_cents=0;
  assert.match(validateProduct(product),/precio/);
});
