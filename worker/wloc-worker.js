var b=(t,e,r)=>(a,n)=>{let o=-1;return s(0);async function s(i){if(i<=o)throw new Error("next() called multiple times");o=i;let c,l=!1,d;if(t[i]?(d=t[i][0][0],a.req.routeIndex=i):d=i===t.length&&n||void 0,d)try{c=await d(a,()=>s(i+1))}catch(h){if(h instanceof Error&&e)a.error=h,c=await e(h,a),l=!0;else throw h}else a.finalized===!1&&r&&(c=await r(a));return c&&(a.finalized===!1||l)&&(a.res=c),a}};var A=Symbol();var F=(t,e)=>new Response(t,{headers:{"Content-Type":e.replace(/^[^;]+/,a=>a.toLowerCase())}}).formData();var x=t=>"headers"in t,S=async(t,e=Object.create(null))=>{let{all:r=!1,dot:a=!1}=e,s=(x(t)?t.headers:t.raw.headers).get("Content-Type")?.split(";")[0].trim().toLowerCase();return s==="multipart/form-data"||s==="application/x-www-form-urlencoded"?X(t,{all:r,dot:a}):{}};async function X(t,e){let r=x(t)?t.headers:t.raw.headers,a=await t.arrayBuffer(),n=F(a,r.get("Content-Type")||"");x(t)||(t.bodyCache.formData=n);let o=await n;return o?tt(o,e):{}}function tt(t,e){let r=Object.create(null);return t.forEach((a,n)=>{e.all||n.endsWith("[]")?et(r,n,a):r[n]=a}),e.dot&&Object.entries(r).forEach(([a,n])=>{a.includes(".")&&(rt(r,a,n),delete r[a])}),r}var et=(t,e,r)=>{t[e]!==void 0?Array.isArray(t[e])?t[e].push(r):t[e]=[t[e],r]:e.endsWith("[]")?t[e]=[r]:t[e]=r},rt=(t,e,r)=>{if(/(?:^|\.)__proto__\./.test(e))return;let a=t,n=e.split(".");n.forEach((o,s)=>{s===n.length-1?a[o]=r:((!a[o]||typeof a[o]!="object"||Array.isArray(a[o])||a[o]instanceof File)&&(a[o]=Object.create(null)),a=a[o])})};var g=(t,e)=>{try{return e(t)}catch{return t.replace(/(?:%[0-9A-Fa-f]{2})+/g,r=>{try{return e(r)}catch{return r}})}},at=t=>g(t,decodeURI),w=t=>{let e=t.url,r=e.indexOf("/",e.indexOf(":")+4),a=r;for(;a<e.length;a++){let n=e.charCodeAt(a);if(n===37){let o=e.indexOf("?",a),s=e.indexOf("#",a),i=o===-1?s===-1?void 0:s:s===-1?o:Math.min(o,s),c=e.slice(r,i);return at(c.includes("%25")?c.replace(/%25/g,"%2525"):c)}else if(n===63||n===35)break}return e.slice(r,a)};var k=t=>{let e=w(t);return e.length>1&&e.at(-1)==="/"?e.slice(0,-1):e},u=(t,e,...r)=>(r.length&&(e=u(e,...r)),`${t?.[0]==="/"?"":"/"}${t}${e==="/"?"":`${t?.at(-1)==="/"?"":"/"}${e?.[0]==="/"?e.slice(1):e}`}`);var y=t=>/[%+]/.test(t)?(t.indexOf("+")!==-1&&(t=t.replace(/\+/g," ")),t.indexOf("%")!==-1?g(t,E):t):t,R=(t,e,r)=>{let a;if(!r&&e&&!/[%+]/.test(e)){let s=t.indexOf("?",8);if(s===-1)return;for(t.startsWith(e,s+1)||(s=t.indexOf(`&${e}`,s+1));s!==-1;){let i=t.charCodeAt(s+e.length+1);if(i===61){let c=s+e.length+2,l=t.indexOf("&",c);return y(t.slice(c,l===-1?void 0:l))}else if(i==38||isNaN(i))return"";s=t.indexOf(`&${e}`,s+1)}if(a=/[%+]/.test(t),!a)return}let n={};a??=/[%+]/.test(t);let o=t.indexOf("?",8);for(;o!==-1;){let s=t.indexOf("&",o+1),i=t.indexOf("=",o);i>s&&s!==-1&&(i=-1);let c=t.slice(o+1,i===-1?s===-1?void 0:s:i);if(a&&(c=y(c)),o=s,c==="")continue;let l;i===-1?l="":(l=t.slice(i+1,s===-1?void 0:s),a&&(l=y(l))),r?(n[c]&&Array.isArray(n[c])||(n[c]=[]),n[c].push(l)):n[c]??=l}return e?n[e]:n},O=R,T=(t,e)=>R(t,e,!0),E=decodeURIComponent;var H=t=>g(t,E),B=class{raw;#e;#a;routeIndex=0;path;bodyCache={};constructor(t,e="/",r=[[]]){this.raw=t,this.path=e,this.#a=r,this.#e={}}param(t){return t?this.#r(t):this.#o()}#r(t){let e=this.#a[0][this.routeIndex][1][t],r=this.#n(e);return r&&/\%/.test(r)?H(r):r}#o(){let t={},e=Object.keys(this.#a[0][this.routeIndex][1]);for(let r of e){let a=this.#n(this.#a[0][this.routeIndex][1][r]);a!==void 0&&(t[r]=/\%/.test(a)?H(a):a)}return t}#n(t){return this.#a[1]?this.#a[1][t]:t}query(t){return O(this.url,t)}queries(t){return T(this.url,t)}header(t){if(t)return this.raw.headers.get(t)??void 0;let e={};return this.raw.headers.forEach((r,a)=>{e[a]=r}),e}async parseBody(t){return S(this,t)}#t=t=>{let{bodyCache:e,raw:r}=this,a=e[t];if(a)return a;let n=Object.keys(e)[0];return n?e[n].then(o=>(n==="json"&&(o=JSON.stringify(o)),new Response(o)[t]())):e[t]=r[t]()};json(){return this.#t("text").then(t=>JSON.parse(t))}text(){return this.#t("text")}arrayBuffer(){return this.#t("arrayBuffer")}bytes(){return this.#t("arrayBuffer").then(t=>new Uint8Array(t))}blob(){return this.#t("blob")}formData(){return this.#t("formData")}addValidatedData(t,e){this.#e[t]=e}valid(t){return this.#e[t]}get url(){return this.raw.url}get method(){return this.raw.method}get[A](){return this.#a}get matchedRoutes(){return this.#a[0].map(([[,t]])=>t)}get routePath(){return this.#a[0].map(([[,t]])=>t)[this.routeIndex].path}};var D={Stringify:1,BeforeStream:2,Stream:3},nt=(t,e)=>{let r=new String(t);return r.isEscaped=!0,r.callbacks=e,r};var L=async(t,e,r,a,n)=>{typeof t=="object"&&!(t instanceof String)&&(t instanceof Promise||(t=t.toString()),t instanceof Promise&&(t=await t));let o=t.callbacks;if(!o?.length)return Promise.resolve(t);n?n[0]+=t:n=[t];let s=Promise.all(o.map(i=>i({phase:e,buffer:n,context:a}))).then(i=>Promise.all(i.filter(Boolean).map(c=>L(c,e,!1,a,n))).then(()=>n[0]));return r?nt(await s,o):s};var ot="text/plain; charset=UTF-8",P=(t,e)=>({"Content-Type":t,...e}),p=(t,e)=>new Response(t,e),_=class{#e;#a;env={};#r;finalized=!1;error;#o;#n;#t;#d;#c;#l;#i;#u;#h;constructor(t,e){this.#e=t,e&&(this.#n=e.executionCtx,this.env=e.env,this.#l=e.notFoundHandler,this.#h=e.path,this.#u=e.matchResult)}get req(){return this.#a??=new B(this.#e,this.#h,this.#u),this.#a}get event(){if(this.#n&&"respondWith"in this.#n)return this.#n;throw Error("This context has no FetchEvent")}get executionCtx(){if(this.#n)return this.#n;throw Error("This context has no ExecutionContext")}get res(){return this.#t||=p(null,{headers:this.#i??=new Headers})}set res(t){if(this.#t&&t){t=p(t.body,t);for(let[e,r]of this.#t.headers.entries())if(e!=="content-type")if(e==="set-cookie"){let a=this.#t.headers.getSetCookie();t.headers.delete("set-cookie");for(let n of a)t.headers.append("set-cookie",n)}else t.headers.set(e,r)}this.#t=t,this.finalized=!0}render=(...t)=>(this.#c??=e=>this.html(e),this.#c(...t));setLayout=t=>this.#d=t;getLayout=()=>this.#d;setRenderer=t=>{this.#c=t};header=(t,e,r)=>{this.finalized&&(this.#t=p(this.#t.body,this.#t));let a=this.#t?this.#t.headers:this.#i??=new Headers;e===void 0?a.delete(t):r?.append?a.append(t,e):a.set(t,e)};status=t=>{this.#o=t};set=(t,e)=>{this.#r??=new Map,this.#r.set(t,e)};get=t=>this.#r?this.#r.get(t):void 0;get var(){return this.#r?Object.fromEntries(this.#r):{}}#s(t,e,r){let a=this.#t?new Headers(this.#t.headers):this.#i??new Headers;if(typeof e=="object"&&"headers"in e){let o=e.headers instanceof Headers?e.headers:new Headers(e.headers);for(let[s,i]of o)s.toLowerCase()==="set-cookie"?a.append(s,i):a.set(s,i)}if(r)for(let[o,s]of Object.entries(r))if(typeof s=="string")a.set(o,s);else{a.delete(o);for(let i of s)a.append(o,i)}let n=typeof e=="number"?e:e?.status??this.#o;return p(t,{status:n,headers:a})}newResponse=(...t)=>this.#s(...t);body=(t,e,r)=>this.#s(t,e,r);text=(t,e,r)=>!this.#i&&!this.#o&&!e&&!r&&!this.finalized?new Response(t):this.#s(t,e,P(ot,r));json=(t,e,r)=>this.#s(JSON.stringify(t),e,P("application/json",r));html=(t,e,r)=>{let a=n=>this.#s(n,e,P("text/html; charset=UTF-8",r));return typeof t=="object"?L(t,D.Stringify,!1,{}).then(a):a(t)};redirect=(t,e)=>{let r=String(t);return this.header("Location",/[^\x00-\xFF]/.test(r)?encodeURI(r):r),this.newResponse(null,e??302)};notFound=()=>(this.#l??=()=>p(),this.#l(this))};var f="ALL",z="all",j=["get","post","put","delete","options","patch"];var N=class extends Error{};var q="__COMPOSED_HANDLER";var st=t=>t.text("404 Not Found",404),U=(t,e)=>{if("getResponse"in t){let r=t.getResponse();return e.newResponse(r.body,r)}return console.error(t),e.text("Internal Server Error",500)},$=class V{get;post;put;delete;options;patch;all;on;use;router;getPath;_basePath="/";#e="/";routes=[];constructor(e={}){[...j,z].forEach(o=>{this[o]=(s,...i)=>(typeof s=="string"?this.#e=s:this.#o(o,this.#e,s),i.forEach(c=>{this.#o(o,this.#e,c)}),this)}),this.on=(o,s,...i)=>{for(let c of[s].flat()){this.#e=c;for(let l of[o].flat())i.map(d=>{this.#o(l.toUpperCase(),this.#e,d)})}return this},this.use=(o,...s)=>(typeof o=="string"?this.#e=o:(this.#e="*",s.unshift(o)),s.forEach(i=>{this.#o(f,this.#e,i)}),this);let{strict:a,...n}=e;Object.assign(this,n),this.getPath=a??!0?e.getPath??w:k}#a(){let e=new V({router:this.router,getPath:this.getPath});return e.errorHandler=this.errorHandler,e.#r=this.#r,e.routes=this.routes,e}#r=st;errorHandler=U;route(e,r){let a=this.basePath(e);return r.routes.map(n=>{let o;r.errorHandler===U?o=n.handler:(o=async(s,i)=>(await b([],r.errorHandler)(s,()=>n.handler(s,i))).res,o[q]=n.handler),a.#o(n.method,n.path,o,n.basePath)}),this}basePath(e){let r=this.#a();return r._basePath=u(this._basePath,e),r}onError=e=>(this.errorHandler=e,this);notFound=e=>(this.#r=e,this);mount(e,r,a){let n,o;a&&(typeof a=="function"?o=a:(o=a.optionHandler,a.replaceRequest===!1?n=c=>c:n=a.replaceRequest));let s=o?c=>{let l=o(c);return Array.isArray(l)?l:[l]}:c=>{let l;try{l=c.executionCtx}catch{}return[c.env,l]};n||=(()=>{let c=u(this._basePath,e),l=c==="/"?0:c.length;return d=>{let h=new URL(d.url);return h.pathname=this.getPath(d).slice(l)||"/",new Request(h,d)}})();let i=async(c,l)=>{let d=await r(n(c.req.raw),...s(c));if(d)return d;await l()};return this.#o(f,u(e,"*"),i),this}#o(e,r,a,n){e=e.toUpperCase(),r=u(this._basePath,r);let o={basePath:n!==void 0?u(this._basePath,n):this._basePath,path:r,method:e,handler:a};this.router.add(e,r,[a,o]),this.routes.push(o)}#n(e,r){if(e instanceof Error)return this.errorHandler(e,r);throw e}#t(e,r,a,n){if(n==="HEAD")return(async()=>new Response(null,await this.#t(e,r,a,"GET")))();let o=this.getPath(e,{env:a}),s=this.router.match(n,o),i=new _(e,{path:o,matchResult:s,env:a,executionCtx:r,notFoundHandler:this.#r});if(s[0].length===1){let l;try{l=s[0][0][0][0](i,async()=>{i.res=await this.#r(i)})}catch(d){return this.#n(d,i)}return l instanceof Promise?l.then(d=>d||(i.finalized?i.res:this.#r(i))).catch(d=>this.#n(d,i)):l??this.#r(i)}let c=b(s[0],this.errorHandler,this.#r);return(async()=>{try{let l=await c(i);if(!l.finalized)throw new Error("Context is not finalized. Did you forget to return a Response object or `await next()`?");return l.res}catch(l){return this.#n(l,i)}})()}fetch=(e,...r)=>this.#t(e,r[1],r[0],e.method);request=(e,r,a,n)=>e instanceof Request?this.fetch(r?new Request(e,r):e,a,n):(e=e.toString(),this.fetch(new Request(/^https?:\/\//.test(e)?e:`http://localhost${u("/",e)}`,r),a,n));fire=()=>{addEventListener("fetch",e=>{e.respondWith(this.#t(e.request,e,void 0,e.request.method))})}};var it=Object.create(null),M=class{name="PatternRouter";#e=[];add(t,e,r){let a=e.at(-1)==="*";a&&(e=e.slice(0,-2)),e.at(-1)==="?"&&(e=e.slice(0,-1),this.add(t,e.replace(/\/[^/]+$/,""),r));let n=(e.match(/\/?(:\w+(?:{(?:(?:{[\d,]+})|[^}])+})?)|\/?[^\/\?]+/g)||[]).map(o=>{let s=o.match(/^\/:([^{]+)(?:{(.*)})?/);return s?`/(?<${s[1]}>${s[2]||"[^/]+"})`:o==="/*"?"/[^/]+":o.replace(/[.\\+*[^\]$()]/g,"\\$&")});try{this.#e.push([new RegExp(`^${n.join("")}${a?"":"/?$"}`),t,r])}catch{throw new N}}match(t,e){let r=[];for(let a=0,n=this.#e.length;a<n;a++){let[o,s,i]=this.#e[a];if(s===t||s===f){let c=o.exec(e);c&&r.push([i,c.groups||it])}}return[r]}};var G=class extends ${constructor(t={}){super(t),this.router=new M}};function W(){return`<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<title>WLOC \u865A\u62DF\u5B9A\u4F4D</title>
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="WLOC">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"><\/script>
<style>
:root { --blue:#007aff; --green:#34c759; --red:#ff3b30; --gray:#8e8e93; --bg:#f2f2f7; --orange:#ff9500; }
* { margin:0; padding:0; box-sizing:border-box; }
body { font-family:-apple-system,system-ui,"SF Pro","Helvetica Neue",sans-serif; background:var(--bg); }
#map { height:50vh; width:100%; min-height:250px; }
.panel { padding:16px; max-width:600px; margin:0 auto; }
.card { background:#fff; border-radius:12px; padding:16px; margin-bottom:12px; box-shadow:0 1px 3px rgba(0,0,0,.08); }
.card h3 { font-size:15px; font-weight:600; margin-bottom:10px; }
.coords { font-family:"SF Mono",monospace; font-size:14px; color:#333; padding:8px 12px; background:var(--bg); border-radius:8px; word-break:break-all; }
.row { display:flex; gap:8px; margin-top:10px; flex-wrap:wrap; }
.btn { flex:1; min-width:100px; padding:12px 16px; border:none; border-radius:10px; font-size:14px; font-weight:500; cursor:pointer; transition:all .15s; }
.btn-primary { background:var(--blue); color:#fff; }
.btn-primary:active { background:#005bb5; transform:scale(.97); }
.btn-secondary { background:#e5e5ea; color:#333; }
.btn-secondary:active { background:#d1d1d6; transform:scale(.97); }
.btn-danger { background:var(--red); color:#fff; }
.btn-danger:active { background:#d63027; transform:scale(.97); }
.btn.success { background:var(--green); color:#fff; }
.btn-sm { flex:none; min-width:auto; padding:6px 12px; font-size:12px; border-radius:8px; }
.input-row { display:flex; gap:8px; margin-top:10px; }
.input-row input { flex:1; padding:10px 12px; border:1px solid #d1d1d6; border-radius:8px; font-size:14px; outline:none; min-width:0; }
.input-row input:focus { border-color:var(--blue); }
.status { font-size:12px; color:var(--gray); margin-top:8px; text-align:center; }
.error-banner { background:var(--red); color:#fff; padding:14px 16px; border-radius:12px; margin-bottom:12px; font-size:14px; line-height:1.5; display:none; }
.error-banner b { display:block; margin-bottom:4px; }
.toast { position:fixed; top:60px; left:50%; transform:translateX(-50%); background:rgba(0,0,0,.8); color:#fff; padding:10px 20px; border-radius:20px; font-size:14px; opacity:0; transition:opacity .3s; pointer-events:none; z-index:9999; max-width:90vw; text-align:center; }
.toast.show { opacity:1; }
.active-loc { background:var(--bg); border-radius:8px; padding:10px 12px; font-size:13px; color:#333; }
.active-loc .label { font-size:11px; color:var(--gray); margin-bottom:4px; }
.active-loc .value { font-family:"SF Mono",monospace; font-size:13px; }
.fav-list { max-height:240px; overflow-y:auto; }
.fav-item { display:flex; align-items:center; gap:8px; padding:10px 12px; background:var(--bg); border-radius:8px; margin-bottom:6px; cursor:pointer; transition:background .15s; }
.fav-item:active { background:#e0e0e5; }
.fav-item .fav-info { flex:1; min-width:0; }
.fav-item .fav-name { font-size:14px; font-weight:500; color:#333; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.fav-item .fav-coords { font-size:11px; color:var(--gray); font-family:"SF Mono",monospace; margin-top:2px; }
.fav-item .fav-active { font-size:10px; color:var(--green); font-weight:600; }
.fav-item .fav-del { flex:none; width:28px; height:28px; border:none; border-radius:50%; background:transparent; color:var(--red); font-size:16px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:background .15s; }
.fav-item .fav-del:hover { background:rgba(255,59,48,.1); }
.fav-empty { text-align:center; color:var(--gray); font-size:13px; padding:16px 0; }
.fav-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; }
.fav-header h3 { margin-bottom:0; }
.modal-overlay { position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,.4); z-index:10000; display:none; align-items:center; justify-content:center; padding:20px; }
.modal-overlay.show { display:flex; }
.modal { background:#fff; border-radius:16px; padding:20px; width:100%; max-width:340px; }
.modal h3 { font-size:17px; font-weight:600; margin-bottom:16px; text-align:center; }
.modal input { width:100%; padding:12px; border:1px solid #d1d1d6; border-radius:10px; font-size:15px; outline:none; margin-bottom:12px; }
.modal input:focus { border-color:var(--blue); }
.modal .modal-btns { display:flex; gap:8px; }
.modal .modal-btns .btn { padding:12px; }
.layer-switch { position:absolute; top:10px; right:10px; z-index:1000; display:flex; gap:4px; background:rgba(255,255,255,.92); border-radius:8px; padding:4px; box-shadow:0 2px 8px rgba(0,0,0,.15); }
.layer-btn { border:none; background:transparent; padding:6px 10px; border-radius:6px; font-size:12px; font-weight:500; color:#333; cursor:pointer; transition:all .15s; white-space:nowrap; }
.layer-btn.active { background:var(--blue); color:#fff; }
.layer-btn:active { transform:scale(.95); }
@media(max-width:480px) { #map { height:44vh; } .panel { padding:12px; } .layer-btn { padding:5px 7px; font-size:11px; } }
</style>
</head>
<body>
<div style="position:relative">
<div id="map"></div>
<div class="layer-switch">
  <button class="layer-btn active" data-layer="satellite" onclick="switchLayer('satellite')">\u536B\u661F</button>
  <button class="layer-btn" data-layer="wgs84" onclick="switchLayer('wgs84')">WGS84</button>
  <button class="layer-btn" data-layer="amap" onclick="switchLayer('amap')">\u9AD8\u5FB7</button>
  <button class="layer-btn" data-layer="voyager" onclick="switchLayer('voyager')">\u5F69\u8272</button>
  <button class="layer-btn" data-layer="standard" onclick="switchLayer('standard')">\u6807\u51C6</button>
  <button class="layer-btn" data-layer="dark" onclick="switchLayer('dark')">\u6697\u8272</button>
</div>
</div>
<div class="panel">
  <div class="error-banner" id="errorBanner">
    <b>\u6A21\u5757\u672A\u751F\u6548</b>
    \u8BF7\u68C0\u67E5\u4EE5\u4E0B\u914D\u7F6E\uFF1A<br>
    1. \u5DF2\u5B89\u88C5\u5E76\u542F\u7528 WLOC \u5B9A\u4F4D\u6A21\u5757<br>
    2. MITM \u5DF2\u5F00\u542F\u4E14\u4FE1\u4EFB\u8BC1\u4E66<br>
    3. MITM \u4E3B\u673A\u540D\u5305\u542B gs-loc.apple.com<br>
    4. \u5F53\u524D\u7F51\u7EDC\u5DF2\u8D70\u4EE3\u7406
  </div>
  <div class="card">
    <h3>\u9009\u62E9\u76EE\u6807\u4F4D\u7F6E</h3>
    <div class="coords" id="coords">\u70B9\u51FB\u5730\u56FE\u6216\u4F7F\u7528\u4E0B\u65B9\u5DE5\u5177\u9009\u62E9\u4F4D\u7F6E</div>
    <div class="row">
      <button class="btn btn-primary" id="saveBtn" onclick="save()">\u50A8\u5B58\u5230\u8BBE\u5907</button>
      <button class="btn btn-secondary" onclick="addFav()">\u6536\u85CF\u4F4D\u7F6E</button>
      <button class="btn btn-secondary" onclick="locateMe()">\u5F53\u524D\u4F4D\u7F6E</button>
    </div>
  </div>
  <div class="card">
    <div class="fav-header">
      <h3>\u6536\u85CF\u7684\u4F4D\u7F6E</h3>
      <button class="btn btn-sm btn-secondary" onclick="clearAllFav()" id="clearAllBtn" style="display:none">\u6E05\u7A7A\u5168\u90E8</button>
    </div>
    <div id="favList" class="fav-list"></div>
  </div>
  <div class="card">
    <h3>\u5F53\u524D\u751F\u6548\u5750\u6807</h3>
    <div class="active-loc" id="activeLoc">
      <div class="label">\u8BBE\u5907\u6301\u4E45\u5316\u6570\u636E (wloc_settings)</div>
      <div class="value" id="activeValue">\u67E5\u8BE2\u4E2D...</div>
    </div>
    <div class="row">
      <button class="btn btn-sm btn-secondary" onclick="queryActive()">\u5237\u65B0</button>
      <button class="btn btn-sm btn-danger" onclick="clearActive()">\u6E05\u9664\u6570\u636E</button>
    </div>
  </div>
  <div class="card">
    <h3>\u8BCA\u65AD\u8BBE\u7F6E</h3>
    <div class="input-row">
      <select id="diagnosticMode" style="flex:1;padding:10px;border:1px solid #d1d1d6;border-radius:8px">
        <option value="off">\u8BCA\u65AD\u5173\u95ED</option><option value="rewrite">\u6539\u5199\u8BCA\u65AD</option><option value="inspect">\u53EA\u68C0\u67E5</option>
      </select>
      <select id="diagnosticOutput" style="flex:1;padding:10px;border:1px solid #d1d1d6;border-radius:8px">
        <option value="both">\u54CD\u5E94\u5934 + \u65E5\u5FD7</option><option value="headers">\u4EC5\u54CD\u5E94\u5934</option><option value="logs">\u4EC5\u65E5\u5FD7</option>
      </select>
    </div>
  </div>
  <div class="card">
    <h3>\u7C98\u8D34\u5730\u56FE\u94FE\u63A5</h3>
    <div class="input-row">
      <input id="urlInput" placeholder="Apple/Google/\u9AD8\u5FB7\u5730\u56FE\u94FE\u63A5 \u6216 \u7ECF\u7EAC\u5EA6" />
      <button class="btn btn-secondary" style="flex:none;min-width:56px" onclick="parseUrl()">\u89E3\u6790</button>
    </div>
    <div style="font-size:11px;color:var(--gray);margin-top:6px">\u652F\u6301 Apple Maps \xB7 Google Maps \xB7 \u9AD8\u5FB7 \xB7 \u767E\u5EA6 \xB7 \u5750\u6807\u6587\u672C</div>
  </div>
  <div class="card">
    <h3>\u641C\u7D22\u5730\u70B9</h3>
    <div class="input-row">
      <input id="searchInput" placeholder="\u8F93\u5165\u5730\u540D\uFF08\u5982: \u4E0A\u6D77\u5916\u6EE9\uFF09" />
      <button class="btn btn-secondary" style="flex:none;min-width:56px" onclick="searchPlace()">\u641C\u7D22</button>
    </div>
  </div>
  <div class="status" id="status">\u9009\u597D\u4F4D\u7F6E\u540E\u70B9\u51FB\u300C\u50A8\u5B58\u5230\u8BBE\u5907\u300D\u5199\u5165\u4EE3\u7406\u5DE5\u5177</div>
</div>
<div class="toast" id="toast"></div>
<div class="modal-overlay" id="favModal">
  <div class="modal">
    <h3>\u6536\u85CF\u6B64\u4F4D\u7F6E</h3>
    <input id="favNameInput" placeholder="\u8F93\u5165\u5907\u6CE8\u540D\u79F0\uFF08\u5982: \u516C\u53F8\u3001\u5BB6\uFF09" maxlength="30" />
    <div style="font-size:12px;color:var(--gray);margin-bottom:12px;text-align:center" id="favModalCoords"></div>
    <div class="modal-btns">
      <button class="btn btn-secondary" onclick="closeFavModal()">\u53D6\u6D88</button>
      <button class="btn btn-primary" onclick="confirmFav()">\u4FDD\u5B58</button>
    </div>
  </div>
</div>
<script>
const SAVE_API = 'https://gs-loc.apple.com/wloc-settings/save';
const FAV_KEY = 'wloc_favorites';
let lat = 22.544577, lon = 113.94114;
let selected = false;
let activeLon = null, activeLat = null;

const map = L.map('map').setView([lat, lon], 13);
const tiles = {
  satellite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {maxZoom:19, attribution:'ArcGIS'}),
  wgs84: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {maxZoom:19, attribution:'ArcGIS WGS84'}),
  standard: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom:19, attribution:'\\u00a9 OSM'}),
  dark: L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {maxZoom:19, attribution:'\\u00a9 Carto'}),
  amap: L.tileLayer('https://webst0{s}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}', {maxZoom:18, subdomains:'1234', attribution:'\\u00a9 \u9AD8\u5FB7'}),
  voyager: L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {maxZoom:19, attribution:'\\u00a9 Carto'})
};
let currentLayer = tiles.satellite;
currentLayer.addTo(map);
function switchLayer(name) {
  map.removeLayer(currentLayer);
  currentLayer = tiles[name];
  currentLayer.addTo(map);
  document.querySelectorAll('.layer-btn').forEach(b => b.classList.toggle('active', b.dataset.layer === name));
}
let marker = L.marker([lat, lon], {draggable:true}).addTo(map);

marker.on('dragend', e => { const p=e.target.getLatLng(); setPos(p.lat, p.lng); });
map.on('click', e => { setPos(e.latlng.lat, e.latlng.lng); });

function setPos(newLat, newLon) {
  lat = newLat; lon = newLon; selected = true;
  marker.setLatLng([lat, lon]);
  document.getElementById('coords').textContent = '\u7ECF\u5EA6 ' + lon.toFixed(6) + '  \u7EAC\u5EA6 ' + lat.toFixed(6);
}

function moveTo(newLat, newLon, zoom) {
  setPos(newLat, newLon);
  map.setView([lat, lon], zoom || 15);
}

function toast(msg, ms) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), ms || 2500);
}

function showError(show) {
  document.getElementById('errorBanner').style.display = show ? 'block' : 'none';
}

/* ---- Favorites (localStorage) ---- */
function getFavs() {
  try { return JSON.parse(localStorage.getItem(FAV_KEY)) || []; } catch(e) { return []; }
}
function saveFavs(favs) {
  localStorage.setItem(FAV_KEY, JSON.stringify(favs));
}

function renderFavs() {
  const favs = getFavs();
  const el = document.getElementById('favList');
  const clearBtn = document.getElementById('clearAllBtn');
  clearBtn.style.display = favs.length ? '' : 'none';
  if (!favs.length) {
    el.innerHTML = '<div class="fav-empty">\u6682\u65E0\u6536\u85CF\uFF0C\u9009\u597D\u4F4D\u7F6E\u540E\u70B9\u51FB\u300C\u6536\u85CF\u4F4D\u7F6E\u300D</div>';
    return;
  }
  el.innerHTML = favs.map((f, i) => {
    const isActive = activeLon !== null && Math.abs(f.lon - activeLon) < 0.000001 && Math.abs(f.lat - activeLat) < 0.000001;
    return '<div class="fav-item" onclick="loadFav(' + i + ')">' +
      '<div class="fav-info">' +
        '<div class="fav-name">' + escHtml(f.name) + '<\\/div>' +
        '<div class="fav-coords">' + f.lon.toFixed(6) + ', ' + f.lat.toFixed(6) + '<\\/div>' +
        (isActive ? '<div class="fav-active">\\u2713 \u5F53\u524D\u751F\u6548<\\/div>' : '') +
      '<\\/div>' +
      '<button class="fav-del" onclick="event.stopPropagation();delFav(' + i + ')" title="\u5220\u9664">\\u00d7<\\/button>' +
    '<\\/div>';
  }).join('');
}

function escHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function addFav() {
  if (!selected) { toast('\u8BF7\u5148\u5728\u5730\u56FE\u4E0A\u9009\u62E9\u4E00\u4E2A\u4F4D\u7F6E'); return; }
  document.getElementById('favModalCoords').textContent = lon.toFixed(6) + ', ' + lat.toFixed(6);
  document.getElementById('favNameInput').value = '';
  document.getElementById('favModal').classList.add('show');
  setTimeout(() => document.getElementById('favNameInput').focus(), 100);
}

function closeFavModal() {
  document.getElementById('favModal').classList.remove('show');
}

function confirmFav() {
  const name = document.getElementById('favNameInput').value.trim();
  if (!name) { toast('\u8BF7\u8F93\u5165\u5907\u6CE8\u540D\u79F0'); return; }
  const favs = getFavs();
  favs.push({ name, lon, lat, time: new Date().toISOString() });
  saveFavs(favs);
  closeFavModal();
  renderFavs();
  toast('\u5DF2\u6536\u85CF: ' + name);
}

function loadFav(i) {
  const favs = getFavs();
  if (!favs[i]) return;
  moveTo(favs[i].lat, favs[i].lon, 15);
  toast(favs[i].name + ' (' + favs[i].lon.toFixed(4) + ', ' + favs[i].lat.toFixed(4) + ')');
}

function delFav(i) {
  const favs = getFavs();
  if (!favs[i]) return;
  const name = favs[i].name;
  favs.splice(i, 1);
  saveFavs(favs);
  renderFavs();
  toast('\u5DF2\u5220\u9664: ' + name);
}

function clearAllFav() {
  if (!confirm('\u786E\u5B9A\u6E05\u7A7A\u6240\u6709\u6536\u85CF\uFF1F')) return;
  saveFavs([]);
  renderFavs();
  toast('\u5DF2\u6E05\u7A7A\u6240\u6709\u6536\u85CF');
}

/* ---- Active location query ---- */
function queryActive() {
  const el = document.getElementById('activeValue');
  el.textContent = '\u67E5\u8BE2\u4E2D...';
  fetch(SAVE_API + '?action=query', { method:'GET', mode:'cors', cache:'no-store' })
    .then(r => r.json())
    .then(d => {
      if (d.success && Number.isFinite(parseFloat(d.longitude)) && Number.isFinite(parseFloat(d.latitude))) {
        activeLon = parseFloat(d.longitude);
        activeLat = parseFloat(d.latitude);
        el.textContent = '\u7ECF\u5EA6 ' + activeLon.toFixed(6) + '  \u7EAC\u5EA6 ' + activeLat.toFixed(6) + (d.accuracy ? '  \u7CBE\u5EA6 ' + d.accuracy + 'm' : '');
        renderFavs();
        document.getElementById('diagnosticMode').value = d.settings.diagnosticMode || (d.settings.inspectMode ? 'inspect' : d.settings.diagnostics ? 'rewrite' : 'off');
        document.getElementById('diagnosticOutput').value = d.settings.diagnosticOutput || 'both';
      } else {
        activeLon = null; activeLat = null;
        el.textContent = '\u65E0\u5DF2\u4FDD\u5B58\u7684\u5750\u6807';
        renderFavs();
      }
    })
    .catch(() => {
      el.textContent = '\u67E5\u8BE2\u5931\u8D25 (\u9700\u8981\u4EE3\u7406\u6A21\u5757\u652F\u6301)';
    });
}

function clearActive() {
  if (!confirm('\u786E\u5B9A\u6E05\u9664\u8BBE\u5907\u4E0A\u5DF2\u4FDD\u5B58\u7684\u5750\u6807\uFF1F\u6E05\u9664\u540E\u5C06\u4F7F\u7528\u6A21\u5757\u9ED8\u8BA4\u53C2\u6570\u6216\u505C\u6B62\u4FEE\u6539\u5B9A\u4F4D\u3002')) return;
  fetch(SAVE_API + '?action=clear', { method:'GET', mode:'cors', cache:'no-store' })
    .then(r => r.json())
    .then(d => {
      if (d.success) {
        activeLon = null; activeLat = null;
        document.getElementById('activeValue').textContent = '\u5DF2\u6E05\u9664';
        renderFavs();
        toast('\u5DF2\u6E05\u9664\u8BBE\u5907\u5750\u6807');
      } else { toast('\u6E05\u9664\u5931\u8D25: ' + (d.error || ''), 3000); }
    })
    .catch(() => { toast('\u6E05\u9664\u5931\u8D25 - \u8BF7\u68C0\u67E5\u6A21\u5757\u914D\u7F6E', 3000); });
}

/* ---- Save to device ---- */
async function save() {
  if (!selected) { toast('\u8BF7\u5148\u5728\u5730\u56FE\u4E0A\u9009\u62E9\u4E00\u4E2A\u4F4D\u7F6E'); return; }
  const btn = document.getElementById('saveBtn');
  btn.textContent = '\u50A8\u5B58\u4E2D...'; btn.disabled = true;
  showError(false);
  try {
    const diagnosticMode = document.getElementById('diagnosticMode').value;
    const diagnosticOutput = document.getElementById('diagnosticOutput').value;
    const r = await fetch(SAVE_API + '?lon=' + lon + '&lat=' + lat + '&acc=25&diagnosticMode=' + diagnosticMode + '&diagnosticOutput=' + diagnosticOutput, {
      method: 'GET', mode: 'cors', cache: 'no-store'
    });
    const d = await r.json();
    if (d.success) {
      activeLon = lon; activeLat = lat;
      btn.textContent = '\\u2713 \u5DF2\u50A8\u5B58'; btn.className = 'btn btn-primary success';
      document.getElementById('status').textContent = '\\u2713 \u5DF2\u5199\u5165: ' + lon.toFixed(6) + ', ' + lat.toFixed(6) + ' \\u00b7 ' + new Date().toLocaleTimeString('zh-CN');
      document.getElementById('activeValue').textContent = '\u7ECF\u5EA6 ' + lon.toFixed(6) + '  \u7EAC\u5EA6 ' + lat.toFixed(6) + '  \u7CBE\u5EA6 25m';
      renderFavs();
      toast('\\u2713 \u5750\u6807\u5DF2\u5199\u5165\u8BBE\u5907\uFF0C\u4E0B\u6B21\u5B9A\u4F4D\u751F\u6548');
      setTimeout(() => { btn.textContent='\u50A8\u5B58\u5230\u8BBE\u5907'; btn.className='btn btn-primary'; btn.disabled=false; }, 2500);
    } else {
      throw new Error(d.error || '\u5199\u5165\u5931\u8D25');
    }
  } catch(e) {
    btn.textContent = '\u50A8\u5B58\u5230\u8BBE\u5907'; btn.className = 'btn btn-primary'; btn.disabled = false;
    showError(true);
    toast('\\u2717 \u50A8\u5B58\u5931\u8D25 - \u8BF7\u68C0\u67E5\u6A21\u5757\u914D\u7F6E', 4000);
  }
}

function locateMe() {
  if (!navigator.geolocation) return toast('\u6D4F\u89C8\u5668\u4E0D\u652F\u6301\u5B9A\u4F4D');
  toast('\u83B7\u53D6\u4F4D\u7F6E\u4E2D...');
  navigator.geolocation.getCurrentPosition(
    pos => { moveTo(pos.coords.latitude, pos.coords.longitude, 16); toast('\u5DF2\u83B7\u53D6\u5F53\u524D\u4F4D\u7F6E'); },
    err => toast('\u5B9A\u4F4D\u5931\u8D25: ' + err.message, 3000),
    { enableHighAccuracy:true, timeout:10000 }
  );
}

function parseMapUrl(text) {
  let m;
  m = text.match(/ll=([0-9.-]+),([0-9.-]+)/);
  if (m) return { lat: parseFloat(m[1]), lon: parseFloat(m[2]) };
  m = text.match(/@([0-9.-]+),([0-9.-]+)/);
  if (m) return { lat: parseFloat(m[1]), lon: parseFloat(m[2]) };
  m = text.match(/lnglat=([0-9.-]+),([0-9.-]+)/);
  if (m) return { lat: parseFloat(m[2]), lon: parseFloat(m[1]) };
  m = text.match(/(?:location|center)=([0-9.-]+),([0-9.-]+)/);
  if (m) return { lat: parseFloat(m[2]), lon: parseFloat(m[1]) };
  m = text.match(/([0-9]+\\.[0-9]+)[,\\s]+([0-9]+\\.[0-9]+)/);
  if (m) {
    const a = parseFloat(m[1]), b = parseFloat(m[2]);
    if (a < 90 && b > 90) return { lat: a, lon: b };
    if (b < 90 && a > 90) return { lat: b, lon: a };
    return { lat: a, lon: b };
  }
  return null;
}

function parseUrl() {
  const input = document.getElementById('urlInput').value.trim();
  if (!input) return toast('\u8BF7\u7C98\u8D34\u5730\u56FE\u94FE\u63A5\u6216\u5750\u6807');
  const result = parseMapUrl(input);
  if (!result) { toast('\u65E0\u6CD5\u89E3\u6790\u5750\u6807\uFF0C\u8BF7\u68C0\u67E5\u94FE\u63A5\u683C\u5F0F', 3000); return; }
  moveTo(result.lat, result.lon, 15);
  toast('\u5DF2\u89E3\u6790: ' + result.lon.toFixed(4) + ', ' + result.lat.toFixed(4));
}

async function searchPlace() {
  const q = document.getElementById('searchInput').value.trim();
  if (!q) return toast('\u8BF7\u8F93\u5165\u5730\u540D');
  toast('\u641C\u7D22\u4E2D...');
  try {
    const r = await fetch('https://nominatim.openstreetmap.org/search?format=json&limit=1&q='+encodeURIComponent(q));
    const results = await r.json();
    if (!results.length) { toast('\u672A\u627E\u5230: ' + q, 3000); return; }
    const p = results[0];
    moveTo(parseFloat(p.lat), parseFloat(p.lon), 15);
    toast(p.display_name.slice(0, 40));
  } catch(e) { toast('\u641C\u7D22\u5931\u8D25', 3000); }
}

document.addEventListener('paste', e => {
  const text = (e.clipboardData||window.clipboardData).getData('text');
  if (text && (text.includes('map') || text.includes('loc') || text.includes('lnglat') || /[0-9]+\\.[0-9]+/.test(text))) {
    document.getElementById('urlInput').value = text;
    setTimeout(parseUrl, 200);
  }
});
document.getElementById('searchInput').addEventListener('keydown', e => { if(e.key==='Enter') searchPlace(); });
document.getElementById('urlInput').addEventListener('keydown', e => { if(e.key==='Enter') parseUrl(); });
document.getElementById('favNameInput').addEventListener('keydown', e => { if(e.key==='Enter') confirmFav(); });

renderFavs();
queryActive();
<\/script>
</body>
</html>`}function C(t){if(!t)return"";try{return decodeURIComponent(String(t).replace(/\+/g," "))}catch{return String(t)}}function m(t){if(!t)return null;let e=String(t),r;if(r=e.match(/(?:coordinate|ll|sll)=(-?\d{1,3}\.\d+)(?:,|%2C)(-?\d{1,3}\.\d+)/i),r){let a=e.match(/[?&]name=([^&]+)/i);return{lat:+r[1],lon:+r[2],name:a?C(a[1]):"",src:"apple"}}return r=e.match(/[?&]p=[^,&%]*(?:,|%2C)(-?\d{1,3}\.\d+)(?:,|%2C)(-?\d{1,3}\.\d+)(?:(?:,|%2C)((?:(?!,|%2C|&).)+))?/i),r?{lat:+r[1],lon:+r[2],name:r[3]?C(r[3]):"",src:"amap"}:(r=e.match(/[?&]q=(-?\d{1,3}\.\d+)(?:,|%2C)(-?\d{1,3}\.\d+)(?:(?:,|%2C)((?:(?!,|%2C|&).)+))?/i),r?{lat:+r[1],lon:+r[2],name:r[3]?C(r[3]):"",src:"amap"}:(r=e.match(/(-?\d{1,3}\.\d{4,})\s*(?:,|%2C)\s*(-?\d{1,3}\.\d{4,})/),r?{lat:+r[1],lon:+r[2],name:"",src:"text"}:null))}async function Q(t){let e=String(t||"").trim();if(!e)throw new Error("\u7A7A\u8F93\u5165");let r=e.match(/https?:\/\/[^\s'"<>]+/i),a=r?r[0]:e,n=m(a);if(n)return n;if(r){let o=a;for(let s=0;s<5;s++){let i;try{i=await fetch(o,{redirect:"manual",headers:{"user-agent":"Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/27.0 Mobile/24A5370h Safari/604.1",accept:"text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8","accept-language":"zh-CN,zh-Hans;q=0.9"}})}catch{break}let c=i.headers.get("location");if(c){if(n=m(c),n||(o=new URL(c,o).toString(),n=m(o),n))return n;continue}if(n=m(i.url),n)return n;try{let l=await i.text();if(n=m(l),n)return n}catch{}break}}throw new Error("\u672A\u80FD\u4ECE\u94FE\u63A5\u4E2D\u89E3\u6790\u51FA\u7ECF\u7EAC\u5EA6")}function I(t){return Math.round(Number(t)*1e6)/1e6}var K=6378245,J=.006693421622965943;function Z(t,e){return t<72.004||t>137.8347||e<.8293||e>55.8271}function ct(t,e){let r=-100+2*t+3*e+.2*e*e+.1*t*e+.2*Math.sqrt(Math.abs(t));return r+=(20*Math.sin(6*t*Math.PI)+20*Math.sin(2*t*Math.PI))*2/3,r+=(20*Math.sin(e*Math.PI)+40*Math.sin(e/3*Math.PI))*2/3,r+=(160*Math.sin(e/12*Math.PI)+320*Math.sin(e*Math.PI/30))*2/3,r}function lt(t,e){let r=300+t+2*e+.1*t*t+.1*t*e+.1*Math.sqrt(Math.abs(t));return r+=(20*Math.sin(6*t*Math.PI)+20*Math.sin(2*t*Math.PI))*2/3,r+=(20*Math.sin(t*Math.PI)+40*Math.sin(t/3*Math.PI))*2/3,r+=(150*Math.sin(t/12*Math.PI)+300*Math.sin(t/30*Math.PI))*2/3,r}function dt(t,e){if(Z(e,t))return{lat:t,lon:e};let r=ct(e-105,t-35),a=lt(e-105,t-35),n=t/180*Math.PI,o=Math.sin(n);o=1-J*o*o;let s=Math.sqrt(o);return r=r*180/(K*(1-J)/(o*s)*Math.PI),a=a*180/(K/s*Math.cos(n)*Math.PI),{lat:t+r,lon:e+a}}function Y(t,e){if(Z(e,t))return{lat:t,lon:e};let r=t,a=e;for(let n=0;n<6;n++){let o=dt(r,a),s=o.lat-t,i=o.lon-e;if(Math.abs(s)<1e-9&&Math.abs(i)<1e-9)break;r-=s,a-=i}return{lat:r,lon:a}}var v=new G;v.get("/",t=>t.html(W()));v.get("/api/parse",async t=>{let e=t.req.query("u")||"",r=(t.req.query("cs")||"").toLowerCase(),a=(t.req.query("format")||"").toLowerCase();try{let{lat:n,lon:o,name:s,src:i}=await Q(e);return(r==="gcj"||r!=="none"&&(i==="amap"||i==="apple"))&&({lat:n,lon:o}=Y(n,o)),n=I(n),o=I(o),s=s||"",t.header("Access-Control-Allow-Origin","*"),a==="json"?t.json({lat:n,lon:o,name:s}):t.text(`lat=${n}&lon=${o}`)}catch(n){return t.header("Access-Control-Allow-Origin","*"),t.json({error:String(n&&n.message?n.message:n)},422)}});v.onError((t,e)=>(console.error(`${t}`),e.text(`${t}`,500)));var re=v;export{re as default};
