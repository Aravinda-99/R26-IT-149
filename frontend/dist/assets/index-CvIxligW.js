(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))r(o);new MutationObserver(o=>{for(const c of o)if(c.type==="childList")for(const l of c.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&r(l)}).observe(document,{childList:!0,subtree:!0});function i(o){const c={};return o.integrity&&(c.integrity=o.integrity),o.referrerPolicy&&(c.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?c.credentials="include":o.crossOrigin==="anonymous"?c.credentials="omit":c.credentials="same-origin",c}function r(o){if(o.ep)return;o.ep=!0;const c=i(o);fetch(o.href,c)}})();var Hr={};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ns=function(t){const e=[];let i=0;for(let r=0;r<t.length;r++){let o=t.charCodeAt(r);o<128?e[i++]=o:o<2048?(e[i++]=o>>6|192,e[i++]=o&63|128):(o&64512)===55296&&r+1<t.length&&(t.charCodeAt(r+1)&64512)===56320?(o=65536+((o&1023)<<10)+(t.charCodeAt(++r)&1023),e[i++]=o>>18|240,e[i++]=o>>12&63|128,e[i++]=o>>6&63|128,e[i++]=o&63|128):(e[i++]=o>>12|224,e[i++]=o>>6&63|128,e[i++]=o&63|128)}return e},$a=function(t){const e=[];let i=0,r=0;for(;i<t.length;){const o=t[i++];if(o<128)e[r++]=String.fromCharCode(o);else if(o>191&&o<224){const c=t[i++];e[r++]=String.fromCharCode((o&31)<<6|c&63)}else if(o>239&&o<365){const c=t[i++],l=t[i++],h=t[i++],g=((o&7)<<18|(c&63)<<12|(l&63)<<6|h&63)-65536;e[r++]=String.fromCharCode(55296+(g>>10)),e[r++]=String.fromCharCode(56320+(g&1023))}else{const c=t[i++],l=t[i++];e[r++]=String.fromCharCode((o&15)<<12|(c&63)<<6|l&63)}}return e.join("")},Ms={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(t,e){if(!Array.isArray(t))throw Error("encodeByteArray takes an array as a parameter");this.init_();const i=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,r=[];for(let o=0;o<t.length;o+=3){const c=t[o],l=o+1<t.length,h=l?t[o+1]:0,g=o+2<t.length,E=g?t[o+2]:0,b=c>>2,S=(c&3)<<4|h>>4;let C=(h&15)<<2|E>>6,L=E&63;g||(L=64,l||(C=64)),r.push(i[b],i[S],i[C],i[L])}return r.join("")},encodeString(t,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(t):this.encodeByteArray(Ns(t),e)},decodeString(t,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(t):$a(this.decodeStringToByteArray(t,e))},decodeStringToByteArray(t,e){this.init_();const i=e?this.charToByteMapWebSafe_:this.charToByteMap_,r=[];for(let o=0;o<t.length;){const c=i[t.charAt(o++)],h=o<t.length?i[t.charAt(o)]:0;++o;const E=o<t.length?i[t.charAt(o)]:64;++o;const S=o<t.length?i[t.charAt(o)]:64;if(++o,c==null||h==null||E==null||S==null)throw new Ha;const C=c<<2|h>>4;if(r.push(C),E!==64){const L=h<<4&240|E>>2;if(r.push(L),S!==64){const R=E<<6&192|S;r.push(R)}}}return r},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let t=0;t<this.ENCODED_VALS.length;t++)this.byteToCharMap_[t]=this.ENCODED_VALS.charAt(t),this.charToByteMap_[this.byteToCharMap_[t]]=t,this.byteToCharMapWebSafe_[t]=this.ENCODED_VALS_WEBSAFE.charAt(t),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[t]]=t,t>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(t)]=t,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(t)]=t)}}};class Ha extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}const Va=function(t){const e=Ns(t);return Ms.encodeByteArray(e,!0)},fn=function(t){return Va(t).replace(/\./g,"")},Us=function(t){try{return Ms.decodeString(t,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function za(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Wa=()=>za().__FIREBASE_DEFAULTS__,Ga=()=>{if(typeof process>"u"||typeof Hr>"u")return;const t=Hr.__FIREBASE_DEFAULTS__;if(t)return JSON.parse(t)},qa=()=>{if(typeof document>"u")return;let t;try{t=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}const e=t&&Us(t[1]);return e&&JSON.parse(e)},bi=()=>{try{return Wa()||Ga()||qa()}catch(t){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${t}`);return}},xs=t=>{var e,i;return(i=(e=bi())===null||e===void 0?void 0:e.emulatorHosts)===null||i===void 0?void 0:i[t]},Ka=t=>{const e=xs(t);if(!e)return;const i=e.lastIndexOf(":");if(i<=0||i+1===e.length)throw new Error(`Invalid host ${e} with no separate hostname and port!`);const r=parseInt(e.substring(i+1),10);return e[0]==="["?[e.substring(1,i-1),r]:[e.substring(0,i),r]},Fs=()=>{var t;return(t=bi())===null||t===void 0?void 0:t.config},js=t=>{var e;return(e=bi())===null||e===void 0?void 0:e[`_${t}`]};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ja{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((e,i)=>{this.resolve=e,this.reject=i})}wrapCallback(e){return(i,r)=>{i?this.reject(i):this.resolve(r),typeof e=="function"&&(this.promise.catch(()=>{}),e.length===1?e(i):e(i,r))}}}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Xa(t,e){if(t.uid)throw new Error('The "uid" field is no longer supported by mockUserToken. Please use "sub" instead for Firebase Auth User ID.');const i={alg:"none",type:"JWT"},r=e||"demo-project",o=t.iat||0,c=t.sub||t.user_id;if(!c)throw new Error("mockUserToken must contain 'sub' or 'user_id' field!");const l=Object.assign({iss:`https://securetoken.google.com/${r}`,aud:r,iat:o,exp:o+3600,auth_time:o,sub:c,user_id:c,firebase:{sign_in_provider:"custom",identities:{}}},t);return[fn(JSON.stringify(i)),fn(JSON.stringify(l)),""].join(".")}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function q(){return typeof navigator<"u"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function Ya(){return typeof window<"u"&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(q())}function Qa(){return typeof navigator<"u"&&navigator.userAgent==="Cloudflare-Workers"}function Bs(){const t=typeof chrome=="object"?chrome.runtime:typeof browser=="object"?browser.runtime:void 0;return typeof t=="object"&&t.id!==void 0}function Za(){return typeof navigator=="object"&&navigator.product==="ReactNative"}function ec(){const t=q();return t.indexOf("MSIE ")>=0||t.indexOf("Trident/")>=0}function $s(){try{return typeof indexedDB=="object"}catch{return!1}}function Hs(){return new Promise((t,e)=>{try{let i=!0;const r="validate-browser-context-for-indexeddb-analytics-module",o=self.indexedDB.open(r);o.onsuccess=()=>{o.result.close(),i||self.indexedDB.deleteDatabase(r),t(!0)},o.onupgradeneeded=()=>{i=!1},o.onerror=()=>{var c;e(((c=o.error)===null||c===void 0?void 0:c.message)||"")}}catch(i){e(i)}})}function tc(){return!(typeof navigator>"u"||!navigator.cookieEnabled)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const nc="FirebaseError";class ce extends Error{constructor(e,i,r){super(i),this.code=e,this.customData=r,this.name=nc,Object.setPrototypeOf(this,ce.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,qe.prototype.create)}}class qe{constructor(e,i,r){this.service=e,this.serviceName=i,this.errors=r}create(e,...i){const r=i[0]||{},o=`${this.service}/${e}`,c=this.errors[e],l=c?ic(c,r):"Error",h=`${this.serviceName}: ${l} (${o}).`;return new ce(o,h,r)}}function ic(t,e){return t.replace(rc,(i,r)=>{const o=e[r];return o!=null?String(o):`<${r}?>`})}const rc=/\{\$([^}]+)}/g;function sc(t){for(const e in t)if(Object.prototype.hasOwnProperty.call(t,e))return!1;return!0}function Dt(t,e){if(t===e)return!0;const i=Object.keys(t),r=Object.keys(e);for(const o of i){if(!r.includes(o))return!1;const c=t[o],l=e[o];if(Vr(c)&&Vr(l)){if(!Dt(c,l))return!1}else if(c!==l)return!1}for(const o of r)if(!i.includes(o))return!1;return!0}function Vr(t){return t!==null&&typeof t=="object"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ut(t){const e=[];for(const[i,r]of Object.entries(t))Array.isArray(r)?r.forEach(o=>{e.push(encodeURIComponent(i)+"="+encodeURIComponent(o))}):e.push(encodeURIComponent(i)+"="+encodeURIComponent(r));return e.length?"&"+e.join("&"):""}function St(t){const e={};return t.replace(/^\?/,"").split("&").forEach(r=>{if(r){const[o,c]=r.split("=");e[decodeURIComponent(o)]=decodeURIComponent(c)}}),e}function Ct(t){const e=t.indexOf("?");if(!e)return"";const i=t.indexOf("#",e);return t.substring(e,i>0?i:void 0)}function oc(t,e){const i=new ac(t,e);return i.subscribe.bind(i)}class ac{constructor(e,i){this.observers=[],this.unsubscribes=[],this.observerCount=0,this.task=Promise.resolve(),this.finalized=!1,this.onNoObservers=i,this.task.then(()=>{e(this)}).catch(r=>{this.error(r)})}next(e){this.forEachObserver(i=>{i.next(e)})}error(e){this.forEachObserver(i=>{i.error(e)}),this.close(e)}complete(){this.forEachObserver(e=>{e.complete()}),this.close()}subscribe(e,i,r){let o;if(e===void 0&&i===void 0&&r===void 0)throw new Error("Missing Observer.");cc(e,["next","error","complete"])?o=e:o={next:e,error:i,complete:r},o.next===void 0&&(o.next=ni),o.error===void 0&&(o.error=ni),o.complete===void 0&&(o.complete=ni);const c=this.unsubscribeOne.bind(this,this.observers.length);return this.finalized&&this.task.then(()=>{try{this.finalError?o.error(this.finalError):o.complete()}catch{}}),this.observers.push(o),c}unsubscribeOne(e){this.observers===void 0||this.observers[e]===void 0||(delete this.observers[e],this.observerCount-=1,this.observerCount===0&&this.onNoObservers!==void 0&&this.onNoObservers(this))}forEachObserver(e){if(!this.finalized)for(let i=0;i<this.observers.length;i++)this.sendOne(i,e)}sendOne(e,i){this.task.then(()=>{if(this.observers!==void 0&&this.observers[e]!==void 0)try{i(this.observers[e])}catch(r){typeof console<"u"&&console.error&&console.error(r)}})}close(e){this.finalized||(this.finalized=!0,e!==void 0&&(this.finalError=e),this.task.then(()=>{this.observers=void 0,this.onNoObservers=void 0}))}}function cc(t,e){if(typeof t!="object"||t===null)return!1;for(const i of e)if(i in t&&typeof t[i]=="function")return!0;return!1}function ni(){}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const lc=1e3,uc=2,hc=4*60*60*1e3,dc=.5;function zr(t,e=lc,i=uc){const r=e*Math.pow(i,t),o=Math.round(dc*r*(Math.random()-.5)*2);return Math.min(hc,r+o)}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function le(t){return t&&t._delegate?t._delegate:t}class oe{constructor(e,i,r){this.name=e,this.instanceFactory=i,this.type=r,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const $e="[DEFAULT]";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class fc{constructor(e,i){this.name=e,this.container=i,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(e){const i=this.normalizeInstanceIdentifier(e);if(!this.instancesDeferred.has(i)){const r=new Ja;if(this.instancesDeferred.set(i,r),this.isInitialized(i)||this.shouldAutoInitialize())try{const o=this.getOrInitializeService({instanceIdentifier:i});o&&r.resolve(o)}catch{}}return this.instancesDeferred.get(i).promise}getImmediate(e){var i;const r=this.normalizeInstanceIdentifier(e==null?void 0:e.identifier),o=(i=e==null?void 0:e.optional)!==null&&i!==void 0?i:!1;if(this.isInitialized(r)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:r})}catch(c){if(o)return null;throw c}else{if(o)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(e){if(e.name!==this.name)throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=e,!!this.shouldAutoInitialize()){if(gc(e))try{this.getOrInitializeService({instanceIdentifier:$e})}catch{}for(const[i,r]of this.instancesDeferred.entries()){const o=this.normalizeInstanceIdentifier(i);try{const c=this.getOrInitializeService({instanceIdentifier:o});r.resolve(c)}catch{}}}}clearInstance(e=$e){this.instancesDeferred.delete(e),this.instancesOptions.delete(e),this.instances.delete(e)}async delete(){const e=Array.from(this.instances.values());await Promise.all([...e.filter(i=>"INTERNAL"in i).map(i=>i.INTERNAL.delete()),...e.filter(i=>"_delete"in i).map(i=>i._delete())])}isComponentSet(){return this.component!=null}isInitialized(e=$e){return this.instances.has(e)}getOptions(e=$e){return this.instancesOptions.get(e)||{}}initialize(e={}){const{options:i={}}=e,r=this.normalizeInstanceIdentifier(e.instanceIdentifier);if(this.isInitialized(r))throw Error(`${this.name}(${r}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);const o=this.getOrInitializeService({instanceIdentifier:r,options:i});for(const[c,l]of this.instancesDeferred.entries()){const h=this.normalizeInstanceIdentifier(c);r===h&&l.resolve(o)}return o}onInit(e,i){var r;const o=this.normalizeInstanceIdentifier(i),c=(r=this.onInitCallbacks.get(o))!==null&&r!==void 0?r:new Set;c.add(e),this.onInitCallbacks.set(o,c);const l=this.instances.get(o);return l&&e(l,o),()=>{c.delete(e)}}invokeOnInitCallbacks(e,i){const r=this.onInitCallbacks.get(i);if(r)for(const o of r)try{o(e,i)}catch{}}getOrInitializeService({instanceIdentifier:e,options:i={}}){let r=this.instances.get(e);if(!r&&this.component&&(r=this.component.instanceFactory(this.container,{instanceIdentifier:pc(e),options:i}),this.instances.set(e,r),this.instancesOptions.set(e,i),this.invokeOnInitCallbacks(r,e),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,e,r)}catch{}return r||null}normalizeInstanceIdentifier(e=$e){return this.component?this.component.multipleInstances?e:$e:e}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}}function pc(t){return t===$e?void 0:t}function gc(t){return t.instantiationMode==="EAGER"}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class mc{constructor(e){this.name=e,this.providers=new Map}addComponent(e){const i=this.getProvider(e.name);if(i.isComponentSet())throw new Error(`Component ${e.name} has already been registered with ${this.name}`);i.setComponent(e)}addOrOverwriteComponent(e){this.getProvider(e.name).isComponentSet()&&this.providers.delete(e.name),this.addComponent(e)}getProvider(e){if(this.providers.has(e))return this.providers.get(e);const i=new fc(e,this);return this.providers.set(e,i),i}getProviders(){return Array.from(this.providers.values())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var O;(function(t){t[t.DEBUG=0]="DEBUG",t[t.VERBOSE=1]="VERBOSE",t[t.INFO=2]="INFO",t[t.WARN=3]="WARN",t[t.ERROR=4]="ERROR",t[t.SILENT=5]="SILENT"})(O||(O={}));const yc={debug:O.DEBUG,verbose:O.VERBOSE,info:O.INFO,warn:O.WARN,error:O.ERROR,silent:O.SILENT},vc=O.INFO,_c={[O.DEBUG]:"log",[O.VERBOSE]:"log",[O.INFO]:"info",[O.WARN]:"warn",[O.ERROR]:"error"},Ic=(t,e,...i)=>{if(e<t.logLevel)return;const r=new Date().toISOString(),o=_c[e];if(o)console[o](`[${r}]  ${t.name}:`,...i);else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)};class bn{constructor(e){this.name=e,this._logLevel=vc,this._logHandler=Ic,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in O))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?yc[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,O.DEBUG,...e),this._logHandler(this,O.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,O.VERBOSE,...e),this._logHandler(this,O.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,O.INFO,...e),this._logHandler(this,O.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,O.WARN,...e),this._logHandler(this,O.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,O.ERROR,...e),this._logHandler(this,O.ERROR,...e)}}const wc=(t,e)=>e.some(i=>t instanceof i);let Wr,Gr;function Ec(){return Wr||(Wr=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function Tc(){return Gr||(Gr=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}const Vs=new WeakMap,pi=new WeakMap,zs=new WeakMap,ii=new WeakMap,Ai=new WeakMap;function bc(t){const e=new Promise((i,r)=>{const o=()=>{t.removeEventListener("success",c),t.removeEventListener("error",l)},c=()=>{i(Le(t.result)),o()},l=()=>{r(t.error),o()};t.addEventListener("success",c),t.addEventListener("error",l)});return e.then(i=>{i instanceof IDBCursor&&Vs.set(i,t)}).catch(()=>{}),Ai.set(e,t),e}function Ac(t){if(pi.has(t))return;const e=new Promise((i,r)=>{const o=()=>{t.removeEventListener("complete",c),t.removeEventListener("error",l),t.removeEventListener("abort",l)},c=()=>{i(),o()},l=()=>{r(t.error||new DOMException("AbortError","AbortError")),o()};t.addEventListener("complete",c),t.addEventListener("error",l),t.addEventListener("abort",l)});pi.set(t,e)}let gi={get(t,e,i){if(t instanceof IDBTransaction){if(e==="done")return pi.get(t);if(e==="objectStoreNames")return t.objectStoreNames||zs.get(t);if(e==="store")return i.objectStoreNames[1]?void 0:i.objectStore(i.objectStoreNames[0])}return Le(t[e])},set(t,e,i){return t[e]=i,!0},has(t,e){return t instanceof IDBTransaction&&(e==="done"||e==="store")?!0:e in t}};function Sc(t){gi=t(gi)}function Cc(t){return t===IDBDatabase.prototype.transaction&&!("objectStoreNames"in IDBTransaction.prototype)?function(e,...i){const r=t.call(ri(this),e,...i);return zs.set(r,e.sort?e.sort():[e]),Le(r)}:Tc().includes(t)?function(...e){return t.apply(ri(this),e),Le(Vs.get(this))}:function(...e){return Le(t.apply(ri(this),e))}}function Pc(t){return typeof t=="function"?Cc(t):(t instanceof IDBTransaction&&Ac(t),wc(t,Ec())?new Proxy(t,gi):t)}function Le(t){if(t instanceof IDBRequest)return bc(t);if(ii.has(t))return ii.get(t);const e=Pc(t);return e!==t&&(ii.set(t,e),Ai.set(e,t)),e}const ri=t=>Ai.get(t);function Ws(t,e,{blocked:i,upgrade:r,blocking:o,terminated:c}={}){const l=indexedDB.open(t,e),h=Le(l);return r&&l.addEventListener("upgradeneeded",g=>{r(Le(l.result),g.oldVersion,g.newVersion,Le(l.transaction),g)}),i&&l.addEventListener("blocked",g=>i(g.oldVersion,g.newVersion,g)),h.then(g=>{c&&g.addEventListener("close",()=>c()),o&&g.addEventListener("versionchange",E=>o(E.oldVersion,E.newVersion,E))}).catch(()=>{}),h}const Rc=["get","getKey","getAll","getAllKeys","count"],kc=["put","add","delete","clear"],si=new Map;function qr(t,e){if(!(t instanceof IDBDatabase&&!(e in t)&&typeof e=="string"))return;if(si.get(e))return si.get(e);const i=e.replace(/FromIndex$/,""),r=e!==i,o=kc.includes(i);if(!(i in(r?IDBIndex:IDBObjectStore).prototype)||!(o||Rc.includes(i)))return;const c=async function(l,...h){const g=this.transaction(l,o?"readwrite":"readonly");let E=g.store;return r&&(E=E.index(h.shift())),(await Promise.all([E[i](...h),o&&g.done]))[0]};return si.set(e,c),c}Sc(t=>({...t,get:(e,i,r)=>qr(e,i)||t.get(e,i,r),has:(e,i)=>!!qr(e,i)||t.has(e,i)}));/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Oc{constructor(e){this.container=e}getPlatformInfoString(){return this.container.getProviders().map(i=>{if(Dc(i)){const r=i.getImmediate();return`${r.library}/${r.version}`}else return null}).filter(i=>i).join(" ")}}function Dc(t){const e=t.getComponent();return(e==null?void 0:e.type)==="VERSION"}const mi="@firebase/app",Kr="0.10.13";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ee=new bn("@firebase/app"),Lc="@firebase/app-compat",Nc="@firebase/analytics-compat",Mc="@firebase/analytics",Uc="@firebase/app-check-compat",xc="@firebase/app-check",Fc="@firebase/auth",jc="@firebase/auth-compat",Bc="@firebase/database",$c="@firebase/data-connect",Hc="@firebase/database-compat",Vc="@firebase/functions",zc="@firebase/functions-compat",Wc="@firebase/installations",Gc="@firebase/installations-compat",qc="@firebase/messaging",Kc="@firebase/messaging-compat",Jc="@firebase/performance",Xc="@firebase/performance-compat",Yc="@firebase/remote-config",Qc="@firebase/remote-config-compat",Zc="@firebase/storage",el="@firebase/storage-compat",tl="@firebase/firestore",nl="@firebase/vertexai-preview",il="@firebase/firestore-compat",rl="firebase",sl="10.14.1";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const yi="[DEFAULT]",ol={[mi]:"fire-core",[Lc]:"fire-core-compat",[Mc]:"fire-analytics",[Nc]:"fire-analytics-compat",[xc]:"fire-app-check",[Uc]:"fire-app-check-compat",[Fc]:"fire-auth",[jc]:"fire-auth-compat",[Bc]:"fire-rtdb",[$c]:"fire-data-connect",[Hc]:"fire-rtdb-compat",[Vc]:"fire-fn",[zc]:"fire-fn-compat",[Wc]:"fire-iid",[Gc]:"fire-iid-compat",[qc]:"fire-fcm",[Kc]:"fire-fcm-compat",[Jc]:"fire-perf",[Xc]:"fire-perf-compat",[Yc]:"fire-rc",[Qc]:"fire-rc-compat",[Zc]:"fire-gcs",[el]:"fire-gcs-compat",[tl]:"fire-fst",[il]:"fire-fst-compat",[nl]:"fire-vertex","fire-js":"fire-js",[rl]:"fire-js-all"};/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const pn=new Map,al=new Map,vi=new Map;function Jr(t,e){try{t.container.addComponent(e)}catch(i){Ee.debug(`Component ${e.name} failed to register with FirebaseApp ${t.name}`,i)}}function fe(t){const e=t.name;if(vi.has(e))return Ee.debug(`There were multiple attempts to register component ${e}.`),!1;vi.set(e,t);for(const i of pn.values())Jr(i,t);for(const i of al.values())Jr(i,t);return!0}function Ke(t,e){const i=t.container.getProvider("heartbeat").getImmediate({optional:!0});return i&&i.triggerHeartbeat(),t.container.getProvider(e)}function ue(t){return t.settings!==void 0}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const cl={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different options or config","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},Ne=new qe("app","Firebase",cl);/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ll{constructor(e,i,r){this._isDeleted=!1,this._options=Object.assign({},e),this._config=Object.assign({},i),this._name=i.name,this._automaticDataCollectionEnabled=i.automaticDataCollectionEnabled,this._container=r,this.container.addComponent(new oe("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(e){this.checkDestroyed(),this._automaticDataCollectionEnabled=e}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(e){this._isDeleted=e}checkDestroyed(){if(this.isDeleted)throw Ne.create("app-deleted",{appName:this._name})}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const at=sl;function Gs(t,e={}){let i=t;typeof e!="object"&&(e={name:e});const r=Object.assign({name:yi,automaticDataCollectionEnabled:!1},e),o=r.name;if(typeof o!="string"||!o)throw Ne.create("bad-app-name",{appName:String(o)});if(i||(i=Fs()),!i)throw Ne.create("no-options");const c=pn.get(o);if(c){if(Dt(i,c.options)&&Dt(r,c.config))return c;throw Ne.create("duplicate-app",{appName:o})}const l=new mc(o);for(const g of vi.values())l.addComponent(g);const h=new ll(i,r,l);return pn.set(o,h),h}function Si(t=yi){const e=pn.get(t);if(!e&&t===yi&&Fs())return Gs();if(!e)throw Ne.create("no-app",{appName:t});return e}function ne(t,e,i){var r;let o=(r=ol[t])!==null&&r!==void 0?r:t;i&&(o+=`-${i}`);const c=o.match(/\s|\//),l=e.match(/\s|\//);if(c||l){const h=[`Unable to register library "${o}" with version "${e}":`];c&&h.push(`library name "${o}" contains illegal characters (whitespace or "/")`),c&&l&&h.push("and"),l&&h.push(`version name "${e}" contains illegal characters (whitespace or "/")`),Ee.warn(h.join(" "));return}fe(new oe(`${o}-version`,()=>({library:o,version:e}),"VERSION"))}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ul="firebase-heartbeat-database",hl=1,Lt="firebase-heartbeat-store";let oi=null;function qs(){return oi||(oi=Ws(ul,hl,{upgrade:(t,e)=>{switch(e){case 0:try{t.createObjectStore(Lt)}catch(i){console.warn(i)}}}}).catch(t=>{throw Ne.create("idb-open",{originalErrorMessage:t.message})})),oi}async function dl(t){try{const i=(await qs()).transaction(Lt),r=await i.objectStore(Lt).get(Ks(t));return await i.done,r}catch(e){if(e instanceof ce)Ee.warn(e.message);else{const i=Ne.create("idb-get",{originalErrorMessage:e==null?void 0:e.message});Ee.warn(i.message)}}}async function Xr(t,e){try{const r=(await qs()).transaction(Lt,"readwrite");await r.objectStore(Lt).put(e,Ks(t)),await r.done}catch(i){if(i instanceof ce)Ee.warn(i.message);else{const r=Ne.create("idb-set",{originalErrorMessage:i==null?void 0:i.message});Ee.warn(r.message)}}}function Ks(t){return`${t.name}!${t.options.appId}`}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const fl=1024,pl=30*24*60*60*1e3;class gl{constructor(e){this.container=e,this._heartbeatsCache=null;const i=this.container.getProvider("app").getImmediate();this._storage=new yl(i),this._heartbeatsCachePromise=this._storage.read().then(r=>(this._heartbeatsCache=r,r))}async triggerHeartbeat(){var e,i;try{const o=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),c=Yr();return((e=this._heartbeatsCache)===null||e===void 0?void 0:e.heartbeats)==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,((i=this._heartbeatsCache)===null||i===void 0?void 0:i.heartbeats)==null)||this._heartbeatsCache.lastSentHeartbeatDate===c||this._heartbeatsCache.heartbeats.some(l=>l.date===c)?void 0:(this._heartbeatsCache.heartbeats.push({date:c,agent:o}),this._heartbeatsCache.heartbeats=this._heartbeatsCache.heartbeats.filter(l=>{const h=new Date(l.date).valueOf();return Date.now()-h<=pl}),this._storage.overwrite(this._heartbeatsCache))}catch(r){Ee.warn(r)}}async getHeartbeatsHeader(){var e;try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,((e=this._heartbeatsCache)===null||e===void 0?void 0:e.heartbeats)==null||this._heartbeatsCache.heartbeats.length===0)return"";const i=Yr(),{heartbeatsToSend:r,unsentEntries:o}=ml(this._heartbeatsCache.heartbeats),c=fn(JSON.stringify({version:2,heartbeats:r}));return this._heartbeatsCache.lastSentHeartbeatDate=i,o.length>0?(this._heartbeatsCache.heartbeats=o,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),c}catch(i){return Ee.warn(i),""}}}function Yr(){return new Date().toISOString().substring(0,10)}function ml(t,e=fl){const i=[];let r=t.slice();for(const o of t){const c=i.find(l=>l.agent===o.agent);if(c){if(c.dates.push(o.date),Qr(i)>e){c.dates.pop();break}}else if(i.push({agent:o.agent,dates:[o.date]}),Qr(i)>e){i.pop();break}r=r.slice(1)}return{heartbeatsToSend:i,unsentEntries:r}}class yl{constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return $s()?Hs().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){const i=await dl(this.app);return i!=null&&i.heartbeats?i:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(e){var i;if(await this._canUseIndexedDBPromise){const o=await this.read();return Xr(this.app,{lastSentHeartbeatDate:(i=e.lastSentHeartbeatDate)!==null&&i!==void 0?i:o.lastSentHeartbeatDate,heartbeats:e.heartbeats})}else return}async add(e){var i;if(await this._canUseIndexedDBPromise){const o=await this.read();return Xr(this.app,{lastSentHeartbeatDate:(i=e.lastSentHeartbeatDate)!==null&&i!==void 0?i:o.lastSentHeartbeatDate,heartbeats:[...o.heartbeats,...e.heartbeats]})}else return}}function Qr(t){return fn(JSON.stringify({version:2,heartbeats:t})).length}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function vl(t){fe(new oe("platform-logger",e=>new Oc(e),"PRIVATE")),fe(new oe("heartbeat",e=>new gl(e),"PRIVATE")),ne(mi,Kr,t),ne(mi,Kr,"esm2017"),ne("fire-js","")}vl("");var _l="firebase",Il="10.14.1";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ne(_l,Il,"app");function Ci(t,e){var i={};for(var r in t)Object.prototype.hasOwnProperty.call(t,r)&&e.indexOf(r)<0&&(i[r]=t[r]);if(t!=null&&typeof Object.getOwnPropertySymbols=="function")for(var o=0,r=Object.getOwnPropertySymbols(t);o<r.length;o++)e.indexOf(r[o])<0&&Object.prototype.propertyIsEnumerable.call(t,r[o])&&(i[r[o]]=t[r[o]]);return i}function Js(){return{"dependent-sdk-initialized-before-auth":"Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."}}const wl=Js,Xs=new qe("auth","Firebase",Js());/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const gn=new bn("@firebase/auth");function El(t,...e){gn.logLevel<=O.WARN&&gn.warn(`Auth (${at}): ${t}`,...e)}function ln(t,...e){gn.logLevel<=O.ERROR&&gn.error(`Auth (${at}): ${t}`,...e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ae(t,...e){throw Pi(t,...e)}function he(t,...e){return Pi(t,...e)}function Ys(t,e,i){const r=Object.assign(Object.assign({},wl()),{[e]:i});return new qe("auth","Firebase",r).create(e,{appName:t.name})}function we(t){return Ys(t,"operation-not-supported-in-this-environment","Operations that alter the current user are not supported in conjunction with FirebaseServerApp")}function Pi(t,...e){if(typeof t!="string"){const i=e[0],r=[...e.slice(1)];return r[0]&&(r[0].appName=t.name),t._errorFactory.create(i,...r)}return Xs.create(t,...e)}function A(t,e,...i){if(!t)throw Pi(e,...i)}function ve(t){const e="INTERNAL ASSERTION FAILED: "+t;throw ln(e),new Error(e)}function Te(t,e){t||ve(e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function _i(){var t;return typeof self<"u"&&((t=self.location)===null||t===void 0?void 0:t.href)||""}function Tl(){return Zr()==="http:"||Zr()==="https:"}function Zr(){var t;return typeof self<"u"&&((t=self.location)===null||t===void 0?void 0:t.protocol)||null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function bl(){return typeof navigator<"u"&&navigator&&"onLine"in navigator&&typeof navigator.onLine=="boolean"&&(Tl()||Bs()||"connection"in navigator)?navigator.onLine:!0}function Al(){if(typeof navigator>"u")return null;const t=navigator;return t.languages&&t.languages[0]||t.language||null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class xt{constructor(e,i){this.shortDelay=e,this.longDelay=i,Te(i>e,"Short delay should be less than long delay!"),this.isMobile=Ya()||Za()}get(){return bl()?this.isMobile?this.longDelay:this.shortDelay:Math.min(5e3,this.shortDelay)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ri(t,e){Te(t.emulator,"Emulator should always be set here");const{url:i}=t.emulator;return e?`${i}${e.startsWith("/")?e.slice(1):e}`:i}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Qs{static initialize(e,i,r){this.fetchImpl=e,i&&(this.headersImpl=i),r&&(this.responseImpl=r)}static fetch(){if(this.fetchImpl)return this.fetchImpl;if(typeof self<"u"&&"fetch"in self)return self.fetch;if(typeof globalThis<"u"&&globalThis.fetch)return globalThis.fetch;if(typeof fetch<"u")return fetch;ve("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static headers(){if(this.headersImpl)return this.headersImpl;if(typeof self<"u"&&"Headers"in self)return self.Headers;if(typeof globalThis<"u"&&globalThis.Headers)return globalThis.Headers;if(typeof Headers<"u")return Headers;ve("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static response(){if(this.responseImpl)return this.responseImpl;if(typeof self<"u"&&"Response"in self)return self.Response;if(typeof globalThis<"u"&&globalThis.Response)return globalThis.Response;if(typeof Response<"u")return Response;ve("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Sl={CREDENTIAL_MISMATCH:"custom-token-mismatch",MISSING_CUSTOM_TOKEN:"internal-error",INVALID_IDENTIFIER:"invalid-email",MISSING_CONTINUE_URI:"internal-error",INVALID_PASSWORD:"wrong-password",MISSING_PASSWORD:"missing-password",INVALID_LOGIN_CREDENTIALS:"invalid-credential",EMAIL_EXISTS:"email-already-in-use",PASSWORD_LOGIN_DISABLED:"operation-not-allowed",INVALID_IDP_RESPONSE:"invalid-credential",INVALID_PENDING_TOKEN:"invalid-credential",FEDERATED_USER_ID_ALREADY_LINKED:"credential-already-in-use",MISSING_REQ_TYPE:"internal-error",EMAIL_NOT_FOUND:"user-not-found",RESET_PASSWORD_EXCEED_LIMIT:"too-many-requests",EXPIRED_OOB_CODE:"expired-action-code",INVALID_OOB_CODE:"invalid-action-code",MISSING_OOB_CODE:"internal-error",CREDENTIAL_TOO_OLD_LOGIN_AGAIN:"requires-recent-login",INVALID_ID_TOKEN:"invalid-user-token",TOKEN_EXPIRED:"user-token-expired",USER_NOT_FOUND:"user-token-expired",TOO_MANY_ATTEMPTS_TRY_LATER:"too-many-requests",PASSWORD_DOES_NOT_MEET_REQUIREMENTS:"password-does-not-meet-requirements",INVALID_CODE:"invalid-verification-code",INVALID_SESSION_INFO:"invalid-verification-id",INVALID_TEMPORARY_PROOF:"invalid-credential",MISSING_SESSION_INFO:"missing-verification-id",SESSION_EXPIRED:"code-expired",MISSING_ANDROID_PACKAGE_NAME:"missing-android-pkg-name",UNAUTHORIZED_DOMAIN:"unauthorized-continue-uri",INVALID_OAUTH_CLIENT_ID:"invalid-oauth-client-id",ADMIN_ONLY_OPERATION:"admin-restricted-operation",INVALID_MFA_PENDING_CREDENTIAL:"invalid-multi-factor-session",MFA_ENROLLMENT_NOT_FOUND:"multi-factor-info-not-found",MISSING_MFA_ENROLLMENT_ID:"missing-multi-factor-info",MISSING_MFA_PENDING_CREDENTIAL:"missing-multi-factor-session",SECOND_FACTOR_EXISTS:"second-factor-already-in-use",SECOND_FACTOR_LIMIT_EXCEEDED:"maximum-second-factor-count-exceeded",BLOCKING_FUNCTION_ERROR_RESPONSE:"internal-error",RECAPTCHA_NOT_ENABLED:"recaptcha-not-enabled",MISSING_RECAPTCHA_TOKEN:"missing-recaptcha-token",INVALID_RECAPTCHA_TOKEN:"invalid-recaptcha-token",INVALID_RECAPTCHA_ACTION:"invalid-recaptcha-action",MISSING_CLIENT_TYPE:"missing-client-type",MISSING_RECAPTCHA_VERSION:"missing-recaptcha-version",INVALID_RECAPTCHA_VERSION:"invalid-recaptcha-version",INVALID_REQ_TYPE:"invalid-req-type"};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Cl=new xt(3e4,6e4);function Me(t,e){return t.tenantId&&!e.tenantId?Object.assign(Object.assign({},e),{tenantId:t.tenantId}):e}async function Ue(t,e,i,r,o={}){return Zs(t,o,async()=>{let c={},l={};r&&(e==="GET"?l=r:c={body:JSON.stringify(r)});const h=Ut(Object.assign({key:t.config.apiKey},l)).slice(1),g=await t._getAdditionalHeaders();g["Content-Type"]="application/json",t.languageCode&&(g["X-Firebase-Locale"]=t.languageCode);const E=Object.assign({method:e,headers:g},c);return Qa()||(E.referrerPolicy="no-referrer"),Qs.fetch()(eo(t,t.config.apiHost,i,h),E)})}async function Zs(t,e,i){t._canInitEmulator=!1;const r=Object.assign(Object.assign({},Sl),e);try{const o=new Rl(t),c=await Promise.race([i(),o.promise]);o.clearNetworkTimeout();const l=await c.json();if("needConfirmation"in l)throw on(t,"account-exists-with-different-credential",l);if(c.ok&&!("errorMessage"in l))return l;{const h=c.ok?l.errorMessage:l.error.message,[g,E]=h.split(" : ");if(g==="FEDERATED_USER_ID_ALREADY_LINKED")throw on(t,"credential-already-in-use",l);if(g==="EMAIL_EXISTS")throw on(t,"email-already-in-use",l);if(g==="USER_DISABLED")throw on(t,"user-disabled",l);const b=r[g]||g.toLowerCase().replace(/[_\s]+/g,"-");if(E)throw Ys(t,b,E);ae(t,b)}}catch(o){if(o instanceof ce)throw o;ae(t,"network-request-failed",{message:String(o)})}}async function Ft(t,e,i,r,o={}){const c=await Ue(t,e,i,r,o);return"mfaPendingCredential"in c&&ae(t,"multi-factor-auth-required",{_serverResponse:c}),c}function eo(t,e,i,r){const o=`${e}${i}?${r}`;return t.config.emulator?Ri(t.config,o):`${t.config.apiScheme}://${o}`}function Pl(t){switch(t){case"ENFORCE":return"ENFORCE";case"AUDIT":return"AUDIT";case"OFF":return"OFF";default:return"ENFORCEMENT_STATE_UNSPECIFIED"}}class Rl{constructor(e){this.auth=e,this.timer=null,this.promise=new Promise((i,r)=>{this.timer=setTimeout(()=>r(he(this.auth,"network-request-failed")),Cl.get())})}clearNetworkTimeout(){clearTimeout(this.timer)}}function on(t,e,i){const r={appName:t.name};i.email&&(r.email=i.email),i.phoneNumber&&(r.phoneNumber=i.phoneNumber);const o=he(t,e,r);return o.customData._tokenResponse=i,o}function es(t){return t!==void 0&&t.enterprise!==void 0}class kl{constructor(e){if(this.siteKey="",this.recaptchaEnforcementState=[],e.recaptchaKey===void 0)throw new Error("recaptchaKey undefined");this.siteKey=e.recaptchaKey.split("/")[3],this.recaptchaEnforcementState=e.recaptchaEnforcementState}getProviderEnforcementState(e){if(!this.recaptchaEnforcementState||this.recaptchaEnforcementState.length===0)return null;for(const i of this.recaptchaEnforcementState)if(i.provider&&i.provider===e)return Pl(i.enforcementState);return null}isProviderEnabled(e){return this.getProviderEnforcementState(e)==="ENFORCE"||this.getProviderEnforcementState(e)==="AUDIT"}}async function Ol(t,e){return Ue(t,"GET","/v2/recaptchaConfig",Me(t,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Dl(t,e){return Ue(t,"POST","/v1/accounts:delete",e)}async function to(t,e){return Ue(t,"POST","/v1/accounts:lookup",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Pt(t){if(t)try{const e=new Date(Number(t));if(!isNaN(e.getTime()))return e.toUTCString()}catch{}}async function Ll(t,e=!1){const i=le(t),r=await i.getIdToken(e),o=ki(r);A(o&&o.exp&&o.auth_time&&o.iat,i.auth,"internal-error");const c=typeof o.firebase=="object"?o.firebase:void 0,l=c==null?void 0:c.sign_in_provider;return{claims:o,token:r,authTime:Pt(ai(o.auth_time)),issuedAtTime:Pt(ai(o.iat)),expirationTime:Pt(ai(o.exp)),signInProvider:l||null,signInSecondFactor:(c==null?void 0:c.sign_in_second_factor)||null}}function ai(t){return Number(t)*1e3}function ki(t){const[e,i,r]=t.split(".");if(e===void 0||i===void 0||r===void 0)return ln("JWT malformed, contained fewer than 3 sections"),null;try{const o=Us(i);return o?JSON.parse(o):(ln("Failed to decode base64 JWT payload"),null)}catch(o){return ln("Caught error parsing JWT payload as JSON",o==null?void 0:o.toString()),null}}function ts(t){const e=ki(t);return A(e,"internal-error"),A(typeof e.exp<"u","internal-error"),A(typeof e.iat<"u","internal-error"),Number(e.exp)-Number(e.iat)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Nt(t,e,i=!1){if(i)return e;try{return await e}catch(r){throw r instanceof ce&&Nl(r)&&t.auth.currentUser===t&&await t.auth.signOut(),r}}function Nl({code:t}){return t==="auth/user-disabled"||t==="auth/user-token-expired"}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ml{constructor(e){this.user=e,this.isRunning=!1,this.timerId=null,this.errorBackoff=3e4}_start(){this.isRunning||(this.isRunning=!0,this.schedule())}_stop(){this.isRunning&&(this.isRunning=!1,this.timerId!==null&&clearTimeout(this.timerId))}getInterval(e){var i;if(e){const r=this.errorBackoff;return this.errorBackoff=Math.min(this.errorBackoff*2,96e4),r}else{this.errorBackoff=3e4;const o=((i=this.user.stsTokenManager.expirationTime)!==null&&i!==void 0?i:0)-Date.now()-3e5;return Math.max(0,o)}}schedule(e=!1){if(!this.isRunning)return;const i=this.getInterval(e);this.timerId=setTimeout(async()=>{await this.iteration()},i)}async iteration(){try{await this.user.getIdToken(!0)}catch(e){(e==null?void 0:e.code)==="auth/network-request-failed"&&this.schedule(!0);return}this.schedule()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ii{constructor(e,i){this.createdAt=e,this.lastLoginAt=i,this._initializeTime()}_initializeTime(){this.lastSignInTime=Pt(this.lastLoginAt),this.creationTime=Pt(this.createdAt)}_copy(e){this.createdAt=e.createdAt,this.lastLoginAt=e.lastLoginAt,this._initializeTime()}toJSON(){return{createdAt:this.createdAt,lastLoginAt:this.lastLoginAt}}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function mn(t){var e;const i=t.auth,r=await t.getIdToken(),o=await Nt(t,to(i,{idToken:r}));A(o==null?void 0:o.users.length,i,"internal-error");const c=o.users[0];t._notifyReloadListener(c);const l=!((e=c.providerUserInfo)===null||e===void 0)&&e.length?no(c.providerUserInfo):[],h=xl(t.providerData,l),g=t.isAnonymous,E=!(t.email&&c.passwordHash)&&!(h!=null&&h.length),b=g?E:!1,S={uid:c.localId,displayName:c.displayName||null,photoURL:c.photoUrl||null,email:c.email||null,emailVerified:c.emailVerified||!1,phoneNumber:c.phoneNumber||null,tenantId:c.tenantId||null,providerData:h,metadata:new Ii(c.createdAt,c.lastLoginAt),isAnonymous:b};Object.assign(t,S)}async function Ul(t){const e=le(t);await mn(e),await e.auth._persistUserIfCurrent(e),e.auth._notifyListenersIfCurrent(e)}function xl(t,e){return[...t.filter(r=>!e.some(o=>o.providerId===r.providerId)),...e]}function no(t){return t.map(e=>{var{providerId:i}=e,r=Ci(e,["providerId"]);return{providerId:i,uid:r.rawId||"",displayName:r.displayName||null,email:r.email||null,phoneNumber:r.phoneNumber||null,photoURL:r.photoUrl||null}})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Fl(t,e){const i=await Zs(t,{},async()=>{const r=Ut({grant_type:"refresh_token",refresh_token:e}).slice(1),{tokenApiHost:o,apiKey:c}=t.config,l=eo(t,o,"/v1/token",`key=${c}`),h=await t._getAdditionalHeaders();return h["Content-Type"]="application/x-www-form-urlencoded",Qs.fetch()(l,{method:"POST",headers:h,body:r})});return{accessToken:i.access_token,expiresIn:i.expires_in,refreshToken:i.refresh_token}}async function jl(t,e){return Ue(t,"POST","/v2/accounts:revokeToken",Me(t,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class nt{constructor(){this.refreshToken=null,this.accessToken=null,this.expirationTime=null}get isExpired(){return!this.expirationTime||Date.now()>this.expirationTime-3e4}updateFromServerResponse(e){A(e.idToken,"internal-error"),A(typeof e.idToken<"u","internal-error"),A(typeof e.refreshToken<"u","internal-error");const i="expiresIn"in e&&typeof e.expiresIn<"u"?Number(e.expiresIn):ts(e.idToken);this.updateTokensAndExpiration(e.idToken,e.refreshToken,i)}updateFromIdToken(e){A(e.length!==0,"internal-error");const i=ts(e);this.updateTokensAndExpiration(e,null,i)}async getToken(e,i=!1){return!i&&this.accessToken&&!this.isExpired?this.accessToken:(A(this.refreshToken,e,"user-token-expired"),this.refreshToken?(await this.refresh(e,this.refreshToken),this.accessToken):null)}clearRefreshToken(){this.refreshToken=null}async refresh(e,i){const{accessToken:r,refreshToken:o,expiresIn:c}=await Fl(e,i);this.updateTokensAndExpiration(r,o,Number(c))}updateTokensAndExpiration(e,i,r){this.refreshToken=i||null,this.accessToken=e||null,this.expirationTime=Date.now()+r*1e3}static fromJSON(e,i){const{refreshToken:r,accessToken:o,expirationTime:c}=i,l=new nt;return r&&(A(typeof r=="string","internal-error",{appName:e}),l.refreshToken=r),o&&(A(typeof o=="string","internal-error",{appName:e}),l.accessToken=o),c&&(A(typeof c=="number","internal-error",{appName:e}),l.expirationTime=c),l}toJSON(){return{refreshToken:this.refreshToken,accessToken:this.accessToken,expirationTime:this.expirationTime}}_assign(e){this.accessToken=e.accessToken,this.refreshToken=e.refreshToken,this.expirationTime=e.expirationTime}_clone(){return Object.assign(new nt,this.toJSON())}_performRefresh(){return ve("not implemented")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Pe(t,e){A(typeof t=="string"||typeof t>"u","internal-error",{appName:e})}class _e{constructor(e){var{uid:i,auth:r,stsTokenManager:o}=e,c=Ci(e,["uid","auth","stsTokenManager"]);this.providerId="firebase",this.proactiveRefresh=new Ml(this),this.reloadUserInfo=null,this.reloadListener=null,this.uid=i,this.auth=r,this.stsTokenManager=o,this.accessToken=o.accessToken,this.displayName=c.displayName||null,this.email=c.email||null,this.emailVerified=c.emailVerified||!1,this.phoneNumber=c.phoneNumber||null,this.photoURL=c.photoURL||null,this.isAnonymous=c.isAnonymous||!1,this.tenantId=c.tenantId||null,this.providerData=c.providerData?[...c.providerData]:[],this.metadata=new Ii(c.createdAt||void 0,c.lastLoginAt||void 0)}async getIdToken(e){const i=await Nt(this,this.stsTokenManager.getToken(this.auth,e));return A(i,this.auth,"internal-error"),this.accessToken!==i&&(this.accessToken=i,await this.auth._persistUserIfCurrent(this),this.auth._notifyListenersIfCurrent(this)),i}getIdTokenResult(e){return Ll(this,e)}reload(){return Ul(this)}_assign(e){this!==e&&(A(this.uid===e.uid,this.auth,"internal-error"),this.displayName=e.displayName,this.photoURL=e.photoURL,this.email=e.email,this.emailVerified=e.emailVerified,this.phoneNumber=e.phoneNumber,this.isAnonymous=e.isAnonymous,this.tenantId=e.tenantId,this.providerData=e.providerData.map(i=>Object.assign({},i)),this.metadata._copy(e.metadata),this.stsTokenManager._assign(e.stsTokenManager))}_clone(e){const i=new _e(Object.assign(Object.assign({},this),{auth:e,stsTokenManager:this.stsTokenManager._clone()}));return i.metadata._copy(this.metadata),i}_onReload(e){A(!this.reloadListener,this.auth,"internal-error"),this.reloadListener=e,this.reloadUserInfo&&(this._notifyReloadListener(this.reloadUserInfo),this.reloadUserInfo=null)}_notifyReloadListener(e){this.reloadListener?this.reloadListener(e):this.reloadUserInfo=e}_startProactiveRefresh(){this.proactiveRefresh._start()}_stopProactiveRefresh(){this.proactiveRefresh._stop()}async _updateTokensIfNecessary(e,i=!1){let r=!1;e.idToken&&e.idToken!==this.stsTokenManager.accessToken&&(this.stsTokenManager.updateFromServerResponse(e),r=!0),i&&await mn(this),await this.auth._persistUserIfCurrent(this),r&&this.auth._notifyListenersIfCurrent(this)}async delete(){if(ue(this.auth.app))return Promise.reject(we(this.auth));const e=await this.getIdToken();return await Nt(this,Dl(this.auth,{idToken:e})),this.stsTokenManager.clearRefreshToken(),this.auth.signOut()}toJSON(){return Object.assign(Object.assign({uid:this.uid,email:this.email||void 0,emailVerified:this.emailVerified,displayName:this.displayName||void 0,isAnonymous:this.isAnonymous,photoURL:this.photoURL||void 0,phoneNumber:this.phoneNumber||void 0,tenantId:this.tenantId||void 0,providerData:this.providerData.map(e=>Object.assign({},e)),stsTokenManager:this.stsTokenManager.toJSON(),_redirectEventId:this._redirectEventId},this.metadata.toJSON()),{apiKey:this.auth.config.apiKey,appName:this.auth.name})}get refreshToken(){return this.stsTokenManager.refreshToken||""}static _fromJSON(e,i){var r,o,c,l,h,g,E,b;const S=(r=i.displayName)!==null&&r!==void 0?r:void 0,C=(o=i.email)!==null&&o!==void 0?o:void 0,L=(c=i.phoneNumber)!==null&&c!==void 0?c:void 0,R=(l=i.photoURL)!==null&&l!==void 0?l:void 0,x=(h=i.tenantId)!==null&&h!==void 0?h:void 0,M=(g=i._redirectEventId)!==null&&g!==void 0?g:void 0,pe=(E=i.createdAt)!==null&&E!==void 0?E:void 0,Z=(b=i.lastLoginAt)!==null&&b!==void 0?b:void 0,{uid:j,emailVerified:ie,isAnonymous:xe,providerData:K,stsTokenManager:v}=i;A(j&&v,e,"internal-error");const d=nt.fromJSON(this.name,v);A(typeof j=="string",e,"internal-error"),Pe(S,e.name),Pe(C,e.name),A(typeof ie=="boolean",e,"internal-error"),A(typeof xe=="boolean",e,"internal-error"),Pe(L,e.name),Pe(R,e.name),Pe(x,e.name),Pe(M,e.name),Pe(pe,e.name),Pe(Z,e.name);const p=new _e({uid:j,auth:e,email:C,emailVerified:ie,displayName:S,isAnonymous:xe,photoURL:R,phoneNumber:L,tenantId:x,stsTokenManager:d,createdAt:pe,lastLoginAt:Z});return K&&Array.isArray(K)&&(p.providerData=K.map(m=>Object.assign({},m))),M&&(p._redirectEventId=M),p}static async _fromIdTokenResponse(e,i,r=!1){const o=new nt;o.updateFromServerResponse(i);const c=new _e({uid:i.localId,auth:e,stsTokenManager:o,isAnonymous:r});return await mn(c),c}static async _fromGetAccountInfoResponse(e,i,r){const o=i.users[0];A(o.localId!==void 0,"internal-error");const c=o.providerUserInfo!==void 0?no(o.providerUserInfo):[],l=!(o.email&&o.passwordHash)&&!(c!=null&&c.length),h=new nt;h.updateFromIdToken(r);const g=new _e({uid:o.localId,auth:e,stsTokenManager:h,isAnonymous:l}),E={uid:o.localId,displayName:o.displayName||null,photoURL:o.photoUrl||null,email:o.email||null,emailVerified:o.emailVerified||!1,phoneNumber:o.phoneNumber||null,tenantId:o.tenantId||null,providerData:c,metadata:new Ii(o.createdAt,o.lastLoginAt),isAnonymous:!(o.email&&o.passwordHash)&&!(c!=null&&c.length)};return Object.assign(g,E),g}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ns=new Map;function Ie(t){Te(t instanceof Function,"Expected a class definition");let e=ns.get(t);return e?(Te(e instanceof t,"Instance stored in cache mismatched with class"),e):(e=new t,ns.set(t,e),e)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class io{constructor(){this.type="NONE",this.storage={}}async _isAvailable(){return!0}async _set(e,i){this.storage[e]=i}async _get(e){const i=this.storage[e];return i===void 0?null:i}async _remove(e){delete this.storage[e]}_addListener(e,i){}_removeListener(e,i){}}io.type="NONE";const is=io;/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function un(t,e,i){return`firebase:${t}:${e}:${i}`}class it{constructor(e,i,r){this.persistence=e,this.auth=i,this.userKey=r;const{config:o,name:c}=this.auth;this.fullUserKey=un(this.userKey,o.apiKey,c),this.fullPersistenceKey=un("persistence",o.apiKey,c),this.boundEventHandler=i._onStorageEvent.bind(i),this.persistence._addListener(this.fullUserKey,this.boundEventHandler)}setCurrentUser(e){return this.persistence._set(this.fullUserKey,e.toJSON())}async getCurrentUser(){const e=await this.persistence._get(this.fullUserKey);return e?_e._fromJSON(this.auth,e):null}removeCurrentUser(){return this.persistence._remove(this.fullUserKey)}savePersistenceForRedirect(){return this.persistence._set(this.fullPersistenceKey,this.persistence.type)}async setPersistence(e){if(this.persistence===e)return;const i=await this.getCurrentUser();if(await this.removeCurrentUser(),this.persistence=e,i)return this.setCurrentUser(i)}delete(){this.persistence._removeListener(this.fullUserKey,this.boundEventHandler)}static async create(e,i,r="authUser"){if(!i.length)return new it(Ie(is),e,r);const o=(await Promise.all(i.map(async E=>{if(await E._isAvailable())return E}))).filter(E=>E);let c=o[0]||Ie(is);const l=un(r,e.config.apiKey,e.name);let h=null;for(const E of i)try{const b=await E._get(l);if(b){const S=_e._fromJSON(e,b);E!==c&&(h=S),c=E;break}}catch{}const g=o.filter(E=>E._shouldAllowMigration);return!c._shouldAllowMigration||!g.length?new it(c,e,r):(c=g[0],h&&await c._set(l,h.toJSON()),await Promise.all(i.map(async E=>{if(E!==c)try{await E._remove(l)}catch{}})),new it(c,e,r))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function rs(t){const e=t.toLowerCase();if(e.includes("opera/")||e.includes("opr/")||e.includes("opios/"))return"Opera";if(ao(e))return"IEMobile";if(e.includes("msie")||e.includes("trident/"))return"IE";if(e.includes("edge/"))return"Edge";if(ro(e))return"Firefox";if(e.includes("silk/"))return"Silk";if(lo(e))return"Blackberry";if(uo(e))return"Webos";if(so(e))return"Safari";if((e.includes("chrome/")||oo(e))&&!e.includes("edge/"))return"Chrome";if(co(e))return"Android";{const i=/([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/,r=t.match(i);if((r==null?void 0:r.length)===2)return r[1]}return"Other"}function ro(t=q()){return/firefox\//i.test(t)}function so(t=q()){const e=t.toLowerCase();return e.includes("safari/")&&!e.includes("chrome/")&&!e.includes("crios/")&&!e.includes("android")}function oo(t=q()){return/crios\//i.test(t)}function ao(t=q()){return/iemobile/i.test(t)}function co(t=q()){return/android/i.test(t)}function lo(t=q()){return/blackberry/i.test(t)}function uo(t=q()){return/webos/i.test(t)}function Oi(t=q()){return/iphone|ipad|ipod/i.test(t)||/macintosh/i.test(t)&&/mobile/i.test(t)}function Bl(t=q()){var e;return Oi(t)&&!!(!((e=window.navigator)===null||e===void 0)&&e.standalone)}function $l(){return ec()&&document.documentMode===10}function ho(t=q()){return Oi(t)||co(t)||uo(t)||lo(t)||/windows phone/i.test(t)||ao(t)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function fo(t,e=[]){let i;switch(t){case"Browser":i=rs(q());break;case"Worker":i=`${rs(q())}-${t}`;break;default:i=t}const r=e.length?e.join(","):"FirebaseCore-web";return`${i}/JsCore/${at}/${r}`}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Hl{constructor(e){this.auth=e,this.queue=[]}pushCallback(e,i){const r=c=>new Promise((l,h)=>{try{const g=e(c);l(g)}catch(g){h(g)}});r.onAbort=i,this.queue.push(r);const o=this.queue.length-1;return()=>{this.queue[o]=()=>Promise.resolve()}}async runMiddleware(e){if(this.auth.currentUser===e)return;const i=[];try{for(const r of this.queue)await r(e),r.onAbort&&i.push(r.onAbort)}catch(r){i.reverse();for(const o of i)try{o()}catch{}throw this.auth._errorFactory.create("login-blocked",{originalMessage:r==null?void 0:r.message})}}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Vl(t,e={}){return Ue(t,"GET","/v2/passwordPolicy",Me(t,e))}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const zl=6;class Wl{constructor(e){var i,r,o,c;const l=e.customStrengthOptions;this.customStrengthOptions={},this.customStrengthOptions.minPasswordLength=(i=l.minPasswordLength)!==null&&i!==void 0?i:zl,l.maxPasswordLength&&(this.customStrengthOptions.maxPasswordLength=l.maxPasswordLength),l.containsLowercaseCharacter!==void 0&&(this.customStrengthOptions.containsLowercaseLetter=l.containsLowercaseCharacter),l.containsUppercaseCharacter!==void 0&&(this.customStrengthOptions.containsUppercaseLetter=l.containsUppercaseCharacter),l.containsNumericCharacter!==void 0&&(this.customStrengthOptions.containsNumericCharacter=l.containsNumericCharacter),l.containsNonAlphanumericCharacter!==void 0&&(this.customStrengthOptions.containsNonAlphanumericCharacter=l.containsNonAlphanumericCharacter),this.enforcementState=e.enforcementState,this.enforcementState==="ENFORCEMENT_STATE_UNSPECIFIED"&&(this.enforcementState="OFF"),this.allowedNonAlphanumericCharacters=(o=(r=e.allowedNonAlphanumericCharacters)===null||r===void 0?void 0:r.join(""))!==null&&o!==void 0?o:"",this.forceUpgradeOnSignin=(c=e.forceUpgradeOnSignin)!==null&&c!==void 0?c:!1,this.schemaVersion=e.schemaVersion}validatePassword(e){var i,r,o,c,l,h;const g={isValid:!0,passwordPolicy:this};return this.validatePasswordLengthOptions(e,g),this.validatePasswordCharacterOptions(e,g),g.isValid&&(g.isValid=(i=g.meetsMinPasswordLength)!==null&&i!==void 0?i:!0),g.isValid&&(g.isValid=(r=g.meetsMaxPasswordLength)!==null&&r!==void 0?r:!0),g.isValid&&(g.isValid=(o=g.containsLowercaseLetter)!==null&&o!==void 0?o:!0),g.isValid&&(g.isValid=(c=g.containsUppercaseLetter)!==null&&c!==void 0?c:!0),g.isValid&&(g.isValid=(l=g.containsNumericCharacter)!==null&&l!==void 0?l:!0),g.isValid&&(g.isValid=(h=g.containsNonAlphanumericCharacter)!==null&&h!==void 0?h:!0),g}validatePasswordLengthOptions(e,i){const r=this.customStrengthOptions.minPasswordLength,o=this.customStrengthOptions.maxPasswordLength;r&&(i.meetsMinPasswordLength=e.length>=r),o&&(i.meetsMaxPasswordLength=e.length<=o)}validatePasswordCharacterOptions(e,i){this.updatePasswordCharacterOptionsStatuses(i,!1,!1,!1,!1);let r;for(let o=0;o<e.length;o++)r=e.charAt(o),this.updatePasswordCharacterOptionsStatuses(i,r>="a"&&r<="z",r>="A"&&r<="Z",r>="0"&&r<="9",this.allowedNonAlphanumericCharacters.includes(r))}updatePasswordCharacterOptionsStatuses(e,i,r,o,c){this.customStrengthOptions.containsLowercaseLetter&&(e.containsLowercaseLetter||(e.containsLowercaseLetter=i)),this.customStrengthOptions.containsUppercaseLetter&&(e.containsUppercaseLetter||(e.containsUppercaseLetter=r)),this.customStrengthOptions.containsNumericCharacter&&(e.containsNumericCharacter||(e.containsNumericCharacter=o)),this.customStrengthOptions.containsNonAlphanumericCharacter&&(e.containsNonAlphanumericCharacter||(e.containsNonAlphanumericCharacter=c))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Gl{constructor(e,i,r,o){this.app=e,this.heartbeatServiceProvider=i,this.appCheckServiceProvider=r,this.config=o,this.currentUser=null,this.emulatorConfig=null,this.operations=Promise.resolve(),this.authStateSubscription=new ss(this),this.idTokenSubscription=new ss(this),this.beforeStateQueue=new Hl(this),this.redirectUser=null,this.isProactiveRefreshEnabled=!1,this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION=1,this._canInitEmulator=!0,this._isInitialized=!1,this._deleted=!1,this._initializationPromise=null,this._popupRedirectResolver=null,this._errorFactory=Xs,this._agentRecaptchaConfig=null,this._tenantRecaptchaConfigs={},this._projectPasswordPolicy=null,this._tenantPasswordPolicies={},this.lastNotifiedUid=void 0,this.languageCode=null,this.tenantId=null,this.settings={appVerificationDisabledForTesting:!1},this.frameworks=[],this.name=e.name,this.clientVersion=o.sdkClientVersion}_initializeWithPersistence(e,i){return i&&(this._popupRedirectResolver=Ie(i)),this._initializationPromise=this.queue(async()=>{var r,o;if(!this._deleted&&(this.persistenceManager=await it.create(this,e),!this._deleted)){if(!((r=this._popupRedirectResolver)===null||r===void 0)&&r._shouldInitProactively)try{await this._popupRedirectResolver._initialize(this)}catch{}await this.initializeCurrentUser(i),this.lastNotifiedUid=((o=this.currentUser)===null||o===void 0?void 0:o.uid)||null,!this._deleted&&(this._isInitialized=!0)}}),this._initializationPromise}async _onStorageEvent(){if(this._deleted)return;const e=await this.assertedPersistence.getCurrentUser();if(!(!this.currentUser&&!e)){if(this.currentUser&&e&&this.currentUser.uid===e.uid){this._currentUser._assign(e),await this.currentUser.getIdToken();return}await this._updateCurrentUser(e,!0)}}async initializeCurrentUserFromIdToken(e){try{const i=await to(this,{idToken:e}),r=await _e._fromGetAccountInfoResponse(this,i,e);await this.directlySetCurrentUser(r)}catch(i){console.warn("FirebaseServerApp could not login user with provided authIdToken: ",i),await this.directlySetCurrentUser(null)}}async initializeCurrentUser(e){var i;if(ue(this.app)){const l=this.app.settings.authIdToken;return l?new Promise(h=>{setTimeout(()=>this.initializeCurrentUserFromIdToken(l).then(h,h))}):this.directlySetCurrentUser(null)}const r=await this.assertedPersistence.getCurrentUser();let o=r,c=!1;if(e&&this.config.authDomain){await this.getOrInitRedirectPersistenceManager();const l=(i=this.redirectUser)===null||i===void 0?void 0:i._redirectEventId,h=o==null?void 0:o._redirectEventId,g=await this.tryRedirectSignIn(e);(!l||l===h)&&(g!=null&&g.user)&&(o=g.user,c=!0)}if(!o)return this.directlySetCurrentUser(null);if(!o._redirectEventId){if(c)try{await this.beforeStateQueue.runMiddleware(o)}catch(l){o=r,this._popupRedirectResolver._overrideRedirectResult(this,()=>Promise.reject(l))}return o?this.reloadAndSetCurrentUserOrClear(o):this.directlySetCurrentUser(null)}return A(this._popupRedirectResolver,this,"argument-error"),await this.getOrInitRedirectPersistenceManager(),this.redirectUser&&this.redirectUser._redirectEventId===o._redirectEventId?this.directlySetCurrentUser(o):this.reloadAndSetCurrentUserOrClear(o)}async tryRedirectSignIn(e){let i=null;try{i=await this._popupRedirectResolver._completeRedirectFn(this,e,!0)}catch{await this._setRedirectUser(null)}return i}async reloadAndSetCurrentUserOrClear(e){try{await mn(e)}catch(i){if((i==null?void 0:i.code)!=="auth/network-request-failed")return this.directlySetCurrentUser(null)}return this.directlySetCurrentUser(e)}useDeviceLanguage(){this.languageCode=Al()}async _delete(){this._deleted=!0}async updateCurrentUser(e){if(ue(this.app))return Promise.reject(we(this));const i=e?le(e):null;return i&&A(i.auth.config.apiKey===this.config.apiKey,this,"invalid-user-token"),this._updateCurrentUser(i&&i._clone(this))}async _updateCurrentUser(e,i=!1){if(!this._deleted)return e&&A(this.tenantId===e.tenantId,this,"tenant-id-mismatch"),i||await this.beforeStateQueue.runMiddleware(e),this.queue(async()=>{await this.directlySetCurrentUser(e),this.notifyAuthListeners()})}async signOut(){return ue(this.app)?Promise.reject(we(this)):(await this.beforeStateQueue.runMiddleware(null),(this.redirectPersistenceManager||this._popupRedirectResolver)&&await this._setRedirectUser(null),this._updateCurrentUser(null,!0))}setPersistence(e){return ue(this.app)?Promise.reject(we(this)):this.queue(async()=>{await this.assertedPersistence.setPersistence(Ie(e))})}_getRecaptchaConfig(){return this.tenantId==null?this._agentRecaptchaConfig:this._tenantRecaptchaConfigs[this.tenantId]}async validatePassword(e){this._getPasswordPolicyInternal()||await this._updatePasswordPolicy();const i=this._getPasswordPolicyInternal();return i.schemaVersion!==this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION?Promise.reject(this._errorFactory.create("unsupported-password-policy-schema-version",{})):i.validatePassword(e)}_getPasswordPolicyInternal(){return this.tenantId===null?this._projectPasswordPolicy:this._tenantPasswordPolicies[this.tenantId]}async _updatePasswordPolicy(){const e=await Vl(this),i=new Wl(e);this.tenantId===null?this._projectPasswordPolicy=i:this._tenantPasswordPolicies[this.tenantId]=i}_getPersistence(){return this.assertedPersistence.persistence.type}_updateErrorMap(e){this._errorFactory=new qe("auth","Firebase",e())}onAuthStateChanged(e,i,r){return this.registerStateListener(this.authStateSubscription,e,i,r)}beforeAuthStateChanged(e,i){return this.beforeStateQueue.pushCallback(e,i)}onIdTokenChanged(e,i,r){return this.registerStateListener(this.idTokenSubscription,e,i,r)}authStateReady(){return new Promise((e,i)=>{if(this.currentUser)e();else{const r=this.onAuthStateChanged(()=>{r(),e()},i)}})}async revokeAccessToken(e){if(this.currentUser){const i=await this.currentUser.getIdToken(),r={providerId:"apple.com",tokenType:"ACCESS_TOKEN",token:e,idToken:i};this.tenantId!=null&&(r.tenantId=this.tenantId),await jl(this,r)}}toJSON(){var e;return{apiKey:this.config.apiKey,authDomain:this.config.authDomain,appName:this.name,currentUser:(e=this._currentUser)===null||e===void 0?void 0:e.toJSON()}}async _setRedirectUser(e,i){const r=await this.getOrInitRedirectPersistenceManager(i);return e===null?r.removeCurrentUser():r.setCurrentUser(e)}async getOrInitRedirectPersistenceManager(e){if(!this.redirectPersistenceManager){const i=e&&Ie(e)||this._popupRedirectResolver;A(i,this,"argument-error"),this.redirectPersistenceManager=await it.create(this,[Ie(i._redirectPersistence)],"redirectUser"),this.redirectUser=await this.redirectPersistenceManager.getCurrentUser()}return this.redirectPersistenceManager}async _redirectUserForId(e){var i,r;return this._isInitialized&&await this.queue(async()=>{}),((i=this._currentUser)===null||i===void 0?void 0:i._redirectEventId)===e?this._currentUser:((r=this.redirectUser)===null||r===void 0?void 0:r._redirectEventId)===e?this.redirectUser:null}async _persistUserIfCurrent(e){if(e===this.currentUser)return this.queue(async()=>this.directlySetCurrentUser(e))}_notifyListenersIfCurrent(e){e===this.currentUser&&this.notifyAuthListeners()}_key(){return`${this.config.authDomain}:${this.config.apiKey}:${this.name}`}_startProactiveRefresh(){this.isProactiveRefreshEnabled=!0,this.currentUser&&this._currentUser._startProactiveRefresh()}_stopProactiveRefresh(){this.isProactiveRefreshEnabled=!1,this.currentUser&&this._currentUser._stopProactiveRefresh()}get _currentUser(){return this.currentUser}notifyAuthListeners(){var e,i;if(!this._isInitialized)return;this.idTokenSubscription.next(this.currentUser);const r=(i=(e=this.currentUser)===null||e===void 0?void 0:e.uid)!==null&&i!==void 0?i:null;this.lastNotifiedUid!==r&&(this.lastNotifiedUid=r,this.authStateSubscription.next(this.currentUser))}registerStateListener(e,i,r,o){if(this._deleted)return()=>{};const c=typeof i=="function"?i:i.next.bind(i);let l=!1;const h=this._isInitialized?Promise.resolve():this._initializationPromise;if(A(h,this,"internal-error"),h.then(()=>{l||c(this.currentUser)}),typeof i=="function"){const g=e.addObserver(i,r,o);return()=>{l=!0,g()}}else{const g=e.addObserver(i);return()=>{l=!0,g()}}}async directlySetCurrentUser(e){this.currentUser&&this.currentUser!==e&&this._currentUser._stopProactiveRefresh(),e&&this.isProactiveRefreshEnabled&&e._startProactiveRefresh(),this.currentUser=e,e?await this.assertedPersistence.setCurrentUser(e):await this.assertedPersistence.removeCurrentUser()}queue(e){return this.operations=this.operations.then(e,e),this.operations}get assertedPersistence(){return A(this.persistenceManager,this,"internal-error"),this.persistenceManager}_logFramework(e){!e||this.frameworks.includes(e)||(this.frameworks.push(e),this.frameworks.sort(),this.clientVersion=fo(this.config.clientPlatform,this._getFrameworks()))}_getFrameworks(){return this.frameworks}async _getAdditionalHeaders(){var e;const i={"X-Client-Version":this.clientVersion};this.app.options.appId&&(i["X-Firebase-gmpid"]=this.app.options.appId);const r=await((e=this.heartbeatServiceProvider.getImmediate({optional:!0}))===null||e===void 0?void 0:e.getHeartbeatsHeader());r&&(i["X-Firebase-Client"]=r);const o=await this._getAppCheckToken();return o&&(i["X-Firebase-AppCheck"]=o),i}async _getAppCheckToken(){var e;const i=await((e=this.appCheckServiceProvider.getImmediate({optional:!0}))===null||e===void 0?void 0:e.getToken());return i!=null&&i.error&&El(`Error while retrieving App Check token: ${i.error}`),i==null?void 0:i.token}}function Je(t){return le(t)}class ss{constructor(e){this.auth=e,this.observer=null,this.addObserver=oc(i=>this.observer=i)}get next(){return A(this.observer,this.auth,"internal-error"),this.observer.next.bind(this.observer)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let An={async loadJS(){throw new Error("Unable to load external scripts")},recaptchaV2Script:"",recaptchaEnterpriseScript:"",gapiScript:""};function ql(t){An=t}function po(t){return An.loadJS(t)}function Kl(){return An.recaptchaEnterpriseScript}function Jl(){return An.gapiScript}function Xl(t){return`__${t}${Math.floor(Math.random()*1e6)}`}const Yl="recaptcha-enterprise",Ql="NO_RECAPTCHA";class Zl{constructor(e){this.type=Yl,this.auth=Je(e)}async verify(e="verify",i=!1){async function r(c){if(!i){if(c.tenantId==null&&c._agentRecaptchaConfig!=null)return c._agentRecaptchaConfig.siteKey;if(c.tenantId!=null&&c._tenantRecaptchaConfigs[c.tenantId]!==void 0)return c._tenantRecaptchaConfigs[c.tenantId].siteKey}return new Promise(async(l,h)=>{Ol(c,{clientType:"CLIENT_TYPE_WEB",version:"RECAPTCHA_ENTERPRISE"}).then(g=>{if(g.recaptchaKey===void 0)h(new Error("recaptcha Enterprise site key undefined"));else{const E=new kl(g);return c.tenantId==null?c._agentRecaptchaConfig=E:c._tenantRecaptchaConfigs[c.tenantId]=E,l(E.siteKey)}}).catch(g=>{h(g)})})}function o(c,l,h){const g=window.grecaptcha;es(g)?g.enterprise.ready(()=>{g.enterprise.execute(c,{action:e}).then(E=>{l(E)}).catch(()=>{l(Ql)})}):h(Error("No reCAPTCHA enterprise script loaded."))}return new Promise((c,l)=>{r(this.auth).then(h=>{if(!i&&es(window.grecaptcha))o(h,c,l);else{if(typeof window>"u"){l(new Error("RecaptchaVerifier is only supported in browser"));return}let g=Kl();g.length!==0&&(g+=h),po(g).then(()=>{o(h,c,l)}).catch(E=>{l(E)})}}).catch(h=>{l(h)})})}}async function os(t,e,i,r=!1){const o=new Zl(t);let c;try{c=await o.verify(i)}catch{c=await o.verify(i,!0)}const l=Object.assign({},e);return r?Object.assign(l,{captchaResp:c}):Object.assign(l,{captchaResponse:c}),Object.assign(l,{clientType:"CLIENT_TYPE_WEB"}),Object.assign(l,{recaptchaVersion:"RECAPTCHA_ENTERPRISE"}),l}async function wi(t,e,i,r){var o;if(!((o=t._getRecaptchaConfig())===null||o===void 0)&&o.isProviderEnabled("EMAIL_PASSWORD_PROVIDER")){const c=await os(t,e,i,i==="getOobCode");return r(t,c)}else return r(t,e).catch(async c=>{if(c.code==="auth/missing-recaptcha-token"){console.log(`${i} is protected by reCAPTCHA Enterprise for this project. Automatically triggering the reCAPTCHA flow and restarting the flow.`);const l=await os(t,e,i,i==="getOobCode");return r(t,l)}else return Promise.reject(c)})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function eu(t,e){const i=Ke(t,"auth");if(i.isInitialized()){const o=i.getImmediate(),c=i.getOptions();if(Dt(c,e??{}))return o;ae(o,"already-initialized")}return i.initialize({options:e})}function tu(t,e){const i=(e==null?void 0:e.persistence)||[],r=(Array.isArray(i)?i:[i]).map(Ie);e!=null&&e.errorMap&&t._updateErrorMap(e.errorMap),t._initializeWithPersistence(r,e==null?void 0:e.popupRedirectResolver)}function nu(t,e,i){const r=Je(t);A(r._canInitEmulator,r,"emulator-config-failed"),A(/^https?:\/\//.test(e),r,"invalid-emulator-scheme");const o=!1,c=go(e),{host:l,port:h}=iu(e),g=h===null?"":`:${h}`;r.config.emulator={url:`${c}//${l}${g}/`},r.settings.appVerificationDisabledForTesting=!0,r.emulatorConfig=Object.freeze({host:l,port:h,protocol:c.replace(":",""),options:Object.freeze({disableWarnings:o})}),ru()}function go(t){const e=t.indexOf(":");return e<0?"":t.substr(0,e+1)}function iu(t){const e=go(t),i=/(\/\/)?([^?#/]+)/.exec(t.substr(e.length));if(!i)return{host:"",port:null};const r=i[2].split("@").pop()||"",o=/^(\[[^\]]+\])(:|$)/.exec(r);if(o){const c=o[1];return{host:c,port:as(r.substr(c.length+1))}}else{const[c,l]=r.split(":");return{host:c,port:as(l)}}}function as(t){if(!t)return null;const e=Number(t);return isNaN(e)?null:e}function ru(){function t(){const e=document.createElement("p"),i=e.style;e.innerText="Running in emulator mode. Do not use with production credentials.",i.position="fixed",i.width="100%",i.backgroundColor="#ffffff",i.border=".1em solid #000000",i.color="#b50000",i.bottom="0px",i.left="0px",i.margin="0px",i.zIndex="10000",i.textAlign="center",e.classList.add("firebase-emulator-warning"),document.body.appendChild(e)}typeof console<"u"&&typeof console.info=="function"&&console.info("WARNING: You are using the Auth Emulator, which is intended for local testing only.  Do not use with production credentials."),typeof window<"u"&&typeof document<"u"&&(document.readyState==="loading"?window.addEventListener("DOMContentLoaded",t):t())}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Di{constructor(e,i){this.providerId=e,this.signInMethod=i}toJSON(){return ve("not implemented")}_getIdTokenResponse(e){return ve("not implemented")}_linkToIdToken(e,i){return ve("not implemented")}_getReauthenticationResolver(e){return ve("not implemented")}}async function su(t,e){return Ue(t,"POST","/v1/accounts:signUp",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function ou(t,e){return Ft(t,"POST","/v1/accounts:signInWithPassword",Me(t,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function au(t,e){return Ft(t,"POST","/v1/accounts:signInWithEmailLink",Me(t,e))}async function cu(t,e){return Ft(t,"POST","/v1/accounts:signInWithEmailLink",Me(t,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Mt extends Di{constructor(e,i,r,o=null){super("password",r),this._email=e,this._password=i,this._tenantId=o}static _fromEmailAndPassword(e,i){return new Mt(e,i,"password")}static _fromEmailAndCode(e,i,r=null){return new Mt(e,i,"emailLink",r)}toJSON(){return{email:this._email,password:this._password,signInMethod:this.signInMethod,tenantId:this._tenantId}}static fromJSON(e){const i=typeof e=="string"?JSON.parse(e):e;if(i!=null&&i.email&&(i!=null&&i.password)){if(i.signInMethod==="password")return this._fromEmailAndPassword(i.email,i.password);if(i.signInMethod==="emailLink")return this._fromEmailAndCode(i.email,i.password,i.tenantId)}return null}async _getIdTokenResponse(e){switch(this.signInMethod){case"password":const i={returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"};return wi(e,i,"signInWithPassword",ou);case"emailLink":return au(e,{email:this._email,oobCode:this._password});default:ae(e,"internal-error")}}async _linkToIdToken(e,i){switch(this.signInMethod){case"password":const r={idToken:i,returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"};return wi(e,r,"signUpPassword",su);case"emailLink":return cu(e,{idToken:i,email:this._email,oobCode:this._password});default:ae(e,"internal-error")}}_getReauthenticationResolver(e){return this._getIdTokenResponse(e)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function rt(t,e){return Ft(t,"POST","/v1/accounts:signInWithIdp",Me(t,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const lu="http://localhost";class Ve extends Di{constructor(){super(...arguments),this.pendingToken=null}static _fromParams(e){const i=new Ve(e.providerId,e.signInMethod);return e.idToken||e.accessToken?(e.idToken&&(i.idToken=e.idToken),e.accessToken&&(i.accessToken=e.accessToken),e.nonce&&!e.pendingToken&&(i.nonce=e.nonce),e.pendingToken&&(i.pendingToken=e.pendingToken)):e.oauthToken&&e.oauthTokenSecret?(i.accessToken=e.oauthToken,i.secret=e.oauthTokenSecret):ae("argument-error"),i}toJSON(){return{idToken:this.idToken,accessToken:this.accessToken,secret:this.secret,nonce:this.nonce,pendingToken:this.pendingToken,providerId:this.providerId,signInMethod:this.signInMethod}}static fromJSON(e){const i=typeof e=="string"?JSON.parse(e):e,{providerId:r,signInMethod:o}=i,c=Ci(i,["providerId","signInMethod"]);if(!r||!o)return null;const l=new Ve(r,o);return l.idToken=c.idToken||void 0,l.accessToken=c.accessToken||void 0,l.secret=c.secret,l.nonce=c.nonce,l.pendingToken=c.pendingToken||null,l}_getIdTokenResponse(e){const i=this.buildRequest();return rt(e,i)}_linkToIdToken(e,i){const r=this.buildRequest();return r.idToken=i,rt(e,r)}_getReauthenticationResolver(e){const i=this.buildRequest();return i.autoCreate=!1,rt(e,i)}buildRequest(){const e={requestUri:lu,returnSecureToken:!0};if(this.pendingToken)e.pendingToken=this.pendingToken;else{const i={};this.idToken&&(i.id_token=this.idToken),this.accessToken&&(i.access_token=this.accessToken),this.secret&&(i.oauth_token_secret=this.secret),i.providerId=this.providerId,this.nonce&&!this.pendingToken&&(i.nonce=this.nonce),e.postBody=Ut(i)}return e}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function uu(t){switch(t){case"recoverEmail":return"RECOVER_EMAIL";case"resetPassword":return"PASSWORD_RESET";case"signIn":return"EMAIL_SIGNIN";case"verifyEmail":return"VERIFY_EMAIL";case"verifyAndChangeEmail":return"VERIFY_AND_CHANGE_EMAIL";case"revertSecondFactorAddition":return"REVERT_SECOND_FACTOR_ADDITION";default:return null}}function hu(t){const e=St(Ct(t)).link,i=e?St(Ct(e)).deep_link_id:null,r=St(Ct(t)).deep_link_id;return(r?St(Ct(r)).link:null)||r||i||e||t}class Li{constructor(e){var i,r,o,c,l,h;const g=St(Ct(e)),E=(i=g.apiKey)!==null&&i!==void 0?i:null,b=(r=g.oobCode)!==null&&r!==void 0?r:null,S=uu((o=g.mode)!==null&&o!==void 0?o:null);A(E&&b&&S,"argument-error"),this.apiKey=E,this.operation=S,this.code=b,this.continueUrl=(c=g.continueUrl)!==null&&c!==void 0?c:null,this.languageCode=(l=g.languageCode)!==null&&l!==void 0?l:null,this.tenantId=(h=g.tenantId)!==null&&h!==void 0?h:null}static parseLink(e){const i=hu(e);try{return new Li(i)}catch{return null}}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ct{constructor(){this.providerId=ct.PROVIDER_ID}static credential(e,i){return Mt._fromEmailAndPassword(e,i)}static credentialWithLink(e,i){const r=Li.parseLink(i);return A(r,"argument-error"),Mt._fromEmailAndCode(e,r.code,r.tenantId)}}ct.PROVIDER_ID="password";ct.EMAIL_PASSWORD_SIGN_IN_METHOD="password";ct.EMAIL_LINK_SIGN_IN_METHOD="emailLink";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class mo{constructor(e){this.providerId=e,this.defaultLanguageCode=null,this.customParameters={}}setDefaultLanguage(e){this.defaultLanguageCode=e}setCustomParameters(e){return this.customParameters=e,this}getCustomParameters(){return this.customParameters}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class jt extends mo{constructor(){super(...arguments),this.scopes=[]}addScope(e){return this.scopes.includes(e)||this.scopes.push(e),this}getScopes(){return[...this.scopes]}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Re extends jt{constructor(){super("facebook.com")}static credential(e){return Ve._fromParams({providerId:Re.PROVIDER_ID,signInMethod:Re.FACEBOOK_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return Re.credentialFromTaggedObject(e)}static credentialFromError(e){return Re.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return Re.credential(e.oauthAccessToken)}catch{return null}}}Re.FACEBOOK_SIGN_IN_METHOD="facebook.com";Re.PROVIDER_ID="facebook.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ke extends jt{constructor(){super("google.com"),this.addScope("profile")}static credential(e,i){return Ve._fromParams({providerId:ke.PROVIDER_ID,signInMethod:ke.GOOGLE_SIGN_IN_METHOD,idToken:e,accessToken:i})}static credentialFromResult(e){return ke.credentialFromTaggedObject(e)}static credentialFromError(e){return ke.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthIdToken:i,oauthAccessToken:r}=e;if(!i&&!r)return null;try{return ke.credential(i,r)}catch{return null}}}ke.GOOGLE_SIGN_IN_METHOD="google.com";ke.PROVIDER_ID="google.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Oe extends jt{constructor(){super("github.com")}static credential(e){return Ve._fromParams({providerId:Oe.PROVIDER_ID,signInMethod:Oe.GITHUB_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return Oe.credentialFromTaggedObject(e)}static credentialFromError(e){return Oe.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return Oe.credential(e.oauthAccessToken)}catch{return null}}}Oe.GITHUB_SIGN_IN_METHOD="github.com";Oe.PROVIDER_ID="github.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class De extends jt{constructor(){super("twitter.com")}static credential(e,i){return Ve._fromParams({providerId:De.PROVIDER_ID,signInMethod:De.TWITTER_SIGN_IN_METHOD,oauthToken:e,oauthTokenSecret:i})}static credentialFromResult(e){return De.credentialFromTaggedObject(e)}static credentialFromError(e){return De.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthAccessToken:i,oauthTokenSecret:r}=e;if(!i||!r)return null;try{return De.credential(i,r)}catch{return null}}}De.TWITTER_SIGN_IN_METHOD="twitter.com";De.PROVIDER_ID="twitter.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function du(t,e){return Ft(t,"POST","/v1/accounts:signUp",Me(t,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ze{constructor(e){this.user=e.user,this.providerId=e.providerId,this._tokenResponse=e._tokenResponse,this.operationType=e.operationType}static async _fromIdTokenResponse(e,i,r,o=!1){const c=await _e._fromIdTokenResponse(e,r,o),l=cs(r);return new ze({user:c,providerId:l,_tokenResponse:r,operationType:i})}static async _forOperation(e,i,r){await e._updateTokensIfNecessary(r,!0);const o=cs(r);return new ze({user:e,providerId:o,_tokenResponse:r,operationType:i})}}function cs(t){return t.providerId?t.providerId:"phoneNumber"in t?"phone":null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class yn extends ce{constructor(e,i,r,o){var c;super(i.code,i.message),this.operationType=r,this.user=o,Object.setPrototypeOf(this,yn.prototype),this.customData={appName:e.name,tenantId:(c=e.tenantId)!==null&&c!==void 0?c:void 0,_serverResponse:i.customData._serverResponse,operationType:r}}static _fromErrorAndOperation(e,i,r,o){return new yn(e,i,r,o)}}function yo(t,e,i,r){return(e==="reauthenticate"?i._getReauthenticationResolver(t):i._getIdTokenResponse(t)).catch(c=>{throw c.code==="auth/multi-factor-auth-required"?yn._fromErrorAndOperation(t,c,e,r):c})}async function fu(t,e,i=!1){const r=await Nt(t,e._linkToIdToken(t.auth,await t.getIdToken()),i);return ze._forOperation(t,"link",r)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function pu(t,e,i=!1){const{auth:r}=t;if(ue(r.app))return Promise.reject(we(r));const o="reauthenticate";try{const c=await Nt(t,yo(r,o,e,t),i);A(c.idToken,r,"internal-error");const l=ki(c.idToken);A(l,r,"internal-error");const{sub:h}=l;return A(t.uid===h,r,"user-mismatch"),ze._forOperation(t,o,c)}catch(c){throw(c==null?void 0:c.code)==="auth/user-not-found"&&ae(r,"user-mismatch"),c}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function vo(t,e,i=!1){if(ue(t.app))return Promise.reject(we(t));const r="signIn",o=await yo(t,r,e),c=await ze._fromIdTokenResponse(t,r,o);return i||await t._updateCurrentUser(c.user),c}async function gu(t,e){return vo(Je(t),e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function _o(t){const e=Je(t);e._getPasswordPolicyInternal()&&await e._updatePasswordPolicy()}async function mu(t,e,i){if(ue(t.app))return Promise.reject(we(t));const r=Je(t),l=await wi(r,{returnSecureToken:!0,email:e,password:i,clientType:"CLIENT_TYPE_WEB"},"signUpPassword",du).catch(g=>{throw g.code==="auth/password-does-not-meet-requirements"&&_o(t),g}),h=await ze._fromIdTokenResponse(r,"signIn",l);return await r._updateCurrentUser(h.user),h}function yu(t,e,i){return ue(t.app)?Promise.reject(we(t)):gu(le(t),ct.credential(e,i)).catch(async r=>{throw r.code==="auth/password-does-not-meet-requirements"&&_o(t),r})}function vu(t,e,i,r){return le(t).onIdTokenChanged(e,i,r)}function _u(t,e,i){return le(t).beforeAuthStateChanged(e,i)}function Iu(t,e,i,r){return le(t).onAuthStateChanged(e,i,r)}function wu(t){return le(t).signOut()}const vn="__sak";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Io{constructor(e,i){this.storageRetriever=e,this.type=i}_isAvailable(){try{return this.storage?(this.storage.setItem(vn,"1"),this.storage.removeItem(vn),Promise.resolve(!0)):Promise.resolve(!1)}catch{return Promise.resolve(!1)}}_set(e,i){return this.storage.setItem(e,JSON.stringify(i)),Promise.resolve()}_get(e){const i=this.storage.getItem(e);return Promise.resolve(i?JSON.parse(i):null)}_remove(e){return this.storage.removeItem(e),Promise.resolve()}get storage(){return this.storageRetriever()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Eu=1e3,Tu=10;class wo extends Io{constructor(){super(()=>window.localStorage,"LOCAL"),this.boundEventHandler=(e,i)=>this.onStorageEvent(e,i),this.listeners={},this.localCache={},this.pollTimer=null,this.fallbackToPolling=ho(),this._shouldAllowMigration=!0}forAllChangedKeys(e){for(const i of Object.keys(this.listeners)){const r=this.storage.getItem(i),o=this.localCache[i];r!==o&&e(i,o,r)}}onStorageEvent(e,i=!1){if(!e.key){this.forAllChangedKeys((l,h,g)=>{this.notifyListeners(l,g)});return}const r=e.key;i?this.detachListener():this.stopPolling();const o=()=>{const l=this.storage.getItem(r);!i&&this.localCache[r]===l||this.notifyListeners(r,l)},c=this.storage.getItem(r);$l()&&c!==e.newValue&&e.newValue!==e.oldValue?setTimeout(o,Tu):o()}notifyListeners(e,i){this.localCache[e]=i;const r=this.listeners[e];if(r)for(const o of Array.from(r))o(i&&JSON.parse(i))}startPolling(){this.stopPolling(),this.pollTimer=setInterval(()=>{this.forAllChangedKeys((e,i,r)=>{this.onStorageEvent(new StorageEvent("storage",{key:e,oldValue:i,newValue:r}),!0)})},Eu)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}attachListener(){window.addEventListener("storage",this.boundEventHandler)}detachListener(){window.removeEventListener("storage",this.boundEventHandler)}_addListener(e,i){Object.keys(this.listeners).length===0&&(this.fallbackToPolling?this.startPolling():this.attachListener()),this.listeners[e]||(this.listeners[e]=new Set,this.localCache[e]=this.storage.getItem(e)),this.listeners[e].add(i)}_removeListener(e,i){this.listeners[e]&&(this.listeners[e].delete(i),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&(this.detachListener(),this.stopPolling())}async _set(e,i){await super._set(e,i),this.localCache[e]=JSON.stringify(i)}async _get(e){const i=await super._get(e);return this.localCache[e]=JSON.stringify(i),i}async _remove(e){await super._remove(e),delete this.localCache[e]}}wo.type="LOCAL";const bu=wo;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Eo extends Io{constructor(){super(()=>window.sessionStorage,"SESSION")}_addListener(e,i){}_removeListener(e,i){}}Eo.type="SESSION";const To=Eo;/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Au(t){return Promise.all(t.map(async e=>{try{return{fulfilled:!0,value:await e}}catch(i){return{fulfilled:!1,reason:i}}}))}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Sn{constructor(e){this.eventTarget=e,this.handlersMap={},this.boundEventHandler=this.handleEvent.bind(this)}static _getInstance(e){const i=this.receivers.find(o=>o.isListeningto(e));if(i)return i;const r=new Sn(e);return this.receivers.push(r),r}isListeningto(e){return this.eventTarget===e}async handleEvent(e){const i=e,{eventId:r,eventType:o,data:c}=i.data,l=this.handlersMap[o];if(!(l!=null&&l.size))return;i.ports[0].postMessage({status:"ack",eventId:r,eventType:o});const h=Array.from(l).map(async E=>E(i.origin,c)),g=await Au(h);i.ports[0].postMessage({status:"done",eventId:r,eventType:o,response:g})}_subscribe(e,i){Object.keys(this.handlersMap).length===0&&this.eventTarget.addEventListener("message",this.boundEventHandler),this.handlersMap[e]||(this.handlersMap[e]=new Set),this.handlersMap[e].add(i)}_unsubscribe(e,i){this.handlersMap[e]&&i&&this.handlersMap[e].delete(i),(!i||this.handlersMap[e].size===0)&&delete this.handlersMap[e],Object.keys(this.handlersMap).length===0&&this.eventTarget.removeEventListener("message",this.boundEventHandler)}}Sn.receivers=[];/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ni(t="",e=10){let i="";for(let r=0;r<e;r++)i+=Math.floor(Math.random()*10);return t+i}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Su{constructor(e){this.target=e,this.handlers=new Set}removeMessageHandler(e){e.messageChannel&&(e.messageChannel.port1.removeEventListener("message",e.onMessage),e.messageChannel.port1.close()),this.handlers.delete(e)}async _send(e,i,r=50){const o=typeof MessageChannel<"u"?new MessageChannel:null;if(!o)throw new Error("connection_unavailable");let c,l;return new Promise((h,g)=>{const E=Ni("",20);o.port1.start();const b=setTimeout(()=>{g(new Error("unsupported_event"))},r);l={messageChannel:o,onMessage(S){const C=S;if(C.data.eventId===E)switch(C.data.status){case"ack":clearTimeout(b),c=setTimeout(()=>{g(new Error("timeout"))},3e3);break;case"done":clearTimeout(c),h(C.data.response);break;default:clearTimeout(b),clearTimeout(c),g(new Error("invalid_response"));break}}},this.handlers.add(l),o.port1.addEventListener("message",l.onMessage),this.target.postMessage({eventType:e,eventId:E,data:i},[o.port2])}).finally(()=>{l&&this.removeMessageHandler(l)})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function de(){return window}function Cu(t){de().location.href=t}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function bo(){return typeof de().WorkerGlobalScope<"u"&&typeof de().importScripts=="function"}async function Pu(){if(!(navigator!=null&&navigator.serviceWorker))return null;try{return(await navigator.serviceWorker.ready).active}catch{return null}}function Ru(){var t;return((t=navigator==null?void 0:navigator.serviceWorker)===null||t===void 0?void 0:t.controller)||null}function ku(){return bo()?self:null}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ao="firebaseLocalStorageDb",Ou=1,_n="firebaseLocalStorage",So="fbase_key";class Bt{constructor(e){this.request=e}toPromise(){return new Promise((e,i)=>{this.request.addEventListener("success",()=>{e(this.request.result)}),this.request.addEventListener("error",()=>{i(this.request.error)})})}}function Cn(t,e){return t.transaction([_n],e?"readwrite":"readonly").objectStore(_n)}function Du(){const t=indexedDB.deleteDatabase(Ao);return new Bt(t).toPromise()}function Ei(){const t=indexedDB.open(Ao,Ou);return new Promise((e,i)=>{t.addEventListener("error",()=>{i(t.error)}),t.addEventListener("upgradeneeded",()=>{const r=t.result;try{r.createObjectStore(_n,{keyPath:So})}catch(o){i(o)}}),t.addEventListener("success",async()=>{const r=t.result;r.objectStoreNames.contains(_n)?e(r):(r.close(),await Du(),e(await Ei()))})})}async function ls(t,e,i){const r=Cn(t,!0).put({[So]:e,value:i});return new Bt(r).toPromise()}async function Lu(t,e){const i=Cn(t,!1).get(e),r=await new Bt(i).toPromise();return r===void 0?null:r.value}function us(t,e){const i=Cn(t,!0).delete(e);return new Bt(i).toPromise()}const Nu=800,Mu=3;class Co{constructor(){this.type="LOCAL",this._shouldAllowMigration=!0,this.listeners={},this.localCache={},this.pollTimer=null,this.pendingWrites=0,this.receiver=null,this.sender=null,this.serviceWorkerReceiverAvailable=!1,this.activeServiceWorker=null,this._workerInitializationPromise=this.initializeServiceWorkerMessaging().then(()=>{},()=>{})}async _openDb(){return this.db?this.db:(this.db=await Ei(),this.db)}async _withRetries(e){let i=0;for(;;)try{const r=await this._openDb();return await e(r)}catch(r){if(i++>Mu)throw r;this.db&&(this.db.close(),this.db=void 0)}}async initializeServiceWorkerMessaging(){return bo()?this.initializeReceiver():this.initializeSender()}async initializeReceiver(){this.receiver=Sn._getInstance(ku()),this.receiver._subscribe("keyChanged",async(e,i)=>({keyProcessed:(await this._poll()).includes(i.key)})),this.receiver._subscribe("ping",async(e,i)=>["keyChanged"])}async initializeSender(){var e,i;if(this.activeServiceWorker=await Pu(),!this.activeServiceWorker)return;this.sender=new Su(this.activeServiceWorker);const r=await this.sender._send("ping",{},800);r&&!((e=r[0])===null||e===void 0)&&e.fulfilled&&!((i=r[0])===null||i===void 0)&&i.value.includes("keyChanged")&&(this.serviceWorkerReceiverAvailable=!0)}async notifyServiceWorker(e){if(!(!this.sender||!this.activeServiceWorker||Ru()!==this.activeServiceWorker))try{await this.sender._send("keyChanged",{key:e},this.serviceWorkerReceiverAvailable?800:50)}catch{}}async _isAvailable(){try{if(!indexedDB)return!1;const e=await Ei();return await ls(e,vn,"1"),await us(e,vn),!0}catch{}return!1}async _withPendingWrite(e){this.pendingWrites++;try{await e()}finally{this.pendingWrites--}}async _set(e,i){return this._withPendingWrite(async()=>(await this._withRetries(r=>ls(r,e,i)),this.localCache[e]=i,this.notifyServiceWorker(e)))}async _get(e){const i=await this._withRetries(r=>Lu(r,e));return this.localCache[e]=i,i}async _remove(e){return this._withPendingWrite(async()=>(await this._withRetries(i=>us(i,e)),delete this.localCache[e],this.notifyServiceWorker(e)))}async _poll(){const e=await this._withRetries(o=>{const c=Cn(o,!1).getAll();return new Bt(c).toPromise()});if(!e)return[];if(this.pendingWrites!==0)return[];const i=[],r=new Set;if(e.length!==0)for(const{fbase_key:o,value:c}of e)r.add(o),JSON.stringify(this.localCache[o])!==JSON.stringify(c)&&(this.notifyListeners(o,c),i.push(o));for(const o of Object.keys(this.localCache))this.localCache[o]&&!r.has(o)&&(this.notifyListeners(o,null),i.push(o));return i}notifyListeners(e,i){this.localCache[e]=i;const r=this.listeners[e];if(r)for(const o of Array.from(r))o(i)}startPolling(){this.stopPolling(),this.pollTimer=setInterval(async()=>this._poll(),Nu)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}_addListener(e,i){Object.keys(this.listeners).length===0&&this.startPolling(),this.listeners[e]||(this.listeners[e]=new Set,this._get(e)),this.listeners[e].add(i)}_removeListener(e,i){this.listeners[e]&&(this.listeners[e].delete(i),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&this.stopPolling()}}Co.type="LOCAL";const Uu=Co;new xt(3e4,6e4);/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function xu(t,e){return e?Ie(e):(A(t._popupRedirectResolver,t,"argument-error"),t._popupRedirectResolver)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Mi extends Di{constructor(e){super("custom","custom"),this.params=e}_getIdTokenResponse(e){return rt(e,this._buildIdpRequest())}_linkToIdToken(e,i){return rt(e,this._buildIdpRequest(i))}_getReauthenticationResolver(e){return rt(e,this._buildIdpRequest())}_buildIdpRequest(e){const i={requestUri:this.params.requestUri,sessionId:this.params.sessionId,postBody:this.params.postBody,tenantId:this.params.tenantId,pendingToken:this.params.pendingToken,returnSecureToken:!0,returnIdpCredential:!0};return e&&(i.idToken=e),i}}function Fu(t){return vo(t.auth,new Mi(t),t.bypassAuthState)}function ju(t){const{auth:e,user:i}=t;return A(i,e,"internal-error"),pu(i,new Mi(t),t.bypassAuthState)}async function Bu(t){const{auth:e,user:i}=t;return A(i,e,"internal-error"),fu(i,new Mi(t),t.bypassAuthState)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Po{constructor(e,i,r,o,c=!1){this.auth=e,this.resolver=r,this.user=o,this.bypassAuthState=c,this.pendingPromise=null,this.eventManager=null,this.filter=Array.isArray(i)?i:[i]}execute(){return new Promise(async(e,i)=>{this.pendingPromise={resolve:e,reject:i};try{this.eventManager=await this.resolver._initialize(this.auth),await this.onExecution(),this.eventManager.registerConsumer(this)}catch(r){this.reject(r)}})}async onAuthEvent(e){const{urlResponse:i,sessionId:r,postBody:o,tenantId:c,error:l,type:h}=e;if(l){this.reject(l);return}const g={auth:this.auth,requestUri:i,sessionId:r,tenantId:c||void 0,postBody:o||void 0,user:this.user,bypassAuthState:this.bypassAuthState};try{this.resolve(await this.getIdpTask(h)(g))}catch(E){this.reject(E)}}onError(e){this.reject(e)}getIdpTask(e){switch(e){case"signInViaPopup":case"signInViaRedirect":return Fu;case"linkViaPopup":case"linkViaRedirect":return Bu;case"reauthViaPopup":case"reauthViaRedirect":return ju;default:ae(this.auth,"internal-error")}}resolve(e){Te(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.resolve(e),this.unregisterAndCleanUp()}reject(e){Te(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.reject(e),this.unregisterAndCleanUp()}unregisterAndCleanUp(){this.eventManager&&this.eventManager.unregisterConsumer(this),this.pendingPromise=null,this.cleanUp()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const $u=new xt(2e3,1e4);class tt extends Po{constructor(e,i,r,o,c){super(e,i,o,c),this.provider=r,this.authWindow=null,this.pollId=null,tt.currentPopupAction&&tt.currentPopupAction.cancel(),tt.currentPopupAction=this}async executeNotNull(){const e=await this.execute();return A(e,this.auth,"internal-error"),e}async onExecution(){Te(this.filter.length===1,"Popup operations only handle one event");const e=Ni();this.authWindow=await this.resolver._openPopup(this.auth,this.provider,this.filter[0],e),this.authWindow.associatedEvent=e,this.resolver._originValidation(this.auth).catch(i=>{this.reject(i)}),this.resolver._isIframeWebStorageSupported(this.auth,i=>{i||this.reject(he(this.auth,"web-storage-unsupported"))}),this.pollUserCancellation()}get eventId(){var e;return((e=this.authWindow)===null||e===void 0?void 0:e.associatedEvent)||null}cancel(){this.reject(he(this.auth,"cancelled-popup-request"))}cleanUp(){this.authWindow&&this.authWindow.close(),this.pollId&&window.clearTimeout(this.pollId),this.authWindow=null,this.pollId=null,tt.currentPopupAction=null}pollUserCancellation(){const e=()=>{var i,r;if(!((r=(i=this.authWindow)===null||i===void 0?void 0:i.window)===null||r===void 0)&&r.closed){this.pollId=window.setTimeout(()=>{this.pollId=null,this.reject(he(this.auth,"popup-closed-by-user"))},8e3);return}this.pollId=window.setTimeout(e,$u.get())};e()}}tt.currentPopupAction=null;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Hu="pendingRedirect",hn=new Map;class Vu extends Po{constructor(e,i,r=!1){super(e,["signInViaRedirect","linkViaRedirect","reauthViaRedirect","unknown"],i,void 0,r),this.eventId=null}async execute(){let e=hn.get(this.auth._key());if(!e){try{const r=await zu(this.resolver,this.auth)?await super.execute():null;e=()=>Promise.resolve(r)}catch(i){e=()=>Promise.reject(i)}hn.set(this.auth._key(),e)}return this.bypassAuthState||hn.set(this.auth._key(),()=>Promise.resolve(null)),e()}async onAuthEvent(e){if(e.type==="signInViaRedirect")return super.onAuthEvent(e);if(e.type==="unknown"){this.resolve(null);return}if(e.eventId){const i=await this.auth._redirectUserForId(e.eventId);if(i)return this.user=i,super.onAuthEvent(e);this.resolve(null)}}async onExecution(){}cleanUp(){}}async function zu(t,e){const i=qu(e),r=Gu(t);if(!await r._isAvailable())return!1;const o=await r._get(i)==="true";return await r._remove(i),o}function Wu(t,e){hn.set(t._key(),e)}function Gu(t){return Ie(t._redirectPersistence)}function qu(t){return un(Hu,t.config.apiKey,t.name)}async function Ku(t,e,i=!1){if(ue(t.app))return Promise.reject(we(t));const r=Je(t),o=xu(r,e),l=await new Vu(r,o,i).execute();return l&&!i&&(delete l.user._redirectEventId,await r._persistUserIfCurrent(l.user),await r._setRedirectUser(null,e)),l}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ju=10*60*1e3;class Xu{constructor(e){this.auth=e,this.cachedEventUids=new Set,this.consumers=new Set,this.queuedRedirectEvent=null,this.hasHandledPotentialRedirect=!1,this.lastProcessedEventTime=Date.now()}registerConsumer(e){this.consumers.add(e),this.queuedRedirectEvent&&this.isEventForConsumer(this.queuedRedirectEvent,e)&&(this.sendToConsumer(this.queuedRedirectEvent,e),this.saveEventToCache(this.queuedRedirectEvent),this.queuedRedirectEvent=null)}unregisterConsumer(e){this.consumers.delete(e)}onEvent(e){if(this.hasEventBeenHandled(e))return!1;let i=!1;return this.consumers.forEach(r=>{this.isEventForConsumer(e,r)&&(i=!0,this.sendToConsumer(e,r),this.saveEventToCache(e))}),this.hasHandledPotentialRedirect||!Yu(e)||(this.hasHandledPotentialRedirect=!0,i||(this.queuedRedirectEvent=e,i=!0)),i}sendToConsumer(e,i){var r;if(e.error&&!Ro(e)){const o=((r=e.error.code)===null||r===void 0?void 0:r.split("auth/")[1])||"internal-error";i.onError(he(this.auth,o))}else i.onAuthEvent(e)}isEventForConsumer(e,i){const r=i.eventId===null||!!e.eventId&&e.eventId===i.eventId;return i.filter.includes(e.type)&&r}hasEventBeenHandled(e){return Date.now()-this.lastProcessedEventTime>=Ju&&this.cachedEventUids.clear(),this.cachedEventUids.has(hs(e))}saveEventToCache(e){this.cachedEventUids.add(hs(e)),this.lastProcessedEventTime=Date.now()}}function hs(t){return[t.type,t.eventId,t.sessionId,t.tenantId].filter(e=>e).join("-")}function Ro({type:t,error:e}){return t==="unknown"&&(e==null?void 0:e.code)==="auth/no-auth-event"}function Yu(t){switch(t.type){case"signInViaRedirect":case"linkViaRedirect":case"reauthViaRedirect":return!0;case"unknown":return Ro(t);default:return!1}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Qu(t,e={}){return Ue(t,"GET","/v1/projects",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Zu=/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,eh=/^https?/;async function th(t){if(t.config.emulator)return;const{authorizedDomains:e}=await Qu(t);for(const i of e)try{if(nh(i))return}catch{}ae(t,"unauthorized-domain")}function nh(t){const e=_i(),{protocol:i,hostname:r}=new URL(e);if(t.startsWith("chrome-extension://")){const l=new URL(t);return l.hostname===""&&r===""?i==="chrome-extension:"&&t.replace("chrome-extension://","")===e.replace("chrome-extension://",""):i==="chrome-extension:"&&l.hostname===r}if(!eh.test(i))return!1;if(Zu.test(t))return r===t;const o=t.replace(/\./g,"\\.");return new RegExp("^(.+\\."+o+"|"+o+")$","i").test(r)}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ih=new xt(3e4,6e4);function ds(){const t=de().___jsl;if(t!=null&&t.H){for(const e of Object.keys(t.H))if(t.H[e].r=t.H[e].r||[],t.H[e].L=t.H[e].L||[],t.H[e].r=[...t.H[e].L],t.CP)for(let i=0;i<t.CP.length;i++)t.CP[i]=null}}function rh(t){return new Promise((e,i)=>{var r,o,c;function l(){ds(),gapi.load("gapi.iframes",{callback:()=>{e(gapi.iframes.getContext())},ontimeout:()=>{ds(),i(he(t,"network-request-failed"))},timeout:ih.get()})}if(!((o=(r=de().gapi)===null||r===void 0?void 0:r.iframes)===null||o===void 0)&&o.Iframe)e(gapi.iframes.getContext());else if(!((c=de().gapi)===null||c===void 0)&&c.load)l();else{const h=Xl("iframefcb");return de()[h]=()=>{gapi.load?l():i(he(t,"network-request-failed"))},po(`${Jl()}?onload=${h}`).catch(g=>i(g))}}).catch(e=>{throw dn=null,e})}let dn=null;function sh(t){return dn=dn||rh(t),dn}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const oh=new xt(5e3,15e3),ah="__/auth/iframe",ch="emulator/auth/iframe",lh={style:{position:"absolute",top:"-100px",width:"1px",height:"1px"},"aria-hidden":"true",tabindex:"-1"},uh=new Map([["identitytoolkit.googleapis.com","p"],["staging-identitytoolkit.sandbox.googleapis.com","s"],["test-identitytoolkit.sandbox.googleapis.com","t"]]);function hh(t){const e=t.config;A(e.authDomain,t,"auth-domain-config-required");const i=e.emulator?Ri(e,ch):`https://${t.config.authDomain}/${ah}`,r={apiKey:e.apiKey,appName:t.name,v:at},o=uh.get(t.config.apiHost);o&&(r.eid=o);const c=t._getFrameworks();return c.length&&(r.fw=c.join(",")),`${i}?${Ut(r).slice(1)}`}async function dh(t){const e=await sh(t),i=de().gapi;return A(i,t,"internal-error"),e.open({where:document.body,url:hh(t),messageHandlersFilter:i.iframes.CROSS_ORIGIN_IFRAMES_FILTER,attributes:lh,dontclear:!0},r=>new Promise(async(o,c)=>{await r.restyle({setHideOnLeave:!1});const l=he(t,"network-request-failed"),h=de().setTimeout(()=>{c(l)},oh.get());function g(){de().clearTimeout(h),o(r)}r.ping(g).then(g,()=>{c(l)})}))}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const fh={location:"yes",resizable:"yes",statusbar:"yes",toolbar:"no"},ph=500,gh=600,mh="_blank",yh="http://localhost";class fs{constructor(e){this.window=e,this.associatedEvent=null}close(){if(this.window)try{this.window.close()}catch{}}}function vh(t,e,i,r=ph,o=gh){const c=Math.max((window.screen.availHeight-o)/2,0).toString(),l=Math.max((window.screen.availWidth-r)/2,0).toString();let h="";const g=Object.assign(Object.assign({},fh),{width:r.toString(),height:o.toString(),top:c,left:l}),E=q().toLowerCase();i&&(h=oo(E)?mh:i),ro(E)&&(e=e||yh,g.scrollbars="yes");const b=Object.entries(g).reduce((C,[L,R])=>`${C}${L}=${R},`,"");if(Bl(E)&&h!=="_self")return _h(e||"",h),new fs(null);const S=window.open(e||"",h,b);A(S,t,"popup-blocked");try{S.focus()}catch{}return new fs(S)}function _h(t,e){const i=document.createElement("a");i.href=t,i.target=e;const r=document.createEvent("MouseEvent");r.initMouseEvent("click",!0,!0,window,1,0,0,0,0,!1,!1,!1,!1,1,null),i.dispatchEvent(r)}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ih="__/auth/handler",wh="emulator/auth/handler",Eh=encodeURIComponent("fac");async function ps(t,e,i,r,o,c){A(t.config.authDomain,t,"auth-domain-config-required"),A(t.config.apiKey,t,"invalid-api-key");const l={apiKey:t.config.apiKey,appName:t.name,authType:i,redirectUrl:r,v:at,eventId:o};if(e instanceof mo){e.setDefaultLanguage(t.languageCode),l.providerId=e.providerId||"",sc(e.getCustomParameters())||(l.customParameters=JSON.stringify(e.getCustomParameters()));for(const[b,S]of Object.entries({}))l[b]=S}if(e instanceof jt){const b=e.getScopes().filter(S=>S!=="");b.length>0&&(l.scopes=b.join(","))}t.tenantId&&(l.tid=t.tenantId);const h=l;for(const b of Object.keys(h))h[b]===void 0&&delete h[b];const g=await t._getAppCheckToken(),E=g?`#${Eh}=${encodeURIComponent(g)}`:"";return`${Th(t)}?${Ut(h).slice(1)}${E}`}function Th({config:t}){return t.emulator?Ri(t,wh):`https://${t.authDomain}/${Ih}`}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ci="webStorageSupport";class bh{constructor(){this.eventManagers={},this.iframes={},this.originValidationPromises={},this._redirectPersistence=To,this._completeRedirectFn=Ku,this._overrideRedirectResult=Wu}async _openPopup(e,i,r,o){var c;Te((c=this.eventManagers[e._key()])===null||c===void 0?void 0:c.manager,"_initialize() not called before _openPopup()");const l=await ps(e,i,r,_i(),o);return vh(e,l,Ni())}async _openRedirect(e,i,r,o){await this._originValidation(e);const c=await ps(e,i,r,_i(),o);return Cu(c),new Promise(()=>{})}_initialize(e){const i=e._key();if(this.eventManagers[i]){const{manager:o,promise:c}=this.eventManagers[i];return o?Promise.resolve(o):(Te(c,"If manager is not set, promise should be"),c)}const r=this.initAndGetManager(e);return this.eventManagers[i]={promise:r},r.catch(()=>{delete this.eventManagers[i]}),r}async initAndGetManager(e){const i=await dh(e),r=new Xu(e);return i.register("authEvent",o=>(A(o==null?void 0:o.authEvent,e,"invalid-auth-event"),{status:r.onEvent(o.authEvent)?"ACK":"ERROR"}),gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER),this.eventManagers[e._key()]={manager:r},this.iframes[e._key()]=i,r}_isIframeWebStorageSupported(e,i){this.iframes[e._key()].send(ci,{type:ci},o=>{var c;const l=(c=o==null?void 0:o[0])===null||c===void 0?void 0:c[ci];l!==void 0&&i(!!l),ae(e,"internal-error")},gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER)}_originValidation(e){const i=e._key();return this.originValidationPromises[i]||(this.originValidationPromises[i]=th(e)),this.originValidationPromises[i]}get _shouldInitProactively(){return ho()||so()||Oi()}}const Ah=bh;var gs="@firebase/auth",ms="1.7.9";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Sh{constructor(e){this.auth=e,this.internalListeners=new Map}getUid(){var e;return this.assertAuthConfigured(),((e=this.auth.currentUser)===null||e===void 0?void 0:e.uid)||null}async getToken(e){return this.assertAuthConfigured(),await this.auth._initializationPromise,this.auth.currentUser?{accessToken:await this.auth.currentUser.getIdToken(e)}:null}addAuthTokenListener(e){if(this.assertAuthConfigured(),this.internalListeners.has(e))return;const i=this.auth.onIdTokenChanged(r=>{e((r==null?void 0:r.stsTokenManager.accessToken)||null)});this.internalListeners.set(e,i),this.updateProactiveRefresh()}removeAuthTokenListener(e){this.assertAuthConfigured();const i=this.internalListeners.get(e);i&&(this.internalListeners.delete(e),i(),this.updateProactiveRefresh())}assertAuthConfigured(){A(this.auth._initializationPromise,"dependent-sdk-initialized-before-auth")}updateProactiveRefresh(){this.internalListeners.size>0?this.auth._startProactiveRefresh():this.auth._stopProactiveRefresh()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ch(t){switch(t){case"Node":return"node";case"ReactNative":return"rn";case"Worker":return"webworker";case"Cordova":return"cordova";case"WebExtension":return"web-extension";default:return}}function Ph(t){fe(new oe("auth",(e,{options:i})=>{const r=e.getProvider("app").getImmediate(),o=e.getProvider("heartbeat"),c=e.getProvider("app-check-internal"),{apiKey:l,authDomain:h}=r.options;A(l&&!l.includes(":"),"invalid-api-key",{appName:r.name});const g={apiKey:l,authDomain:h,clientPlatform:t,apiHost:"identitytoolkit.googleapis.com",tokenApiHost:"securetoken.googleapis.com",apiScheme:"https",sdkClientVersion:fo(t)},E=new Gl(r,o,c,g);return tu(E,i),E},"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((e,i,r)=>{e.getProvider("auth-internal").initialize()})),fe(new oe("auth-internal",e=>{const i=Je(e.getProvider("auth").getImmediate());return(r=>new Sh(r))(i)},"PRIVATE").setInstantiationMode("EXPLICIT")),ne(gs,ms,Ch(t)),ne(gs,ms,"esm2017")}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Rh=5*60,kh=js("authIdTokenMaxAge")||Rh;let ys=null;const Oh=t=>async e=>{const i=e&&await e.getIdTokenResult(),r=i&&(new Date().getTime()-Date.parse(i.issuedAtTime))/1e3;if(r&&r>kh)return;const o=i==null?void 0:i.token;ys!==o&&(ys=o,await fetch(t,{method:o?"POST":"DELETE",headers:o?{Authorization:`Bearer ${o}`}:{}}))};function $t(t=Si()){const e=Ke(t,"auth");if(e.isInitialized())return e.getImmediate();const i=eu(t,{popupRedirectResolver:Ah,persistence:[Uu,bu,To]}),r=js("authTokenSyncURL");if(r&&typeof isSecureContext=="boolean"&&isSecureContext){const c=new URL(r,location.origin);if(location.origin===c.origin){const l=Oh(c.toString());_u(i,l,()=>l(i.currentUser)),vu(i,h=>l(h))}}const o=xs("auth");return o&&nu(i,`http://${o}`),i}function Dh(){var t,e;return(e=(t=document.getElementsByTagName("head"))===null||t===void 0?void 0:t[0])!==null&&e!==void 0?e:document}ql({loadJS(t){return new Promise((e,i)=>{const r=document.createElement("script");r.setAttribute("src",t),r.onload=e,r.onerror=o=>{const c=he("internal-error");c.customData=o,i(c)},r.type="text/javascript",r.charset="UTF-8",Dh().appendChild(r)})},gapiScript:"https://apis.google.com/js/api.js",recaptchaV2Script:"https://www.google.com/recaptcha/api.js",recaptchaEnterpriseScript:"https://www.google.com/recaptcha/enterprise.js?render="});Ph("Browser");var vs=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var ko;(function(){var t;/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/function e(v,d){function p(){}p.prototype=d.prototype,v.D=d.prototype,v.prototype=new p,v.prototype.constructor=v,v.C=function(m,y,I){for(var f=Array(arguments.length-2),ge=2;ge<arguments.length;ge++)f[ge-2]=arguments[ge];return d.prototype[y].apply(m,f)}}function i(){this.blockSize=-1}function r(){this.blockSize=-1,this.blockSize=64,this.g=Array(4),this.B=Array(this.blockSize),this.o=this.h=0,this.s()}e(r,i),r.prototype.s=function(){this.g[0]=1732584193,this.g[1]=4023233417,this.g[2]=2562383102,this.g[3]=271733878,this.o=this.h=0};function o(v,d,p){p||(p=0);var m=Array(16);if(typeof d=="string")for(var y=0;16>y;++y)m[y]=d.charCodeAt(p++)|d.charCodeAt(p++)<<8|d.charCodeAt(p++)<<16|d.charCodeAt(p++)<<24;else for(y=0;16>y;++y)m[y]=d[p++]|d[p++]<<8|d[p++]<<16|d[p++]<<24;d=v.g[0],p=v.g[1],y=v.g[2];var I=v.g[3],f=d+(I^p&(y^I))+m[0]+3614090360&4294967295;d=p+(f<<7&4294967295|f>>>25),f=I+(y^d&(p^y))+m[1]+3905402710&4294967295,I=d+(f<<12&4294967295|f>>>20),f=y+(p^I&(d^p))+m[2]+606105819&4294967295,y=I+(f<<17&4294967295|f>>>15),f=p+(d^y&(I^d))+m[3]+3250441966&4294967295,p=y+(f<<22&4294967295|f>>>10),f=d+(I^p&(y^I))+m[4]+4118548399&4294967295,d=p+(f<<7&4294967295|f>>>25),f=I+(y^d&(p^y))+m[5]+1200080426&4294967295,I=d+(f<<12&4294967295|f>>>20),f=y+(p^I&(d^p))+m[6]+2821735955&4294967295,y=I+(f<<17&4294967295|f>>>15),f=p+(d^y&(I^d))+m[7]+4249261313&4294967295,p=y+(f<<22&4294967295|f>>>10),f=d+(I^p&(y^I))+m[8]+1770035416&4294967295,d=p+(f<<7&4294967295|f>>>25),f=I+(y^d&(p^y))+m[9]+2336552879&4294967295,I=d+(f<<12&4294967295|f>>>20),f=y+(p^I&(d^p))+m[10]+4294925233&4294967295,y=I+(f<<17&4294967295|f>>>15),f=p+(d^y&(I^d))+m[11]+2304563134&4294967295,p=y+(f<<22&4294967295|f>>>10),f=d+(I^p&(y^I))+m[12]+1804603682&4294967295,d=p+(f<<7&4294967295|f>>>25),f=I+(y^d&(p^y))+m[13]+4254626195&4294967295,I=d+(f<<12&4294967295|f>>>20),f=y+(p^I&(d^p))+m[14]+2792965006&4294967295,y=I+(f<<17&4294967295|f>>>15),f=p+(d^y&(I^d))+m[15]+1236535329&4294967295,p=y+(f<<22&4294967295|f>>>10),f=d+(y^I&(p^y))+m[1]+4129170786&4294967295,d=p+(f<<5&4294967295|f>>>27),f=I+(p^y&(d^p))+m[6]+3225465664&4294967295,I=d+(f<<9&4294967295|f>>>23),f=y+(d^p&(I^d))+m[11]+643717713&4294967295,y=I+(f<<14&4294967295|f>>>18),f=p+(I^d&(y^I))+m[0]+3921069994&4294967295,p=y+(f<<20&4294967295|f>>>12),f=d+(y^I&(p^y))+m[5]+3593408605&4294967295,d=p+(f<<5&4294967295|f>>>27),f=I+(p^y&(d^p))+m[10]+38016083&4294967295,I=d+(f<<9&4294967295|f>>>23),f=y+(d^p&(I^d))+m[15]+3634488961&4294967295,y=I+(f<<14&4294967295|f>>>18),f=p+(I^d&(y^I))+m[4]+3889429448&4294967295,p=y+(f<<20&4294967295|f>>>12),f=d+(y^I&(p^y))+m[9]+568446438&4294967295,d=p+(f<<5&4294967295|f>>>27),f=I+(p^y&(d^p))+m[14]+3275163606&4294967295,I=d+(f<<9&4294967295|f>>>23),f=y+(d^p&(I^d))+m[3]+4107603335&4294967295,y=I+(f<<14&4294967295|f>>>18),f=p+(I^d&(y^I))+m[8]+1163531501&4294967295,p=y+(f<<20&4294967295|f>>>12),f=d+(y^I&(p^y))+m[13]+2850285829&4294967295,d=p+(f<<5&4294967295|f>>>27),f=I+(p^y&(d^p))+m[2]+4243563512&4294967295,I=d+(f<<9&4294967295|f>>>23),f=y+(d^p&(I^d))+m[7]+1735328473&4294967295,y=I+(f<<14&4294967295|f>>>18),f=p+(I^d&(y^I))+m[12]+2368359562&4294967295,p=y+(f<<20&4294967295|f>>>12),f=d+(p^y^I)+m[5]+4294588738&4294967295,d=p+(f<<4&4294967295|f>>>28),f=I+(d^p^y)+m[8]+2272392833&4294967295,I=d+(f<<11&4294967295|f>>>21),f=y+(I^d^p)+m[11]+1839030562&4294967295,y=I+(f<<16&4294967295|f>>>16),f=p+(y^I^d)+m[14]+4259657740&4294967295,p=y+(f<<23&4294967295|f>>>9),f=d+(p^y^I)+m[1]+2763975236&4294967295,d=p+(f<<4&4294967295|f>>>28),f=I+(d^p^y)+m[4]+1272893353&4294967295,I=d+(f<<11&4294967295|f>>>21),f=y+(I^d^p)+m[7]+4139469664&4294967295,y=I+(f<<16&4294967295|f>>>16),f=p+(y^I^d)+m[10]+3200236656&4294967295,p=y+(f<<23&4294967295|f>>>9),f=d+(p^y^I)+m[13]+681279174&4294967295,d=p+(f<<4&4294967295|f>>>28),f=I+(d^p^y)+m[0]+3936430074&4294967295,I=d+(f<<11&4294967295|f>>>21),f=y+(I^d^p)+m[3]+3572445317&4294967295,y=I+(f<<16&4294967295|f>>>16),f=p+(y^I^d)+m[6]+76029189&4294967295,p=y+(f<<23&4294967295|f>>>9),f=d+(p^y^I)+m[9]+3654602809&4294967295,d=p+(f<<4&4294967295|f>>>28),f=I+(d^p^y)+m[12]+3873151461&4294967295,I=d+(f<<11&4294967295|f>>>21),f=y+(I^d^p)+m[15]+530742520&4294967295,y=I+(f<<16&4294967295|f>>>16),f=p+(y^I^d)+m[2]+3299628645&4294967295,p=y+(f<<23&4294967295|f>>>9),f=d+(y^(p|~I))+m[0]+4096336452&4294967295,d=p+(f<<6&4294967295|f>>>26),f=I+(p^(d|~y))+m[7]+1126891415&4294967295,I=d+(f<<10&4294967295|f>>>22),f=y+(d^(I|~p))+m[14]+2878612391&4294967295,y=I+(f<<15&4294967295|f>>>17),f=p+(I^(y|~d))+m[5]+4237533241&4294967295,p=y+(f<<21&4294967295|f>>>11),f=d+(y^(p|~I))+m[12]+1700485571&4294967295,d=p+(f<<6&4294967295|f>>>26),f=I+(p^(d|~y))+m[3]+2399980690&4294967295,I=d+(f<<10&4294967295|f>>>22),f=y+(d^(I|~p))+m[10]+4293915773&4294967295,y=I+(f<<15&4294967295|f>>>17),f=p+(I^(y|~d))+m[1]+2240044497&4294967295,p=y+(f<<21&4294967295|f>>>11),f=d+(y^(p|~I))+m[8]+1873313359&4294967295,d=p+(f<<6&4294967295|f>>>26),f=I+(p^(d|~y))+m[15]+4264355552&4294967295,I=d+(f<<10&4294967295|f>>>22),f=y+(d^(I|~p))+m[6]+2734768916&4294967295,y=I+(f<<15&4294967295|f>>>17),f=p+(I^(y|~d))+m[13]+1309151649&4294967295,p=y+(f<<21&4294967295|f>>>11),f=d+(y^(p|~I))+m[4]+4149444226&4294967295,d=p+(f<<6&4294967295|f>>>26),f=I+(p^(d|~y))+m[11]+3174756917&4294967295,I=d+(f<<10&4294967295|f>>>22),f=y+(d^(I|~p))+m[2]+718787259&4294967295,y=I+(f<<15&4294967295|f>>>17),f=p+(I^(y|~d))+m[9]+3951481745&4294967295,v.g[0]=v.g[0]+d&4294967295,v.g[1]=v.g[1]+(y+(f<<21&4294967295|f>>>11))&4294967295,v.g[2]=v.g[2]+y&4294967295,v.g[3]=v.g[3]+I&4294967295}r.prototype.u=function(v,d){d===void 0&&(d=v.length);for(var p=d-this.blockSize,m=this.B,y=this.h,I=0;I<d;){if(y==0)for(;I<=p;)o(this,v,I),I+=this.blockSize;if(typeof v=="string"){for(;I<d;)if(m[y++]=v.charCodeAt(I++),y==this.blockSize){o(this,m),y=0;break}}else for(;I<d;)if(m[y++]=v[I++],y==this.blockSize){o(this,m),y=0;break}}this.h=y,this.o+=d},r.prototype.v=function(){var v=Array((56>this.h?this.blockSize:2*this.blockSize)-this.h);v[0]=128;for(var d=1;d<v.length-8;++d)v[d]=0;var p=8*this.o;for(d=v.length-8;d<v.length;++d)v[d]=p&255,p/=256;for(this.u(v),v=Array(16),d=p=0;4>d;++d)for(var m=0;32>m;m+=8)v[p++]=this.g[d]>>>m&255;return v};function c(v,d){var p=h;return Object.prototype.hasOwnProperty.call(p,v)?p[v]:p[v]=d(v)}function l(v,d){this.h=d;for(var p=[],m=!0,y=v.length-1;0<=y;y--){var I=v[y]|0;m&&I==d||(p[y]=I,m=!1)}this.g=p}var h={};function g(v){return-128<=v&&128>v?c(v,function(d){return new l([d|0],0>d?-1:0)}):new l([v|0],0>v?-1:0)}function E(v){if(isNaN(v)||!isFinite(v))return S;if(0>v)return M(E(-v));for(var d=[],p=1,m=0;v>=p;m++)d[m]=v/p|0,p*=4294967296;return new l(d,0)}function b(v,d){if(v.length==0)throw Error("number format error: empty string");if(d=d||10,2>d||36<d)throw Error("radix out of range: "+d);if(v.charAt(0)=="-")return M(b(v.substring(1),d));if(0<=v.indexOf("-"))throw Error('number format error: interior "-" character');for(var p=E(Math.pow(d,8)),m=S,y=0;y<v.length;y+=8){var I=Math.min(8,v.length-y),f=parseInt(v.substring(y,y+I),d);8>I?(I=E(Math.pow(d,I)),m=m.j(I).add(E(f))):(m=m.j(p),m=m.add(E(f)))}return m}var S=g(0),C=g(1),L=g(16777216);t=l.prototype,t.m=function(){if(x(this))return-M(this).m();for(var v=0,d=1,p=0;p<this.g.length;p++){var m=this.i(p);v+=(0<=m?m:4294967296+m)*d,d*=4294967296}return v},t.toString=function(v){if(v=v||10,2>v||36<v)throw Error("radix out of range: "+v);if(R(this))return"0";if(x(this))return"-"+M(this).toString(v);for(var d=E(Math.pow(v,6)),p=this,m="";;){var y=ie(p,d).g;p=pe(p,y.j(d));var I=((0<p.g.length?p.g[0]:p.h)>>>0).toString(v);if(p=y,R(p))return I+m;for(;6>I.length;)I="0"+I;m=I+m}},t.i=function(v){return 0>v?0:v<this.g.length?this.g[v]:this.h};function R(v){if(v.h!=0)return!1;for(var d=0;d<v.g.length;d++)if(v.g[d]!=0)return!1;return!0}function x(v){return v.h==-1}t.l=function(v){return v=pe(this,v),x(v)?-1:R(v)?0:1};function M(v){for(var d=v.g.length,p=[],m=0;m<d;m++)p[m]=~v.g[m];return new l(p,~v.h).add(C)}t.abs=function(){return x(this)?M(this):this},t.add=function(v){for(var d=Math.max(this.g.length,v.g.length),p=[],m=0,y=0;y<=d;y++){var I=m+(this.i(y)&65535)+(v.i(y)&65535),f=(I>>>16)+(this.i(y)>>>16)+(v.i(y)>>>16);m=f>>>16,I&=65535,f&=65535,p[y]=f<<16|I}return new l(p,p[p.length-1]&-2147483648?-1:0)};function pe(v,d){return v.add(M(d))}t.j=function(v){if(R(this)||R(v))return S;if(x(this))return x(v)?M(this).j(M(v)):M(M(this).j(v));if(x(v))return M(this.j(M(v)));if(0>this.l(L)&&0>v.l(L))return E(this.m()*v.m());for(var d=this.g.length+v.g.length,p=[],m=0;m<2*d;m++)p[m]=0;for(m=0;m<this.g.length;m++)for(var y=0;y<v.g.length;y++){var I=this.i(m)>>>16,f=this.i(m)&65535,ge=v.i(y)>>>16,lt=v.i(y)&65535;p[2*m+2*y]+=f*lt,Z(p,2*m+2*y),p[2*m+2*y+1]+=I*lt,Z(p,2*m+2*y+1),p[2*m+2*y+1]+=f*ge,Z(p,2*m+2*y+1),p[2*m+2*y+2]+=I*ge,Z(p,2*m+2*y+2)}for(m=0;m<d;m++)p[m]=p[2*m+1]<<16|p[2*m];for(m=d;m<2*d;m++)p[m]=0;return new l(p,0)};function Z(v,d){for(;(v[d]&65535)!=v[d];)v[d+1]+=v[d]>>>16,v[d]&=65535,d++}function j(v,d){this.g=v,this.h=d}function ie(v,d){if(R(d))throw Error("division by zero");if(R(v))return new j(S,S);if(x(v))return d=ie(M(v),d),new j(M(d.g),M(d.h));if(x(d))return d=ie(v,M(d)),new j(M(d.g),d.h);if(30<v.g.length){if(x(v)||x(d))throw Error("slowDivide_ only works with positive integers.");for(var p=C,m=d;0>=m.l(v);)p=xe(p),m=xe(m);var y=K(p,1),I=K(m,1);for(m=K(m,2),p=K(p,2);!R(m);){var f=I.add(m);0>=f.l(v)&&(y=y.add(p),I=f),m=K(m,1),p=K(p,1)}return d=pe(v,y.j(d)),new j(y,d)}for(y=S;0<=v.l(d);){for(p=Math.max(1,Math.floor(v.m()/d.m())),m=Math.ceil(Math.log(p)/Math.LN2),m=48>=m?1:Math.pow(2,m-48),I=E(p),f=I.j(d);x(f)||0<f.l(v);)p-=m,I=E(p),f=I.j(d);R(I)&&(I=C),y=y.add(I),v=pe(v,f)}return new j(y,v)}t.A=function(v){return ie(this,v).h},t.and=function(v){for(var d=Math.max(this.g.length,v.g.length),p=[],m=0;m<d;m++)p[m]=this.i(m)&v.i(m);return new l(p,this.h&v.h)},t.or=function(v){for(var d=Math.max(this.g.length,v.g.length),p=[],m=0;m<d;m++)p[m]=this.i(m)|v.i(m);return new l(p,this.h|v.h)},t.xor=function(v){for(var d=Math.max(this.g.length,v.g.length),p=[],m=0;m<d;m++)p[m]=this.i(m)^v.i(m);return new l(p,this.h^v.h)};function xe(v){for(var d=v.g.length+1,p=[],m=0;m<d;m++)p[m]=v.i(m)<<1|v.i(m-1)>>>31;return new l(p,v.h)}function K(v,d){var p=d>>5;d%=32;for(var m=v.g.length-p,y=[],I=0;I<m;I++)y[I]=0<d?v.i(I+p)>>>d|v.i(I+p+1)<<32-d:v.i(I+p);return new l(y,v.h)}r.prototype.digest=r.prototype.v,r.prototype.reset=r.prototype.s,r.prototype.update=r.prototype.u,l.prototype.add=l.prototype.add,l.prototype.multiply=l.prototype.j,l.prototype.modulo=l.prototype.A,l.prototype.compare=l.prototype.l,l.prototype.toNumber=l.prototype.m,l.prototype.toString=l.prototype.toString,l.prototype.getBits=l.prototype.i,l.fromNumber=E,l.fromString=b,ko=l}).apply(typeof vs<"u"?vs:typeof self<"u"?self:typeof window<"u"?window:{});var an=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};(function(){var t,e=typeof Object.defineProperties=="function"?Object.defineProperty:function(n,s,a){return n==Array.prototype||n==Object.prototype||(n[s]=a.value),n};function i(n){n=[typeof globalThis=="object"&&globalThis,n,typeof window=="object"&&window,typeof self=="object"&&self,typeof an=="object"&&an];for(var s=0;s<n.length;++s){var a=n[s];if(a&&a.Math==Math)return a}throw Error("Cannot find global object")}var r=i(this);function o(n,s){if(s)e:{var a=r;n=n.split(".");for(var u=0;u<n.length-1;u++){var _=n[u];if(!(_ in a))break e;a=a[_]}n=n[n.length-1],u=a[n],s=s(u),s!=u&&s!=null&&e(a,n,{configurable:!0,writable:!0,value:s})}}function c(n,s){n instanceof String&&(n+="");var a=0,u=!1,_={next:function(){if(!u&&a<n.length){var w=a++;return{value:s(w,n[w]),done:!1}}return u=!0,{done:!0,value:void 0}}};return _[Symbol.iterator]=function(){return _},_}o("Array.prototype.values",function(n){return n||function(){return c(this,function(s,a){return a})}});/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/var l=l||{},h=this||self;function g(n){var s=typeof n;return s=s!="object"?s:n?Array.isArray(n)?"array":s:"null",s=="array"||s=="object"&&typeof n.length=="number"}function E(n){var s=typeof n;return s=="object"&&n!=null||s=="function"}function b(n,s,a){return n.call.apply(n.bind,arguments)}function S(n,s,a){if(!n)throw Error();if(2<arguments.length){var u=Array.prototype.slice.call(arguments,2);return function(){var _=Array.prototype.slice.call(arguments);return Array.prototype.unshift.apply(_,u),n.apply(s,_)}}return function(){return n.apply(s,arguments)}}function C(n,s,a){return C=Function.prototype.bind&&Function.prototype.bind.toString().indexOf("native code")!=-1?b:S,C.apply(null,arguments)}function L(n,s){var a=Array.prototype.slice.call(arguments,1);return function(){var u=a.slice();return u.push.apply(u,arguments),n.apply(this,u)}}function R(n,s){function a(){}a.prototype=s.prototype,n.aa=s.prototype,n.prototype=new a,n.prototype.constructor=n,n.Qb=function(u,_,w){for(var T=Array(arguments.length-2),D=2;D<arguments.length;D++)T[D-2]=arguments[D];return s.prototype[_].apply(u,T)}}function x(n){const s=n.length;if(0<s){const a=Array(s);for(let u=0;u<s;u++)a[u]=n[u];return a}return[]}function M(n,s){for(let a=1;a<arguments.length;a++){const u=arguments[a];if(g(u)){const _=n.length||0,w=u.length||0;n.length=_+w;for(let T=0;T<w;T++)n[_+T]=u[T]}else n.push(u)}}class pe{constructor(s,a){this.i=s,this.j=a,this.h=0,this.g=null}get(){let s;return 0<this.h?(this.h--,s=this.g,this.g=s.next,s.next=null):s=this.i(),s}}function Z(n){return/^[\s\xa0]*$/.test(n)}function j(){var n=h.navigator;return n&&(n=n.userAgent)?n:""}function ie(n){return ie[" "](n),n}ie[" "]=function(){};var xe=j().indexOf("Gecko")!=-1&&!(j().toLowerCase().indexOf("webkit")!=-1&&j().indexOf("Edge")==-1)&&!(j().indexOf("Trident")!=-1||j().indexOf("MSIE")!=-1)&&j().indexOf("Edge")==-1;function K(n,s,a){for(const u in n)s.call(a,n[u],u,n)}function v(n,s){for(const a in n)s.call(void 0,n[a],a,n)}function d(n){const s={};for(const a in n)s[a]=n[a];return s}const p="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function m(n,s){let a,u;for(let _=1;_<arguments.length;_++){u=arguments[_];for(a in u)n[a]=u[a];for(let w=0;w<p.length;w++)a=p[w],Object.prototype.hasOwnProperty.call(u,a)&&(n[a]=u[a])}}function y(n){var s=1;n=n.split(":");const a=[];for(;0<s&&n.length;)a.push(n.shift()),s--;return n.length&&a.push(n.join(":")),a}function I(n){h.setTimeout(()=>{throw n},0)}function f(){var n=kn;let s=null;return n.g&&(s=n.g,n.g=n.g.next,n.g||(n.h=null),s.next=null),s}class ge{constructor(){this.h=this.g=null}add(s,a){const u=lt.get();u.set(s,a),this.h?this.h.next=u:this.g=u,this.h=u}}var lt=new pe(()=>new ra,n=>n.reset());class ra{constructor(){this.next=this.g=this.h=null}set(s,a){this.h=s,this.g=a,this.next=null}reset(){this.next=this.g=this.h=null}}let ut,ht=!1,kn=new ge,zi=()=>{const n=h.Promise.resolve(void 0);ut=()=>{n.then(sa)}};var sa=()=>{for(var n;n=f();){try{n.h.call(n.g)}catch(a){I(a)}var s=lt;s.j(n),100>s.h&&(s.h++,n.next=s.g,s.g=n)}ht=!1};function be(){this.s=this.s,this.C=this.C}be.prototype.s=!1,be.prototype.ma=function(){this.s||(this.s=!0,this.N())},be.prototype.N=function(){if(this.C)for(;this.C.length;)this.C.shift()()};function B(n,s){this.type=n,this.g=this.target=s,this.defaultPrevented=!1}B.prototype.h=function(){this.defaultPrevented=!0};var oa=function(){if(!h.addEventListener||!Object.defineProperty)return!1;var n=!1,s=Object.defineProperty({},"passive",{get:function(){n=!0}});try{const a=()=>{};h.addEventListener("test",a,s),h.removeEventListener("test",a,s)}catch{}return n}();function dt(n,s){if(B.call(this,n?n.type:""),this.relatedTarget=this.g=this.target=null,this.button=this.screenY=this.screenX=this.clientY=this.clientX=0,this.key="",this.metaKey=this.shiftKey=this.altKey=this.ctrlKey=!1,this.state=null,this.pointerId=0,this.pointerType="",this.i=null,n){var a=this.type=n.type,u=n.changedTouches&&n.changedTouches.length?n.changedTouches[0]:null;if(this.target=n.target||n.srcElement,this.g=s,s=n.relatedTarget){if(xe){e:{try{ie(s.nodeName);var _=!0;break e}catch{}_=!1}_||(s=null)}}else a=="mouseover"?s=n.fromElement:a=="mouseout"&&(s=n.toElement);this.relatedTarget=s,u?(this.clientX=u.clientX!==void 0?u.clientX:u.pageX,this.clientY=u.clientY!==void 0?u.clientY:u.pageY,this.screenX=u.screenX||0,this.screenY=u.screenY||0):(this.clientX=n.clientX!==void 0?n.clientX:n.pageX,this.clientY=n.clientY!==void 0?n.clientY:n.pageY,this.screenX=n.screenX||0,this.screenY=n.screenY||0),this.button=n.button,this.key=n.key||"",this.ctrlKey=n.ctrlKey,this.altKey=n.altKey,this.shiftKey=n.shiftKey,this.metaKey=n.metaKey,this.pointerId=n.pointerId||0,this.pointerType=typeof n.pointerType=="string"?n.pointerType:aa[n.pointerType]||"",this.state=n.state,this.i=n,n.defaultPrevented&&dt.aa.h.call(this)}}R(dt,B);var aa={2:"touch",3:"pen",4:"mouse"};dt.prototype.h=function(){dt.aa.h.call(this);var n=this.i;n.preventDefault?n.preventDefault():n.returnValue=!1};var Vt="closure_listenable_"+(1e6*Math.random()|0),ca=0;function la(n,s,a,u,_){this.listener=n,this.proxy=null,this.src=s,this.type=a,this.capture=!!u,this.ha=_,this.key=++ca,this.da=this.fa=!1}function zt(n){n.da=!0,n.listener=null,n.proxy=null,n.src=null,n.ha=null}function Wt(n){this.src=n,this.g={},this.h=0}Wt.prototype.add=function(n,s,a,u,_){var w=n.toString();n=this.g[w],n||(n=this.g[w]=[],this.h++);var T=Dn(n,s,u,_);return-1<T?(s=n[T],a||(s.fa=!1)):(s=new la(s,this.src,w,!!u,_),s.fa=a,n.push(s)),s};function On(n,s){var a=s.type;if(a in n.g){var u=n.g[a],_=Array.prototype.indexOf.call(u,s,void 0),w;(w=0<=_)&&Array.prototype.splice.call(u,_,1),w&&(zt(s),n.g[a].length==0&&(delete n.g[a],n.h--))}}function Dn(n,s,a,u){for(var _=0;_<n.length;++_){var w=n[_];if(!w.da&&w.listener==s&&w.capture==!!a&&w.ha==u)return _}return-1}var Ln="closure_lm_"+(1e6*Math.random()|0),Nn={};function Wi(n,s,a,u,_){if(Array.isArray(s)){for(var w=0;w<s.length;w++)Wi(n,s[w],a,u,_);return null}return a=Ki(a),n&&n[Vt]?n.K(s,a,E(u)?!!u.capture:!1,_):ua(n,s,a,!1,u,_)}function ua(n,s,a,u,_,w){if(!s)throw Error("Invalid event type");var T=E(_)?!!_.capture:!!_,D=Un(n);if(D||(n[Ln]=D=new Wt(n)),a=D.add(s,a,u,T,w),a.proxy)return a;if(u=ha(),a.proxy=u,u.src=n,u.listener=a,n.addEventListener)oa||(_=T),_===void 0&&(_=!1),n.addEventListener(s.toString(),u,_);else if(n.attachEvent)n.attachEvent(qi(s.toString()),u);else if(n.addListener&&n.removeListener)n.addListener(u);else throw Error("addEventListener and attachEvent are unavailable.");return a}function ha(){function n(a){return s.call(n.src,n.listener,a)}const s=da;return n}function Gi(n,s,a,u,_){if(Array.isArray(s))for(var w=0;w<s.length;w++)Gi(n,s[w],a,u,_);else u=E(u)?!!u.capture:!!u,a=Ki(a),n&&n[Vt]?(n=n.i,s=String(s).toString(),s in n.g&&(w=n.g[s],a=Dn(w,a,u,_),-1<a&&(zt(w[a]),Array.prototype.splice.call(w,a,1),w.length==0&&(delete n.g[s],n.h--)))):n&&(n=Un(n))&&(s=n.g[s.toString()],n=-1,s&&(n=Dn(s,a,u,_)),(a=-1<n?s[n]:null)&&Mn(a))}function Mn(n){if(typeof n!="number"&&n&&!n.da){var s=n.src;if(s&&s[Vt])On(s.i,n);else{var a=n.type,u=n.proxy;s.removeEventListener?s.removeEventListener(a,u,n.capture):s.detachEvent?s.detachEvent(qi(a),u):s.addListener&&s.removeListener&&s.removeListener(u),(a=Un(s))?(On(a,n),a.h==0&&(a.src=null,s[Ln]=null)):zt(n)}}}function qi(n){return n in Nn?Nn[n]:Nn[n]="on"+n}function da(n,s){if(n.da)n=!0;else{s=new dt(s,this);var a=n.listener,u=n.ha||n.src;n.fa&&Mn(n),n=a.call(u,s)}return n}function Un(n){return n=n[Ln],n instanceof Wt?n:null}var xn="__closure_events_fn_"+(1e9*Math.random()>>>0);function Ki(n){return typeof n=="function"?n:(n[xn]||(n[xn]=function(s){return n.handleEvent(s)}),n[xn])}function $(){be.call(this),this.i=new Wt(this),this.M=this,this.F=null}R($,be),$.prototype[Vt]=!0,$.prototype.removeEventListener=function(n,s,a,u){Gi(this,n,s,a,u)};function z(n,s){var a,u=n.F;if(u)for(a=[];u;u=u.F)a.push(u);if(n=n.M,u=s.type||s,typeof s=="string")s=new B(s,n);else if(s instanceof B)s.target=s.target||n;else{var _=s;s=new B(u,n),m(s,_)}if(_=!0,a)for(var w=a.length-1;0<=w;w--){var T=s.g=a[w];_=Gt(T,u,!0,s)&&_}if(T=s.g=n,_=Gt(T,u,!0,s)&&_,_=Gt(T,u,!1,s)&&_,a)for(w=0;w<a.length;w++)T=s.g=a[w],_=Gt(T,u,!1,s)&&_}$.prototype.N=function(){if($.aa.N.call(this),this.i){var n=this.i,s;for(s in n.g){for(var a=n.g[s],u=0;u<a.length;u++)zt(a[u]);delete n.g[s],n.h--}}this.F=null},$.prototype.K=function(n,s,a,u){return this.i.add(String(n),s,!1,a,u)},$.prototype.L=function(n,s,a,u){return this.i.add(String(n),s,!0,a,u)};function Gt(n,s,a,u){if(s=n.i.g[String(s)],!s)return!0;s=s.concat();for(var _=!0,w=0;w<s.length;++w){var T=s[w];if(T&&!T.da&&T.capture==a){var D=T.listener,F=T.ha||T.src;T.fa&&On(n.i,T),_=D.call(F,u)!==!1&&_}}return _&&!u.defaultPrevented}function Ji(n,s,a){if(typeof n=="function")a&&(n=C(n,a));else if(n&&typeof n.handleEvent=="function")n=C(n.handleEvent,n);else throw Error("Invalid listener argument");return 2147483647<Number(s)?-1:h.setTimeout(n,s||0)}function Xi(n){n.g=Ji(()=>{n.g=null,n.i&&(n.i=!1,Xi(n))},n.l);const s=n.h;n.h=null,n.m.apply(null,s)}class fa extends be{constructor(s,a){super(),this.m=s,this.l=a,this.h=null,this.i=!1,this.g=null}j(s){this.h=arguments,this.g?this.i=!0:Xi(this)}N(){super.N(),this.g&&(h.clearTimeout(this.g),this.g=null,this.i=!1,this.h=null)}}function ft(n){be.call(this),this.h=n,this.g={}}R(ft,be);var Yi=[];function Qi(n){K(n.g,function(s,a){this.g.hasOwnProperty(a)&&Mn(s)},n),n.g={}}ft.prototype.N=function(){ft.aa.N.call(this),Qi(this)},ft.prototype.handleEvent=function(){throw Error("EventHandler.handleEvent not implemented")};var Fn=h.JSON.stringify,pa=h.JSON.parse,ga=class{stringify(n){return h.JSON.stringify(n,void 0)}parse(n){return h.JSON.parse(n,void 0)}};function jn(){}jn.prototype.h=null;function Zi(n){return n.h||(n.h=n.i())}function ma(){}var pt={OPEN:"a",kb:"b",Ja:"c",wb:"d"};function Bn(){B.call(this,"d")}R(Bn,B);function $n(){B.call(this,"c")}R($n,B);var Xe={},er=null;function Hn(){return er=er||new $}Xe.La="serverreachability";function tr(n){B.call(this,Xe.La,n)}R(tr,B);function gt(n){const s=Hn();z(s,new tr(s))}Xe.STAT_EVENT="statevent";function nr(n,s){B.call(this,Xe.STAT_EVENT,n),this.stat=s}R(nr,B);function W(n){const s=Hn();z(s,new nr(s,n))}Xe.Ma="timingevent";function ir(n,s){B.call(this,Xe.Ma,n),this.size=s}R(ir,B);function mt(n,s){if(typeof n!="function")throw Error("Fn must not be null and must be a function");return h.setTimeout(function(){n()},s)}function yt(){this.g=!0}yt.prototype.xa=function(){this.g=!1};function ya(n,s,a,u,_,w){n.info(function(){if(n.g)if(w)for(var T="",D=w.split("&"),F=0;F<D.length;F++){var k=D[F].split("=");if(1<k.length){var H=k[0];k=k[1];var V=H.split("_");T=2<=V.length&&V[1]=="type"?T+(H+"="+k+"&"):T+(H+"=redacted&")}}else T=null;else T=w;return"XMLHTTP REQ ("+u+") [attempt "+_+"]: "+s+`
`+a+`
`+T})}function va(n,s,a,u,_,w,T){n.info(function(){return"XMLHTTP RESP ("+u+") [ attempt "+_+"]: "+s+`
`+a+`
`+w+" "+T})}function Ye(n,s,a,u){n.info(function(){return"XMLHTTP TEXT ("+s+"): "+Ia(n,a)+(u?" "+u:"")})}function _a(n,s){n.info(function(){return"TIMEOUT: "+s})}yt.prototype.info=function(){};function Ia(n,s){if(!n.g)return s;if(!s)return null;try{var a=JSON.parse(s);if(a){for(n=0;n<a.length;n++)if(Array.isArray(a[n])){var u=a[n];if(!(2>u.length)){var _=u[1];if(Array.isArray(_)&&!(1>_.length)){var w=_[0];if(w!="noop"&&w!="stop"&&w!="close")for(var T=1;T<_.length;T++)_[T]=""}}}}return Fn(a)}catch{return s}}var Vn={NO_ERROR:0,TIMEOUT:8},wa={},zn;function qt(){}R(qt,jn),qt.prototype.g=function(){return new XMLHttpRequest},qt.prototype.i=function(){return{}},zn=new qt;function Ae(n,s,a,u){this.j=n,this.i=s,this.l=a,this.R=u||1,this.U=new ft(this),this.I=45e3,this.H=null,this.o=!1,this.m=this.A=this.v=this.L=this.F=this.S=this.B=null,this.D=[],this.g=null,this.C=0,this.s=this.u=null,this.X=-1,this.J=!1,this.O=0,this.M=null,this.W=this.K=this.T=this.P=!1,this.h=new rr}function rr(){this.i=null,this.g="",this.h=!1}var sr={},Wn={};function Gn(n,s,a){n.L=1,n.v=Yt(me(s)),n.m=a,n.P=!0,or(n,null)}function or(n,s){n.F=Date.now(),Kt(n),n.A=me(n.v);var a=n.A,u=n.R;Array.isArray(u)||(u=[String(u)]),Ir(a.i,"t",u),n.C=0,a=n.j.J,n.h=new rr,n.g=Fr(n.j,a?s:null,!n.m),0<n.O&&(n.M=new fa(C(n.Y,n,n.g),n.O)),s=n.U,a=n.g,u=n.ca;var _="readystatechange";Array.isArray(_)||(_&&(Yi[0]=_.toString()),_=Yi);for(var w=0;w<_.length;w++){var T=Wi(a,_[w],u||s.handleEvent,!1,s.h||s);if(!T)break;s.g[T.key]=T}s=n.H?d(n.H):{},n.m?(n.u||(n.u="POST"),s["Content-Type"]="application/x-www-form-urlencoded",n.g.ea(n.A,n.u,n.m,s)):(n.u="GET",n.g.ea(n.A,n.u,null,s)),gt(),ya(n.i,n.u,n.A,n.l,n.R,n.m)}Ae.prototype.ca=function(n){n=n.target;const s=this.M;s&&ye(n)==3?s.j():this.Y(n)},Ae.prototype.Y=function(n){try{if(n==this.g)e:{const V=ye(this.g);var s=this.g.Ba();const et=this.g.Z();if(!(3>V)&&(V!=3||this.g&&(this.h.h||this.g.oa()||Cr(this.g)))){this.J||V!=4||s==7||(s==8||0>=et?gt(3):gt(2)),qn(this);var a=this.g.Z();this.X=a;t:if(ar(this)){var u=Cr(this.g);n="";var _=u.length,w=ye(this.g)==4;if(!this.h.i){if(typeof TextDecoder>"u"){Fe(this),vt(this);var T="";break t}this.h.i=new h.TextDecoder}for(s=0;s<_;s++)this.h.h=!0,n+=this.h.i.decode(u[s],{stream:!(w&&s==_-1)});u.length=0,this.h.g+=n,this.C=0,T=this.h.g}else T=this.g.oa();if(this.o=a==200,va(this.i,this.u,this.A,this.l,this.R,V,a),this.o){if(this.T&&!this.K){t:{if(this.g){var D,F=this.g;if((D=F.g?F.g.getResponseHeader("X-HTTP-Initial-Response"):null)&&!Z(D)){var k=D;break t}}k=null}if(a=k)Ye(this.i,this.l,a,"Initial handshake response via X-HTTP-Initial-Response"),this.K=!0,Kn(this,a);else{this.o=!1,this.s=3,W(12),Fe(this),vt(this);break e}}if(this.P){a=!0;let re;for(;!this.J&&this.C<T.length;)if(re=Ea(this,T),re==Wn){V==4&&(this.s=4,W(14),a=!1),Ye(this.i,this.l,null,"[Incomplete Response]");break}else if(re==sr){this.s=4,W(15),Ye(this.i,this.l,T,"[Invalid Chunk]"),a=!1;break}else Ye(this.i,this.l,re,null),Kn(this,re);if(ar(this)&&this.C!=0&&(this.h.g=this.h.g.slice(this.C),this.C=0),V!=4||T.length!=0||this.h.h||(this.s=1,W(16),a=!1),this.o=this.o&&a,!a)Ye(this.i,this.l,T,"[Invalid Chunked Response]"),Fe(this),vt(this);else if(0<T.length&&!this.W){this.W=!0;var H=this.j;H.g==this&&H.ba&&!H.M&&(H.j.info("Great, no buffering proxy detected. Bytes received: "+T.length),ei(H),H.M=!0,W(11))}}else Ye(this.i,this.l,T,null),Kn(this,T);V==4&&Fe(this),this.o&&!this.J&&(V==4?Nr(this.j,this):(this.o=!1,Kt(this)))}else ja(this.g),a==400&&0<T.indexOf("Unknown SID")?(this.s=3,W(12)):(this.s=0,W(13)),Fe(this),vt(this)}}}catch{}finally{}};function ar(n){return n.g?n.u=="GET"&&n.L!=2&&n.j.Ca:!1}function Ea(n,s){var a=n.C,u=s.indexOf(`
`,a);return u==-1?Wn:(a=Number(s.substring(a,u)),isNaN(a)?sr:(u+=1,u+a>s.length?Wn:(s=s.slice(u,u+a),n.C=u+a,s)))}Ae.prototype.cancel=function(){this.J=!0,Fe(this)};function Kt(n){n.S=Date.now()+n.I,cr(n,n.I)}function cr(n,s){if(n.B!=null)throw Error("WatchDog timer not null");n.B=mt(C(n.ba,n),s)}function qn(n){n.B&&(h.clearTimeout(n.B),n.B=null)}Ae.prototype.ba=function(){this.B=null;const n=Date.now();0<=n-this.S?(_a(this.i,this.A),this.L!=2&&(gt(),W(17)),Fe(this),this.s=2,vt(this)):cr(this,this.S-n)};function vt(n){n.j.G==0||n.J||Nr(n.j,n)}function Fe(n){qn(n);var s=n.M;s&&typeof s.ma=="function"&&s.ma(),n.M=null,Qi(n.U),n.g&&(s=n.g,n.g=null,s.abort(),s.ma())}function Kn(n,s){try{var a=n.j;if(a.G!=0&&(a.g==n||Jn(a.h,n))){if(!n.K&&Jn(a.h,n)&&a.G==3){try{var u=a.Da.g.parse(s)}catch{u=null}if(Array.isArray(u)&&u.length==3){var _=u;if(_[0]==0){e:if(!a.u){if(a.g)if(a.g.F+3e3<n.F)rn(a),tn(a);else break e;Zn(a),W(18)}}else a.za=_[1],0<a.za-a.T&&37500>_[2]&&a.F&&a.v==0&&!a.C&&(a.C=mt(C(a.Za,a),6e3));if(1>=hr(a.h)&&a.ca){try{a.ca()}catch{}a.ca=void 0}}else Be(a,11)}else if((n.K||a.g==n)&&rn(a),!Z(s))for(_=a.Da.g.parse(s),s=0;s<_.length;s++){let k=_[s];if(a.T=k[0],k=k[1],a.G==2)if(k[0]=="c"){a.K=k[1],a.ia=k[2];const H=k[3];H!=null&&(a.la=H,a.j.info("VER="+a.la));const V=k[4];V!=null&&(a.Aa=V,a.j.info("SVER="+a.Aa));const et=k[5];et!=null&&typeof et=="number"&&0<et&&(u=1.5*et,a.L=u,a.j.info("backChannelRequestTimeoutMs_="+u)),u=a;const re=n.g;if(re){const sn=re.g?re.g.getResponseHeader("X-Client-Wire-Protocol"):null;if(sn){var w=u.h;w.g||sn.indexOf("spdy")==-1&&sn.indexOf("quic")==-1&&sn.indexOf("h2")==-1||(w.j=w.l,w.g=new Set,w.h&&(Xn(w,w.h),w.h=null))}if(u.D){const ti=re.g?re.g.getResponseHeader("X-HTTP-Session-Id"):null;ti&&(u.ya=ti,N(u.I,u.D,ti))}}a.G=3,a.l&&a.l.ua(),a.ba&&(a.R=Date.now()-n.F,a.j.info("Handshake RTT: "+a.R+"ms")),u=a;var T=n;if(u.qa=xr(u,u.J?u.ia:null,u.W),T.K){dr(u.h,T);var D=T,F=u.L;F&&(D.I=F),D.B&&(qn(D),Kt(D)),u.g=T}else Dr(u);0<a.i.length&&nn(a)}else k[0]!="stop"&&k[0]!="close"||Be(a,7);else a.G==3&&(k[0]=="stop"||k[0]=="close"?k[0]=="stop"?Be(a,7):Qn(a):k[0]!="noop"&&a.l&&a.l.ta(k),a.v=0)}}gt(4)}catch{}}var Ta=class{constructor(n,s){this.g=n,this.map=s}};function lr(n){this.l=n||10,h.PerformanceNavigationTiming?(n=h.performance.getEntriesByType("navigation"),n=0<n.length&&(n[0].nextHopProtocol=="hq"||n[0].nextHopProtocol=="h2")):n=!!(h.chrome&&h.chrome.loadTimes&&h.chrome.loadTimes()&&h.chrome.loadTimes().wasFetchedViaSpdy),this.j=n?this.l:1,this.g=null,1<this.j&&(this.g=new Set),this.h=null,this.i=[]}function ur(n){return n.h?!0:n.g?n.g.size>=n.j:!1}function hr(n){return n.h?1:n.g?n.g.size:0}function Jn(n,s){return n.h?n.h==s:n.g?n.g.has(s):!1}function Xn(n,s){n.g?n.g.add(s):n.h=s}function dr(n,s){n.h&&n.h==s?n.h=null:n.g&&n.g.has(s)&&n.g.delete(s)}lr.prototype.cancel=function(){if(this.i=fr(this),this.h)this.h.cancel(),this.h=null;else if(this.g&&this.g.size!==0){for(const n of this.g.values())n.cancel();this.g.clear()}};function fr(n){if(n.h!=null)return n.i.concat(n.h.D);if(n.g!=null&&n.g.size!==0){let s=n.i;for(const a of n.g.values())s=s.concat(a.D);return s}return x(n.i)}function ba(n){if(n.V&&typeof n.V=="function")return n.V();if(typeof Map<"u"&&n instanceof Map||typeof Set<"u"&&n instanceof Set)return Array.from(n.values());if(typeof n=="string")return n.split("");if(g(n)){for(var s=[],a=n.length,u=0;u<a;u++)s.push(n[u]);return s}s=[],a=0;for(u in n)s[a++]=n[u];return s}function Aa(n){if(n.na&&typeof n.na=="function")return n.na();if(!n.V||typeof n.V!="function"){if(typeof Map<"u"&&n instanceof Map)return Array.from(n.keys());if(!(typeof Set<"u"&&n instanceof Set)){if(g(n)||typeof n=="string"){var s=[];n=n.length;for(var a=0;a<n;a++)s.push(a);return s}s=[],a=0;for(const u in n)s[a++]=u;return s}}}function pr(n,s){if(n.forEach&&typeof n.forEach=="function")n.forEach(s,void 0);else if(g(n)||typeof n=="string")Array.prototype.forEach.call(n,s,void 0);else for(var a=Aa(n),u=ba(n),_=u.length,w=0;w<_;w++)s.call(void 0,u[w],a&&a[w],n)}var gr=RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$");function Sa(n,s){if(n){n=n.split("&");for(var a=0;a<n.length;a++){var u=n[a].indexOf("="),_=null;if(0<=u){var w=n[a].substring(0,u);_=n[a].substring(u+1)}else w=n[a];s(w,_?decodeURIComponent(_.replace(/\+/g," ")):"")}}}function je(n){if(this.g=this.o=this.j="",this.s=null,this.m=this.l="",this.h=!1,n instanceof je){this.h=n.h,Jt(this,n.j),this.o=n.o,this.g=n.g,Xt(this,n.s),this.l=n.l;var s=n.i,a=new wt;a.i=s.i,s.g&&(a.g=new Map(s.g),a.h=s.h),mr(this,a),this.m=n.m}else n&&(s=String(n).match(gr))?(this.h=!1,Jt(this,s[1]||"",!0),this.o=_t(s[2]||""),this.g=_t(s[3]||"",!0),Xt(this,s[4]),this.l=_t(s[5]||"",!0),mr(this,s[6]||"",!0),this.m=_t(s[7]||"")):(this.h=!1,this.i=new wt(null,this.h))}je.prototype.toString=function(){var n=[],s=this.j;s&&n.push(It(s,yr,!0),":");var a=this.g;return(a||s=="file")&&(n.push("//"),(s=this.o)&&n.push(It(s,yr,!0),"@"),n.push(encodeURIComponent(String(a)).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),a=this.s,a!=null&&n.push(":",String(a))),(a=this.l)&&(this.g&&a.charAt(0)!="/"&&n.push("/"),n.push(It(a,a.charAt(0)=="/"?Ra:Pa,!0))),(a=this.i.toString())&&n.push("?",a),(a=this.m)&&n.push("#",It(a,Oa)),n.join("")};function me(n){return new je(n)}function Jt(n,s,a){n.j=a?_t(s,!0):s,n.j&&(n.j=n.j.replace(/:$/,""))}function Xt(n,s){if(s){if(s=Number(s),isNaN(s)||0>s)throw Error("Bad port number "+s);n.s=s}else n.s=null}function mr(n,s,a){s instanceof wt?(n.i=s,Da(n.i,n.h)):(a||(s=It(s,ka)),n.i=new wt(s,n.h))}function N(n,s,a){n.i.set(s,a)}function Yt(n){return N(n,"zx",Math.floor(2147483648*Math.random()).toString(36)+Math.abs(Math.floor(2147483648*Math.random())^Date.now()).toString(36)),n}function _t(n,s){return n?s?decodeURI(n.replace(/%25/g,"%2525")):decodeURIComponent(n):""}function It(n,s,a){return typeof n=="string"?(n=encodeURI(n).replace(s,Ca),a&&(n=n.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),n):null}function Ca(n){return n=n.charCodeAt(0),"%"+(n>>4&15).toString(16)+(n&15).toString(16)}var yr=/[#\/\?@]/g,Pa=/[#\?:]/g,Ra=/[#\?]/g,ka=/[#\?@]/g,Oa=/#/g;function wt(n,s){this.h=this.g=null,this.i=n||null,this.j=!!s}function Se(n){n.g||(n.g=new Map,n.h=0,n.i&&Sa(n.i,function(s,a){n.add(decodeURIComponent(s.replace(/\+/g," ")),a)}))}t=wt.prototype,t.add=function(n,s){Se(this),this.i=null,n=Qe(this,n);var a=this.g.get(n);return a||this.g.set(n,a=[]),a.push(s),this.h+=1,this};function vr(n,s){Se(n),s=Qe(n,s),n.g.has(s)&&(n.i=null,n.h-=n.g.get(s).length,n.g.delete(s))}function _r(n,s){return Se(n),s=Qe(n,s),n.g.has(s)}t.forEach=function(n,s){Se(this),this.g.forEach(function(a,u){a.forEach(function(_){n.call(s,_,u,this)},this)},this)},t.na=function(){Se(this);const n=Array.from(this.g.values()),s=Array.from(this.g.keys()),a=[];for(let u=0;u<s.length;u++){const _=n[u];for(let w=0;w<_.length;w++)a.push(s[u])}return a},t.V=function(n){Se(this);let s=[];if(typeof n=="string")_r(this,n)&&(s=s.concat(this.g.get(Qe(this,n))));else{n=Array.from(this.g.values());for(let a=0;a<n.length;a++)s=s.concat(n[a])}return s},t.set=function(n,s){return Se(this),this.i=null,n=Qe(this,n),_r(this,n)&&(this.h-=this.g.get(n).length),this.g.set(n,[s]),this.h+=1,this},t.get=function(n,s){return n?(n=this.V(n),0<n.length?String(n[0]):s):s};function Ir(n,s,a){vr(n,s),0<a.length&&(n.i=null,n.g.set(Qe(n,s),x(a)),n.h+=a.length)}t.toString=function(){if(this.i)return this.i;if(!this.g)return"";const n=[],s=Array.from(this.g.keys());for(var a=0;a<s.length;a++){var u=s[a];const w=encodeURIComponent(String(u)),T=this.V(u);for(u=0;u<T.length;u++){var _=w;T[u]!==""&&(_+="="+encodeURIComponent(String(T[u]))),n.push(_)}}return this.i=n.join("&")};function Qe(n,s){return s=String(s),n.j&&(s=s.toLowerCase()),s}function Da(n,s){s&&!n.j&&(Se(n),n.i=null,n.g.forEach(function(a,u){var _=u.toLowerCase();u!=_&&(vr(this,u),Ir(this,_,a))},n)),n.j=s}function La(n,s){const a=new yt;if(h.Image){const u=new Image;u.onload=L(Ce,a,"TestLoadImage: loaded",!0,s,u),u.onerror=L(Ce,a,"TestLoadImage: error",!1,s,u),u.onabort=L(Ce,a,"TestLoadImage: abort",!1,s,u),u.ontimeout=L(Ce,a,"TestLoadImage: timeout",!1,s,u),h.setTimeout(function(){u.ontimeout&&u.ontimeout()},1e4),u.src=n}else s(!1)}function Na(n,s){const a=new yt,u=new AbortController,_=setTimeout(()=>{u.abort(),Ce(a,"TestPingServer: timeout",!1,s)},1e4);fetch(n,{signal:u.signal}).then(w=>{clearTimeout(_),w.ok?Ce(a,"TestPingServer: ok",!0,s):Ce(a,"TestPingServer: server error",!1,s)}).catch(()=>{clearTimeout(_),Ce(a,"TestPingServer: error",!1,s)})}function Ce(n,s,a,u,_){try{_&&(_.onload=null,_.onerror=null,_.onabort=null,_.ontimeout=null),u(a)}catch{}}function Ma(){this.g=new ga}function Ua(n,s,a){const u=a||"";try{pr(n,function(_,w){let T=_;E(_)&&(T=Fn(_)),s.push(u+w+"="+encodeURIComponent(T))})}catch(_){throw s.push(u+"type="+encodeURIComponent("_badmap")),_}}function Qt(n){this.l=n.Ub||null,this.j=n.eb||!1}R(Qt,jn),Qt.prototype.g=function(){return new Zt(this.l,this.j)},Qt.prototype.i=function(n){return function(){return n}}({});function Zt(n,s){$.call(this),this.D=n,this.o=s,this.m=void 0,this.status=this.readyState=0,this.responseType=this.responseText=this.response=this.statusText="",this.onreadystatechange=null,this.u=new Headers,this.h=null,this.B="GET",this.A="",this.g=!1,this.v=this.j=this.l=null}R(Zt,$),t=Zt.prototype,t.open=function(n,s){if(this.readyState!=0)throw this.abort(),Error("Error reopening a connection");this.B=n,this.A=s,this.readyState=1,Tt(this)},t.send=function(n){if(this.readyState!=1)throw this.abort(),Error("need to call open() first. ");this.g=!0;const s={headers:this.u,method:this.B,credentials:this.m,cache:void 0};n&&(s.body=n),(this.D||h).fetch(new Request(this.A,s)).then(this.Sa.bind(this),this.ga.bind(this))},t.abort=function(){this.response=this.responseText="",this.u=new Headers,this.status=0,this.j&&this.j.cancel("Request was aborted.").catch(()=>{}),1<=this.readyState&&this.g&&this.readyState!=4&&(this.g=!1,Et(this)),this.readyState=0},t.Sa=function(n){if(this.g&&(this.l=n,this.h||(this.status=this.l.status,this.statusText=this.l.statusText,this.h=n.headers,this.readyState=2,Tt(this)),this.g&&(this.readyState=3,Tt(this),this.g)))if(this.responseType==="arraybuffer")n.arrayBuffer().then(this.Qa.bind(this),this.ga.bind(this));else if(typeof h.ReadableStream<"u"&&"body"in n){if(this.j=n.body.getReader(),this.o){if(this.responseType)throw Error('responseType must be empty for "streamBinaryChunks" mode responses.');this.response=[]}else this.response=this.responseText="",this.v=new TextDecoder;wr(this)}else n.text().then(this.Ra.bind(this),this.ga.bind(this))};function wr(n){n.j.read().then(n.Pa.bind(n)).catch(n.ga.bind(n))}t.Pa=function(n){if(this.g){if(this.o&&n.value)this.response.push(n.value);else if(!this.o){var s=n.value?n.value:new Uint8Array(0);(s=this.v.decode(s,{stream:!n.done}))&&(this.response=this.responseText+=s)}n.done?Et(this):Tt(this),this.readyState==3&&wr(this)}},t.Ra=function(n){this.g&&(this.response=this.responseText=n,Et(this))},t.Qa=function(n){this.g&&(this.response=n,Et(this))},t.ga=function(){this.g&&Et(this)};function Et(n){n.readyState=4,n.l=null,n.j=null,n.v=null,Tt(n)}t.setRequestHeader=function(n,s){this.u.append(n,s)},t.getResponseHeader=function(n){return this.h&&this.h.get(n.toLowerCase())||""},t.getAllResponseHeaders=function(){if(!this.h)return"";const n=[],s=this.h.entries();for(var a=s.next();!a.done;)a=a.value,n.push(a[0]+": "+a[1]),a=s.next();return n.join(`\r
`)};function Tt(n){n.onreadystatechange&&n.onreadystatechange.call(n)}Object.defineProperty(Zt.prototype,"withCredentials",{get:function(){return this.m==="include"},set:function(n){this.m=n?"include":"same-origin"}});function Er(n){let s="";return K(n,function(a,u){s+=u,s+=":",s+=a,s+=`\r
`}),s}function Yn(n,s,a){e:{for(u in a){var u=!1;break e}u=!0}u||(a=Er(a),typeof n=="string"?a!=null&&encodeURIComponent(String(a)):N(n,s,a))}function U(n){$.call(this),this.headers=new Map,this.o=n||null,this.h=!1,this.v=this.g=null,this.D="",this.m=0,this.l="",this.j=this.B=this.u=this.A=!1,this.I=null,this.H="",this.J=!1}R(U,$);var xa=/^https?$/i,Fa=["POST","PUT"];t=U.prototype,t.Ha=function(n){this.J=n},t.ea=function(n,s,a,u){if(this.g)throw Error("[goog.net.XhrIo] Object is active with another request="+this.D+"; newUri="+n);s=s?s.toUpperCase():"GET",this.D=n,this.l="",this.m=0,this.A=!1,this.h=!0,this.g=this.o?this.o.g():zn.g(),this.v=this.o?Zi(this.o):Zi(zn),this.g.onreadystatechange=C(this.Ea,this);try{this.B=!0,this.g.open(s,String(n),!0),this.B=!1}catch(w){Tr(this,w);return}if(n=a||"",a=new Map(this.headers),u)if(Object.getPrototypeOf(u)===Object.prototype)for(var _ in u)a.set(_,u[_]);else if(typeof u.keys=="function"&&typeof u.get=="function")for(const w of u.keys())a.set(w,u.get(w));else throw Error("Unknown input type for opt_headers: "+String(u));u=Array.from(a.keys()).find(w=>w.toLowerCase()=="content-type"),_=h.FormData&&n instanceof h.FormData,!(0<=Array.prototype.indexOf.call(Fa,s,void 0))||u||_||a.set("Content-Type","application/x-www-form-urlencoded;charset=utf-8");for(const[w,T]of a)this.g.setRequestHeader(w,T);this.H&&(this.g.responseType=this.H),"withCredentials"in this.g&&this.g.withCredentials!==this.J&&(this.g.withCredentials=this.J);try{Sr(this),this.u=!0,this.g.send(n),this.u=!1}catch(w){Tr(this,w)}};function Tr(n,s){n.h=!1,n.g&&(n.j=!0,n.g.abort(),n.j=!1),n.l=s,n.m=5,br(n),en(n)}function br(n){n.A||(n.A=!0,z(n,"complete"),z(n,"error"))}t.abort=function(n){this.g&&this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1,this.m=n||7,z(this,"complete"),z(this,"abort"),en(this))},t.N=function(){this.g&&(this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1),en(this,!0)),U.aa.N.call(this)},t.Ea=function(){this.s||(this.B||this.u||this.j?Ar(this):this.bb())},t.bb=function(){Ar(this)};function Ar(n){if(n.h&&typeof l<"u"&&(!n.v[1]||ye(n)!=4||n.Z()!=2)){if(n.u&&ye(n)==4)Ji(n.Ea,0,n);else if(z(n,"readystatechange"),ye(n)==4){n.h=!1;try{const T=n.Z();e:switch(T){case 200:case 201:case 202:case 204:case 206:case 304:case 1223:var s=!0;break e;default:s=!1}var a;if(!(a=s)){var u;if(u=T===0){var _=String(n.D).match(gr)[1]||null;!_&&h.self&&h.self.location&&(_=h.self.location.protocol.slice(0,-1)),u=!xa.test(_?_.toLowerCase():"")}a=u}if(a)z(n,"complete"),z(n,"success");else{n.m=6;try{var w=2<ye(n)?n.g.statusText:""}catch{w=""}n.l=w+" ["+n.Z()+"]",br(n)}}finally{en(n)}}}}function en(n,s){if(n.g){Sr(n);const a=n.g,u=n.v[0]?()=>{}:null;n.g=null,n.v=null,s||z(n,"ready");try{a.onreadystatechange=u}catch{}}}function Sr(n){n.I&&(h.clearTimeout(n.I),n.I=null)}t.isActive=function(){return!!this.g};function ye(n){return n.g?n.g.readyState:0}t.Z=function(){try{return 2<ye(this)?this.g.status:-1}catch{return-1}},t.oa=function(){try{return this.g?this.g.responseText:""}catch{return""}},t.Oa=function(n){if(this.g){var s=this.g.responseText;return n&&s.indexOf(n)==0&&(s=s.substring(n.length)),pa(s)}};function Cr(n){try{if(!n.g)return null;if("response"in n.g)return n.g.response;switch(n.H){case"":case"text":return n.g.responseText;case"arraybuffer":if("mozResponseArrayBuffer"in n.g)return n.g.mozResponseArrayBuffer}return null}catch{return null}}function ja(n){const s={};n=(n.g&&2<=ye(n)&&n.g.getAllResponseHeaders()||"").split(`\r
`);for(let u=0;u<n.length;u++){if(Z(n[u]))continue;var a=y(n[u]);const _=a[0];if(a=a[1],typeof a!="string")continue;a=a.trim();const w=s[_]||[];s[_]=w,w.push(a)}v(s,function(u){return u.join(", ")})}t.Ba=function(){return this.m},t.Ka=function(){return typeof this.l=="string"?this.l:String(this.l)};function bt(n,s,a){return a&&a.internalChannelParams&&a.internalChannelParams[n]||s}function Pr(n){this.Aa=0,this.i=[],this.j=new yt,this.ia=this.qa=this.I=this.W=this.g=this.ya=this.D=this.H=this.m=this.S=this.o=null,this.Ya=this.U=0,this.Va=bt("failFast",!1,n),this.F=this.C=this.u=this.s=this.l=null,this.X=!0,this.za=this.T=-1,this.Y=this.v=this.B=0,this.Ta=bt("baseRetryDelayMs",5e3,n),this.cb=bt("retryDelaySeedMs",1e4,n),this.Wa=bt("forwardChannelMaxRetries",2,n),this.wa=bt("forwardChannelRequestTimeoutMs",2e4,n),this.pa=n&&n.xmlHttpFactory||void 0,this.Xa=n&&n.Tb||void 0,this.Ca=n&&n.useFetchStreams||!1,this.L=void 0,this.J=n&&n.supportsCrossDomainXhr||!1,this.K="",this.h=new lr(n&&n.concurrentRequestLimit),this.Da=new Ma,this.P=n&&n.fastHandshake||!1,this.O=n&&n.encodeInitMessageHeaders||!1,this.P&&this.O&&(this.O=!1),this.Ua=n&&n.Rb||!1,n&&n.xa&&this.j.xa(),n&&n.forceLongPolling&&(this.X=!1),this.ba=!this.P&&this.X&&n&&n.detectBufferingProxy||!1,this.ja=void 0,n&&n.longPollingTimeout&&0<n.longPollingTimeout&&(this.ja=n.longPollingTimeout),this.ca=void 0,this.R=0,this.M=!1,this.ka=this.A=null}t=Pr.prototype,t.la=8,t.G=1,t.connect=function(n,s,a,u){W(0),this.W=n,this.H=s||{},a&&u!==void 0&&(this.H.OSID=a,this.H.OAID=u),this.F=this.X,this.I=xr(this,null,this.W),nn(this)};function Qn(n){if(Rr(n),n.G==3){var s=n.U++,a=me(n.I);if(N(a,"SID",n.K),N(a,"RID",s),N(a,"TYPE","terminate"),At(n,a),s=new Ae(n,n.j,s),s.L=2,s.v=Yt(me(a)),a=!1,h.navigator&&h.navigator.sendBeacon)try{a=h.navigator.sendBeacon(s.v.toString(),"")}catch{}!a&&h.Image&&(new Image().src=s.v,a=!0),a||(s.g=Fr(s.j,null),s.g.ea(s.v)),s.F=Date.now(),Kt(s)}Ur(n)}function tn(n){n.g&&(ei(n),n.g.cancel(),n.g=null)}function Rr(n){tn(n),n.u&&(h.clearTimeout(n.u),n.u=null),rn(n),n.h.cancel(),n.s&&(typeof n.s=="number"&&h.clearTimeout(n.s),n.s=null)}function nn(n){if(!ur(n.h)&&!n.s){n.s=!0;var s=n.Ga;ut||zi(),ht||(ut(),ht=!0),kn.add(s,n),n.B=0}}function Ba(n,s){return hr(n.h)>=n.h.j-(n.s?1:0)?!1:n.s?(n.i=s.D.concat(n.i),!0):n.G==1||n.G==2||n.B>=(n.Va?0:n.Wa)?!1:(n.s=mt(C(n.Ga,n,s),Mr(n,n.B)),n.B++,!0)}t.Ga=function(n){if(this.s)if(this.s=null,this.G==1){if(!n){this.U=Math.floor(1e5*Math.random()),n=this.U++;const _=new Ae(this,this.j,n);let w=this.o;if(this.S&&(w?(w=d(w),m(w,this.S)):w=this.S),this.m!==null||this.O||(_.H=w,w=null),this.P)e:{for(var s=0,a=0;a<this.i.length;a++){t:{var u=this.i[a];if("__data__"in u.map&&(u=u.map.__data__,typeof u=="string")){u=u.length;break t}u=void 0}if(u===void 0)break;if(s+=u,4096<s){s=a;break e}if(s===4096||a===this.i.length-1){s=a+1;break e}}s=1e3}else s=1e3;s=Or(this,_,s),a=me(this.I),N(a,"RID",n),N(a,"CVER",22),this.D&&N(a,"X-HTTP-Session-Id",this.D),At(this,a),w&&(this.O?s="headers="+encodeURIComponent(String(Er(w)))+"&"+s:this.m&&Yn(a,this.m,w)),Xn(this.h,_),this.Ua&&N(a,"TYPE","init"),this.P?(N(a,"$req",s),N(a,"SID","null"),_.T=!0,Gn(_,a,null)):Gn(_,a,s),this.G=2}}else this.G==3&&(n?kr(this,n):this.i.length==0||ur(this.h)||kr(this))};function kr(n,s){var a;s?a=s.l:a=n.U++;const u=me(n.I);N(u,"SID",n.K),N(u,"RID",a),N(u,"AID",n.T),At(n,u),n.m&&n.o&&Yn(u,n.m,n.o),a=new Ae(n,n.j,a,n.B+1),n.m===null&&(a.H=n.o),s&&(n.i=s.D.concat(n.i)),s=Or(n,a,1e3),a.I=Math.round(.5*n.wa)+Math.round(.5*n.wa*Math.random()),Xn(n.h,a),Gn(a,u,s)}function At(n,s){n.H&&K(n.H,function(a,u){N(s,u,a)}),n.l&&pr({},function(a,u){N(s,u,a)})}function Or(n,s,a){a=Math.min(n.i.length,a);var u=n.l?C(n.l.Na,n.l,n):null;e:{var _=n.i;let w=-1;for(;;){const T=["count="+a];w==-1?0<a?(w=_[0].g,T.push("ofs="+w)):w=0:T.push("ofs="+w);let D=!0;for(let F=0;F<a;F++){let k=_[F].g;const H=_[F].map;if(k-=w,0>k)w=Math.max(0,_[F].g-100),D=!1;else try{Ua(H,T,"req"+k+"_")}catch{u&&u(H)}}if(D){u=T.join("&");break e}}}return n=n.i.splice(0,a),s.D=n,u}function Dr(n){if(!n.g&&!n.u){n.Y=1;var s=n.Fa;ut||zi(),ht||(ut(),ht=!0),kn.add(s,n),n.v=0}}function Zn(n){return n.g||n.u||3<=n.v?!1:(n.Y++,n.u=mt(C(n.Fa,n),Mr(n,n.v)),n.v++,!0)}t.Fa=function(){if(this.u=null,Lr(this),this.ba&&!(this.M||this.g==null||0>=this.R)){var n=2*this.R;this.j.info("BP detection timer enabled: "+n),this.A=mt(C(this.ab,this),n)}},t.ab=function(){this.A&&(this.A=null,this.j.info("BP detection timeout reached."),this.j.info("Buffering proxy detected and switch to long-polling!"),this.F=!1,this.M=!0,W(10),tn(this),Lr(this))};function ei(n){n.A!=null&&(h.clearTimeout(n.A),n.A=null)}function Lr(n){n.g=new Ae(n,n.j,"rpc",n.Y),n.m===null&&(n.g.H=n.o),n.g.O=0;var s=me(n.qa);N(s,"RID","rpc"),N(s,"SID",n.K),N(s,"AID",n.T),N(s,"CI",n.F?"0":"1"),!n.F&&n.ja&&N(s,"TO",n.ja),N(s,"TYPE","xmlhttp"),At(n,s),n.m&&n.o&&Yn(s,n.m,n.o),n.L&&(n.g.I=n.L);var a=n.g;n=n.ia,a.L=1,a.v=Yt(me(s)),a.m=null,a.P=!0,or(a,n)}t.Za=function(){this.C!=null&&(this.C=null,tn(this),Zn(this),W(19))};function rn(n){n.C!=null&&(h.clearTimeout(n.C),n.C=null)}function Nr(n,s){var a=null;if(n.g==s){rn(n),ei(n),n.g=null;var u=2}else if(Jn(n.h,s))a=s.D,dr(n.h,s),u=1;else return;if(n.G!=0){if(s.o)if(u==1){a=s.m?s.m.length:0,s=Date.now()-s.F;var _=n.B;u=Hn(),z(u,new ir(u,a)),nn(n)}else Dr(n);else if(_=s.s,_==3||_==0&&0<s.X||!(u==1&&Ba(n,s)||u==2&&Zn(n)))switch(a&&0<a.length&&(s=n.h,s.i=s.i.concat(a)),_){case 1:Be(n,5);break;case 4:Be(n,10);break;case 3:Be(n,6);break;default:Be(n,2)}}}function Mr(n,s){let a=n.Ta+Math.floor(Math.random()*n.cb);return n.isActive()||(a*=2),a*s}function Be(n,s){if(n.j.info("Error code "+s),s==2){var a=C(n.fb,n),u=n.Xa;const _=!u;u=new je(u||"//www.google.com/images/cleardot.gif"),h.location&&h.location.protocol=="http"||Jt(u,"https"),Yt(u),_?La(u.toString(),a):Na(u.toString(),a)}else W(2);n.G=0,n.l&&n.l.sa(s),Ur(n),Rr(n)}t.fb=function(n){n?(this.j.info("Successfully pinged google.com"),W(2)):(this.j.info("Failed to ping google.com"),W(1))};function Ur(n){if(n.G=0,n.ka=[],n.l){const s=fr(n.h);(s.length!=0||n.i.length!=0)&&(M(n.ka,s),M(n.ka,n.i),n.h.i.length=0,x(n.i),n.i.length=0),n.l.ra()}}function xr(n,s,a){var u=a instanceof je?me(a):new je(a);if(u.g!="")s&&(u.g=s+"."+u.g),Xt(u,u.s);else{var _=h.location;u=_.protocol,s=s?s+"."+_.hostname:_.hostname,_=+_.port;var w=new je(null);u&&Jt(w,u),s&&(w.g=s),_&&Xt(w,_),a&&(w.l=a),u=w}return a=n.D,s=n.ya,a&&s&&N(u,a,s),N(u,"VER",n.la),At(n,u),u}function Fr(n,s,a){if(s&&!n.J)throw Error("Can't create secondary domain capable XhrIo object.");return s=n.Ca&&!n.pa?new U(new Qt({eb:a})):new U(n.pa),s.Ha(n.J),s}t.isActive=function(){return!!this.l&&this.l.isActive(this)};function jr(){}t=jr.prototype,t.ua=function(){},t.ta=function(){},t.sa=function(){},t.ra=function(){},t.isActive=function(){return!0},t.Na=function(){};function te(n,s){$.call(this),this.g=new Pr(s),this.l=n,this.h=s&&s.messageUrlParams||null,n=s&&s.messageHeaders||null,s&&s.clientProtocolHeaderRequired&&(n?n["X-Client-Protocol"]="webchannel":n={"X-Client-Protocol":"webchannel"}),this.g.o=n,n=s&&s.initMessageHeaders||null,s&&s.messageContentType&&(n?n["X-WebChannel-Content-Type"]=s.messageContentType:n={"X-WebChannel-Content-Type":s.messageContentType}),s&&s.va&&(n?n["X-WebChannel-Client-Profile"]=s.va:n={"X-WebChannel-Client-Profile":s.va}),this.g.S=n,(n=s&&s.Sb)&&!Z(n)&&(this.g.m=n),this.v=s&&s.supportsCrossDomainXhr||!1,this.u=s&&s.sendRawJson||!1,(s=s&&s.httpSessionIdParam)&&!Z(s)&&(this.g.D=s,n=this.h,n!==null&&s in n&&(n=this.h,s in n&&delete n[s])),this.j=new Ze(this)}R(te,$),te.prototype.m=function(){this.g.l=this.j,this.v&&(this.g.J=!0),this.g.connect(this.l,this.h||void 0)},te.prototype.close=function(){Qn(this.g)},te.prototype.o=function(n){var s=this.g;if(typeof n=="string"){var a={};a.__data__=n,n=a}else this.u&&(a={},a.__data__=Fn(n),n=a);s.i.push(new Ta(s.Ya++,n)),s.G==3&&nn(s)},te.prototype.N=function(){this.g.l=null,delete this.j,Qn(this.g),delete this.g,te.aa.N.call(this)};function Br(n){Bn.call(this),n.__headers__&&(this.headers=n.__headers__,this.statusCode=n.__status__,delete n.__headers__,delete n.__status__);var s=n.__sm__;if(s){e:{for(const a in s){n=a;break e}n=void 0}(this.i=n)&&(n=this.i,s=s!==null&&n in s?s[n]:void 0),this.data=s}else this.data=n}R(Br,Bn);function $r(){$n.call(this),this.status=1}R($r,$n);function Ze(n){this.g=n}R(Ze,jr),Ze.prototype.ua=function(){z(this.g,"a")},Ze.prototype.ta=function(n){z(this.g,new Br(n))},Ze.prototype.sa=function(n){z(this.g,new $r)},Ze.prototype.ra=function(){z(this.g,"b")},te.prototype.send=te.prototype.o,te.prototype.open=te.prototype.m,te.prototype.close=te.prototype.close,Vn.NO_ERROR=0,Vn.TIMEOUT=8,Vn.HTTP_ERROR=6,wa.COMPLETE="complete",ma.EventType=pt,pt.OPEN="a",pt.CLOSE="b",pt.ERROR="c",pt.MESSAGE="d",$.prototype.listen=$.prototype.K,U.prototype.listenOnce=U.prototype.L,U.prototype.getLastError=U.prototype.Ka,U.prototype.getLastErrorCode=U.prototype.Ba,U.prototype.getStatus=U.prototype.Z,U.prototype.getResponseJson=U.prototype.Oa,U.prototype.getResponseText=U.prototype.oa,U.prototype.send=U.prototype.ea,U.prototype.setWithCredentials=U.prototype.Ha}).apply(typeof an<"u"?an:typeof self<"u"?self:typeof window<"u"?window:{});const _s="@firebase/firestore";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class G{constructor(e){this.uid=e}isAuthenticated(){return this.uid!=null}toKey(){return this.isAuthenticated()?"uid:"+this.uid:"anonymous-user"}isEqual(e){return e.uid===this.uid}}G.UNAUTHENTICATED=new G(null),G.GOOGLE_CREDENTIALS=new G("google-credentials-uid"),G.FIRST_PARTY=new G("first-party-uid"),G.MOCK_USER=new G("mock-user");/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Ht="10.14.0";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const st=new bn("@firebase/firestore");function se(t,...e){if(st.logLevel<=O.DEBUG){const i=e.map(Ui);st.debug(`Firestore (${Ht}): ${t}`,...i)}}function Oo(t,...e){if(st.logLevel<=O.ERROR){const i=e.map(Ui);st.error(`Firestore (${Ht}): ${t}`,...i)}}function Lh(t,...e){if(st.logLevel<=O.WARN){const i=e.map(Ui);st.warn(`Firestore (${Ht}): ${t}`,...i)}}function Ui(t){if(typeof t=="string")return t;try{/**
* @license
* Copyright 2020 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/return function(i){return JSON.stringify(i)}(t)}catch{return t}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function xi(t="Unexpected state"){const e=`FIRESTORE (${Ht}) INTERNAL ASSERTION FAILED: `+t;throw Oo(e),new Error(e)}function Rt(t,e){t||xi()}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const J={CANCELLED:"cancelled",INVALID_ARGUMENT:"invalid-argument",FAILED_PRECONDITION:"failed-precondition"};class X extends ce{constructor(e,i){super(e,i),this.code=e,this.message=i,this.toString=()=>`${this.name}: [code=${this.code}]: ${this.message}`}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class kt{constructor(){this.promise=new Promise((e,i)=>{this.resolve=e,this.reject=i})}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Do{constructor(e,i){this.user=i,this.type="OAuth",this.headers=new Map,this.headers.set("Authorization",`Bearer ${e}`)}}class Nh{getToken(){return Promise.resolve(null)}invalidateToken(){}start(e,i){e.enqueueRetryable(()=>i(G.UNAUTHENTICATED))}shutdown(){}}class Mh{constructor(e){this.token=e,this.changeListener=null}getToken(){return Promise.resolve(this.token)}invalidateToken(){}start(e,i){this.changeListener=i,e.enqueueRetryable(()=>i(this.token.user))}shutdown(){this.changeListener=null}}class Uh{constructor(e){this.t=e,this.currentUser=G.UNAUTHENTICATED,this.i=0,this.forceRefresh=!1,this.auth=null}start(e,i){Rt(this.o===void 0);let r=this.i;const o=g=>this.i!==r?(r=this.i,i(g)):Promise.resolve();let c=new kt;this.o=()=>{this.i++,this.currentUser=this.u(),c.resolve(),c=new kt,e.enqueueRetryable(()=>o(this.currentUser))};const l=()=>{const g=c;e.enqueueRetryable(async()=>{await g.promise,await o(this.currentUser)})},h=g=>{se("FirebaseAuthCredentialsProvider","Auth detected"),this.auth=g,this.o&&(this.auth.addAuthTokenListener(this.o),l())};this.t.onInit(g=>h(g)),setTimeout(()=>{if(!this.auth){const g=this.t.getImmediate({optional:!0});g?h(g):(se("FirebaseAuthCredentialsProvider","Auth not yet detected"),c.resolve(),c=new kt)}},0),l()}getToken(){const e=this.i,i=this.forceRefresh;return this.forceRefresh=!1,this.auth?this.auth.getToken(i).then(r=>this.i!==e?(se("FirebaseAuthCredentialsProvider","getToken aborted due to token change."),this.getToken()):r?(Rt(typeof r.accessToken=="string"),new Do(r.accessToken,this.currentUser)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.auth&&this.o&&this.auth.removeAuthTokenListener(this.o),this.o=void 0}u(){const e=this.auth&&this.auth.getUid();return Rt(e===null||typeof e=="string"),new G(e)}}class xh{constructor(e,i,r){this.l=e,this.h=i,this.P=r,this.type="FirstParty",this.user=G.FIRST_PARTY,this.I=new Map}T(){return this.P?this.P():null}get headers(){this.I.set("X-Goog-AuthUser",this.l);const e=this.T();return e&&this.I.set("Authorization",e),this.h&&this.I.set("X-Goog-Iam-Authorization-Token",this.h),this.I}}class Fh{constructor(e,i,r){this.l=e,this.h=i,this.P=r}getToken(){return Promise.resolve(new xh(this.l,this.h,this.P))}start(e,i){e.enqueueRetryable(()=>i(G.FIRST_PARTY))}shutdown(){}invalidateToken(){}}class jh{constructor(e){this.value=e,this.type="AppCheck",this.headers=new Map,e&&e.length>0&&this.headers.set("x-firebase-appcheck",this.value)}}class Bh{constructor(e){this.A=e,this.forceRefresh=!1,this.appCheck=null,this.R=null}start(e,i){Rt(this.o===void 0);const r=c=>{c.error!=null&&se("FirebaseAppCheckTokenProvider",`Error getting App Check token; using placeholder token instead. Error: ${c.error.message}`);const l=c.token!==this.R;return this.R=c.token,se("FirebaseAppCheckTokenProvider",`Received ${l?"new":"existing"} token.`),l?i(c.token):Promise.resolve()};this.o=c=>{e.enqueueRetryable(()=>r(c))};const o=c=>{se("FirebaseAppCheckTokenProvider","AppCheck detected"),this.appCheck=c,this.o&&this.appCheck.addTokenListener(this.o)};this.A.onInit(c=>o(c)),setTimeout(()=>{if(!this.appCheck){const c=this.A.getImmediate({optional:!0});c?o(c):se("FirebaseAppCheckTokenProvider","AppCheck not yet detected")}},0)}getToken(){const e=this.forceRefresh;return this.forceRefresh=!1,this.appCheck?this.appCheck.getToken(e).then(i=>i?(Rt(typeof i.token=="string"),this.R=i.token,new jh(i.token)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.appCheck&&this.o&&this.appCheck.removeTokenListener(this.o),this.o=void 0}}function $h(t){return t.name==="IndexedDbTransactionError"}class In{constructor(e,i){this.projectId=e,this.database=i||"(default)"}static empty(){return new In("","")}get isDefaultDatabase(){return this.database==="(default)"}isEqual(e){return e instanceof In&&e.projectId===this.projectId&&e.database===this.database}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var Is,P;(P=Is||(Is={}))[P.OK=0]="OK",P[P.CANCELLED=1]="CANCELLED",P[P.UNKNOWN=2]="UNKNOWN",P[P.INVALID_ARGUMENT=3]="INVALID_ARGUMENT",P[P.DEADLINE_EXCEEDED=4]="DEADLINE_EXCEEDED",P[P.NOT_FOUND=5]="NOT_FOUND",P[P.ALREADY_EXISTS=6]="ALREADY_EXISTS",P[P.PERMISSION_DENIED=7]="PERMISSION_DENIED",P[P.UNAUTHENTICATED=16]="UNAUTHENTICATED",P[P.RESOURCE_EXHAUSTED=8]="RESOURCE_EXHAUSTED",P[P.FAILED_PRECONDITION=9]="FAILED_PRECONDITION",P[P.ABORTED=10]="ABORTED",P[P.OUT_OF_RANGE=11]="OUT_OF_RANGE",P[P.UNIMPLEMENTED=12]="UNIMPLEMENTED",P[P.INTERNAL=13]="INTERNAL",P[P.UNAVAILABLE=14]="UNAVAILABLE",P[P.DATA_LOSS=15]="DATA_LOSS";/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */new ko([4294967295,4294967295],0);function li(){return typeof document<"u"?document:null}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Hh{constructor(e,i,r=1e3,o=1.5,c=6e4){this.ui=e,this.timerId=i,this.ko=r,this.qo=o,this.Qo=c,this.Ko=0,this.$o=null,this.Uo=Date.now(),this.reset()}reset(){this.Ko=0}Wo(){this.Ko=this.Qo}Go(e){this.cancel();const i=Math.floor(this.Ko+this.zo()),r=Math.max(0,Date.now()-this.Uo),o=Math.max(0,i-r);o>0&&se("ExponentialBackoff",`Backing off for ${o} ms (base delay: ${this.Ko} ms, delay with jitter: ${i} ms, last attempt: ${r} ms ago)`),this.$o=this.ui.enqueueAfterDelay(this.timerId,o,()=>(this.Uo=Date.now(),e())),this.Ko*=this.qo,this.Ko<this.ko&&(this.Ko=this.ko),this.Ko>this.Qo&&(this.Ko=this.Qo)}jo(){this.$o!==null&&(this.$o.skipDelay(),this.$o=null)}cancel(){this.$o!==null&&(this.$o.cancel(),this.$o=null)}zo(){return(Math.random()-.5)*this.Ko}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Fi{constructor(e,i,r,o,c){this.asyncQueue=e,this.timerId=i,this.targetTimeMs=r,this.op=o,this.removalCallback=c,this.deferred=new kt,this.then=this.deferred.promise.then.bind(this.deferred.promise),this.deferred.promise.catch(l=>{})}get promise(){return this.deferred.promise}static createAndSchedule(e,i,r,o,c){const l=Date.now()+r,h=new Fi(e,i,l,o,c);return h.start(r),h}start(e){this.timerHandle=setTimeout(()=>this.handleDelayElapsed(),e)}skipDelay(){return this.handleDelayElapsed()}cancel(e){this.timerHandle!==null&&(this.clearTimeout(),this.deferred.reject(new X(J.CANCELLED,"Operation cancelled"+(e?": "+e:""))))}handleDelayElapsed(){this.asyncQueue.enqueueAndForget(()=>this.timerHandle!==null?(this.clearTimeout(),this.op().then(e=>this.deferred.resolve(e))):Promise.resolve())}clearTimeout(){this.timerHandle!==null&&(this.removalCallback(this),clearTimeout(this.timerHandle),this.timerHandle=null)}}var ws,Es;(Es=ws||(ws={})).ea="default",Es.Cache="cache";/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Vh(t){const e={};return t.timeoutSeconds!==void 0&&(e.timeoutSeconds=t.timeoutSeconds),e}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ts=new Map;function zh(t,e,i,r){if(e===!0&&r===!0)throw new X(J.INVALID_ARGUMENT,`${t} and ${i} cannot be used together.`)}function Wh(t){if(t===void 0)return"undefined";if(t===null)return"null";if(typeof t=="string")return t.length>20&&(t=`${t.substring(0,20)}...`),JSON.stringify(t);if(typeof t=="number"||typeof t=="boolean")return""+t;if(typeof t=="object"){if(t instanceof Array)return"an array";{const e=function(r){return r.constructor?r.constructor.name:null}(t);return e?`a custom ${e} object`:"an object"}}return typeof t=="function"?"a function":xi()}function Gh(t,e){if("_delegate"in t&&(t=t._delegate),!(t instanceof e)){if(e.name===t.constructor.name)throw new X(J.INVALID_ARGUMENT,"Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");{const i=Wh(t);throw new X(J.INVALID_ARGUMENT,`Expected type '${e.name}', but it was: ${i}`)}}return t}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class bs{constructor(e){var i,r;if(e.host===void 0){if(e.ssl!==void 0)throw new X(J.INVALID_ARGUMENT,"Can't provide ssl option if host option is not set");this.host="firestore.googleapis.com",this.ssl=!0}else this.host=e.host,this.ssl=(i=e.ssl)===null||i===void 0||i;if(this.credentials=e.credentials,this.ignoreUndefinedProperties=!!e.ignoreUndefinedProperties,this.localCache=e.localCache,e.cacheSizeBytes===void 0)this.cacheSizeBytes=41943040;else{if(e.cacheSizeBytes!==-1&&e.cacheSizeBytes<1048576)throw new X(J.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");this.cacheSizeBytes=e.cacheSizeBytes}zh("experimentalForceLongPolling",e.experimentalForceLongPolling,"experimentalAutoDetectLongPolling",e.experimentalAutoDetectLongPolling),this.experimentalForceLongPolling=!!e.experimentalForceLongPolling,this.experimentalForceLongPolling?this.experimentalAutoDetectLongPolling=!1:e.experimentalAutoDetectLongPolling===void 0?this.experimentalAutoDetectLongPolling=!0:this.experimentalAutoDetectLongPolling=!!e.experimentalAutoDetectLongPolling,this.experimentalLongPollingOptions=Vh((r=e.experimentalLongPollingOptions)!==null&&r!==void 0?r:{}),function(c){if(c.timeoutSeconds!==void 0){if(isNaN(c.timeoutSeconds))throw new X(J.INVALID_ARGUMENT,`invalid long polling timeout: ${c.timeoutSeconds} (must not be NaN)`);if(c.timeoutSeconds<5)throw new X(J.INVALID_ARGUMENT,`invalid long polling timeout: ${c.timeoutSeconds} (minimum allowed value is 5)`);if(c.timeoutSeconds>30)throw new X(J.INVALID_ARGUMENT,`invalid long polling timeout: ${c.timeoutSeconds} (maximum allowed value is 30)`)}}(this.experimentalLongPollingOptions),this.useFetchStreams=!!e.useFetchStreams}isEqual(e){return this.host===e.host&&this.ssl===e.ssl&&this.credentials===e.credentials&&this.cacheSizeBytes===e.cacheSizeBytes&&this.experimentalForceLongPolling===e.experimentalForceLongPolling&&this.experimentalAutoDetectLongPolling===e.experimentalAutoDetectLongPolling&&function(r,o){return r.timeoutSeconds===o.timeoutSeconds}(this.experimentalLongPollingOptions,e.experimentalLongPollingOptions)&&this.ignoreUndefinedProperties===e.ignoreUndefinedProperties&&this.useFetchStreams===e.useFetchStreams}}class Lo{constructor(e,i,r,o){this._authCredentials=e,this._appCheckCredentials=i,this._databaseId=r,this._app=o,this.type="firestore-lite",this._persistenceKey="(lite)",this._settings=new bs({}),this._settingsFrozen=!1,this._terminateTask="notTerminated"}get app(){if(!this._app)throw new X(J.FAILED_PRECONDITION,"Firestore was not initialized using the Firebase SDK. 'app' is not available");return this._app}get _initialized(){return this._settingsFrozen}get _terminated(){return this._terminateTask!=="notTerminated"}_setSettings(e){if(this._settingsFrozen)throw new X(J.FAILED_PRECONDITION,"Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");this._settings=new bs(e),e.credentials!==void 0&&(this._authCredentials=function(r){if(!r)return new Nh;switch(r.type){case"firstParty":return new Fh(r.sessionIndex||"0",r.iamToken||null,r.authTokenFactory||null);case"provider":return r.client;default:throw new X(J.INVALID_ARGUMENT,"makeAuthCredentialsProvider failed due to invalid credential type")}}(e.credentials))}_getSettings(){return this._settings}_freezeSettings(){return this._settingsFrozen=!0,this._settings}_delete(){return this._terminateTask==="notTerminated"&&(this._terminateTask=this._terminate()),this._terminateTask}async _restart(){this._terminateTask==="notTerminated"?await this._terminate():this._terminateTask="notTerminated"}toJSON(){return{app:this._app,databaseId:this._databaseId,settings:this._settings}}_terminate(){return function(i){const r=Ts.get(i);r&&(se("ComponentProvider","Removing Datastore"),Ts.delete(i),r.terminate())}(this),Promise.resolve()}}function qh(t,e,i,r={}){var o;const c=(t=Gh(t,Lo))._getSettings(),l=`${e}:${i}`;if(c.host!=="firestore.googleapis.com"&&c.host!==l&&Lh("Host has been set in both settings() and connectFirestoreEmulator(), emulator host will be used."),t._setSettings(Object.assign(Object.assign({},c),{host:l,ssl:!1})),r.mockUserToken){let h,g;if(typeof r.mockUserToken=="string")h=r.mockUserToken,g=G.MOCK_USER;else{h=Xa(r.mockUserToken,(o=t._app)===null||o===void 0?void 0:o.options.projectId);const E=r.mockUserToken.sub||r.mockUserToken.user_id;if(!E)throw new X(J.INVALID_ARGUMENT,"mockUserToken must contain 'sub' or 'user_id' field!");g=new G(E)}t._authCredentials=new Mh(new Do(h,g))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class As{constructor(e=Promise.resolve()){this.Pu=[],this.Iu=!1,this.Tu=[],this.Eu=null,this.du=!1,this.Au=!1,this.Ru=[],this.t_=new Hh(this,"async_queue_retry"),this.Vu=()=>{const r=li();r&&se("AsyncQueue","Visibility state changed to "+r.visibilityState),this.t_.jo()},this.mu=e;const i=li();i&&typeof i.addEventListener=="function"&&i.addEventListener("visibilitychange",this.Vu)}get isShuttingDown(){return this.Iu}enqueueAndForget(e){this.enqueue(e)}enqueueAndForgetEvenWhileRestricted(e){this.fu(),this.gu(e)}enterRestrictedMode(e){if(!this.Iu){this.Iu=!0,this.Au=e||!1;const i=li();i&&typeof i.removeEventListener=="function"&&i.removeEventListener("visibilitychange",this.Vu)}}enqueue(e){if(this.fu(),this.Iu)return new Promise(()=>{});const i=new kt;return this.gu(()=>this.Iu&&this.Au?Promise.resolve():(e().then(i.resolve,i.reject),i.promise)).then(()=>i.promise)}enqueueRetryable(e){this.enqueueAndForget(()=>(this.Pu.push(e),this.pu()))}async pu(){if(this.Pu.length!==0){try{await this.Pu[0](),this.Pu.shift(),this.t_.reset()}catch(e){if(!$h(e))throw e;se("AsyncQueue","Operation failed with retryable error: "+e)}this.Pu.length>0&&this.t_.Go(()=>this.pu())}}gu(e){const i=this.mu.then(()=>(this.du=!0,e().catch(r=>{this.Eu=r,this.du=!1;const o=function(l){let h=l.message||"";return l.stack&&(h=l.stack.includes(l.message)?l.stack:l.message+`
`+l.stack),h}(r);throw Oo("INTERNAL UNHANDLED ERROR: ",o),r}).then(r=>(this.du=!1,r))));return this.mu=i,i}enqueueAfterDelay(e,i,r){this.fu(),this.Ru.indexOf(e)>-1&&(i=0);const o=Fi.createAndSchedule(this,e,i,r,c=>this.yu(c));return this.Tu.push(o),o}fu(){this.Eu&&xi()}verifyOperationInProgress(){}async wu(){let e;do e=this.mu,await e;while(e!==this.mu)}Su(e){for(const i of this.Tu)if(i.timerId===e)return!0;return!1}bu(e){return this.wu().then(()=>{this.Tu.sort((i,r)=>i.targetTimeMs-r.targetTimeMs);for(const i of this.Tu)if(i.skipDelay(),e!=="all"&&i.timerId===e)break;return this.wu()})}Du(e){this.Ru.push(e)}yu(e){const i=this.Tu.indexOf(e);this.Tu.splice(i,1)}}class Kh extends Lo{constructor(e,i,r,o){super(e,i,r,o),this.type="firestore",this._queue=new As,this._persistenceKey=(o==null?void 0:o.name)||"[DEFAULT]"}async _terminate(){if(this._firestoreClient){const e=this._firestoreClient.terminate();this._queue=new As(e),this._firestoreClient=void 0,await e}}}function Jh(t,e){const i=typeof t=="object"?t:Si(),r=typeof t=="string"?t:"(default)",o=Ke(i,"firestore").getImmediate({identifier:r});if(!o._initialized){const c=Ka("firestore");c&&qh(o,...c)}return o}(function(e,i=!0){(function(o){Ht=o})(at),fe(new oe("firestore",(r,{instanceIdentifier:o,options:c})=>{const l=r.getProvider("app").getImmediate(),h=new Kh(new Uh(r.getProvider("auth-internal")),new Bh(r.getProvider("app-check-internal")),function(E,b){if(!Object.prototype.hasOwnProperty.apply(E.options,["projectId"]))throw new X(J.INVALID_ARGUMENT,'"projectId" not provided in firebase.initializeApp.');return new In(E.options.projectId,b)}(l,o),l);return c=Object.assign({useFetchStreams:i},c),h._setSettings(c),h},"PUBLIC").setMultipleInstances(!0)),ne(_s,"4.7.3",e),ne(_s,"4.7.3","esm2017")})();const No="@firebase/installations",ji="0.6.9";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Mo=1e4,Uo=`w:${ji}`,xo="FIS_v2",Xh="https://firebaseinstallations.googleapis.com/v1",Yh=60*60*1e3,Qh="installations",Zh="Installations";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ed={"missing-app-config-values":'Missing App configuration value: "{$valueName}"',"not-registered":"Firebase Installation is not registered.","installation-not-found":"Firebase Installation not found.","request-failed":'{$requestName} request failed with error "{$serverCode} {$serverStatus}: {$serverMessage}"',"app-offline":"Could not process request. Application offline.","delete-pending-registration":"Can't delete installation while there is a pending registration request."},We=new qe(Qh,Zh,ed);function Fo(t){return t instanceof ce&&t.code.includes("request-failed")}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function jo({projectId:t}){return`${Xh}/projects/${t}/installations`}function Bo(t){return{token:t.token,requestStatus:2,expiresIn:nd(t.expiresIn),creationTime:Date.now()}}async function $o(t,e){const r=(await e.json()).error;return We.create("request-failed",{requestName:t,serverCode:r.code,serverMessage:r.message,serverStatus:r.status})}function Ho({apiKey:t}){return new Headers({"Content-Type":"application/json",Accept:"application/json","x-goog-api-key":t})}function td(t,{refreshToken:e}){const i=Ho(t);return i.append("Authorization",id(e)),i}async function Vo(t){const e=await t();return e.status>=500&&e.status<600?t():e}function nd(t){return Number(t.replace("s","000"))}function id(t){return`${xo} ${t}`}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function rd({appConfig:t,heartbeatServiceProvider:e},{fid:i}){const r=jo(t),o=Ho(t),c=e.getImmediate({optional:!0});if(c){const E=await c.getHeartbeatsHeader();E&&o.append("x-firebase-client",E)}const l={fid:i,authVersion:xo,appId:t.appId,sdkVersion:Uo},h={method:"POST",headers:o,body:JSON.stringify(l)},g=await Vo(()=>fetch(r,h));if(g.ok){const E=await g.json();return{fid:E.fid||i,registrationStatus:2,refreshToken:E.refreshToken,authToken:Bo(E.authToken)}}else throw await $o("Create Installation",g)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function zo(t){return new Promise(e=>{setTimeout(e,t)})}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function sd(t){return btoa(String.fromCharCode(...t)).replace(/\+/g,"-").replace(/\//g,"_")}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const od=/^[cdef][\w-]{21}$/,Ti="";function ad(){try{const t=new Uint8Array(17);(self.crypto||self.msCrypto).getRandomValues(t),t[0]=112+t[0]%16;const i=cd(t);return od.test(i)?i:Ti}catch{return Ti}}function cd(t){return sd(t).substr(0,22)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Pn(t){return`${t.appName}!${t.appId}`}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Wo=new Map;function Go(t,e){const i=Pn(t);qo(i,e),ld(i,e)}function qo(t,e){const i=Wo.get(t);if(i)for(const r of i)r(e)}function ld(t,e){const i=ud();i&&i.postMessage({key:t,fid:e}),hd()}let He=null;function ud(){return!He&&"BroadcastChannel"in self&&(He=new BroadcastChannel("[Firebase] FID Change"),He.onmessage=t=>{qo(t.data.key,t.data.fid)}),He}function hd(){Wo.size===0&&He&&(He.close(),He=null)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const dd="firebase-installations-database",fd=1,Ge="firebase-installations-store";let ui=null;function Bi(){return ui||(ui=Ws(dd,fd,{upgrade:(t,e)=>{switch(e){case 0:t.createObjectStore(Ge)}}})),ui}async function wn(t,e){const i=Pn(t),o=(await Bi()).transaction(Ge,"readwrite"),c=o.objectStore(Ge),l=await c.get(i);return await c.put(e,i),await o.done,(!l||l.fid!==e.fid)&&Go(t,e.fid),e}async function Ko(t){const e=Pn(t),r=(await Bi()).transaction(Ge,"readwrite");await r.objectStore(Ge).delete(e),await r.done}async function Rn(t,e){const i=Pn(t),o=(await Bi()).transaction(Ge,"readwrite"),c=o.objectStore(Ge),l=await c.get(i),h=e(l);return h===void 0?await c.delete(i):await c.put(h,i),await o.done,h&&(!l||l.fid!==h.fid)&&Go(t,h.fid),h}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function $i(t){let e;const i=await Rn(t.appConfig,r=>{const o=pd(r),c=gd(t,o);return e=c.registrationPromise,c.installationEntry});return i.fid===Ti?{installationEntry:await e}:{installationEntry:i,registrationPromise:e}}function pd(t){const e=t||{fid:ad(),registrationStatus:0};return Jo(e)}function gd(t,e){if(e.registrationStatus===0){if(!navigator.onLine){const o=Promise.reject(We.create("app-offline"));return{installationEntry:e,registrationPromise:o}}const i={fid:e.fid,registrationStatus:1,registrationTime:Date.now()},r=md(t,i);return{installationEntry:i,registrationPromise:r}}else return e.registrationStatus===1?{installationEntry:e,registrationPromise:yd(t)}:{installationEntry:e}}async function md(t,e){try{const i=await rd(t,e);return wn(t.appConfig,i)}catch(i){throw Fo(i)&&i.customData.serverCode===409?await Ko(t.appConfig):await wn(t.appConfig,{fid:e.fid,registrationStatus:0}),i}}async function yd(t){let e=await Ss(t.appConfig);for(;e.registrationStatus===1;)await zo(100),e=await Ss(t.appConfig);if(e.registrationStatus===0){const{installationEntry:i,registrationPromise:r}=await $i(t);return r||i}return e}function Ss(t){return Rn(t,e=>{if(!e)throw We.create("installation-not-found");return Jo(e)})}function Jo(t){return vd(t)?{fid:t.fid,registrationStatus:0}:t}function vd(t){return t.registrationStatus===1&&t.registrationTime+Mo<Date.now()}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function _d({appConfig:t,heartbeatServiceProvider:e},i){const r=Id(t,i),o=td(t,i),c=e.getImmediate({optional:!0});if(c){const E=await c.getHeartbeatsHeader();E&&o.append("x-firebase-client",E)}const l={installation:{sdkVersion:Uo,appId:t.appId}},h={method:"POST",headers:o,body:JSON.stringify(l)},g=await Vo(()=>fetch(r,h));if(g.ok){const E=await g.json();return Bo(E)}else throw await $o("Generate Auth Token",g)}function Id(t,{fid:e}){return`${jo(t)}/${e}/authTokens:generate`}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Hi(t,e=!1){let i;const r=await Rn(t.appConfig,c=>{if(!Xo(c))throw We.create("not-registered");const l=c.authToken;if(!e&&Td(l))return c;if(l.requestStatus===1)return i=wd(t,e),c;{if(!navigator.onLine)throw We.create("app-offline");const h=Ad(c);return i=Ed(t,h),h}});return i?await i:r.authToken}async function wd(t,e){let i=await Cs(t.appConfig);for(;i.authToken.requestStatus===1;)await zo(100),i=await Cs(t.appConfig);const r=i.authToken;return r.requestStatus===0?Hi(t,e):r}function Cs(t){return Rn(t,e=>{if(!Xo(e))throw We.create("not-registered");const i=e.authToken;return Sd(i)?Object.assign(Object.assign({},e),{authToken:{requestStatus:0}}):e})}async function Ed(t,e){try{const i=await _d(t,e),r=Object.assign(Object.assign({},e),{authToken:i});return await wn(t.appConfig,r),i}catch(i){if(Fo(i)&&(i.customData.serverCode===401||i.customData.serverCode===404))await Ko(t.appConfig);else{const r=Object.assign(Object.assign({},e),{authToken:{requestStatus:0}});await wn(t.appConfig,r)}throw i}}function Xo(t){return t!==void 0&&t.registrationStatus===2}function Td(t){return t.requestStatus===2&&!bd(t)}function bd(t){const e=Date.now();return e<t.creationTime||t.creationTime+t.expiresIn<e+Yh}function Ad(t){const e={requestStatus:1,requestTime:Date.now()};return Object.assign(Object.assign({},t),{authToken:e})}function Sd(t){return t.requestStatus===1&&t.requestTime+Mo<Date.now()}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Cd(t){const e=t,{installationEntry:i,registrationPromise:r}=await $i(e);return r?r.catch(console.error):Hi(e).catch(console.error),i.fid}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Pd(t,e=!1){const i=t;return await Rd(i),(await Hi(i,e)).token}async function Rd(t){const{registrationPromise:e}=await $i(t);e&&await e}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function kd(t){if(!t||!t.options)throw hi("App Configuration");if(!t.name)throw hi("App Name");const e=["projectId","apiKey","appId"];for(const i of e)if(!t.options[i])throw hi(i);return{appName:t.name,projectId:t.options.projectId,apiKey:t.options.apiKey,appId:t.options.appId}}function hi(t){return We.create("missing-app-config-values",{valueName:t})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Yo="installations",Od="installations-internal",Dd=t=>{const e=t.getProvider("app").getImmediate(),i=kd(e),r=Ke(e,"heartbeat");return{app:e,appConfig:i,heartbeatServiceProvider:r,_delete:()=>Promise.resolve()}},Ld=t=>{const e=t.getProvider("app").getImmediate(),i=Ke(e,Yo).getImmediate();return{getId:()=>Cd(i),getToken:o=>Pd(i,o)}};function Nd(){fe(new oe(Yo,Dd,"PUBLIC")),fe(new oe(Od,Ld,"PRIVATE"))}Nd();ne(No,ji);ne(No,ji,"esm2017");/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const En="analytics",Md="firebase_id",Ud="origin",xd=60*1e3,Fd="https://firebase.googleapis.com/v1alpha/projects/-/apps/{app-id}/webConfig",Vi="https://www.googletagmanager.com/gtag/js";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Q=new bn("@firebase/analytics");/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const jd={"already-exists":"A Firebase Analytics instance with the appId {$id}  already exists. Only one Firebase Analytics instance can be created for each appId.","already-initialized":"initializeAnalytics() cannot be called again with different options than those it was initially called with. It can be called again with the same options to return the existing instance, or getAnalytics() can be used to get a reference to the already-initialized instance.","already-initialized-settings":"Firebase Analytics has already been initialized.settings() must be called before initializing any Analytics instanceor it will have no effect.","interop-component-reg-failed":"Firebase Analytics Interop Component failed to instantiate: {$reason}","invalid-analytics-context":"Firebase Analytics is not supported in this environment. Wrap initialization of analytics in analytics.isSupported() to prevent initialization in unsupported environments. Details: {$errorInfo}","indexeddb-unavailable":"IndexedDB unavailable or restricted in this environment. Wrap initialization of analytics in analytics.isSupported() to prevent initialization in unsupported environments. Details: {$errorInfo}","fetch-throttle":"The config fetch request timed out while in an exponential backoff state. Unix timestamp in milliseconds when fetch request throttling ends: {$throttleEndTimeMillis}.","config-fetch-failed":"Dynamic config fetch failed: [{$httpStatus}] {$responseMessage}","no-api-key":'The "apiKey" field is empty in the local Firebase config. Firebase Analytics requires this field tocontain a valid API key.',"no-app-id":'The "appId" field is empty in the local Firebase config. Firebase Analytics requires this field tocontain a valid app ID.',"no-client-id":'The "client_id" field is empty.',"invalid-gtag-resource":"Trusted Types detected an invalid gtag resource: {$gtagURL}."},ee=new qe("analytics","Analytics",jd);/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Bd(t){if(!t.startsWith(Vi)){const e=ee.create("invalid-gtag-resource",{gtagURL:t});return Q.warn(e.message),""}return t}function Qo(t){return Promise.all(t.map(e=>e.catch(i=>i)))}function $d(t,e){let i;return window.trustedTypes&&(i=window.trustedTypes.createPolicy(t,e)),i}function Hd(t,e){const i=$d("firebase-js-sdk-policy",{createScriptURL:Bd}),r=document.createElement("script"),o=`${Vi}?l=${t}&id=${e}`;r.src=i?i==null?void 0:i.createScriptURL(o):o,r.async=!0,document.head.appendChild(r)}function Vd(t){let e=[];return Array.isArray(window[t])?e=window[t]:window[t]=e,e}async function zd(t,e,i,r,o,c){const l=r[o];try{if(l)await e[l];else{const g=(await Qo(i)).find(E=>E.measurementId===o);g&&await e[g.appId]}}catch(h){Q.error(h)}t("config",o,c)}async function Wd(t,e,i,r,o){try{let c=[];if(o&&o.send_to){let l=o.send_to;Array.isArray(l)||(l=[l]);const h=await Qo(i);for(const g of l){const E=h.find(S=>S.measurementId===g),b=E&&e[E.appId];if(b)c.push(b);else{c=[];break}}}c.length===0&&(c=Object.values(e)),await Promise.all(c),t("event",r,o||{})}catch(c){Q.error(c)}}function Gd(t,e,i,r){async function o(c,...l){try{if(c==="event"){const[h,g]=l;await Wd(t,e,i,h,g)}else if(c==="config"){const[h,g]=l;await zd(t,e,i,r,h,g)}else if(c==="consent"){const[h,g]=l;t("consent",h,g)}else if(c==="get"){const[h,g,E]=l;t("get",h,g,E)}else if(c==="set"){const[h]=l;t("set",h)}else t(c,...l)}catch(h){Q.error(h)}}return o}function qd(t,e,i,r,o){let c=function(...l){window[r].push(arguments)};return window[o]&&typeof window[o]=="function"&&(c=window[o]),window[o]=Gd(c,t,e,i),{gtagCore:c,wrappedGtag:window[o]}}function Kd(t){const e=window.document.getElementsByTagName("script");for(const i of Object.values(e))if(i.src&&i.src.includes(Vi)&&i.src.includes(t))return i;return null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Jd=30,Xd=1e3;class Yd{constructor(e={},i=Xd){this.throttleMetadata=e,this.intervalMillis=i}getThrottleMetadata(e){return this.throttleMetadata[e]}setThrottleMetadata(e,i){this.throttleMetadata[e]=i}deleteThrottleMetadata(e){delete this.throttleMetadata[e]}}const Zo=new Yd;function Qd(t){return new Headers({Accept:"application/json","x-goog-api-key":t})}async function Zd(t){var e;const{appId:i,apiKey:r}=t,o={method:"GET",headers:Qd(r)},c=Fd.replace("{app-id}",i),l=await fetch(c,o);if(l.status!==200&&l.status!==304){let h="";try{const g=await l.json();!((e=g.error)===null||e===void 0)&&e.message&&(h=g.error.message)}catch{}throw ee.create("config-fetch-failed",{httpStatus:l.status,responseMessage:h})}return l.json()}async function ef(t,e=Zo,i){const{appId:r,apiKey:o,measurementId:c}=t.options;if(!r)throw ee.create("no-app-id");if(!o){if(c)return{measurementId:c,appId:r};throw ee.create("no-api-key")}const l=e.getThrottleMetadata(r)||{backoffCount:0,throttleEndTimeMillis:Date.now()},h=new rf;return setTimeout(async()=>{h.abort()},xd),ea({appId:r,apiKey:o,measurementId:c},l,h,e)}async function ea(t,{throttleEndTimeMillis:e,backoffCount:i},r,o=Zo){var c;const{appId:l,measurementId:h}=t;try{await tf(r,e)}catch(g){if(h)return Q.warn(`Timed out fetching this Firebase app's measurement ID from the server. Falling back to the measurement ID ${h} provided in the "measurementId" field in the local Firebase config. [${g==null?void 0:g.message}]`),{appId:l,measurementId:h};throw g}try{const g=await Zd(t);return o.deleteThrottleMetadata(l),g}catch(g){const E=g;if(!nf(E)){if(o.deleteThrottleMetadata(l),h)return Q.warn(`Failed to fetch this Firebase app's measurement ID from the server. Falling back to the measurement ID ${h} provided in the "measurementId" field in the local Firebase config. [${E==null?void 0:E.message}]`),{appId:l,measurementId:h};throw g}const b=Number((c=E==null?void 0:E.customData)===null||c===void 0?void 0:c.httpStatus)===503?zr(i,o.intervalMillis,Jd):zr(i,o.intervalMillis),S={throttleEndTimeMillis:Date.now()+b,backoffCount:i+1};return o.setThrottleMetadata(l,S),Q.debug(`Calling attemptFetch again in ${b} millis`),ea(t,S,r,o)}}function tf(t,e){return new Promise((i,r)=>{const o=Math.max(e-Date.now(),0),c=setTimeout(i,o);t.addEventListener(()=>{clearTimeout(c),r(ee.create("fetch-throttle",{throttleEndTimeMillis:e}))})})}function nf(t){if(!(t instanceof ce)||!t.customData)return!1;const e=Number(t.customData.httpStatus);return e===429||e===500||e===503||e===504}class rf{constructor(){this.listeners=[]}addEventListener(e){this.listeners.push(e)}abort(){this.listeners.forEach(e=>e())}}async function sf(t,e,i,r,o){if(o&&o.global){t("event",i,r);return}else{const c=await e,l=Object.assign(Object.assign({},r),{send_to:c});t("event",i,l)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function of(){if($s())try{await Hs()}catch(t){return Q.warn(ee.create("indexeddb-unavailable",{errorInfo:t==null?void 0:t.toString()}).message),!1}else return Q.warn(ee.create("indexeddb-unavailable",{errorInfo:"IndexedDB is not available in this environment."}).message),!1;return!0}async function af(t,e,i,r,o,c,l){var h;const g=ef(t);g.then(L=>{i[L.measurementId]=L.appId,t.options.measurementId&&L.measurementId!==t.options.measurementId&&Q.warn(`The measurement ID in the local Firebase config (${t.options.measurementId}) does not match the measurement ID fetched from the server (${L.measurementId}). To ensure analytics events are always sent to the correct Analytics property, update the measurement ID field in the local config or remove it from the local config.`)}).catch(L=>Q.error(L)),e.push(g);const E=of().then(L=>{if(L)return r.getId()}),[b,S]=await Promise.all([g,E]);Kd(c)||Hd(c,b.measurementId),o("js",new Date);const C=(h=l==null?void 0:l.config)!==null&&h!==void 0?h:{};return C[Ud]="firebase",C.update=!0,S!=null&&(C[Md]=S),o("config",b.measurementId,C),b.measurementId}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class cf{constructor(e){this.app=e}_delete(){return delete Ot[this.app.options.appId],Promise.resolve()}}let Ot={},Ps=[];const Rs={};let di="dataLayer",lf="gtag",ks,ta,Os=!1;function uf(){const t=[];if(Bs()&&t.push("This is a browser extension environment."),tc()||t.push("Cookies are not available."),t.length>0){const e=t.map((r,o)=>`(${o+1}) ${r}`).join(" "),i=ee.create("invalid-analytics-context",{errorInfo:e});Q.warn(i.message)}}function hf(t,e,i){uf();const r=t.options.appId;if(!r)throw ee.create("no-app-id");if(!t.options.apiKey)if(t.options.measurementId)Q.warn(`The "apiKey" field is empty in the local Firebase config. This is needed to fetch the latest measurement ID for this Firebase app. Falling back to the measurement ID ${t.options.measurementId} provided in the "measurementId" field in the local Firebase config.`);else throw ee.create("no-api-key");if(Ot[r]!=null)throw ee.create("already-exists",{id:r});if(!Os){Vd(di);const{wrappedGtag:c,gtagCore:l}=qd(Ot,Ps,Rs,di,lf);ta=c,ks=l,Os=!0}return Ot[r]=af(t,Ps,Rs,e,ks,di,i),new cf(t)}function df(t=Si()){t=le(t);const e=Ke(t,En);return e.isInitialized()?e.getImmediate():ff(t)}function ff(t,e={}){const i=Ke(t,En);if(i.isInitialized()){const o=i.getImmediate();if(Dt(e,i.getOptions()))return o;throw ee.create("already-initialized")}return i.initialize({options:e})}function pf(t,e,i,r){t=le(t),sf(ta,Ot[t.app.options.appId],e,i,r).catch(o=>Q.error(o))}const Ds="@firebase/analytics",Ls="0.10.8";function gf(){fe(new oe(En,(e,{options:i})=>{const r=e.getProvider("app").getImmediate(),o=e.getProvider("installations-internal").getImmediate();return hf(r,o,i)},"PUBLIC")),fe(new oe("analytics-internal",t,"PRIVATE")),ne(Ds,Ls),ne(Ds,Ls,"esm2017");function t(e){try{const i=e.getProvider(En).getImmediate();return{logEvent:(r,o,c)=>pf(i,r,o,c)}}catch(i){throw ee.create("interop-component-reg-failed",{reason:i})}}}gf();const mf={apiKey:"AIzaSyAMPxVjR2_lXTe5iZiPl6G0RSxZIR8Cb88",authDomain:"research-project-7247c.firebaseapp.com",projectId:"research-project-7247c",storageBucket:"research-project-7247c.firebasestorage.app",messagingSenderId:"905117548022",appId:"1:905117548022:web:3edfa08c1501a5f5a1dbd7",measurementId:"G-GZVKWHK6GZ"};let cn,yf,vf,_f;function If(){try{cn=Gs(mf),yf=$t(cn),vf=Jh(cn),_f=df(cn),console.log("[OK] Firebase initialized")}catch(t){console.warn("[WARN] Firebase init failed:",t.message)}}let Tn=null,na=[];function wf(){const t=$t();Iu(t,e=>{Tn=e,na.forEach(i=>i(e))})}function Ef(t){na.push(t),Tn!==void 0&&t(Tn)}async function Tf(){const t=$t();await wu(t),Tn=null}const bf="/api";async function Y(t,e="GET",i=null){const r={method:e,headers:{"Content-Type":"application/json"}};i&&(r.body=JSON.stringify(i));const o=await fetch(`${bf}${t}`,r),c=await o.json();if(!o.ok)throw new Error(c.error||`API error ${o.status}`);return c}const ia={getNextActivity:t=>Y(`/adaptive/next-activity/${t}`),updateProgress:t=>Y("/adaptive/update-progress","POST",t),getLearningPath:t=>Y(`/adaptive/learning-path/${t}`)},fi={analyze:t=>Y("/errors/analyze","POST",t),getHistory:t=>Y(`/errors/history/${t}`),getSummary:t=>Y(`/errors/summary/${t}`)},Af={getGames:()=>Y("/gamification/games"),submitScore:t=>Y("/gamification/submit-score","POST",t),getLeaderboard:()=>Y("/gamification/leaderboard"),getProfile:t=>Y(`/gamification/profile/${t}`)},Sf={getStatus:t=>Y(`/mastery/status/${t}`),update:t=>Y("/mastery/update","POST",t),submitDiagnostic:t=>Y("/mastery/diagnostic","POST",t),getHistory:(t,e)=>Y(`/mastery/history/${t}/${e}`)};async function Cf(t){t.innerHTML=`
        <h1>Welcome back, Learner</h1>
        <p style="color: var(--text-secondary); margin-bottom: 2rem;">Your learning progress overview</p>

        <div class="stats-grid">
            <div class="stat-card">
                <span class="stat-value" id="stat-mastery">0%</span>
                <span class="stat-label">Overall Mastery</span>
            </div>
            <div class="stat-card">
                <span class="stat-value" id="stat-games">0</span>
                <span class="stat-label">Games Played</span>
            </div>
            <div class="stat-card">
                <span class="stat-value" id="stat-xp">0</span>
                <span class="stat-label">Total XP</span>
            </div>
            <div class="stat-card">
                <span class="stat-value" id="stat-streak">0</span>
                <span class="stat-label">Day Streak</span>
            </div>
        </div>

        <div class="grid-2">
            <div class="card">
                <h3>Schema Mastery Overview</h3>
                <canvas id="mastery-chart" width="400" height="250"></canvas>
            </div>
            <div class="card">
                <h3>Recommended Activity</h3>
                <div id="recommendation">
                    <p style="color: var(--text-secondary)">Loading recommendation...</p>
                </div>
            </div>
        </div>
    `;try{const e=await ia.getNextActivity("demo_user");document.getElementById("recommendation").innerHTML=`
            <p><strong>${e.recommended_topic}</strong></p>
            <p style="color: var(--text-secondary)">${e.reason}</p>
            <span style="color: var(--accent-green); text-transform: uppercase; font-size: 0.8rem">${e.difficulty}</span>
        `}catch(e){console.warn("Could not load recommendation:",e)}}async function Pf(t){t.innerHTML=`
        <h1>Learning Path</h1>
        <p style="color: var(--text-secondary); margin-bottom: 2rem;">Your personalized programming journey</p>
        <div id="path-list"><p style="color: var(--text-secondary)">Loading...</p></div>
    `;try{const e=await ia.getLearningPath("demo_user"),i=document.getElementById("path-list");i.innerHTML=e.learning_path.map((r,o)=>`
            <div class="card" style="display: flex; align-items: center; gap: 1rem;">
                <div style="width: 40px; height: 40px; border-radius: 50%; background: ${r.status==="started"?"var(--accent-orange)":"var(--border-color)"}; display: flex; align-items: center; justify-content: center; font-weight: 700;">${o+1}</div>
                <div style="flex: 1">
                    <strong>${r.name}</strong>
                    <p style="color: var(--text-secondary); font-size: 0.85rem;">Mastery: ${r.mastery}% — ${r.status}</p>
                </div>
                <span style="color: var(--text-secondary)">${r.mastery}%</span>
            </div>
        `).join("")}catch{document.getElementById("path-list").innerHTML='<p style="color: var(--accent-orange)">Could not load learning path</p>'}}async function Rf(t){t.innerHTML=`
        <h1>Learning Games</h1>
        <p style="color: var(--text-secondary); margin-bottom: 2rem;">Master concepts through interactive challenges</p>
        <div class="grid-3" id="games-grid"><p style="color: var(--text-secondary)">Loading...</p></div>
    `;try{const e=await Af.getGames(),i=document.getElementById("games-grid");i.innerHTML=e.games.map(r=>`
            <div class="card" style="cursor: pointer;" onclick="alert('TODO: Launch ${r.title} with PhaserJS')">
                <h3 style="color: var(--text-primary); font-size: 1.1rem;">${r.title}</h3>
                <p style="color: var(--text-secondary); font-size: 0.85rem; margin: 0.5rem 0;">Concept: ${r.concept}</p>
                <div style="display: flex; justify-content: space-between; color: var(--text-secondary); font-size: 0.8rem;">
                    <span>${r.levels} Levels</span>
                    <span style="color: var(--accent-green)">${r.xp_reward} XP</span>
                </div>
            </div>
        `).join("")}catch{document.getElementById("games-grid").innerHTML='<p style="color: var(--accent-orange)">Could not load games</p>'}}async function kf(t){t.innerHTML=`
        <h1>Error Pattern Analyzer</h1>
        <p style="color: var(--text-secondary); margin-bottom: 2rem;">Submit your code to detect common error patterns</p>

        <div class="grid-2">
            <div class="card">
                <h3>Submit Code</h3>
                <textarea id="code-input" class="input-field" rows="10" placeholder="Paste your Python code here..." style="font-family: monospace; resize: vertical;"></textarea>
                <div style="margin-top: 1rem; display: flex; gap: 0.5rem;">
                    <button class="btn btn-primary" id="analyze-btn">Analyze Code</button>
                    <button class="btn" id="clear-btn" style="background: var(--border-color); color: var(--text-primary);">Clear</button>
                </div>
                <div id="analysis-result" style="margin-top: 1rem;"></div>
            </div>

            <div class="card">
                <h3>Error History</h3>
                <div id="error-history" style="color: var(--text-secondary);">
                    <p>Submit code to see your error analysis history</p>
                </div>
            </div>
        </div>

        <div class="card" style="margin-top: 1rem;">
            <h3>Error Summary</h3>
            <div id="error-summary" style="color: var(--text-secondary);">
                <p>No error data yet</p>
            </div>
        </div>
    `,document.getElementById("analyze-btn").addEventListener("click",async()=>{const e=document.getElementById("code-input").value.trim(),i=document.getElementById("analysis-result");if(!e){i.innerHTML='<p style="color: var(--accent-orange); font-size: 0.85rem;">Please enter some code first</p>';return}i.innerHTML='<p style="color: var(--text-secondary);">Analyzing...</p>';try{const r=await fi.analyze({user_id:"demo_user",code_snippet:e});r.error_count===0?i.innerHTML='<p style="color: var(--accent-green);">No errors detected!</p>':i.innerHTML=`
                    <p style="color: var(--accent-orange); margin-bottom: 0.5rem;">${r.error_count} error(s) found</p>
                    ${r.detected_errors.map(o=>`<div style="padding: 0.5rem; background: var(--bg-secondary); border-radius: 6px; margin-bottom: 0.5rem; font-size: 0.85rem;">${o}</div>`).join("")}
                    <p style="color: var(--text-secondary); font-size: 0.85rem; margin-top: 0.5rem;">${r.suggestion}</p>
                `}catch(r){i.innerHTML=`<p style="color: var(--accent-orange);">Analysis failed: ${r.message}</p>`}}),document.getElementById("clear-btn").addEventListener("click",()=>{document.getElementById("code-input").value="",document.getElementById("analysis-result").innerHTML=""});try{const e=await fi.getHistory("demo_user"),i=document.getElementById("error-history");e.total===0?i.innerHTML="<p>No previous analyses</p>":i.innerHTML=e.history.map(r=>`<div style="padding: 0.5rem; border-bottom: 1px solid var(--border-color); font-size: 0.85rem;">${r}</div>`).join("")}catch(e){console.warn("Could not load error history:",e)}try{const e=await fi.getSummary("demo_user"),i=document.getElementById("error-summary");e.total_errors===0&&(i.innerHTML="<p>No errors recorded yet. Start by analyzing some code above.</p>")}catch(e){console.warn("Could not load error summary:",e)}}async function Of(t){t.innerHTML=`
        <h1>Schema Mastery</h1>
        <p style="color: var(--text-secondary); margin-bottom: 2rem;">Track your conceptual understanding</p>
        <div class="grid-3" id="mastery-grid"><p style="color: var(--text-secondary)">Loading...</p></div>
    `;try{const e=await Sf.getStatus("demo_user"),i=document.getElementById("mastery-grid");i.innerHTML=Object.entries(e.schemas).map(([r,o])=>`
            <div class="card">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <strong>${o.name}</strong>
                    <span style="font-size: 1.2rem; font-weight: 700;">${o.mastery_level}%</span>
                </div>
                <span style="color: var(--accent-purple); font-size: 0.75rem; text-transform: uppercase;">${o.classification}</span>
                <div style="margin-top: 1rem;">
                    ${Object.entries(o.sub_skills).map(([c,l])=>`<div style="display: flex; justify-content: space-between; font-size: 0.8rem; color: var(--text-secondary); margin: 0.3rem 0;"><span>${c.replace(/_/g," ")}</span><span>${l}%</span></div>`).join("")}
                </div>
            </div>
        `).join("")}catch{document.getElementById("mastery-grid").innerHTML='<p style="color: var(--accent-orange)">Could not load mastery data</p>'}}function Df(t,e){t.innerHTML=`
        <div style="max-width: 400px; margin: 4rem auto; text-align: center;">
            <h1 style="margin-bottom: 0.5rem;">Welcome to CodeQuest</h1>
            <p style="color: var(--text-secondary); margin-bottom: 2rem;">Sign in to continue your learning journey</p>

            <div class="card" style="text-align: left;">
                <div style="margin-bottom: 1rem;">
                    <label style="display: block; font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.4rem;">Email</label>
                    <input type="email" id="login-email" class="input-field" placeholder="you@example.com" />
                </div>
                <div style="margin-bottom: 1.5rem;">
                    <label style="display: block; font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.4rem;">Password</label>
                    <input type="password" id="login-password" class="input-field" placeholder="Your password" />
                </div>
                <div id="login-error" style="color: var(--accent-orange); font-size: 0.85rem; margin-bottom: 1rem; display: none;"></div>
                <button class="btn btn-primary" id="login-btn" style="width: 100%;">Sign In</button>
                <p style="text-align: center; margin-top: 1rem; font-size: 0.85rem; color: var(--text-secondary);">
                    Don't have an account? <a href="#" id="go-register" style="color: var(--accent-blue);">Register</a>
                </p>
            </div>
        </div>
    `,document.getElementById("login-btn").addEventListener("click",async()=>{const r=document.getElementById("login-email").value.trim(),o=document.getElementById("login-password").value,c=document.getElementById("login-error"),l=document.getElementById("login-btn");if(!r||!o){c.textContent="Please fill in all fields",c.style.display="block";return}l.disabled=!0,l.textContent="Signing in...",c.style.display="none";try{const h=$t();await yu(h,r,o),e&&e("dashboard")}catch(h){c.textContent=h.message.replace("Firebase: ",""),c.style.display="block",l.disabled=!1,l.textContent="Sign In"}});const i=document.getElementById("go-register");i&&e&&i.addEventListener("click",r=>{r.preventDefault(),e("register")})}function Lf(t,e){t.innerHTML=`
        <div style="max-width: 400px; margin: 4rem auto; text-align: center;">
            <h1 style="margin-bottom: 0.5rem;">Create Account</h1>
            <p style="color: var(--text-secondary); margin-bottom: 2rem;">Join CodeQuest and start learning</p>

            <div class="card" style="text-align: left;">
                <div style="margin-bottom: 1rem;">
                    <label style="display: block; font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.4rem;">Display Name</label>
                    <input type="text" id="reg-name" class="input-field" placeholder="Your name" />
                </div>
                <div style="margin-bottom: 1rem;">
                    <label style="display: block; font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.4rem;">Email</label>
                    <input type="email" id="reg-email" class="input-field" placeholder="you@example.com" />
                </div>
                <div style="margin-bottom: 1.5rem;">
                    <label style="display: block; font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.4rem;">Password</label>
                    <input type="password" id="reg-password" class="input-field" placeholder="Min 6 characters" />
                </div>
                <div id="reg-error" style="color: var(--accent-orange); font-size: 0.85rem; margin-bottom: 1rem; display: none;"></div>
                <button class="btn btn-primary" id="reg-btn" style="width: 100%;">Create Account</button>
                <p style="text-align: center; margin-top: 1rem; font-size: 0.85rem; color: var(--text-secondary);">
                    Already have an account? <a href="#" id="go-login" style="color: var(--accent-blue);">Sign In</a>
                </p>
            </div>
        </div>
    `,document.getElementById("reg-btn").addEventListener("click",async()=>{const r=document.getElementById("reg-name").value.trim(),o=document.getElementById("reg-email").value.trim(),c=document.getElementById("reg-password").value,l=document.getElementById("reg-error"),h=document.getElementById("reg-btn");if(!r||!o||!c){l.textContent="Please fill in all fields",l.style.display="block";return}h.disabled=!0,h.textContent="Creating account...",l.style.display="none";try{const g=$t(),E=await mu(g,o,c);await fetch("/api/auth/register",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({uid:E.user.uid,email:o,display_name:r})}),e&&e("dashboard")}catch(g){l.textContent=g.message.replace("Firebase: ",""),l.style.display="block",h.disabled=!1,h.textContent="Create Account"}});const i=document.getElementById("go-login");i&&e&&i.addEventListener("click",r=>{r.preventDefault(),e("login")})}If();wf();const Nf={dashboard:Cf,"learning-path":Pf,games:Rf,"error-analysis":kf,mastery:Of},Mf={login:t=>Df(t,ot),register:t=>Lf(t,ot)};function ot(t){document.querySelectorAll(".nav-link").forEach(r=>{r.classList.toggle("active",r.dataset.page===t)});const e=document.getElementById("page-container"),i=Nf[t]||Mf[t];i?i(e):e.innerHTML="<h2>Page not found</h2>"}function Uf(t){const e=document.getElementById("nav-actions");e&&(t?(e.innerHTML=`
            <span style="color: var(--text-secondary); font-size: 0.85rem; margin-right: 0.5rem;">${t.email}</span>
            <button class="btn" id="logout-btn" style="background: var(--border-color); color: var(--text-primary); font-size: 0.8rem;">Logout</button>
        `,document.getElementById("logout-btn").addEventListener("click",async()=>{await Tf(),ot("login")})):(e.innerHTML=`
            <button class="btn btn-primary" id="nav-login-btn" style="font-size: 0.8rem;">Sign In</button>
        `,document.getElementById("nav-login-btn").addEventListener("click",()=>{ot("login")})))}document.addEventListener("DOMContentLoaded",()=>{console.log("[OK] CodeQuest app loaded"),document.querySelectorAll(".nav-link").forEach(t=>{t.addEventListener("click",e=>{e.preventDefault(),ot(t.dataset.page)})}),Ef(t=>{Uf(t)}),ot("dashboard")});
