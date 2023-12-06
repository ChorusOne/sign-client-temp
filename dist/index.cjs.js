"use strict";Object.defineProperty(exports,"__esModule",{value:!0});var S=require("@walletconnect/core"),O=require("@walletconnect/logger"),U=require("@walletconnect/types"),i=require("@walletconnect/utils"),$=require("events"),p=require("@walletconnect/time"),g=require("@walletconnect/jsonrpc-utils");function H(E){return E&&typeof E=="object"&&"default"in E?E:{default:E}}var W=H($);const A="wc",L=2,b="client",T=`${A}@${L}:${b}:`,V={name:b,logger:"error",controller:!1,relayUrl:"wss://relay.walletconnect.com"},B={session_proposal:"session_proposal",session_update:"session_update",session_extend:"session_extend",session_ping:"session_ping",session_delete:"session_delete",session_expire:"session_expire",session_request:"session_request",session_request_sent:"session_request_sent",session_event:"session_event",proposal_expire:"proposal_expire"},Z={database:":memory:"},M="WALLETCONNECT_DEEPLINK_CHOICE",ee={created:"history_created",updated:"history_updated",deleted:"history_deleted",sync:"history_sync"},se="history",te="0.3",Y="proposal",ie=p.THIRTY_DAYS,Q="Proposal expired",k="session",P=p.SEVEN_DAYS,J="engine",N={wc_sessionPropose:{req:{ttl:p.FIVE_MINUTES,prompt:!0,tag:1100},res:{ttl:p.FIVE_MINUTES,prompt:!1,tag:1101}},wc_sessionSettle:{req:{ttl:p.FIVE_MINUTES,prompt:!1,tag:1102},res:{ttl:p.FIVE_MINUTES,prompt:!1,tag:1103}},wc_sessionUpdate:{req:{ttl:p.ONE_DAY,prompt:!1,tag:1104},res:{ttl:p.ONE_DAY,prompt:!1,tag:1105}},wc_sessionExtend:{req:{ttl:p.ONE_DAY,prompt:!1,tag:1106},res:{ttl:p.ONE_DAY,prompt:!1,tag:1107}},wc_sessionRequest:{req:{ttl:p.FIVE_MINUTES,prompt:!0,tag:1108},res:{ttl:p.FIVE_MINUTES,prompt:!1,tag:1109}},wc_sessionEvent:{req:{ttl:p.FIVE_MINUTES,prompt:!0,tag:1110},res:{ttl:p.FIVE_MINUTES,prompt:!1,tag:1111}},wc_sessionDelete:{req:{ttl:p.ONE_DAY,prompt:!1,tag:1112},res:{ttl:p.ONE_DAY,prompt:!1,tag:1113}},wc_sessionPing:{req:{ttl:p.THIRTY_SECONDS,prompt:!1,tag:1114},res:{ttl:p.THIRTY_SECONDS,prompt:!1,tag:1115}}},D={min:p.FIVE_MINUTES,max:p.SEVEN_DAYS},_={idle:"IDLE",active:"ACTIVE"},K="request",F=["wc_sessionPropose","wc_sessionRequest","wc_authRequest"];var re=Object.defineProperty,ne=Object.defineProperties,oe=Object.getOwnPropertyDescriptors,X=Object.getOwnPropertySymbols,ae=Object.prototype.hasOwnProperty,ce=Object.prototype.propertyIsEnumerable,j=(E,n,e)=>n in E?re(E,n,{enumerable:!0,configurable:!0,writable:!0,value:e}):E[n]=e,m=(E,n)=>{for(var e in n||(n={}))ae.call(n,e)&&j(E,e,n[e]);if(X)for(var e of X(n))ce.call(n,e)&&j(E,e,n[e]);return E},v=(E,n)=>ne(E,oe(n));class le extends U.IEngine{constructor(n){super(n),this.name=J,this.events=new W.default,this.initialized=!1,this.ignoredPayloadTypes=[i.TYPE_1],this.requestQueue={state:_.idle,queue:[]},this.sessionRequestQueue={state:_.idle,queue:[]},this.requestQueueDelay=p.ONE_SECOND,this.init=async()=>{this.initialized||(await this.cleanup(),this.registerRelayerEvents(),this.registerExpirerEvents(),this.registerPairingEvents(),this.client.core.pairing.register({methods:Object.keys(N)}),this.initialized=!0,setTimeout(()=>{this.sessionRequestQueue.queue=this.getPendingSessionRequests(),this.processSessionRequestQueue()},p.toMiliseconds(this.requestQueueDelay)))},this.connect=async e=>{await this.isInitialized();const s=v(m({},e),{requiredNamespaces:e.requiredNamespaces||{},optionalNamespaces:e.optionalNamespaces||{}});await this.isValidConnect(s);const{pairingTopic:t,requiredNamespaces:r,optionalNamespaces:o,sessionProperties:a,relays:c}=s;let l=t,h,u=!1;if(l&&(u=this.client.core.pairing.pairings.get(l).active),!l||!u){const{topic:R,uri:w}=await this.client.core.pairing.create();l=R,h=w}const d=await this.client.core.crypto.generateKeyPair(),y=m({requiredNamespaces:r,optionalNamespaces:o,relays:c??[{protocol:S.RELAYER_DEFAULT_PROTOCOL}],proposer:{publicKey:d,metadata:this.client.metadata}},a&&{sessionProperties:a}),{reject:I,resolve:q,done:C}=i.createDelayedPromise(p.FIVE_MINUTES,Q);if(this.events.once(i.engineEvent("session_connect"),async({error:R,session:w})=>{if(R)I(R);else if(w){w.self.publicKey=d;const G=v(m({},w),{requiredNamespaces:w.requiredNamespaces,optionalNamespaces:w.optionalNamespaces});await this.client.session.set(w.topic,G),await this.setExpiry(w.topic,w.expiry),l&&await this.client.core.pairing.updateMetadata({topic:l,metadata:w.peer.metadata}),q(G)}}),!l){const{message:R}=i.getInternalError("NO_MATCHING_KEY",`connect() pairing topic: ${l}`);throw new Error(R)}const f=await this.sendRequest({topic:l,method:"wc_sessionPropose",params:y}),z=i.calcExpiry(p.FIVE_MINUTES);return await this.setProposal(f,m({id:f,expiry:z},y)),{uri:h,approval:C}},this.pair=async e=>(await this.isInitialized(),await this.client.core.pairing.pair(e)),this.approve=async e=>{await this.isInitialized(),await this.isValidApprove(e);const{id:s,relayProtocol:t,namespaces:r,sessionProperties:o}=e,a=this.client.proposal.get(s);let{pairingTopic:c,proposer:l,requiredNamespaces:h,optionalNamespaces:u}=a;c=c||"",i.isValidObject(h)||(h=i.getRequiredNamespacesFromNamespaces(r,"approve()"));const d=await this.client.core.crypto.generateKeyPair(),y=l.publicKey,I=await this.client.core.crypto.generateSharedKey(d,y);c&&s&&(await this.client.core.pairing.updateMetadata({topic:c,metadata:l.metadata}),await this.sendResult({id:s,topic:c,result:{relay:{protocol:t??"irn"},responderPublicKey:d}}),await this.client.proposal.delete(s,i.getSdkError("USER_DISCONNECTED")),await this.client.core.pairing.activate({topic:c}));const q=m({relay:{protocol:t??"irn"},namespaces:r,requiredNamespaces:h,optionalNamespaces:u,pairingTopic:c,controller:{publicKey:d,metadata:this.client.metadata},expiry:i.calcExpiry(P)},o&&{sessionProperties:o});await this.client.core.relayer.subscribe(I),await this.sendRequest({topic:I,method:"wc_sessionSettle",params:q,throwOnFailedPublish:!0});const C=v(m({},q),{topic:I,pairingTopic:c,acknowledged:!1,self:q.controller,peer:{publicKey:l.publicKey,metadata:l.metadata},controller:d});return await this.client.session.set(I,C),await this.setExpiry(I,i.calcExpiry(P)),{topic:I,acknowledged:()=>new Promise(f=>setTimeout(()=>f(this.client.session.get(I)),500))}},this.reject=async e=>{await this.isInitialized(),await this.isValidReject(e);const{id:s,reason:t}=e,{pairingTopic:r}=this.client.proposal.get(s);r&&(await this.sendError(s,r,t),await this.client.proposal.delete(s,i.getSdkError("USER_DISCONNECTED")))},this.update=async e=>{await this.isInitialized(),await this.isValidUpdate(e);const{topic:s,namespaces:t}=e,r=await this.sendRequest({topic:s,method:"wc_sessionUpdate",params:{namespaces:t}}),{done:o,resolve:a,reject:c}=i.createDelayedPromise();return this.events.once(i.engineEvent("session_update",r),({error:l})=>{l?c(l):a()}),await this.client.session.update(s,{namespaces:t}),{acknowledged:o}},this.extend=async e=>{await this.isInitialized(),await this.isValidExtend(e);const{topic:s}=e,t=await this.sendRequest({topic:s,method:"wc_sessionExtend",params:{}}),{done:r,resolve:o,reject:a}=i.createDelayedPromise();return this.events.once(i.engineEvent("session_extend",t),({error:c})=>{c?a(c):o()}),await this.setExpiry(s,i.calcExpiry(P)),{acknowledged:r}},this.request=async e=>{await this.isInitialized(),await this.isValidRequest(e);const{chainId:s,request:t,topic:r,expiry:o}=e,a=g.payloadId(),{done:c,resolve:l,reject:h}=i.createDelayedPromise(o,"Request expired. Please try again.");return this.events.once(i.engineEvent("session_request",a),({error:u,result:d})=>{u?h(u):l(d)}),await Promise.all([new Promise(async u=>{await this.sendRequest({clientRpcId:a,topic:r,method:"wc_sessionRequest",params:{request:t,chainId:s},expiry:o,throwOnFailedPublish:!0}).catch(d=>h(d)),this.client.events.emit("session_request_sent",{topic:r,request:t,chainId:s,id:a}),u()}),new Promise(async u=>{const d=await i.getDeepLink(this.client.core.storage,M);i.handleDeeplinkRedirect({id:a,topic:r,wcDeepLink:d}),u()}),c()]).then(u=>u[2])},this.respond=async e=>{await this.isInitialized(),await this.isValidRespond(e);const{topic:s,response:t}=e,{id:r}=t;g.isJsonRpcResult(t)?await this.sendResult({id:r,topic:s,result:t.result,throwOnFailedPublish:!0}):g.isJsonRpcError(t)&&await this.sendError(r,s,t.error),this.cleanupAfterResponse(e)},this.ping=async e=>{await this.isInitialized(),await this.isValidPing(e);const{topic:s}=e;if(this.client.session.keys.includes(s)){const t=await this.sendRequest({topic:s,method:"wc_sessionPing",params:{}}),{done:r,resolve:o,reject:a}=i.createDelayedPromise();this.events.once(i.engineEvent("session_ping",t),({error:c})=>{c?a(c):o()}),await r()}else this.client.core.pairing.pairings.keys.includes(s)&&await this.client.core.pairing.ping({topic:s})},this.emit=async e=>{await this.isInitialized(),await this.isValidEmit(e);const{topic:s,event:t,chainId:r}=e;await this.sendRequest({topic:s,method:"wc_sessionEvent",params:{event:t,chainId:r}})},this.disconnect=async e=>{await this.isInitialized(),await this.isValidDisconnect(e);const{topic:s}=e;this.client.session.keys.includes(s)?(await this.sendRequest({topic:s,method:"wc_sessionDelete",params:i.getSdkError("USER_DISCONNECTED"),throwOnFailedPublish:!0}),await this.deleteSession(s)):await this.client.core.pairing.disconnect({topic:s})},this.find=e=>(this.isInitialized(),this.client.session.getAll().filter(s=>i.isSessionCompatible(s,e))),this.getPendingSessionRequests=()=>(this.isInitialized(),this.client.pendingRequest.getAll()),this.cleanupDuplicatePairings=async e=>{if(e.pairingTopic)try{const s=this.client.core.pairing.pairings.get(e.pairingTopic),t=this.client.core.pairing.pairings.getAll().filter(r=>{var o,a;return((o=r.peerMetadata)==null?void 0:o.url)&&((a=r.peerMetadata)==null?void 0:a.url)===e.peer.metadata.url&&r.topic&&r.topic!==s.topic});if(t.length===0)return;this.client.logger.info(`Cleaning up ${t.length} duplicate pairing(s)`),await Promise.all(t.map(r=>this.client.core.pairing.disconnect({topic:r.topic}))),this.client.logger.info("Duplicate pairings clean up finished")}catch(s){this.client.logger.error(s)}},this.deleteSession=async(e,s)=>{const{self:t}=this.client.session.get(e);await this.client.core.relayer.unsubscribe(e),this.client.session.delete(e,i.getSdkError("USER_DISCONNECTED")),this.client.core.crypto.keychain.has(t.publicKey)&&await this.client.core.crypto.deleteKeyPair(t.publicKey),this.client.core.crypto.keychain.has(e)&&await this.client.core.crypto.deleteSymKey(e),s||this.client.core.expirer.del(e),this.client.core.storage.removeItem(M).catch(r=>this.client.logger.warn(r))},this.deleteProposal=async(e,s)=>{await Promise.all([this.client.proposal.delete(e,i.getSdkError("USER_DISCONNECTED")),s?Promise.resolve():this.client.core.expirer.del(e)])},this.deletePendingSessionRequest=async(e,s,t=!1)=>{await Promise.all([this.client.pendingRequest.delete(e,s),t?Promise.resolve():this.client.core.expirer.del(e)]),this.sessionRequestQueue.queue=this.sessionRequestQueue.queue.filter(r=>r.id!==e),t&&(this.sessionRequestQueue.state=_.idle)},this.setExpiry=async(e,s)=>{this.client.session.keys.includes(e)&&await this.client.session.update(e,{expiry:s}),this.client.core.expirer.set(e,s)},this.setProposal=async(e,s)=>{await this.client.proposal.set(e,s),this.client.core.expirer.set(e,s.expiry)},this.setPendingSessionRequest=async e=>{const s=N.wc_sessionRequest.req.ttl,{id:t,topic:r,params:o,verifyContext:a}=e;await this.client.pendingRequest.set(t,{id:t,topic:r,params:o,verifyContext:a}),s&&this.client.core.expirer.set(t,i.calcExpiry(s))},this.sendRequest=async e=>{const{topic:s,method:t,params:r,expiry:o,relayRpcId:a,clientRpcId:c,throwOnFailedPublish:l}=e,h=g.formatJsonRpcRequest(t,r,c);if(i.isBrowser()&&F.includes(t)){const y=i.hashMessage(JSON.stringify(h));this.client.core.verify.register({attestationId:y})}const u=await this.client.core.crypto.encode(s,h),d=N[t].req;return o&&(d.ttl=o),a&&(d.id=a),this.client.core.history.set(s,h),l?(d.internal=v(m({},d.internal),{throwOnFailedPublish:!0}),await this.client.core.relayer.publish(s,u,d)):this.client.core.relayer.publish(s,u,d).catch(y=>this.client.logger.error(y)),h.id},this.sendResult=async e=>{const{id:s,topic:t,result:r,throwOnFailedPublish:o}=e,a=g.formatJsonRpcResult(s,r),c=await this.client.core.crypto.encode(t,a),l=await this.client.core.history.get(t,s),h=N[l.request.method].res;o?(h.internal=v(m({},h.internal),{throwOnFailedPublish:!0}),await this.client.core.relayer.publish(t,c,h)):this.client.core.relayer.publish(t,c,h).catch(u=>this.client.logger.error(u)),await this.client.core.history.resolve(a)},this.sendError=async(e,s,t)=>{const r=g.formatJsonRpcError(e,t),o=await this.client.core.crypto.encode(s,r),a=await this.client.core.history.get(s,e),c=N[a.request.method].res;this.client.core.relayer.publish(s,o,c),await this.client.core.history.resolve(r)},this.cleanup=async()=>{const e=[],s=[];this.client.session.getAll().forEach(t=>{i.isExpired(t.expiry)&&e.push(t.topic)}),this.client.proposal.getAll().forEach(t=>{i.isExpired(t.expiry)&&s.push(t.id)}),await Promise.all([...e.map(t=>this.deleteSession(t)),...s.map(t=>this.deleteProposal(t))])},this.onRelayEventRequest=async e=>{this.requestQueue.queue.push(e),await this.processRequestsQueue()},this.processRequestsQueue=async()=>{if(this.requestQueue.state===_.active){this.client.logger.info("Request queue already active, skipping...");return}for(this.client.logger.info(`Request queue starting with ${this.requestQueue.queue.length} requests`);this.requestQueue.queue.length>0;){this.requestQueue.state=_.active;const e=this.requestQueue.queue.shift();if(e)try{this.processRequest(e),await new Promise(s=>setTimeout(s,300))}catch(s){this.client.logger.warn(s)}}this.requestQueue.state=_.idle},this.processRequest=e=>{const{topic:s,payload:t}=e,r=t.method;switch(r){case"wc_sessionPropose":return this.onSessionProposeRequest(s,t);case"wc_sessionSettle":return this.onSessionSettleRequest(s,t);case"wc_sessionUpdate":return this.onSessionUpdateRequest(s,t);case"wc_sessionExtend":return this.onSessionExtendRequest(s,t);case"wc_sessionPing":return this.onSessionPingRequest(s,t);case"wc_sessionDelete":return this.onSessionDeleteRequest(s,t);case"wc_sessionRequest":return this.onSessionRequest(s,t);case"wc_sessionEvent":return this.onSessionEventRequest(s,t);default:return this.client.logger.info(`Unsupported request method ${r}`)}},this.onRelayEventResponse=async e=>{const{topic:s,payload:t}=e,r=(await this.client.core.history.get(s,t.id)).request.method;switch(r){case"wc_sessionPropose":return this.onSessionProposeResponse(s,t);case"wc_sessionSettle":return this.onSessionSettleResponse(s,t);case"wc_sessionUpdate":return this.onSessionUpdateResponse(s,t);case"wc_sessionExtend":return this.onSessionExtendResponse(s,t);case"wc_sessionPing":return this.onSessionPingResponse(s,t);case"wc_sessionRequest":return this.onSessionRequestResponse(s,t);default:return this.client.logger.info(`Unsupported response method ${r}`)}},this.onRelayEventUnknownPayload=e=>{const{topic:s}=e,{message:t}=i.getInternalError("MISSING_OR_INVALID",`Decoded payload on topic ${s} is not identifiable as a JSON-RPC request or a response.`);throw new Error(t)},this.onSessionProposeRequest=async(e,s)=>{const{params:t,id:r}=s;try{this.isValidConnect(m({},s.params));const o=i.calcExpiry(p.FIVE_MINUTES),a=m({id:r,pairingTopic:e,expiry:o},t);await this.setProposal(r,a);const c=i.hashMessage(JSON.stringify(s)),l=await this.getVerifyContext(c,a.proposer.metadata);this.client.events.emit("session_proposal",{id:r,params:a,verifyContext:l})}catch(o){await this.sendError(r,e,o),this.client.logger.error(o)}},this.onSessionProposeResponse=async(e,s)=>{const{id:t}=s;if(g.isJsonRpcResult(s)){const{result:r}=s;this.client.logger.trace({type:"method",method:"onSessionProposeResponse",result:r});const o=this.client.proposal.get(t);this.client.logger.trace({type:"method",method:"onSessionProposeResponse",proposal:o});const a=o.proposer.publicKey;this.client.logger.trace({type:"method",method:"onSessionProposeResponse",selfPublicKey:a});const c=r.responderPublicKey;this.client.logger.trace({type:"method",method:"onSessionProposeResponse",peerPublicKey:c});const l=await this.client.core.crypto.generateSharedKey(a,c);this.client.logger.trace({type:"method",method:"onSessionProposeResponse",sessionTopic:l});const h=await this.client.core.relayer.subscribe(l);this.client.logger.trace({type:"method",method:"onSessionProposeResponse",subscriptionId:h}),await this.client.core.pairing.activate({topic:e})}else g.isJsonRpcError(s)&&(await this.client.proposal.delete(t,i.getSdkError("USER_DISCONNECTED")),this.events.emit(i.engineEvent("session_connect"),{error:s.error}))},this.onSessionSettleRequest=async(e,s)=>{const{id:t,params:r}=s;try{this.isValidSessionSettleRequest(r);const{relay:o,controller:a,expiry:c,namespaces:l,requiredNamespaces:h,optionalNamespaces:u,sessionProperties:d,pairingTopic:y}=s.params,I=m({topic:e,relay:o,expiry:c,namespaces:l,acknowledged:!0,pairingTopic:y,requiredNamespaces:h,optionalNamespaces:u,controller:a.publicKey,self:{publicKey:"",metadata:this.client.metadata},peer:{publicKey:a.publicKey,metadata:a.metadata}},d&&{sessionProperties:d});await this.sendResult({id:s.id,topic:e,result:!0}),this.events.emit(i.engineEvent("session_connect"),{session:I}),this.cleanupDuplicatePairings(I)}catch(o){await this.sendError(t,e,o),this.client.logger.error(o)}},this.onSessionSettleResponse=async(e,s)=>{const{id:t}=s;g.isJsonRpcResult(s)?(await this.client.session.update(e,{acknowledged:!0}),this.events.emit(i.engineEvent("session_approve",t),{})):g.isJsonRpcError(s)&&(await this.client.session.delete(e,i.getSdkError("USER_DISCONNECTED")),this.events.emit(i.engineEvent("session_approve",t),{error:s.error}))},this.onSessionUpdateRequest=async(e,s)=>{const{params:t,id:r}=s;try{const o=`${e}_session_update`,a=i.MemoryStore.get(o);if(a&&this.isRequestOutOfSync(a,r)){this.client.logger.info(`Discarding out of sync request - ${r}`);return}this.isValidUpdate(m({topic:e},t)),await this.client.session.update(e,{namespaces:t.namespaces}),await this.sendResult({id:r,topic:e,result:!0}),this.client.events.emit("session_update",{id:r,topic:e,params:t}),i.MemoryStore.set(o,r)}catch(o){await this.sendError(r,e,o),this.client.logger.error(o)}},this.isRequestOutOfSync=(e,s)=>parseInt(s.toString().slice(0,-3))<=parseInt(e.toString().slice(0,-3)),this.onSessionUpdateResponse=(e,s)=>{const{id:t}=s;g.isJsonRpcResult(s)?this.events.emit(i.engineEvent("session_update",t),{}):g.isJsonRpcError(s)&&this.events.emit(i.engineEvent("session_update",t),{error:s.error})},this.onSessionExtendRequest=async(e,s)=>{const{id:t}=s;try{this.isValidExtend({topic:e}),await this.setExpiry(e,i.calcExpiry(P)),await this.sendResult({id:t,topic:e,result:!0}),this.client.events.emit("session_extend",{id:t,topic:e})}catch(r){await this.sendError(t,e,r),this.client.logger.error(r)}},this.onSessionExtendResponse=(e,s)=>{const{id:t}=s;g.isJsonRpcResult(s)?this.events.emit(i.engineEvent("session_extend",t),{}):g.isJsonRpcError(s)&&this.events.emit(i.engineEvent("session_extend",t),{error:s.error})},this.onSessionPingRequest=async(e,s)=>{const{id:t}=s;try{this.isValidPing({topic:e}),await this.sendResult({id:t,topic:e,result:!0}),this.client.events.emit("session_ping",{id:t,topic:e})}catch(r){await this.sendError(t,e,r),this.client.logger.error(r)}},this.onSessionPingResponse=(e,s)=>{const{id:t}=s;setTimeout(()=>{g.isJsonRpcResult(s)?this.events.emit(i.engineEvent("session_ping",t),{}):g.isJsonRpcError(s)&&this.events.emit(i.engineEvent("session_ping",t),{error:s.error})},500)},this.onSessionDeleteRequest=async(e,s)=>{const{id:t}=s;try{this.isValidDisconnect({topic:e,reason:s.params}),await Promise.all([new Promise(r=>{this.client.core.relayer.once(S.RELAYER_EVENTS.publish,async()=>{r(await this.deleteSession(e))})}),this.sendResult({id:t,topic:e,result:!0})]),this.client.events.emit("session_delete",{id:t,topic:e})}catch(r){this.client.logger.error(r)}},this.onSessionRequest=async(e,s)=>{const{id:t,params:r}=s;try{this.isValidRequest(m({topic:e},r));const o=i.hashMessage(JSON.stringify(g.formatJsonRpcRequest("wc_sessionRequest",r,t))),a=this.client.session.get(e),c=await this.getVerifyContext(o,a.peer.metadata),l={id:t,topic:e,params:r,verifyContext:c};await this.setPendingSessionRequest(l),this.addSessionRequestToSessionRequestQueue(l),this.processSessionRequestQueue()}catch(o){await this.sendError(t,e,o),this.client.logger.error(o)}},this.onSessionRequestResponse=(e,s)=>{const{id:t}=s;g.isJsonRpcResult(s)?this.events.emit(i.engineEvent("session_request",t),{result:s.result}):g.isJsonRpcError(s)&&this.events.emit(i.engineEvent("session_request",t),{error:s.error})},this.onSessionEventRequest=async(e,s)=>{const{id:t,params:r}=s;try{const o=`${e}_session_event_${r.event.name}`,a=i.MemoryStore.get(o);if(a&&this.isRequestOutOfSync(a,t)){this.client.logger.info(`Discarding out of sync request - ${t}`);return}this.isValidEmit(m({topic:e},r)),this.client.events.emit("session_event",{id:t,topic:e,params:r}),i.MemoryStore.set(o,t)}catch(o){await this.sendError(t,e,o),this.client.logger.error(o)}},this.addSessionRequestToSessionRequestQueue=e=>{this.sessionRequestQueue.queue.push(e)},this.cleanupAfterResponse=e=>{this.deletePendingSessionRequest(e.response.id,{message:"fulfilled",code:0}),setTimeout(()=>{this.sessionRequestQueue.state=_.idle,this.processSessionRequestQueue()},p.toMiliseconds(this.requestQueueDelay))},this.processSessionRequestQueue=()=>{if(this.sessionRequestQueue.state===_.active){this.client.logger.info("session request queue is already active.");return}const e=this.sessionRequestQueue.queue[0];if(!e){this.client.logger.info("session request queue is empty.");return}try{this.sessionRequestQueue.state=_.active,this.client.events.emit("session_request",e)}catch(s){this.client.logger.error(s)}},this.onPairingCreated=e=>{if(e.active)return;const s=this.client.proposal.getAll().find(t=>t.pairingTopic===e.topic);s&&this.onSessionProposeRequest(e.topic,g.formatJsonRpcRequest("wc_sessionPropose",{requiredNamespaces:s.requiredNamespaces,optionalNamespaces:s.optionalNamespaces,relays:s.relays,proposer:s.proposer,sessionProperties:s.sessionProperties},s.id))},this.isValidConnect=async e=>{if(!i.isValidParams(e)){const{message:c}=i.getInternalError("MISSING_OR_INVALID",`connect() params: ${JSON.stringify(e)}`);throw new Error(c)}const{pairingTopic:s,requiredNamespaces:t,optionalNamespaces:r,sessionProperties:o,relays:a}=e;if(i.isUndefined(s)||await this.isValidPairingTopic(s),!i.isValidRelays(a,!0)){const{message:c}=i.getInternalError("MISSING_OR_INVALID",`connect() relays: ${a}`);throw new Error(c)}!i.isUndefined(t)&&i.isValidObject(t)!==0&&this.validateNamespaces(t,"requiredNamespaces"),!i.isUndefined(r)&&i.isValidObject(r)!==0&&this.validateNamespaces(r,"optionalNamespaces"),i.isUndefined(o)||this.validateSessionProps(o,"sessionProperties")},this.validateNamespaces=(e,s)=>{const t=i.isValidRequiredNamespaces(e,"connect()",s);if(t)throw new Error(t.message)},this.isValidApprove=async e=>{if(!i.isValidParams(e))throw new Error(i.getInternalError("MISSING_OR_INVALID",`approve() params: ${e}`).message);const{id:s,namespaces:t,relayProtocol:r,sessionProperties:o}=e;await this.isValidProposalId(s);const a=this.client.proposal.get(s),c=i.isValidNamespaces(t,"approve()");if(c)throw new Error(c.message);const l=i.isConformingNamespaces(a.requiredNamespaces,t,"approve()");if(l)throw new Error(l.message);if(!i.isValidString(r,!0)){const{message:h}=i.getInternalError("MISSING_OR_INVALID",`approve() relayProtocol: ${r}`);throw new Error(h)}i.isUndefined(o)||this.validateSessionProps(o,"sessionProperties")},this.isValidReject=async e=>{if(!i.isValidParams(e)){const{message:r}=i.getInternalError("MISSING_OR_INVALID",`reject() params: ${e}`);throw new Error(r)}const{id:s,reason:t}=e;if(await this.isValidProposalId(s),!i.isValidErrorReason(t)){const{message:r}=i.getInternalError("MISSING_OR_INVALID",`reject() reason: ${JSON.stringify(t)}`);throw new Error(r)}},this.isValidSessionSettleRequest=e=>{if(!i.isValidParams(e)){const{message:l}=i.getInternalError("MISSING_OR_INVALID",`onSessionSettleRequest() params: ${e}`);throw new Error(l)}const{relay:s,controller:t,namespaces:r,expiry:o}=e;if(!i.isValidRelay(s)){const{message:l}=i.getInternalError("MISSING_OR_INVALID","onSessionSettleRequest() relay protocol should be a string");throw new Error(l)}const a=i.isValidController(t,"onSessionSettleRequest()");if(a)throw new Error(a.message);const c=i.isValidNamespaces(r,"onSessionSettleRequest()");if(c)throw new Error(c.message);if(i.isExpired(o)){const{message:l}=i.getInternalError("EXPIRED","onSessionSettleRequest()");throw new Error(l)}},this.isValidUpdate=async e=>{if(!i.isValidParams(e)){const{message:c}=i.getInternalError("MISSING_OR_INVALID",`update() params: ${e}`);throw new Error(c)}const{topic:s,namespaces:t}=e;await this.isValidSessionTopic(s);const r=this.client.session.get(s),o=i.isValidNamespaces(t,"update()");if(o)throw new Error(o.message);const a=i.isConformingNamespaces(r.requiredNamespaces,t,"update()");if(a)throw new Error(a.message)},this.isValidExtend=async e=>{if(!i.isValidParams(e)){const{message:t}=i.getInternalError("MISSING_OR_INVALID",`extend() params: ${e}`);throw new Error(t)}const{topic:s}=e;await this.isValidSessionTopic(s)},this.isValidRequest=async e=>{if(!i.isValidParams(e)){const{message:c}=i.getInternalError("MISSING_OR_INVALID",`request() params: ${e}`);throw new Error(c)}const{topic:s,request:t,chainId:r,expiry:o}=e;await this.isValidSessionTopic(s);const{namespaces:a}=this.client.session.get(s);if(!i.isValidNamespacesChainId(a,r)){const{message:c}=i.getInternalError("MISSING_OR_INVALID",`request() chainId: ${r}`);throw new Error(c)}if(!i.isValidRequest(t)){const{message:c}=i.getInternalError("MISSING_OR_INVALID",`request() ${JSON.stringify(t)}`);throw new Error(c)}if(!i.isValidNamespacesRequest(a,r,t.method)){const{message:c}=i.getInternalError("MISSING_OR_INVALID",`request() method: ${t.method}`);throw new Error(c)}if(o&&!i.isValidRequestExpiry(o,D)){const{message:c}=i.getInternalError("MISSING_OR_INVALID",`request() expiry: ${o}. Expiry must be a number (in seconds) between ${D.min} and ${D.max}`);throw new Error(c)}},this.isValidRespond=async e=>{if(!i.isValidParams(e)){const{message:r}=i.getInternalError("MISSING_OR_INVALID",`respond() params: ${e}`);throw new Error(r)}const{topic:s,response:t}=e;if(await this.isValidSessionTopic(s),!i.isValidResponse(t)){const{message:r}=i.getInternalError("MISSING_OR_INVALID",`respond() response: ${JSON.stringify(t)}`);throw new Error(r)}},this.isValidPing=async e=>{if(!i.isValidParams(e)){const{message:t}=i.getInternalError("MISSING_OR_INVALID",`ping() params: ${e}`);throw new Error(t)}const{topic:s}=e;await this.isValidSessionOrPairingTopic(s)},this.isValidEmit=async e=>{if(!i.isValidParams(e)){const{message:a}=i.getInternalError("MISSING_OR_INVALID",`emit() params: ${e}`);throw new Error(a)}const{topic:s,event:t,chainId:r}=e;await this.isValidSessionTopic(s);const{namespaces:o}=this.client.session.get(s);if(!i.isValidNamespacesChainId(o,r)){const{message:a}=i.getInternalError("MISSING_OR_INVALID",`emit() chainId: ${r}`);throw new Error(a)}if(!i.isValidEvent(t)){const{message:a}=i.getInternalError("MISSING_OR_INVALID",`emit() event: ${JSON.stringify(t)}`);throw new Error(a)}if(!i.isValidNamespacesEvent(o,r,t.name)){const{message:a}=i.getInternalError("MISSING_OR_INVALID",`emit() event: ${JSON.stringify(t)}`);throw new Error(a)}},this.isValidDisconnect=async e=>{if(!i.isValidParams(e)){const{message:t}=i.getInternalError("MISSING_OR_INVALID",`disconnect() params: ${e}`);throw new Error(t)}const{topic:s}=e;await this.isValidSessionOrPairingTopic(s)},this.getVerifyContext=async(e,s)=>{const t={verified:{verifyUrl:s.verifyUrl||S.VERIFY_SERVER,validation:"UNKNOWN",origin:s.url||""}};try{const r=await this.client.core.verify.resolve({attestationId:e,verifyUrl:s.verifyUrl});r&&(t.verified.origin=r.origin,t.verified.isScam=r.isScam,t.verified.validation=r.origin===new URL(s.url).origin?"VALID":"INVALID")}catch(r){this.client.logger.info(r)}return this.client.logger.info(`Verify context: ${JSON.stringify(t)}`),t},this.validateSessionProps=(e,s)=>{Object.values(e).forEach(t=>{if(!i.isValidString(t,!1)){const{message:r}=i.getInternalError("MISSING_OR_INVALID",`${s} must be in Record<string, string> format. Received: ${JSON.stringify(t)}`);throw new Error(r)}})}}async isInitialized(){if(!this.initialized){const{message:n}=i.getInternalError("NOT_INITIALIZED",this.name);throw new Error(n)}await this.client.core.relayer.confirmOnlineStateOrThrow()}registerRelayerEvents(){this.client.core.relayer.on(S.RELAYER_EVENTS.message,async n=>{const{topic:e,message:s}=n;if(this.ignoredPayloadTypes.includes(this.client.core.crypto.getPayloadType(s)))return;const t=await this.client.core.crypto.decode(e,s);try{g.isJsonRpcRequest(t)?(this.client.core.history.set(e,t),this.onRelayEventRequest({topic:e,payload:t})):g.isJsonRpcResponse(t)?(await this.client.core.history.resolve(t),await this.onRelayEventResponse({topic:e,payload:t}),this.client.core.history.delete(e,t.id)):this.onRelayEventUnknownPayload({topic:e,payload:t})}catch(r){this.client.logger.error(r)}})}registerExpirerEvents(){this.client.core.expirer.on(S.EXPIRER_EVENTS.expired,async n=>{const{topic:e,id:s}=i.parseExpirerTarget(n.target);if(s&&this.client.pendingRequest.keys.includes(s))return await this.deletePendingSessionRequest(s,i.getInternalError("EXPIRED"),!0);e?this.client.session.keys.includes(e)&&(await this.deleteSession(e,!0),this.client.events.emit("session_expire",{topic:e})):s&&(await this.deleteProposal(s,!0),this.client.events.emit("proposal_expire",{id:s}))})}registerPairingEvents(){this.client.core.pairing.events.on(S.PAIRING_EVENTS.create,n=>this.onPairingCreated(n))}isValidPairingTopic(n){if(!i.isValidString(n,!1)){const{message:e}=i.getInternalError("MISSING_OR_INVALID",`pairing topic should be a string: ${n}`);throw new Error(e)}if(!this.client.core.pairing.pairings.keys.includes(n)){const{message:e}=i.getInternalError("NO_MATCHING_KEY",`pairing topic doesn't exist: ${n}`);throw new Error(e)}if(i.isExpired(this.client.core.pairing.pairings.get(n).expiry)){const{message:e}=i.getInternalError("EXPIRED",`pairing topic: ${n}`);throw new Error(e)}}async isValidSessionTopic(n){if(!i.isValidString(n,!1)){const{message:e}=i.getInternalError("MISSING_OR_INVALID",`session topic should be a string: ${n}`);throw new Error(e)}if(!this.client.session.keys.includes(n)){const{message:e}=i.getInternalError("NO_MATCHING_KEY",`session topic doesn't exist: ${n}`);throw new Error(e)}if(i.isExpired(this.client.session.get(n).expiry)){await this.deleteSession(n);const{message:e}=i.getInternalError("EXPIRED",`session topic: ${n}`);throw new Error(e)}}async isValidSessionOrPairingTopic(n){if(this.client.session.keys.includes(n))await this.isValidSessionTopic(n);else if(this.client.core.pairing.pairings.keys.includes(n))this.isValidPairingTopic(n);else if(i.isValidString(n,!1)){const{message:e}=i.getInternalError("NO_MATCHING_KEY",`session or pairing topic doesn't exist: ${n}`);throw new Error(e)}else{const{message:e}=i.getInternalError("MISSING_OR_INVALID",`session or pairing topic should be a string: ${n}`);throw new Error(e)}}async isValidProposalId(n){if(!i.isValidId(n)){const{message:e}=i.getInternalError("MISSING_OR_INVALID",`proposal id should be a number: ${n}`);throw new Error(e)}if(!this.client.proposal.keys.includes(n)){const{message:e}=i.getInternalError("NO_MATCHING_KEY",`proposal id doesn't exist: ${n}`);throw new Error(e)}if(i.isExpired(this.client.proposal.get(n).expiry)){await this.deleteProposal(n);const{message:e}=i.getInternalError("EXPIRED",`proposal id: ${n}`);throw new Error(e)}}}class pe extends S.Store{constructor(n,e){super(n,e,Y,T),this.core=n,this.logger=e}}class he extends S.Store{constructor(n,e){super(n,e,k,T),this.core=n,this.logger=e}}class de extends S.Store{constructor(n,e){super(n,e,K,T,s=>s.id),this.core=n,this.logger=e}}class x extends U.ISignClient{constructor(n){super(n),this.protocol=A,this.version=L,this.name=V.name,this.events=new $.EventEmitter,this.on=(s,t)=>this.events.on(s,t),this.once=(s,t)=>this.events.once(s,t),this.off=(s,t)=>this.events.off(s,t),this.removeListener=(s,t)=>this.events.removeListener(s,t),this.removeAllListeners=s=>this.events.removeAllListeners(s),this.connect=async s=>{try{return await this.engine.connect(s)}catch(t){throw this.logger.error(t.message),t}},this.pair=async s=>{try{return await this.engine.pair(s)}catch(t){throw this.logger.error(t.message),t}},this.approve=async s=>{try{return await this.engine.approve(s)}catch(t){throw this.logger.error(t.message),t}},this.reject=async s=>{try{return await this.engine.reject(s)}catch(t){throw this.logger.error(t.message),t}},this.update=async s=>{try{return await this.engine.update(s)}catch(t){throw this.logger.error(t.message),t}},this.extend=async s=>{try{return await this.engine.extend(s)}catch(t){throw this.logger.error(t.message),t}},this.request=async s=>{try{return await this.engine.request(s)}catch(t){throw this.logger.error(t.message),t}},this.respond=async s=>{try{return await this.engine.respond(s)}catch(t){throw this.logger.error(t.message),t}},this.ping=async s=>{try{return await this.engine.ping(s)}catch(t){throw this.logger.error(t.message),t}},this.emit=async s=>{try{return await this.engine.emit(s)}catch(t){throw this.logger.error(t.message),t}},this.disconnect=async s=>{try{return await this.engine.disconnect(s)}catch(t){throw this.logger.error(t.message),t}},this.find=s=>{try{return this.engine.find(s)}catch(t){throw this.logger.error(t.message),t}},this.getPendingSessionRequests=()=>{try{return this.engine.getPendingSessionRequests()}catch(s){throw this.logger.error(s.message),s}},this.name=n?.name||V.name,this.metadata=n?.metadata||i.getAppMetadata();const e=typeof n?.logger<"u"&&typeof n?.logger!="string"?n.logger:O.pino(O.getDefaultLoggerOptions({level:n?.logger||V.logger}));this.core=n?.core||new S.Core(n),this.logger=O.generateChildLogger(e,this.name),this.session=new he(this.core,this.logger),this.proposal=new pe(this.core,this.logger),this.pendingRequest=new de(this.core,this.logger),this.engine=new le(this)}static async init(n){const e=new x(n);return await e.initialize(),e}get context(){return O.getLoggerContext(this.logger)}get pairing(){return this.core.pairing.pairings}async initialize(){this.logger.trace("Initialized");try{await this.core.start(),await this.session.init(),await this.proposal.init(),await this.pendingRequest.init(),await this.engine.init(),this.core.verify.init({verifyUrl:this.metadata.verifyUrl}),this.logger.info("SignClient Initialization Success")}catch(n){throw this.logger.info("SignClient Initialization Failure"),this.logger.error(n.message),n}}}const ge=x;exports.ENGINE_CONTEXT=J,exports.ENGINE_QUEUE_STATES=_,exports.ENGINE_RPC_OPTS=N,exports.HISTORY_CONTEXT=se,exports.HISTORY_EVENTS=ee,exports.HISTORY_STORAGE_VERSION=te,exports.METHODS_TO_VERIFY=F,exports.PROPOSAL_CONTEXT=Y,exports.PROPOSAL_EXPIRY=ie,exports.PROPOSAL_EXPIRY_MESSAGE=Q,exports.REQUEST_CONTEXT=K,exports.SESSION_CONTEXT=k,exports.SESSION_EXPIRY=P,exports.SESSION_REQUEST_EXPIRY_BOUNDARIES=D,exports.SIGN_CLIENT_CONTEXT=b,exports.SIGN_CLIENT_DEFAULT=V,exports.SIGN_CLIENT_EVENTS=B,exports.SIGN_CLIENT_PROTOCOL=A,exports.SIGN_CLIENT_STORAGE_OPTIONS=Z,exports.SIGN_CLIENT_STORAGE_PREFIX=T,exports.SIGN_CLIENT_VERSION=L,exports.SignClient=ge,exports.WALLETCONNECT_DEEPLINK_CHOICE=M,exports.default=x;
//# sourceMappingURL=index.cjs.js.map