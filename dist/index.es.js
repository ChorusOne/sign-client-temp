import{RELAYER_DEFAULT_PROTOCOL as ge,RELAYER_EVENTS as Z,VERIFY_SERVER as me,EXPIRER_EVENTS as we,PAIRING_EVENTS as ye,Store as k,Core as Se}from"@walletconnect/core";import{pino as Ee,getDefaultLoggerOptions as Re,generateChildLogger as Ie,getLoggerContext as _e}from"@walletconnect/logger";import{IEngine as Ne,ISignClient as qe}from"@walletconnect/types";import{TYPE_1 as fe,createDelayedPromise as x,engineEvent as u,getInternalError as l,calcExpiry as _,isValidObject as z,getRequiredNamespacesFromNamespaces as ve,getSdkError as N,getDeepLink as Pe,handleDeeplinkRedirect as Oe,isSessionCompatible as Ve,isBrowser as Te,hashMessage as Y,isExpired as P,MemoryStore as $,isValidParams as E,isUndefined as D,isValidRelays as xe,isValidRequiredNamespaces as De,isValidNamespaces as j,isConformingNamespaces as ee,isValidString as C,isValidErrorReason as Ce,isValidRelay as Ae,isValidController as be,isValidNamespacesChainId as se,isValidRequest as Le,isValidNamespacesRequest as $e,isValidRequestExpiry as Ge,isValidResponse as Me,isValidEvent as Ue,isValidNamespacesEvent as Qe,parseExpirerTarget as Ke,isValidId as ke,getAppMetadata as ze}from"@walletconnect/utils";import Ye,{EventEmitter as je}from"events";import{THIRTY_DAYS as Je,SEVEN_DAYS as te,FIVE_MINUTES as y,ONE_DAY as O,THIRTY_SECONDS as ie,ONE_SECOND as Xe,toMiliseconds as re}from"@walletconnect/time";import{payloadId as Fe,isJsonRpcResult as q,isJsonRpcError as f,formatJsonRpcRequest as J,formatJsonRpcResult as He,formatJsonRpcError as We,isJsonRpcRequest as Be,isJsonRpcResponse as Ze}from"@walletconnect/jsonrpc-utils";const X="wc",F=2,H="client",G=`${X}@${F}:${H}:`,M={name:H,logger:"error",controller:!1,relayUrl:"wss://relay.walletconnect.com"},es={session_proposal:"session_proposal",session_update:"session_update",session_extend:"session_extend",session_ping:"session_ping",session_delete:"session_delete",session_expire:"session_expire",session_request:"session_request",session_request_sent:"session_request_sent",session_event:"session_event",proposal_expire:"proposal_expire"},ss={database:":memory:"},W="WALLETCONNECT_DEEPLINK_CHOICE",ts={created:"history_created",updated:"history_updated",deleted:"history_deleted",sync:"history_sync"},is="history",rs="0.3",ne="proposal",ns=Je,oe="Proposal expired",ae="session",A=te,ce="engine",V={wc_sessionPropose:{req:{ttl:y,prompt:!0,tag:1100},res:{ttl:y,prompt:!1,tag:1101}},wc_sessionSettle:{req:{ttl:y,prompt:!1,tag:1102},res:{ttl:y,prompt:!1,tag:1103}},wc_sessionUpdate:{req:{ttl:O,prompt:!1,tag:1104},res:{ttl:O,prompt:!1,tag:1105}},wc_sessionExtend:{req:{ttl:O,prompt:!1,tag:1106},res:{ttl:O,prompt:!1,tag:1107}},wc_sessionRequest:{req:{ttl:y,prompt:!0,tag:1108},res:{ttl:y,prompt:!1,tag:1109}},wc_sessionEvent:{req:{ttl:y,prompt:!0,tag:1110},res:{ttl:y,prompt:!1,tag:1111}},wc_sessionDelete:{req:{ttl:O,prompt:!1,tag:1112},res:{ttl:O,prompt:!1,tag:1113}},wc_sessionPing:{req:{ttl:ie,prompt:!1,tag:1114},res:{ttl:ie,prompt:!1,tag:1115}}},U={min:y,max:te},I={idle:"IDLE",active:"ACTIVE"},le="request",pe=["wc_sessionPropose","wc_sessionRequest","wc_authRequest"];var os=Object.defineProperty,as=Object.defineProperties,cs=Object.getOwnPropertyDescriptors,he=Object.getOwnPropertySymbols,ls=Object.prototype.hasOwnProperty,ps=Object.prototype.propertyIsEnumerable,de=(m,r,e)=>r in m?os(m,r,{enumerable:!0,configurable:!0,writable:!0,value:e}):m[r]=e,g=(m,r)=>{for(var e in r||(r={}))ls.call(r,e)&&de(m,e,r[e]);if(he)for(var e of he(r))ps.call(r,e)&&de(m,e,r[e]);return m},b=(m,r)=>as(m,cs(r));class hs extends Ne{constructor(r){super(r),this.name=ce,this.events=new Ye,this.initialized=!1,this.ignoredPayloadTypes=[fe],this.requestQueue={state:I.idle,queue:[]},this.sessionRequestQueue={state:I.idle,queue:[]},this.requestQueueDelay=Xe,this.init=async()=>{this.initialized||(await this.cleanup(),this.registerRelayerEvents(),this.registerExpirerEvents(),this.registerPairingEvents(),this.client.core.pairing.register({methods:Object.keys(V)}),this.initialized=!0,setTimeout(()=>{this.sessionRequestQueue.queue=this.getPendingSessionRequests(),this.processSessionRequestQueue()},re(this.requestQueueDelay)))},this.connect=async e=>{await this.isInitialized();const s=b(g({},e),{requiredNamespaces:e.requiredNamespaces||{},optionalNamespaces:e.optionalNamespaces||{}});await this.isValidConnect(s);const{pairingTopic:t,requiredNamespaces:i,optionalNamespaces:n,sessionProperties:o,relays:a}=s;let c=t,p,d=!1;if(c&&(d=this.client.core.pairing.pairings.get(c).active),!c||!d){const{topic:v,uri:S}=await this.client.core.pairing.create();c=v,p=S}const h=await this.client.core.crypto.generateKeyPair(),R=g({requiredNamespaces:i,optionalNamespaces:n,relays:a??[{protocol:ge}],proposer:{publicKey:h,metadata:this.client.metadata}},o&&{sessionProperties:o}),{reject:w,resolve:T,done:K}=x(y,oe);if(this.events.once(u("session_connect"),async({error:v,session:S})=>{if(v)w(v);else if(S){S.self.publicKey=h;const B=b(g({},S),{requiredNamespaces:S.requiredNamespaces,optionalNamespaces:S.optionalNamespaces});await this.client.session.set(S.topic,B),await this.setExpiry(S.topic,S.expiry),c&&await this.client.core.pairing.updateMetadata({topic:c,metadata:S.peer.metadata}),T(B)}}),!c){const{message:v}=l("NO_MATCHING_KEY",`connect() pairing topic: ${c}`);throw new Error(v)}const L=await this.sendRequest({topic:c,method:"wc_sessionPropose",params:R}),ue=_(y);return await this.setProposal(L,g({id:L,expiry:ue},R)),{uri:p,approval:K}},this.pair=async e=>(await this.isInitialized(),await this.client.core.pairing.pair(e)),this.approve=async e=>{await this.isInitialized(),await this.isValidApprove(e);const{id:s,relayProtocol:t,namespaces:i,sessionProperties:n}=e,o=this.client.proposal.get(s);let{pairingTopic:a,proposer:c,requiredNamespaces:p,optionalNamespaces:d}=o;a=a||"",z(p)||(p=ve(i,"approve()"));const h=await this.client.core.crypto.generateKeyPair(),R=c.publicKey,w=await this.client.core.crypto.generateSharedKey(h,R);a&&s&&(await this.client.core.pairing.updateMetadata({topic:a,metadata:c.metadata}),await this.sendResult({id:s,topic:a,result:{relay:{protocol:t??"irn"},responderPublicKey:h}}),await this.client.proposal.delete(s,N("USER_DISCONNECTED")),await this.client.core.pairing.activate({topic:a}));const T=g({relay:{protocol:t??"irn"},namespaces:i,requiredNamespaces:p,optionalNamespaces:d,pairingTopic:a,controller:{publicKey:h,metadata:this.client.metadata},expiry:_(A)},n&&{sessionProperties:n});await this.client.core.relayer.subscribe(w),await this.sendRequest({topic:w,method:"wc_sessionSettle",params:T,throwOnFailedPublish:!0});const K=b(g({},T),{topic:w,pairingTopic:a,acknowledged:!1,self:T.controller,peer:{publicKey:c.publicKey,metadata:c.metadata},controller:h});return await this.client.session.set(w,K),await this.setExpiry(w,_(A)),{topic:w,acknowledged:()=>new Promise(L=>setTimeout(()=>L(this.client.session.get(w)),500))}},this.reject=async e=>{await this.isInitialized(),await this.isValidReject(e);const{id:s,reason:t}=e,{pairingTopic:i}=this.client.proposal.get(s);i&&(await this.sendError(s,i,t),await this.client.proposal.delete(s,N("USER_DISCONNECTED")))},this.update=async e=>{await this.isInitialized(),await this.isValidUpdate(e);const{topic:s,namespaces:t}=e,i=await this.sendRequest({topic:s,method:"wc_sessionUpdate",params:{namespaces:t}}),{done:n,resolve:o,reject:a}=x();return this.events.once(u("session_update",i),({error:c})=>{c?a(c):o()}),await this.client.session.update(s,{namespaces:t}),{acknowledged:n}},this.extend=async e=>{await this.isInitialized(),await this.isValidExtend(e);const{topic:s}=e,t=await this.sendRequest({topic:s,method:"wc_sessionExtend",params:{}}),{done:i,resolve:n,reject:o}=x();return this.events.once(u("session_extend",t),({error:a})=>{a?o(a):n()}),await this.setExpiry(s,_(A)),{acknowledged:i}},this.request=async e=>{await this.isInitialized(),await this.isValidRequest(e);const{chainId:s,request:t,topic:i,expiry:n}=e,o=Fe(),{done:a,resolve:c,reject:p}=x(n,"Request expired. Please try again.");return this.events.once(u("session_request",o),({error:d,result:h})=>{d?p(d):c(h)}),await Promise.all([new Promise(async d=>{await this.sendRequest({clientRpcId:o,topic:i,method:"wc_sessionRequest",params:{request:t,chainId:s},expiry:n,throwOnFailedPublish:!0}).catch(h=>p(h)),this.client.events.emit("session_request_sent",{topic:i,request:t,chainId:s,id:o}),d()}),new Promise(async d=>{const h=await Pe(this.client.core.storage,W);Oe({id:o,topic:i,wcDeepLink:h}),d()}),a()]).then(d=>d[2])},this.respond=async e=>{await this.isInitialized(),await this.isValidRespond(e);const{topic:s,response:t}=e,{id:i}=t;q(t)?await this.sendResult({id:i,topic:s,result:t.result,throwOnFailedPublish:!0}):f(t)&&await this.sendError(i,s,t.error),this.cleanupAfterResponse(e)},this.ping=async e=>{await this.isInitialized(),await this.isValidPing(e);const{topic:s}=e;if(this.client.session.keys.includes(s)){const t=await this.sendRequest({topic:s,method:"wc_sessionPing",params:{}}),{done:i,resolve:n,reject:o}=x();this.events.once(u("session_ping",t),({error:a})=>{a?o(a):n()}),await i()}else this.client.core.pairing.pairings.keys.includes(s)&&await this.client.core.pairing.ping({topic:s})},this.emit=async e=>{await this.isInitialized(),await this.isValidEmit(e);const{topic:s,event:t,chainId:i}=e;await this.sendRequest({topic:s,method:"wc_sessionEvent",params:{event:t,chainId:i}})},this.disconnect=async e=>{await this.isInitialized(),await this.isValidDisconnect(e);const{topic:s}=e;this.client.session.keys.includes(s)?(await this.sendRequest({topic:s,method:"wc_sessionDelete",params:N("USER_DISCONNECTED"),throwOnFailedPublish:!0}),await this.deleteSession(s)):await this.client.core.pairing.disconnect({topic:s})},this.find=e=>(this.isInitialized(),this.client.session.getAll().filter(s=>Ve(s,e))),this.getPendingSessionRequests=()=>(this.isInitialized(),this.client.pendingRequest.getAll()),this.cleanupDuplicatePairings=async e=>{if(e.pairingTopic)try{const s=this.client.core.pairing.pairings.get(e.pairingTopic),t=this.client.core.pairing.pairings.getAll().filter(i=>{var n,o;return((n=i.peerMetadata)==null?void 0:n.url)&&((o=i.peerMetadata)==null?void 0:o.url)===e.peer.metadata.url&&i.topic&&i.topic!==s.topic});if(t.length===0)return;this.client.logger.info(`Cleaning up ${t.length} duplicate pairing(s)`),await Promise.all(t.map(i=>this.client.core.pairing.disconnect({topic:i.topic}))),this.client.logger.info("Duplicate pairings clean up finished")}catch(s){this.client.logger.error(s)}},this.deleteSession=async(e,s)=>{const{self:t}=this.client.session.get(e);await this.client.core.relayer.unsubscribe(e),this.client.session.delete(e,N("USER_DISCONNECTED")),this.client.core.crypto.keychain.has(t.publicKey)&&await this.client.core.crypto.deleteKeyPair(t.publicKey),this.client.core.crypto.keychain.has(e)&&await this.client.core.crypto.deleteSymKey(e),s||this.client.core.expirer.del(e),this.client.core.storage.removeItem(W).catch(i=>this.client.logger.warn(i))},this.deleteProposal=async(e,s)=>{await Promise.all([this.client.proposal.delete(e,N("USER_DISCONNECTED")),s?Promise.resolve():this.client.core.expirer.del(e)])},this.deletePendingSessionRequest=async(e,s,t=!1)=>{await Promise.all([this.client.pendingRequest.delete(e,s),t?Promise.resolve():this.client.core.expirer.del(e)]),this.sessionRequestQueue.queue=this.sessionRequestQueue.queue.filter(i=>i.id!==e),t&&(this.sessionRequestQueue.state=I.idle)},this.setExpiry=async(e,s)=>{this.client.session.keys.includes(e)&&await this.client.session.update(e,{expiry:s}),this.client.core.expirer.set(e,s)},this.setProposal=async(e,s)=>{await this.client.proposal.set(e,s),this.client.core.expirer.set(e,s.expiry)},this.setPendingSessionRequest=async e=>{const s=V.wc_sessionRequest.req.ttl,{id:t,topic:i,params:n,verifyContext:o}=e;await this.client.pendingRequest.set(t,{id:t,topic:i,params:n,verifyContext:o}),s&&this.client.core.expirer.set(t,_(s))},this.sendRequest=async e=>{const{topic:s,method:t,params:i,expiry:n,relayRpcId:o,clientRpcId:a,throwOnFailedPublish:c}=e,p=J(t,i,a);if(Te()&&pe.includes(t)){const R=Y(JSON.stringify(p));this.client.core.verify.register({attestationId:R})}const d=await this.client.core.crypto.encode(s,p),h=V[t].req;return n&&(h.ttl=n),o&&(h.id=o),this.client.core.history.set(s,p),c?(h.internal=b(g({},h.internal),{throwOnFailedPublish:!0}),await this.client.core.relayer.publish(s,d,h)):this.client.core.relayer.publish(s,d,h).catch(R=>this.client.logger.error(R)),p.id},this.sendResult=async e=>{const{id:s,topic:t,result:i,throwOnFailedPublish:n}=e,o=He(s,i),a=await this.client.core.crypto.encode(t,o),c=await this.client.core.history.get(t,s),p=V[c.request.method].res;n?(p.internal=b(g({},p.internal),{throwOnFailedPublish:!0}),await this.client.core.relayer.publish(t,a,p)):this.client.core.relayer.publish(t,a,p).catch(d=>this.client.logger.error(d)),await this.client.core.history.resolve(o)},this.sendError=async(e,s,t)=>{const i=We(e,t),n=await this.client.core.crypto.encode(s,i),o=await this.client.core.history.get(s,e),a=V[o.request.method].res;this.client.core.relayer.publish(s,n,a),await this.client.core.history.resolve(i)},this.cleanup=async()=>{const e=[],s=[];this.client.session.getAll().forEach(t=>{P(t.expiry)&&e.push(t.topic)}),this.client.proposal.getAll().forEach(t=>{P(t.expiry)&&s.push(t.id)}),await Promise.all([...e.map(t=>this.deleteSession(t)),...s.map(t=>this.deleteProposal(t))])},this.onRelayEventRequest=async e=>{this.requestQueue.queue.push(e),await this.processRequestsQueue()},this.processRequestsQueue=async()=>{if(this.requestQueue.state===I.active){this.client.logger.info("Request queue already active, skipping...");return}for(this.client.logger.info(`Request queue starting with ${this.requestQueue.queue.length} requests`);this.requestQueue.queue.length>0;){this.requestQueue.state=I.active;const e=this.requestQueue.queue.shift();if(e)try{this.processRequest(e),await new Promise(s=>setTimeout(s,300))}catch(s){this.client.logger.warn(s)}}this.requestQueue.state=I.idle},this.processRequest=e=>{const{topic:s,payload:t}=e,i=t.method;switch(i){case"wc_sessionPropose":return this.onSessionProposeRequest(s,t);case"wc_sessionSettle":return this.onSessionSettleRequest(s,t);case"wc_sessionUpdate":return this.onSessionUpdateRequest(s,t);case"wc_sessionExtend":return this.onSessionExtendRequest(s,t);case"wc_sessionPing":return this.onSessionPingRequest(s,t);case"wc_sessionDelete":return this.onSessionDeleteRequest(s,t);case"wc_sessionRequest":return this.onSessionRequest(s,t);case"wc_sessionEvent":return this.onSessionEventRequest(s,t);default:return this.client.logger.info(`Unsupported request method ${i}`)}},this.onRelayEventResponse=async e=>{const{topic:s,payload:t}=e,i=(await this.client.core.history.get(s,t.id)).request.method;switch(i){case"wc_sessionPropose":return this.onSessionProposeResponse(s,t);case"wc_sessionSettle":return this.onSessionSettleResponse(s,t);case"wc_sessionUpdate":return this.onSessionUpdateResponse(s,t);case"wc_sessionExtend":return this.onSessionExtendResponse(s,t);case"wc_sessionPing":return this.onSessionPingResponse(s,t);case"wc_sessionRequest":return this.onSessionRequestResponse(s,t);default:return this.client.logger.info(`Unsupported response method ${i}`)}},this.onRelayEventUnknownPayload=e=>{const{topic:s}=e,{message:t}=l("MISSING_OR_INVALID",`Decoded payload on topic ${s} is not identifiable as a JSON-RPC request or a response.`);throw new Error(t)},this.onSessionProposeRequest=async(e,s)=>{const{params:t,id:i}=s;try{this.isValidConnect(g({},s.params));const n=_(y),o=g({id:i,pairingTopic:e,expiry:n},t);await this.setProposal(i,o);const a=Y(JSON.stringify(s)),c=await this.getVerifyContext(a,o.proposer.metadata);this.client.events.emit("session_proposal",{id:i,params:o,verifyContext:c})}catch(n){await this.sendError(i,e,n),this.client.logger.error(n)}},this.onSessionProposeResponse=async(e,s)=>{const{id:t}=s;if(q(s)){const{result:i}=s;this.client.logger.trace({type:"method",method:"onSessionProposeResponse",result:i});const n=this.client.proposal.get(t);this.client.logger.trace({type:"method",method:"onSessionProposeResponse",proposal:n});const o=n.proposer.publicKey;this.client.logger.trace({type:"method",method:"onSessionProposeResponse",selfPublicKey:o});const a=i.responderPublicKey;this.client.logger.trace({type:"method",method:"onSessionProposeResponse",peerPublicKey:a});const c=await this.client.core.crypto.generateSharedKey(o,a);this.client.logger.trace({type:"method",method:"onSessionProposeResponse",sessionTopic:c});const p=await this.client.core.relayer.subscribe(c);this.client.logger.trace({type:"method",method:"onSessionProposeResponse",subscriptionId:p}),await this.client.core.pairing.activate({topic:e})}else f(s)&&(await this.client.proposal.delete(t,N("USER_DISCONNECTED")),this.events.emit(u("session_connect"),{error:s.error}))},this.onSessionSettleRequest=async(e,s)=>{const{id:t,params:i}=s;try{this.isValidSessionSettleRequest(i);const{relay:n,controller:o,expiry:a,namespaces:c,requiredNamespaces:p,optionalNamespaces:d,sessionProperties:h,pairingTopic:R}=s.params,w=g({topic:e,relay:n,expiry:a,namespaces:c,acknowledged:!0,pairingTopic:R,requiredNamespaces:p,optionalNamespaces:d,controller:o.publicKey,self:{publicKey:"",metadata:this.client.metadata},peer:{publicKey:o.publicKey,metadata:o.metadata}},h&&{sessionProperties:h});await this.sendResult({id:s.id,topic:e,result:!0}),this.events.emit(u("session_connect"),{session:w}),this.cleanupDuplicatePairings(w)}catch(n){await this.sendError(t,e,n),this.client.logger.error(n)}},this.onSessionSettleResponse=async(e,s)=>{const{id:t}=s;q(s)?(await this.client.session.update(e,{acknowledged:!0}),this.events.emit(u("session_approve",t),{})):f(s)&&(await this.client.session.delete(e,N("USER_DISCONNECTED")),this.events.emit(u("session_approve",t),{error:s.error}))},this.onSessionUpdateRequest=async(e,s)=>{const{params:t,id:i}=s;try{const n=`${e}_session_update`,o=$.get(n);if(o&&this.isRequestOutOfSync(o,i)){this.client.logger.info(`Discarding out of sync request - ${i}`);return}this.isValidUpdate(g({topic:e},t)),await this.client.session.update(e,{namespaces:t.namespaces}),await this.sendResult({id:i,topic:e,result:!0}),this.client.events.emit("session_update",{id:i,topic:e,params:t}),$.set(n,i)}catch(n){await this.sendError(i,e,n),this.client.logger.error(n)}},this.isRequestOutOfSync=(e,s)=>parseInt(s.toString().slice(0,-3))<=parseInt(e.toString().slice(0,-3)),this.onSessionUpdateResponse=(e,s)=>{const{id:t}=s;q(s)?this.events.emit(u("session_update",t),{}):f(s)&&this.events.emit(u("session_update",t),{error:s.error})},this.onSessionExtendRequest=async(e,s)=>{const{id:t}=s;try{this.isValidExtend({topic:e}),await this.setExpiry(e,_(A)),await this.sendResult({id:t,topic:e,result:!0}),this.client.events.emit("session_extend",{id:t,topic:e})}catch(i){await this.sendError(t,e,i),this.client.logger.error(i)}},this.onSessionExtendResponse=(e,s)=>{const{id:t}=s;q(s)?this.events.emit(u("session_extend",t),{}):f(s)&&this.events.emit(u("session_extend",t),{error:s.error})},this.onSessionPingRequest=async(e,s)=>{const{id:t}=s;try{this.isValidPing({topic:e}),await this.sendResult({id:t,topic:e,result:!0}),this.client.events.emit("session_ping",{id:t,topic:e})}catch(i){await this.sendError(t,e,i),this.client.logger.error(i)}},this.onSessionPingResponse=(e,s)=>{const{id:t}=s;setTimeout(()=>{q(s)?this.events.emit(u("session_ping",t),{}):f(s)&&this.events.emit(u("session_ping",t),{error:s.error})},500)},this.onSessionDeleteRequest=async(e,s)=>{const{id:t}=s;try{this.isValidDisconnect({topic:e,reason:s.params}),await Promise.all([new Promise(i=>{this.client.core.relayer.once(Z.publish,async()=>{i(await this.deleteSession(e))})}),this.sendResult({id:t,topic:e,result:!0})]),this.client.events.emit("session_delete",{id:t,topic:e})}catch(i){this.client.logger.error(i)}},this.onSessionRequest=async(e,s)=>{const{id:t,params:i}=s;try{this.isValidRequest(g({topic:e},i));const n=Y(JSON.stringify(J("wc_sessionRequest",i,t))),o=this.client.session.get(e),a=await this.getVerifyContext(n,o.peer.metadata),c={id:t,topic:e,params:i,verifyContext:a};await this.setPendingSessionRequest(c),this.addSessionRequestToSessionRequestQueue(c),this.processSessionRequestQueue()}catch(n){await this.sendError(t,e,n),this.client.logger.error(n)}},this.onSessionRequestResponse=(e,s)=>{const{id:t}=s;q(s)?this.events.emit(u("session_request",t),{result:s.result}):f(s)&&this.events.emit(u("session_request",t),{error:s.error})},this.onSessionEventRequest=async(e,s)=>{const{id:t,params:i}=s;try{const n=`${e}_session_event_${i.event.name}`,o=$.get(n);if(o&&this.isRequestOutOfSync(o,t)){this.client.logger.info(`Discarding out of sync request - ${t}`);return}this.isValidEmit(g({topic:e},i)),this.client.events.emit("session_event",{id:t,topic:e,params:i}),$.set(n,t)}catch(n){await this.sendError(t,e,n),this.client.logger.error(n)}},this.addSessionRequestToSessionRequestQueue=e=>{this.sessionRequestQueue.queue.push(e)},this.cleanupAfterResponse=e=>{this.deletePendingSessionRequest(e.response.id,{message:"fulfilled",code:0}),setTimeout(()=>{this.sessionRequestQueue.state=I.idle,this.processSessionRequestQueue()},re(this.requestQueueDelay))},this.processSessionRequestQueue=()=>{if(this.sessionRequestQueue.state===I.active){this.client.logger.info("session request queue is already active.");return}const e=this.sessionRequestQueue.queue[0];if(!e){this.client.logger.info("session request queue is empty.");return}try{this.sessionRequestQueue.state=I.active,this.client.events.emit("session_request",e)}catch(s){this.client.logger.error(s)}},this.onPairingCreated=e=>{if(e.active)return;const s=this.client.proposal.getAll().find(t=>t.pairingTopic===e.topic);s&&this.onSessionProposeRequest(e.topic,J("wc_sessionPropose",{requiredNamespaces:s.requiredNamespaces,optionalNamespaces:s.optionalNamespaces,relays:s.relays,proposer:s.proposer,sessionProperties:s.sessionProperties},s.id))},this.isValidConnect=async e=>{if(!E(e)){const{message:a}=l("MISSING_OR_INVALID",`connect() params: ${JSON.stringify(e)}`);throw new Error(a)}const{pairingTopic:s,requiredNamespaces:t,optionalNamespaces:i,sessionProperties:n,relays:o}=e;if(D(s)||await this.isValidPairingTopic(s),!xe(o,!0)){const{message:a}=l("MISSING_OR_INVALID",`connect() relays: ${o}`);throw new Error(a)}!D(t)&&z(t)!==0&&this.validateNamespaces(t,"requiredNamespaces"),!D(i)&&z(i)!==0&&this.validateNamespaces(i,"optionalNamespaces"),D(n)||this.validateSessionProps(n,"sessionProperties")},this.validateNamespaces=(e,s)=>{const t=De(e,"connect()",s);if(t)throw new Error(t.message)},this.isValidApprove=async e=>{if(!E(e))throw new Error(l("MISSING_OR_INVALID",`approve() params: ${e}`).message);const{id:s,namespaces:t,relayProtocol:i,sessionProperties:n}=e;await this.isValidProposalId(s);const o=this.client.proposal.get(s),a=j(t,"approve()");if(a)throw new Error(a.message);const c=ee(o.requiredNamespaces,t,"approve()");if(c)throw new Error(c.message);if(!C(i,!0)){const{message:p}=l("MISSING_OR_INVALID",`approve() relayProtocol: ${i}`);throw new Error(p)}D(n)||this.validateSessionProps(n,"sessionProperties")},this.isValidReject=async e=>{if(!E(e)){const{message:i}=l("MISSING_OR_INVALID",`reject() params: ${e}`);throw new Error(i)}const{id:s,reason:t}=e;if(await this.isValidProposalId(s),!Ce(t)){const{message:i}=l("MISSING_OR_INVALID",`reject() reason: ${JSON.stringify(t)}`);throw new Error(i)}},this.isValidSessionSettleRequest=e=>{if(!E(e)){const{message:c}=l("MISSING_OR_INVALID",`onSessionSettleRequest() params: ${e}`);throw new Error(c)}const{relay:s,controller:t,namespaces:i,expiry:n}=e;if(!Ae(s)){const{message:c}=l("MISSING_OR_INVALID","onSessionSettleRequest() relay protocol should be a string");throw new Error(c)}const o=be(t,"onSessionSettleRequest()");if(o)throw new Error(o.message);const a=j(i,"onSessionSettleRequest()");if(a)throw new Error(a.message);if(P(n)){const{message:c}=l("EXPIRED","onSessionSettleRequest()");throw new Error(c)}},this.isValidUpdate=async e=>{if(!E(e)){const{message:a}=l("MISSING_OR_INVALID",`update() params: ${e}`);throw new Error(a)}const{topic:s,namespaces:t}=e;await this.isValidSessionTopic(s);const i=this.client.session.get(s),n=j(t,"update()");if(n)throw new Error(n.message);const o=ee(i.requiredNamespaces,t,"update()");if(o)throw new Error(o.message)},this.isValidExtend=async e=>{if(!E(e)){const{message:t}=l("MISSING_OR_INVALID",`extend() params: ${e}`);throw new Error(t)}const{topic:s}=e;await this.isValidSessionTopic(s)},this.isValidRequest=async e=>{if(!E(e)){const{message:a}=l("MISSING_OR_INVALID",`request() params: ${e}`);throw new Error(a)}const{topic:s,request:t,chainId:i,expiry:n}=e;await this.isValidSessionTopic(s);const{namespaces:o}=this.client.session.get(s);if(!se(o,i)){const{message:a}=l("MISSING_OR_INVALID",`request() chainId: ${i}`);throw new Error(a)}if(!Le(t)){const{message:a}=l("MISSING_OR_INVALID",`request() ${JSON.stringify(t)}`);throw new Error(a)}if(!$e(o,i,t.method)){const{message:a}=l("MISSING_OR_INVALID",`request() method: ${t.method}`);throw new Error(a)}if(n&&!Ge(n,U)){const{message:a}=l("MISSING_OR_INVALID",`request() expiry: ${n}. Expiry must be a number (in seconds) between ${U.min} and ${U.max}`);throw new Error(a)}},this.isValidRespond=async e=>{if(!E(e)){const{message:i}=l("MISSING_OR_INVALID",`respond() params: ${e}`);throw new Error(i)}const{topic:s,response:t}=e;if(await this.isValidSessionTopic(s),!Me(t)){const{message:i}=l("MISSING_OR_INVALID",`respond() response: ${JSON.stringify(t)}`);throw new Error(i)}},this.isValidPing=async e=>{if(!E(e)){const{message:t}=l("MISSING_OR_INVALID",`ping() params: ${e}`);throw new Error(t)}const{topic:s}=e;await this.isValidSessionOrPairingTopic(s)},this.isValidEmit=async e=>{if(!E(e)){const{message:o}=l("MISSING_OR_INVALID",`emit() params: ${e}`);throw new Error(o)}const{topic:s,event:t,chainId:i}=e;await this.isValidSessionTopic(s);const{namespaces:n}=this.client.session.get(s);if(!se(n,i)){const{message:o}=l("MISSING_OR_INVALID",`emit() chainId: ${i}`);throw new Error(o)}if(!Ue(t)){const{message:o}=l("MISSING_OR_INVALID",`emit() event: ${JSON.stringify(t)}`);throw new Error(o)}if(!Qe(n,i,t.name)){const{message:o}=l("MISSING_OR_INVALID",`emit() event: ${JSON.stringify(t)}`);throw new Error(o)}},this.isValidDisconnect=async e=>{if(!E(e)){const{message:t}=l("MISSING_OR_INVALID",`disconnect() params: ${e}`);throw new Error(t)}const{topic:s}=e;await this.isValidSessionOrPairingTopic(s)},this.getVerifyContext=async(e,s)=>{const t={verified:{verifyUrl:s.verifyUrl||me,validation:"UNKNOWN",origin:s.url||""}};try{const i=await this.client.core.verify.resolve({attestationId:e,verifyUrl:s.verifyUrl});i&&(t.verified.origin=i.origin,t.verified.isScam=i.isScam,t.verified.validation=i.origin===new URL(s.url).origin?"VALID":"INVALID")}catch(i){this.client.logger.info(i)}return this.client.logger.info(`Verify context: ${JSON.stringify(t)}`),t},this.validateSessionProps=(e,s)=>{Object.values(e).forEach(t=>{if(!C(t,!1)){const{message:i}=l("MISSING_OR_INVALID",`${s} must be in Record<string, string> format. Received: ${JSON.stringify(t)}`);throw new Error(i)}})}}async isInitialized(){if(!this.initialized){const{message:r}=l("NOT_INITIALIZED",this.name);throw new Error(r)}await this.client.core.relayer.confirmOnlineStateOrThrow()}registerRelayerEvents(){this.client.core.relayer.on(Z.message,async r=>{const{topic:e,message:s}=r;if(this.ignoredPayloadTypes.includes(this.client.core.crypto.getPayloadType(s)))return;const t=await this.client.core.crypto.decode(e,s);try{Be(t)?(this.client.core.history.set(e,t),this.onRelayEventRequest({topic:e,payload:t})):Ze(t)?(await this.client.core.history.resolve(t),await this.onRelayEventResponse({topic:e,payload:t}),this.client.core.history.delete(e,t.id)):this.onRelayEventUnknownPayload({topic:e,payload:t})}catch(i){this.client.logger.error(i)}})}registerExpirerEvents(){this.client.core.expirer.on(we.expired,async r=>{const{topic:e,id:s}=Ke(r.target);if(s&&this.client.pendingRequest.keys.includes(s))return await this.deletePendingSessionRequest(s,l("EXPIRED"),!0);e?this.client.session.keys.includes(e)&&(await this.deleteSession(e,!0),this.client.events.emit("session_expire",{topic:e})):s&&(await this.deleteProposal(s,!0),this.client.events.emit("proposal_expire",{id:s}))})}registerPairingEvents(){this.client.core.pairing.events.on(ye.create,r=>this.onPairingCreated(r))}isValidPairingTopic(r){if(!C(r,!1)){const{message:e}=l("MISSING_OR_INVALID",`pairing topic should be a string: ${r}`);throw new Error(e)}if(!this.client.core.pairing.pairings.keys.includes(r)){const{message:e}=l("NO_MATCHING_KEY",`pairing topic doesn't exist: ${r}`);throw new Error(e)}if(P(this.client.core.pairing.pairings.get(r).expiry)){const{message:e}=l("EXPIRED",`pairing topic: ${r}`);throw new Error(e)}}async isValidSessionTopic(r){if(!C(r,!1)){const{message:e}=l("MISSING_OR_INVALID",`session topic should be a string: ${r}`);throw new Error(e)}if(!this.client.session.keys.includes(r)){const{message:e}=l("NO_MATCHING_KEY",`session topic doesn't exist: ${r}`);throw new Error(e)}if(P(this.client.session.get(r).expiry)){await this.deleteSession(r);const{message:e}=l("EXPIRED",`session topic: ${r}`);throw new Error(e)}}async isValidSessionOrPairingTopic(r){if(this.client.session.keys.includes(r))await this.isValidSessionTopic(r);else if(this.client.core.pairing.pairings.keys.includes(r))this.isValidPairingTopic(r);else if(C(r,!1)){const{message:e}=l("NO_MATCHING_KEY",`session or pairing topic doesn't exist: ${r}`);throw new Error(e)}else{const{message:e}=l("MISSING_OR_INVALID",`session or pairing topic should be a string: ${r}`);throw new Error(e)}}async isValidProposalId(r){if(!ke(r)){const{message:e}=l("MISSING_OR_INVALID",`proposal id should be a number: ${r}`);throw new Error(e)}if(!this.client.proposal.keys.includes(r)){const{message:e}=l("NO_MATCHING_KEY",`proposal id doesn't exist: ${r}`);throw new Error(e)}if(P(this.client.proposal.get(r).expiry)){await this.deleteProposal(r);const{message:e}=l("EXPIRED",`proposal id: ${r}`);throw new Error(e)}}}class ds extends k{constructor(r,e){super(r,e,ne,G),this.core=r,this.logger=e}}class us extends k{constructor(r,e){super(r,e,ae,G),this.core=r,this.logger=e}}class gs extends k{constructor(r,e){super(r,e,le,G,s=>s.id),this.core=r,this.logger=e}}class Q extends qe{constructor(r){super(r),this.protocol=X,this.version=F,this.name=M.name,this.events=new je,this.on=(s,t)=>this.events.on(s,t),this.once=(s,t)=>this.events.once(s,t),this.off=(s,t)=>this.events.off(s,t),this.removeListener=(s,t)=>this.events.removeListener(s,t),this.removeAllListeners=s=>this.events.removeAllListeners(s),this.connect=async s=>{try{return await this.engine.connect(s)}catch(t){throw this.logger.error(t.message),t}},this.pair=async s=>{try{return await this.engine.pair(s)}catch(t){throw this.logger.error(t.message),t}},this.approve=async s=>{try{return await this.engine.approve(s)}catch(t){throw this.logger.error(t.message),t}},this.reject=async s=>{try{return await this.engine.reject(s)}catch(t){throw this.logger.error(t.message),t}},this.update=async s=>{try{return await this.engine.update(s)}catch(t){throw this.logger.error(t.message),t}},this.extend=async s=>{try{return await this.engine.extend(s)}catch(t){throw this.logger.error(t.message),t}},this.request=async s=>{try{return await this.engine.request(s)}catch(t){throw this.logger.error(t.message),t}},this.respond=async s=>{try{return await this.engine.respond(s)}catch(t){throw this.logger.error(t.message),t}},this.ping=async s=>{try{return await this.engine.ping(s)}catch(t){throw this.logger.error(t.message),t}},this.emit=async s=>{try{return await this.engine.emit(s)}catch(t){throw this.logger.error(t.message),t}},this.disconnect=async s=>{try{return await this.engine.disconnect(s)}catch(t){throw this.logger.error(t.message),t}},this.find=s=>{try{return this.engine.find(s)}catch(t){throw this.logger.error(t.message),t}},this.getPendingSessionRequests=()=>{try{return this.engine.getPendingSessionRequests()}catch(s){throw this.logger.error(s.message),s}},this.name=r?.name||M.name,this.metadata=r?.metadata||ze();const e=typeof r?.logger<"u"&&typeof r?.logger!="string"?r.logger:Ee(Re({level:r?.logger||M.logger}));this.core=r?.core||new Se(r),this.logger=Ie(e,this.name),this.session=new us(this.core,this.logger),this.proposal=new ds(this.core,this.logger),this.pendingRequest=new gs(this.core,this.logger),this.engine=new hs(this)}static async init(r){const e=new Q(r);return await e.initialize(),e}get context(){return _e(this.logger)}get pairing(){return this.core.pairing.pairings}async initialize(){this.logger.trace("Initialized");try{await this.core.start(),await this.session.init(),await this.proposal.init(),await this.pendingRequest.init(),await this.engine.init(),this.core.verify.init({verifyUrl:this.metadata.verifyUrl}),this.logger.info("SignClient Initialization Success")}catch(r){throw this.logger.info("SignClient Initialization Failure"),this.logger.error(r.message),r}}}const ms=Q;export{ce as ENGINE_CONTEXT,I as ENGINE_QUEUE_STATES,V as ENGINE_RPC_OPTS,is as HISTORY_CONTEXT,ts as HISTORY_EVENTS,rs as HISTORY_STORAGE_VERSION,pe as METHODS_TO_VERIFY,ne as PROPOSAL_CONTEXT,ns as PROPOSAL_EXPIRY,oe as PROPOSAL_EXPIRY_MESSAGE,le as REQUEST_CONTEXT,ae as SESSION_CONTEXT,A as SESSION_EXPIRY,U as SESSION_REQUEST_EXPIRY_BOUNDARIES,H as SIGN_CLIENT_CONTEXT,M as SIGN_CLIENT_DEFAULT,es as SIGN_CLIENT_EVENTS,X as SIGN_CLIENT_PROTOCOL,ss as SIGN_CLIENT_STORAGE_OPTIONS,G as SIGN_CLIENT_STORAGE_PREFIX,F as SIGN_CLIENT_VERSION,ms as SignClient,W as WALLETCONNECT_DEEPLINK_CHOICE,Q as default};
//# sourceMappingURL=index.es.js.map
