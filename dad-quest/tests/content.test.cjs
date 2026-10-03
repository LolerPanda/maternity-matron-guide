const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
function readLocale(lang){const ctx={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'assets/js/locales',lang+'.js'),'utf8'),ctx);return JSON.parse(JSON.stringify(ctx.window.DAD_QUEST_LOCALE));}
const zh=readLocale('zh-CN'),en=readLocale('en');
test('both locales contain the same complete learning structure',()=>{
  assert.deepEqual(Object.keys(zh.ui).sort(),Object.keys(en.ui).sort());
  for(const d of [zh,en]){
    assert.equal(d.chapters.length,4);assert.equal(d.scenes.length,12);assert.equal(d.checks.length,6);
    for(const value of Object.values(d.ui))assert.ok(typeof value==='string'&&value.trim());
    d.scenes.forEach((s,i)=>{
      assert.equal(s.options.length,3);assert.ok(s.best>=0&&s.best<3);
      for(const field of ['title','place','story','why','action'])assert.ok(s[field]?.trim(),field+' at '+i);
      assert.ok(d.sources[s.source]);assert.equal(s.best,zh.scenes[i].best);
      assert.equal(s.source,zh.scenes[i].source);
      assert.ok(d.sources[s.source][1].startsWith('https://'));
    });
  }
});
test('English learning content has no untranslated Chinese strings',()=>{
  const copy=JSON.parse(JSON.stringify(en));delete copy.ui.langLink;delete copy.ui.switchLabel;
  assert.ok(!/[\u3400-\u9fff]/u.test(JSON.stringify(copy)));
});
test('both entry pages reference existing local assets and the correct locale',()=>{
  for(const [file,lang] of [['index.html','zh-CN'],['en.html','en']]){
    const html=fs.readFileSync(path.join(root,file),'utf8');
    assert.ok(html.includes(`<html lang="${lang}">`));
    assert.ok(html.includes(`assets/js/locales/${lang}.js`));
    for(const m of html.matchAll(/(?:src|href)="([^"#]+)"/g)){
      if(!m[1].startsWith('http'))assert.ok(fs.existsSync(path.join(root,m[1])),m[1]);
    }
  }
});
test('urgent-help scenarios and resources are present in both locales',()=>{
  for(const d of [zh,en]){assert.equal(d.scenes.filter(s=>s.urgent).length,2);assert.equal(d.scenes[8].source,'warning');assert.equal(d.scenes[10].source,'mood');assert.ok(d.ui.urgentNote);}
});
