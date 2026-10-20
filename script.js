function registerCleanup(e){"function"==typeof e&&pageCleanups.push(e)}function runPageCleanups(){for(;pageCleanups.length;){const e=pageCleanups.pop();try{e()}catch(e){}}}function initGlobalOnce(){initLenis(),globalInitDone||(globalInitDone=!0,initTwostepScalingNavigation(),initScrambleOnHover(document),initIrisFollow(),initCopyEmail(),initTabTitleSwap(),initLogoRevealLoader())}function initPage(e){nextPage=e||document,initScrambleOnLoad(nextPage),initScrambleOnScroll(nextPage),initScrambleOnHover(nextPage),addMagneticEffect(nextPage),initDraggableStickers(nextPage),initHighlightMarkerTextReveal(nextPage),initFooterParallax(nextPage),initRectangleReveal(nextPage),initMwg026Effect(nextPage),initMwg082Effect(nextPage),initMouseTrailEffect(nextPage),initCSSMarquee(nextPage),initPixelReveal(nextPage),initAboutScroll(nextPage),initMaskTextScrollReveal(nextPage),initTeamCarousel(nextPage),initPixelatedImageReveal(nextPage),initFooterDeformation(nextPage),initPixelatedScrollTransition(nextPage),initEventGalleryCarousel(nextPage),initTitleReveal(nextPage),initPreviewFollower(nextPage),initPssstCarousel(nextPage)}function cleanupPage(){hasScrollTrigger&&ScrollTrigger.getAll().forEach((e=>e.kill())),runPageCleanups()}function initLenis(){!lenis&&hasLenis&&(lenis=new Lenis({lerp:.05,wheelMultiplier:1}),hasScrollTrigger&&lenis.on("scroll",ScrollTrigger.update),gsap.ticker.add((e=>lenis.raf(1e3*e))),gsap.ticker.lagSmoothing(0))}function resetPage(e){window.scrollTo(0,0),e&&gsap.set(e,{clearProps:"position,top,left,right"}),hasLenis&&lenis&&(lenis.resize(),lenis.start())}function resetWebflow(e){try{if(!e||!e.next||!e.next.html)return;const t=(new DOMParser).parseFromString(e.next.html,"text/html"),a=t.querySelector("html")?.getAttribute("data-wf-page");if(a&&document.documentElement.setAttribute("data-wf-page",a),window.Webflow){window.Webflow.destroy(),window.Webflow.ready();const e=window.Webflow.require&&window.Webflow.require("ix2");e&&e.init&&e.init()}}catch(e){}}function initBarbaNavUpdate(e){if(!e||!e.next||!e.next.html)return;const t=document.createElement("template");t.innerHTML=e.next.html.trim();const a=t.content.querySelectorAll("[data-barba-update]");document.querySelectorAll("nav [data-barba-update]").forEach(((e,t)=>{const r=a[t];if(!r)return;const n=r.getAttribute("aria-current");null!==n?e.setAttribute("aria-current",n):e.removeAttribute("aria-current"),e.setAttribute("class",r.getAttribute("class")||"")}))}function applyThemeFrom(e){const t=e?.dataset?.pageTheme||"light",a=themeConfig[t]||themeConfig.light;document.body.dataset.pageTheme=t;const r=document.querySelector("[data-theme-transition]");r&&(r.dataset.themeTransition=a.transition);const n=document.querySelector("[data-theme-nav]");n&&(n.dataset.themeNav=a.nav)}function runPageOnceAnimation(e){const t=gsap.timeline();return t.call((()=>{resetPage(e)}),null,0),t}function runPageLeaveAnimation(e,t,a){const r=gsap.timeline();if(reducedMotion)return r.set(e,{autoAlpha:0}),r.call((()=>{cleanupPage(),e.remove(),resetWebflow(a)}),null,0),r;pixelGrid(window.innerHeight>window.innerWidth);const n=document.querySelector("[data-transition-wrap]").querySelector("[data-transition-panel]"),o=Array.from(n.querySelectorAll("[data-transition-col]")),i=n.querySelectorAll("[data-transition-pixel]"),l=.5*transitionDuration,s=.5*transitionDuration,c=Math.max(1,o.length),d=Math.min(pixelFadeDuration,.6*l),u=(l-d)/c,p=(s-d)/c,g=e=>({each:d/Math.max(1,e)*.6,from:"random"});return gsap.set(n,{opacity:1,willChange:"opacity"}),gsap.set(i,{opacity:0,willChange:"opacity"}),gsap.set(t,{autoAlpha:0,position:"fixed",top:0,left:0,right:0,maxHeight:"100dvh"}),o.forEach(((e,t)=>{const a=e.querySelectorAll("[data-transition-pixel]");a.length&&r.to(a,{opacity:1,duration:d,ease:"power1.in",stagger:g(a.length)},t*u)})),r.add("covered",l),r.set(i,{opacity:1},"covered"),r.set(t,{autoAlpha:1},"covered"),r.call((()=>{cleanupPage(),e.remove(),resetWebflow(a)}),null,"covered"),o.forEach(((e,t)=>{const a=e.querySelectorAll("[data-transition-pixel]");a.length&&r.to(a,{opacity:0,duration:d,ease:"power1.out",stagger:g(a.length)},"covered+="+t*p)})),r.set(t,{clearProps:"position,top,left,right,maxHeight,visibility,opacity,willChange"}),r.set(i,{clearProps:"willChange"}),r.set(n,{clearProps:"willChange"}),r}function runPageEnterAnimation(e){const t=gsap.timeline(),a=transitionDuration/Math.max(1,pixelHorizontalAmount);return reducedMotion?(t.set(e,{autoAlpha:1}),t.add("pageReady"),t.call(resetPage,[e],"pageReady"),new Promise((e=>t.call(e,null,"pageReady")))):(t.add("pageReady",transitionDuration+a),t.call(resetPage,[e],"pageReady"),new Promise((e=>t.call(e,null,"pageReady"))))}function pixelGrid(e){const t=document.querySelector("[data-transition-panel]");if(!t)return;const a=t.getBoundingClientRect();t.style.flexDirection=e?"column":"row";const r=e?a.height/pixelHorizontalAmount:a.width/pixelHorizontalAmount,n=Math.ceil((e?a.width:a.height)/r);let o=t.querySelectorAll("[data-transition-col]");const i=o[0],l=i.querySelector("[data-transition-pixel]");if(o.length!==pixelHorizontalAmount){const e=document.createDocumentFragment();for(let t=0;t<pixelHorizontalAmount;t++)e.appendChild(i.cloneNode(!1));t.replaceChildren(e),o=t.querySelectorAll("[data-transition-col]")}o.forEach((t=>{t.style.flexDirection=e?"row":"column",t.style.flex="1 1 auto",t.style.justifyContent="center";const a=n-t.childElementCount;if(a>0){const e=document.createDocumentFragment();for(let t=0;t<a;t++)e.appendChild(l.cloneNode(!0));t.appendChild(e)}else if(a<0)for(let e=a;e<0;e++)t.lastElementChild.remove()}))}function initTwostepScalingNavigation(){const e=document.querySelector("[data-twostep-nav]"),t=document.querySelector("[data-nav-status]");if(!e||!t)return;if(e.__navInit)return;e.__navInit=!0;const a=e=>t.setAttribute("data-nav-status",e),r=()=>"active"===t.getAttribute("data-nav-status"),n=()=>a("active"),o=()=>a("not-active"),i=()=>r()?o():n();document.querySelectorAll('[data-nav-toggle="toggle"]').forEach((e=>e.addEventListener("click",i))),document.querySelectorAll('[data-nav-toggle="close"]').forEach((e=>e.addEventListener("click",o))),document.addEventListener("keydown",(e=>{"Escape"===e.key&&r()&&o()}))}function initIrisFollow(){window.addEventListener("mousemove",(e=>{document.querySelectorAll('[data-move="iris"]').forEach((t=>{const a=30,r=e.clientX/window.innerWidth-.5,n=e.clientY/window.innerHeight-.5;t.style.transform=`translate(${r*a}px, ${n*a}px)`}))}))}function initCopyEmail(){let e=null,t=null;const a=()=>(e||(e=document.createElement("div"),e.className="copy-snackbar",document.body.appendChild(e)),e),r=e=>{const r=a();r.textContent=e,r.offsetWidth,r.classList.add("is-visible"),clearTimeout(t),t=setTimeout((()=>r.classList.remove("is-visible")),2200)},n=e=>navigator.clipboard&&window.isSecureContext?navigator.clipboard.writeText(e):new Promise(((t,a)=>{const r=document.createElement("textarea");r.value=e,r.style.position="fixed",r.style.opacity="0",document.body.appendChild(r),r.select();try{document.execCommand("copy"),document.body.removeChild(r),t()}catch(e){document.body.removeChild(r),a(e)}}));document.addEventListener("click",(e=>{const t=e.target.closest("[data-copy-email]");if(!t)return;e.preventDefault();const a=t.getAttribute("data-copy-email")||t.textContent.trim();n(a).then((()=>r("Email address copied"))).catch((()=>r("Could not copy")))}))}function initTabTitleSwap(){const e=document.title,t="✦ The Auction Society";window.addEventListener("focus",(()=>{document.title=e})),window.addEventListener("blur",(()=>{document.title=t}))}function initLogoRevealLoader(){if(!window.CustomEase)return;CustomEase.create("loader","0.65, 0.01, 0.05, 0.99");const e=document.querySelector("[data-load-wrap]");if(!e)return;gsap.set(e,{display:"block"});const t=()=>{const t=e.querySelector("[data-load-container]"),a=e.querySelector("[data-load-bg]"),r=e.querySelector("[data-load-progress]"),n=e.querySelector("[data-load-logo]"),o=Array.from(e.querySelectorAll("[data-load-text]")),i=Array.from(e.querySelectorAll("[data-load-reset]:not([data-load-text])"));let l=null,s=null;o.length>=2&&(gsap.set(o,{autoAlpha:1}),l=new SplitText(o[0],{type:"lines,chars",mask:"lines"}),s=new SplitText(o[1],{type:"lines,chars",mask:"lines"}),gsap.set([l.chars,s.chars],{autoAlpha:0,yPercent:125}));const c=gsap.timeline({defaults:{ease:"loader",duration:3}}).set(e,{display:"block"}).to(r,{scaleX:1}).to(n,{clipPath:"inset(0% 0% 0% 0%)"},"<").to(t,{autoAlpha:0,duration:.5}).to(r,{scaleX:0,transformOrigin:"right center",duration:.5},"<").add("hideContent","<").to(a,{yPercent:-101,duration:1},"hideContent").set(e,{display:"none"});i.length&&c.set(i,{autoAlpha:1},0),l&&s&&(c.to(l.chars,{autoAlpha:1,yPercent:0,duration:.6,stagger:{each:.02}},0),c.to(l.chars,{autoAlpha:0,yPercent:-125,duration:.4,stagger:{each:.02}},">+=0.4"),c.to(s.chars,{autoAlpha:1,yPercent:0,duration:.6,stagger:{each:.02}},"<"),c.to(s.chars,{autoAlpha:0,yPercent:-125,duration:.4,stagger:{each:.02}},"hideContent-=0.5"))};document.fonts&&document.fonts.ready?document.fonts.ready.then(t):t()}function initScrambleOnLoad(e){e.querySelectorAll('[data-scramble="load"]').forEach((e=>{const t=new SplitText(e,{type:"words, chars",wordsClass:"word",charsClass:"char"});gsap.to(t.words,{duration:1.2,stagger:.01,scrambleText:{text:"{original}",chars:"upperCase",speed:.85},onComplete:()=>t.revert()})}))}function initScrambleOnScroll(e){e.querySelectorAll('[data-scramble="scroll"]').forEach((e=>{const t=e.hasAttribute("data-scramble-alt"),a=new SplitText(e,{type:"words, chars",wordsClass:"word",charsClass:"char"});gsap.to(a.words,{duration:1.4,stagger:.015,scrambleText:{text:"{original}",chars:t?"\u25af|":"upperCase",speed:.95},scrollTrigger:{trigger:e,start:"top bottom",once:!0},onComplete:()=>a.revert()})}))}function initScrambleOnHover(e){e.querySelectorAll('[data-scramble-hover="link"]').forEach((e=>{if(e.__scrambleInit)return;e.__scrambleInit=!0;const t=e.querySelector('[data-scramble-hover="target"]');if(!t)return;const a=t.textContent,r=t.getAttribute("data-scramble-text");new SplitText(t,{type:"words, chars",wordsClass:"word",charsClass:"char"}),e.addEventListener("mouseenter",(()=>{gsap.to(t,{duration:1.2,scrambleText:{text:r||a,chars:"ABCDEFGHIJKLMNOPQRSTUVWXYZ&@#"}})})),e.addEventListener("mouseleave",(()=>{gsap.to(t,{duration:1,scrambleText:{text:a,speed:1,chars:"ABCDEFGHIJKLMNOPQRSTUVWXYZ&@#"}})}))}))}function addMagneticEffect(e){if(!window.gsap||!window.Draggable)return;const t=e.querySelectorAll('[data-sticker="item"]');if(!t.length)return;const a=5,r=1,n=.9,o=.22,i=.28,l="power3.out",s=e=>Math.sign(e)*Math.pow(Math.abs(e),n),c=e=>Math.round(e/r)*r;t.forEach((e=>{e.__magneticInit||(e.__magneticInit=!0,gsap.set(e,{xPercent:0,yPercent:0}),e.addEventListener("mousemove",(t=>{const r=Draggable.get(e);if(r&&r.isDragging)return;const n=e.getBoundingClientRect(),i=n.left+n.width/2,d=n.top+n.height/2,u=(t.clientX-i)/(n.width/2),p=(t.clientY-d)/(n.height/2),g=c(s(gsap.utils.clamp(-1,1,u))*a),m=c(s(gsap.utils.clamp(-1,1,p))*a);gsap.to(e,{xPercent:g/n.width*100,yPercent:m/n.height*100,duration:o,ease:l,overwrite:"auto"})})),e.addEventListener("mouseleave",(()=>{gsap.to(e,{xPercent:0,yPercent:0,duration:i,ease:l,overwrite:"auto"})})))}))}function initDraggableStickers(e){const t=e.querySelector('[data-sticker="wrap"]')||document.querySelector('[data-sticker="wrap"]'),a=e.querySelectorAll('[data-sticker="item"]');if(!a.length)return;const r=[];let n=100;a.forEach((e=>{if(e.__dragInit)return;e.__dragInit=!0;let a=0,o=0,i=!1;const l=8,s=Draggable.create(e,{bounds:t||void 0,dragResistance:.1,minimumMovement:l,allowEventDefault:!0,zIndexBoost:!1,onPress(e){i=!1;const t=e.touches?e.touches[0]:e;a=t.clientX,o=t.clientY},onDragStart(){i=!0,this.target.style.zIndex=n<990?++n:990,gsap.to(this.target,{scale:1.05,rotation:gsap.utils.random(-1,1),filter:"drop-shadow(0px 12px 24px rgba(0,0,0,0.12))",duration:.25})},onDrag(){const e=gsap.utils.clamp(-14,14,.08*this.deltaX);gsap.to(this.target,{rotation:e,duration:.2,ease:"power3.out",overwrite:!0})},onRelease(e){if(gsap.to(this.target,{scale:1,rotation:0,ease:"power3.out",filter:"drop-shadow(0px 0px 0px rgba(0,0,0,0))",duration:.25,overwrite:!0}),!i){const t=e.changedTouches?e.changedTouches[0]:e,r=t.clientX,n=t.clientY;if(Math.hypot(r-a,n-o)<l){const e=document.elementFromPoint(r,n);if(e&&e!==this.target){const t=e.closest("a, button, [data-clickable]");t&&setTimeout((()=>{t.click()}),10)}}}}});s&&s[0]&&r.push(s[0])})),registerCleanup((()=>r.forEach((e=>e.kill&&e.kill()))))}function initHighlightMarkerTextReveal(e){const t={direction:"right",theme:"blue",scrollStart:"top 95%",staggerStart:"start",stagger:100,barDuration:.9,barEase:"power3.inOut"},a={pink:"#350AFF",white:"#FFFFFF"},r={right:{prop:"scaleX",origin:"right center"},left:{prop:"scaleX",origin:"left center"},up:{prop:"scaleY",origin:"center top"},down:{prop:"scaleY",origin:"center bottom"}},n=e=>a[e]?a[e]:e.startsWith("--")&&getComputedStyle(document.body).getPropertyValue(e).trim()||e,o=(e,t)=>{const a=document.createElement("div");return a.className="highlight-marker-bar",Object.assign(a.style,{backgroundColor:e,transformOrigin:t}),a},i=e=>{e._highlightMarkerReveal&&(e._highlightMarkerReveal.timeline?.kill(),e._highlightMarkerReveal.scrollTrigger?.kill(),e._highlightMarkerReveal.split?.revert(),e.querySelectorAll(".highlight-marker-bar").forEach((e=>e.remove())),delete e._highlightMarkerReveal)};let l=!1;if(gsap.matchMedia().add({reduce:"(prefers-reduced-motion: reduce)"},(e=>{l=e.conditions.reduce})),l)return void e.querySelectorAll("[data-highlight-marker-reveal]").forEach((e=>gsap.set(e,{autoAlpha:1})));e.querySelectorAll("[data-highlight-marker-reveal]").forEach(i);const s=e.querySelectorAll("[data-highlight-marker-reveal]");s.length&&s.forEach((e=>{const a=e.getAttribute("data-marker-direction")||t.direction,i=e.getAttribute("data-marker-theme")||t.theme,l=e.getAttribute("data-marker-scroll-start")||t.scrollStart,s=e.getAttribute("data-marker-stagger-start")||t.staggerStart,c=(parseFloat(e.getAttribute("data-marker-stagger"))||t.stagger)/1e3,d=n(i),u=r[a]||r.right;e._highlightMarkerReveal={};const p=SplitText.create(e,{type:"lines",linesClass:"highlight-marker-line",autoSplit:!0,onSplit(a){const r=e._highlightMarkerReveal;r.timeline?.kill(),r.scrollTrigger?.kill(),e.querySelectorAll(".highlight-marker-bar").forEach((e=>e.remove()));const n=a.lines,i=gsap.timeline({paused:!0});n.forEach(((e,a)=>{gsap.set(e,{position:"relative",overflow:"hidden"});const r=o(d,u.origin);e.appendChild(r);const l="end"===s?n.length-1-a:a;i.to(r,{[u.prop]:0,duration:t.barDuration,ease:t.barEase},l*c)})),gsap.set(e,{autoAlpha:1});const p=ScrollTrigger.create({trigger:e,start:l,once:!0,onEnter:()=>i.play()});r.timeline=i,r.scrollTrigger=p}});e._highlightMarkerReveal.split=p}))}function initFooterParallax(e){e.querySelectorAll("[data-footer-parallax]").forEach((e=>{if(e.__parallaxInit)return;e.__parallaxInit=!0;const t=gsap.timeline({scrollTrigger:{trigger:e,start:"clamp(top bottom)",end:"clamp(top top)",scrub:!0,invalidateOnRefresh:!0}}),a=e.querySelector("[data-footer-parallax-inner]"),r=e.querySelector("[data-footer-parallax-dark]");a&&t.fromTo(a,{yPercent:-55},{yPercent:0,ease:"power1.in"}),r&&t.fromTo(r,{opacity:.3},{opacity:0,ease:"power1.in"},"<")}))}function initRectangleReveal(e){const t={duration:1,ease:"power2.inOut",color:"#350AFF",startScrub:"top 80%"};e.querySelectorAll('[data-effect="swipe-reveal"]').forEach((e=>{if(e.__swipeInit)return;e.__swipeInit=!0;const a=document.createElement("div");a.style.position="relative",a.style.display="inline-block",a.style.overflow="hidden",e.parentNode.insertBefore(a,e),a.appendChild(e);const r=document.createElement("div");Object.assign(r.style,{position:"absolute",top:"0",left:"0",width:"100%",height:"100%",backgroundColor:t.color,transform:"scaleX(0)",transformOrigin:"left",zIndex:"2"}),a.appendChild(r),gsap.set(e,{autoAlpha:0});gsap.timeline({scrollTrigger:{trigger:a,start:t.startScrub,toggleActions:"play none none reverse"}}).to(r,{duration:t.duration/2,scaleX:1,transformOrigin:"left",ease:t.ease}).set(e,{autoAlpha:1}).to(r,{duration:t.duration/2,scaleX:0,transformOrigin:"right",ease:t.ease})}))}
function initMwg026Effect(e){const t=e.querySelectorAll(".mwg026");t.length&&t.forEach((e=>{const t=e.querySelector(".mwg026-container");if(!t)return;const a=t.clientWidth/2,r=gsap.utils.wrap(-a,0),n=gsap.quickTo(t,"x",{duration:1.5,ease:"power4",modifiers:{x:gsap.utils.unitize(r)}}),o=t.clientHeight/2,i=gsap.utils.wrap(-o,0),l=gsap.quickTo(t,"y",{duration:1.5,ease:"power4",modifiers:{y:gsap.utils.unitize(i)}});let s=0,c=0;const d=Observer.create({target:window,type:"wheel,touch,pointer",onChangeX:e=>{"wheel"===e.event.type?s-=e.deltaX:s+=2*e.deltaX,n(s)},onChangeY:e=>{"wheel"===e.event.type?c-=e.deltaY:c+=2*e.deltaY,l(c)}});registerCleanup((()=>d.kill()))}))}function initMwg082Effect(e){const t=e.querySelectorAll(".mwg082");t.length&&t.forEach((e=>{if(e.__mwg082Init)return;e.__mwg082Init=!0;const t=e.querySelector(".mwg082-pin-height"),a=e.querySelector(".mwg082-container"),r=e.querySelectorAll(".mwg082-media");if(!t||!a||!r.length)return;const n=[];r.forEach((e=>{const t=gsap.timeline({paused:!0});t.fromTo(e,{scaleX:.9,scaleY:.9},{scaleX:1,scaleY:1,immediateRender:!1,ease:"elastic.out(2, 0.6)",duration:.5},"<"),n.push(t)}));const o=gsap.timeline({scrollTrigger:{trigger:t,start:"top top",end:"bottom bottom",scrub:!0,pin:a,invalidateOnRefresh:!0}});r.forEach(((e,t)=>{const a=gsap.timeline({onStart:()=>{n[t].play()},onReverseComplete:()=>{n[t].progress(-1).pause()}});a.set(e,{autoAlpha:1},.001);const r=40*(Math.random()-.5);a.to(e,{z:-window.innerWidth,rotation:r,duration:1,ease:"power1.inOut"}),a.to(e,{x:.01*r*window.innerWidth,y:-2*window.innerHeight,duration:.6,ease:"power1.in"},"<+=0.4"),o.add(a,.1*t)})),registerCleanup((()=>{o.scrollTrigger&&o.scrollTrigger.kill(),o.kill(),n.forEach((e=>e.kill()))}))}))}function initMouseTrailEffect(e){const t=e.querySelectorAll(".mwg020");t.length&&t.forEach((e=>{function t(t,r,n,o){const i=document.createElement("img");i.classList.add("created-img"),i.setAttribute("src",a[l]),e.appendChild(i);const s=gsap.timeline({onComplete:()=>{e.contains(i)&&e.removeChild(i)}});s.fromTo(i,{xPercent:80*(Math.random()-.5)-50,yPercent:10*(Math.random()-.5)-50,scaleX:1.3,scaleY:1.3},{scaleX:1,scaleY:1,ease:"elastic.out(2, 0.6)",duration:.6}),s.fromTo(i,{x:t,y:r,rotation:20*(Math.random()-.5)},{x:"+="+4*n,y:"+="+4*o,rotation:20*(Math.random()-.5),ease:"power4.out",duration:1.5},"<"),s.to(i,{duration:.3,scale:.5,delay:.1,ease:"back.in(1.5)"}),l=(l+1)%a.length}if(e.__mouseTrailInit)return;e.__mouseTrailInit=!0;const a=[];if(e.querySelectorAll(".mwg020-media").forEach((e=>a.push(e.getAttribute("src")))),!a.length)return;let r=0,n=0,o=0,i=window.innerWidth/8,l=0;const s=t=>{n=t.clientX,o=t.clientY,e.removeEventListener("mousemove",s)};e.addEventListener("mousemove",s);const c=a=>{const l=a.clientX,s=a.clientY;r+=Math.abs(l-n)+Math.abs(s-o),r>i&&(r=0,t(l,s-e.getBoundingClientRect().top,l-n,s-o)),n=l,o=s};e.addEventListener("mousemove",c)}))}function initCSSMarquee(e){const t=75,a=e.querySelectorAll("[data-css-marquee]");if(!a.length)return;a.forEach((e=>{e.__marqueeInit||(e.__marqueeInit=!0,e.querySelectorAll("[data-css-marquee-list]").forEach((t=>e.appendChild(t.cloneNode(!0)))))}));const r=new IntersectionObserver((e=>{e.forEach((e=>{e.target.querySelectorAll("[data-css-marquee-list]").forEach((t=>t.style.animationPlayState=e.isIntersecting?"running":"paused"))}))}),{threshold:0});a.forEach((e=>{e.querySelectorAll("[data-css-marquee-list]").forEach((e=>{e.style.animationDuration=e.offsetWidth/t+"s",e.style.animationPlayState="paused"})),r.observe(e)})),registerCleanup((()=>r.disconnect()))}function initPixelReveal(e){const t=20,a=.2,r=.04,n=.2;e.querySelectorAll("[data-pixel-reveal]").forEach((e=>{if(e.__pixelRevealInit)return;e.__pixelRevealInit=!0,"static"===window.getComputedStyle(e).position&&(e.style.position="relative");const o=e.getAttribute("data-pixel-color")||"#5a32fa";e.style.setProperty("--pixel-color",o);const i=document.createElement("div");i.className="pixel-reveal-wrap";const l=e.getBoundingClientRect(),s=Math.ceil(l.width/t),c=Math.ceil(l.height/t);i.style.gridTemplateColumns=`repeat(${s}, 1fr)`,i.style.gridTemplateRows=`repeat(${c}, 1fr)`;for(let e=0;e<s*c;e++){const e=document.createElement("div");e.className="pixel-box",i.appendChild(e)}e.appendChild(i);const d=i.querySelectorAll(".pixel-box");gsap.to(d,{scrollTrigger:{trigger:e,start:"top 80%",once:!0},opacity:0,duration:a,ease:"power1.inOut",stagger:e=>e%s*r+Math.random()*n})}))}function initAboutScroll(e){const t=e.querySelectorAll(".mwg005");if(!t.length)return;const a=()=>{t.forEach((e=>{if(e.__aboutInit)return;e.__aboutInit=!0;const t=e.querySelector(".mwg005-pin-height"),a=e.querySelector(".mwg005-container"),r=e.querySelector(".mwg005-paragraph");if(!t||!a||!r)return;const n=r.textContent;r.innerHTML=n.split(" ").map((e=>`<span class="word">${e}</span>`)).join(" ");const o=r.querySelectorAll(".word");gsap.to(o,{x:0,stagger:.02,ease:"power4.inOut",scrollTrigger:{trigger:t,start:"top top",end:"bottom bottom",scrub:!0,pin:a,pinSpacing:!1,invalidateOnRefresh:!0}})}))};document.fonts&&document.fonts.ready?document.fonts.ready.then(a):a()}function initMaskTextScrollReveal(e){e.querySelectorAll('[data-split="heading"]').forEach((e=>{const t=e.dataset.splitReveal||"lines",a="lines"===t?["lines"]:"words"===t?["lines","words"]:["lines","words","chars"];SplitText.create(e,{type:a.join(", "),mask:"lines",autoSplit:!0,linesClass:"line",wordsClass:"word",charsClass:"letter",onSplit:function(a){const r=a[t],n=splitConfig[t];return gsap.from(r,{yPercent:110,duration:n.duration,stagger:n.stagger,ease:"expo.out",scrollTrigger:{trigger:e,start:"clamp(top 80%)",once:!0}})}})}))}function initTeamCarousel(e){const t=e.querySelector(".mwg008");if(!t)return;const a=t.querySelector(".mwg008-container"),r=t.querySelectorAll(".mwg008-card");if(!a||0===r.length)return;gsap.set(a,{clearProps:"x,transform"});r.forEach(((e,t)=>{e.style.position="relative",e.style.zIndex=r.length-t}))}function initPixelatedImageReveal(e){const t=.4,a=8,r=100/a,n=e.querySelectorAll("[data-pixelated-image-reveal]");if(!n.length)return;const o="ontouchstart"in window||navigator.maxTouchPoints>0||window.matchMedia("(pointer: coarse)").matches;n.forEach((e=>{if(e.__pixImgInit)return;e.__pixImgInit=!0;const n=e.querySelector("[data-pixelated-image-reveal-grid]"),i=e.querySelector("[data-pixelated-image-reveal-active]");if(!n||!i)return;n.querySelectorAll(".pixelated-image-card__pixel").forEach((e=>e.remove()));for(let e=0;e<a;e++)for(let t=0;t<a;t++){const a=document.createElement("div");a.classList.add("pixelated-image-card__pixel"),a.style.width=`${r}%`,a.style.height=`${r}%`,a.style.left=t*r+"%",a.style.top=e*r+"%",n.appendChild(a)}const l=n.querySelectorAll(".pixelated-image-card__pixel"),s=t/l.length;let c,d=!1;const u=e=>{d=e,gsap.killTweensOf(l),c&&c.kill(),gsap.set(l,{display:"none"}),gsap.to(l,{display:"block",duration:0,stagger:{each:s,from:"random"}}),c=gsap.delayedCall(t,(()=>{i.style.display=e?"block":"none",i.style.pointerEvents=e?"none":""})),gsap.to(l,{display:"none",duration:0,delay:t,stagger:{each:s,from:"random"}})};o?e.addEventListener("click",(()=>u(!d))):(e.addEventListener("mouseenter",(()=>{d||u(!0)})),e.addEventListener("mouseleave",(()=>{d&&u(!1)})))}))}function initFooterDeformation(e){e.querySelectorAll(".effet-deformation").forEach((e=>{e.__deformInit||(e.__deformInit=!0,e.addEventListener("mousemove",(t=>{const a=e.getBoundingClientRect(),r=t.clientX-a.left,n=t.clientY-a.top,o=(r-a.width/2)/(a.width/2),i=(n-a.height/2)/(a.height/2);e.style.transition="transform 0.1s ease-out",e.style.transform=`perspective(1000px) scale(1.05) rotateX(${15*-i}deg) rotateY(${15*o}deg) skew(${5*o}deg, ${5*i}deg)`})),e.addEventListener("mouseleave",(()=>{e.style.transition="transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)",e.style.transform="perspective(1000px) scale(1) rotateX(0deg) rotateY(0deg) skew(0deg, 0deg)"})))}))}function initPixelatedScrollTransition(e){const t=e.querySelectorAll("[data-pixelated-scroll-transition]");if(!t.length)return;const a=12,r=6,n="cover",o={cover:"bottom bottom",reveal:"top bottom"},i={cover:"bottom top",reveal:"top center"},l=.3,s=.1,c=1.5,d="pixelated-scroll-transition__panel",u="pixelated-scroll-transition__col",p="pixelated-scroll-transition__pixel",g={mobile:"(max-width: 478px)",landscape:"(max-width: 767px)",tablet:"(max-width: 991px)"},m=[],h=e=>{const t=parseInt(e.dataset.columns,10)||a;return matchMedia(g.mobile).matches?parseInt(e.dataset.columnsMobile,10)||Math.max(4,Math.round(.4*t)):matchMedia(g.landscape).matches?parseInt(e.dataset.columnsLandscape,10)||Math.max(6,Math.round(.6*t)):matchMedia(g.tablet).matches?parseInt(e.dataset.columnsTablet,10)||Math.max(8,Math.round(.75*t)):t},f=e=>{const t=parseInt(e.dataset.rows,10)||r;return matchMedia(g.mobile).matches?parseInt(e.dataset.rowsMobile,10)||t:matchMedia(g.landscape).matches?parseInt(e.dataset.rowsLandscape,10)||t:matchMedia(g.tablet).matches&&parseInt(e.dataset.rowsTablet,10)||t},y=e=>"reveal"===e.dataset.mode?"reveal":n,w=(e,t)=>e.dataset.scrollStart||o[t],v=(e,t)=>e.dataset.scrollEnd||i[t],b=()=>{const e=document.createElement("div");return e.classList.add(u),e.setAttribute("data-pixelated-scroll-column",""),e},x=()=>{const e=document.createElement("div");return e.classList.add(p),e.setAttribute("data-pixelated-scroll-pixel",""),e},S=(e,t,a)=>{const r=document.createElement("div");r.classList.add(d),r.setAttribute("data-pixelated-scroll-panel","");const n=document.createDocumentFragment();for(let e=0;e<t;e++){const e=b();for(let t=0;t<a;t++)e.appendChild(x());n.appendChild(e)}return r.appendChild(n),e.appendChild(r),{panel:r}},E=(e,t,a)=>{const r=e.querySelectorAll("[data-pixelated-scroll-column]"),n=[];for(let e=0;e<a;e++)r.forEach(((t,r)=>{const o=t.children[e];if(!o)return;const i=50*(a-1-e)+300*Math.random()+30*Math.sin(.3*r);n.push({element:o,priority:i})}));return n.sort(((e,t)=>e.priority-t.priority)),n.map((e=>e.element))},A=(e,t,a,r)=>{const n=gsap.timeline({scrollTrigger:{trigger:a,start:"clamp("+w(e,r)+")",end:"clamp("+v(e,r)+")",scrub:l,invalidateOnRefresh:!0}}),o="cover"===r?0:1,i="cover"===r?1:0;return gsap.set(t,{autoAlpha:o}),n.to(t,{autoAlpha:i,duration:s,stagger:{amount:c,from:"start"},ease:"none"}),n},q=e=>{const t=e.closest("section")||e.parentElement,a=h(e),r=f(e),n=y(e),{panel:o}=S(e,a,r),i=E(o,a,r);return{wrapper:e,tl:A(e,i,t,n)}},C=gsap.matchMedia();C.add({isDesktop:"(min-width: 992px)",isTablet:"(min-width: 768px) and (max-width: 991px)",isLandscape:"(min-width: 479px) and (max-width: 767px)",isMobile:"(max-width: 478px)",reduceMotion:"(prefers-reduced-motion: reduce)"},(e=>{if(!e.conditions.reduceMotion)return t.forEach((e=>m.push(q(e)))),ScrollTrigger.refresh(),()=>{m.forEach((e=>{e.tl?.scrollTrigger?.kill(),e.tl?.kill();const t=e.wrapper.querySelector("[data-pixelated-scroll-panel]");t&&t.remove()})),m.length=0}})),registerCleanup((()=>C.kill()))}
function initEventGalleryCarousel(e){function t(t){c&&c.kill(),e.querySelectorAll(".slot-progress-fill").forEach((e=>gsap.set(e,{width:"0%"})));const a=i[t];if(!a)return;const r=a.querySelector(".slot-progress-fill");c=gsap.to(r,{width:"100%",duration:s,ease:"none",onComplete:()=>{const e=(t+1)%i.length;d||i[e].click()}})}function a(e){const t=e.querySelector(".event-title");if(t&&!e._splitText){const a=new SplitText(t,{type:"lines",linesClass:"line-inner"});a.lines.forEach((e=>{const t=document.createElement("div");t.className="line-mask",t.style.overflow="hidden",e.parentNode.insertBefore(t,e),t.appendChild(e)})),e._splitText=a}const a=e._splitText,r=e.querySelector(".event-description, .text-block-6"),n=e.querySelectorAll(".badge-square, .badge-round"),o=e.querySelector(".event-button, .btn-bubble-arrow");a&&a.lines.length&&gsap.set(a.lines,{yPercent:110,rotation:5,opacity:0}),r&&gsap.set(r,{y:30,opacity:0}),n.length&&gsap.set(n,{yPercent:120,rotation:10,opacity:0}),o&&gsap.set(o,{y:30,opacity:0})}function r(e){const t=e._splitText,a=e.querySelector(".event-description, .text-block-6"),r=e.querySelectorAll(".badge-square, .badge-round"),n=e.querySelector(".event-button, .btn-bubble-arrow"),o=gsap.timeline();return r.length&&o.to(r,{yPercent:0,rotation:0,opacity:1,duration:1.2,stagger:.1,ease:"power4.out",force3D:!0},0),t&&t.lines.length&&o.to(t.lines,{yPercent:0,rotation:0,opacity:1,duration:1.4,stagger:.1,ease:"power4.out",force3D:!0},.1),a&&o.to(a,{y:0,opacity:1,duration:.8,ease:"power3.out"},.4),n&&o.to(n,{y:0,opacity:1,duration:.8,ease:"power3.out"},.6),o}function n(e){const t=e._splitText,a=e.querySelector(".event-description, .text-block-6"),r=e.querySelectorAll(".badge-square, .badge-round"),n=e.querySelector(".event-button, .btn-bubble-arrow"),o=gsap.timeline();t&&t.lines.length&&o.to(t.lines,{yPercent:-110,rotation:-2,opacity:0,duration:.6,ease:"power3.in"},0);const i=[];return a&&i.push(a),r.length&&i.push(r),n&&i.push(n),i.length&&o.to(i,{y:-20,opacity:0,duration:.5,ease:"power3.in"},.1),o.eventCallback("onComplete",(()=>{t&&(t.revert(),delete e._splitText)})),o}function o(){const n=e.querySelector(".event-content.is-active"),o=i.findIndex((e=>e.classList.contains("is-active"))),l=o>-1?o:0;n&&a(n),ScrollTrigger.create({trigger:e.querySelector(".event-pin-height"),start:"top 85%",once:!0,onEnter:()=>{n&&r(n).eventCallback("onComplete",(()=>t(l)))}})}const i=Array.from(e.querySelectorAll(".gallery-slot")),l=e.querySelectorAll(".event-content");if(!i.length||!l.length)return;const s=6;let c=null,d=!1;const u=()=>{o()};document.fonts&&document.fonts.ready?document.fonts.ready.then(u):u(),i.forEach((e=>{const t=document.createElement("div");t.className="slot-progress-container";const a=document.createElement("div");a.className="slot-progress-fill",t.appendChild(a),e.appendChild(t)})),i.forEach(((o,l)=>{o.addEventListener("click",(function(){if(d||o.classList.contains("is-active"))return;const s=e.querySelector(`#${o.dataset.target}`),u=e.querySelector(".event-content.is-active");s&&u&&(d=!0,c&&c.pause(),i.forEach((e=>e.classList.remove("is-active"))),o.classList.add("is-active"),n(u).eventCallback("onComplete",(()=>{u.classList.remove("is-active"),s.classList.add("is-active"),a(s);const e=r(s);d=!1,e.eventCallback("onComplete",(()=>t(l)))})))}))})),registerCleanup((()=>{c&&c.kill(),l.forEach((e=>{e._splitText&&e._splitText.revert()}))}))}function initTitleReveal(e){const t=e.querySelectorAll('[data-animate="title-reveal"]');if(!t.length)return;const a=()=>{const e=e=>{const t=e.textContent.trim().split(" ");e.innerHTML="";const a=t.map((t=>{const a=document.createElement("span");return a.textContent=t+" ",a.style.display="inline-block",e.appendChild(a),a})),r={};a.forEach((e=>{const t=e.offsetTop;(r[t]||=[]).push(e.textContent)})),e.innerHTML="";const n=[];return Object.keys(r).sort(((e,t)=>parseFloat(e)-parseFloat(t))).forEach((t=>{const a=document.createElement("div");a.className="line-mask";const o=document.createElement("div");o.className="line-inner",o.textContent=r[t].join("").trim(),a.appendChild(o),e.appendChild(a),n.push(o)})),n};t.forEach((t=>{if(t.__titleRevealInit)return;t.__titleRevealInit=!0;const a=e(t);gsap.set(t,{opacity:1}),gsap.set(a,{yPercent:110,rotation:5,opacity:0}),gsap.to(a,{yPercent:0,rotation:0,opacity:1,duration:1.4,stagger:.1,ease:"power4.out",force3D:!0,scrollTrigger:{trigger:t,start:"top 85%",toggleActions:"play none none none"}})}))};document.fonts&&document.fonts.ready?document.fonts.ready.then(a):a()}function initPreviewFollower(e){const t=e.querySelectorAll("[data-follower-wrap]");t.length&&t.forEach((e=>{if(e.__followerInit)return;e.__followerInit=!0;const t=e.querySelector("[data-follower-collection]"),a=e.querySelectorAll("[data-follower-item]"),r=e.querySelector("[data-follower-cursor]"),n=e.querySelector("[data-follower-cursor-inner]");if(!r||!n)return;let o=null,i=!0;const l=100,s=.5,c="power2.inOut";gsap.set(r,{xPercent:-50,yPercent:-50});const d=gsap.quickTo(r,"x",{duration:.6,ease:"power3"}),u=gsap.quickTo(r,"y",{duration:.6,ease:"power3"}),p=e=>{d(e.clientX),u(e.clientY)};window.addEventListener("mousemove",p),registerCleanup((()=>window.removeEventListener("mousemove",p))),a.forEach(((e,t)=>{e.addEventListener("mouseenter",(()=>{const a=null===o||t>o;o=t,r.querySelectorAll("[data-follower-visual]").forEach((e=>{gsap.killTweensOf(e),gsap.to(e,{yPercent:a?-l:l,duration:s,ease:c,overwrite:"auto",onComplete:()=>e.remove()})}));const d=e.querySelector("[data-follower-visual]");if(!d)return;const u=d.cloneNode(!0);n.appendChild(u),i?i=!1:gsap.fromTo(u,{yPercent:a?l:-l},{yPercent:0,duration:s,ease:c,overwrite:"auto"})})),e.addEventListener("mouseleave",(()=>{const e=r.querySelector("[data-follower-visual]");e&&(gsap.killTweensOf(e),gsap.to(e,{yPercent:-l,duration:s,ease:c,overwrite:"auto",onComplete:()=>e.remove()}))}))})),t&&t.addEventListener("mouseleave",(()=>{r.querySelectorAll("[data-follower-visual]").forEach((e=>{gsap.killTweensOf(e),gsap.delayedCall(s,(()=>e.remove()))})),i=!0,o=null}))}))}function initPssstCarousel(e){const t=e.querySelector("[data-pssst-page]"),a=e.querySelector("[data-pssst-carousel]"),r=e.querySelector("[data-pssst-track]");if(!t||!a||!r)return;if(r.__pssstInit)return;r.__pssstInit=!0;const n=Array.from(r.querySelectorAll("[data-pssst-item]"));if(!n.length)return;const o={speedMobile:parseFloat(a.dataset.speedMobile)||.1,speedTablet:parseFloat(a.dataset.speedTablet)||.1,speedDesktop:parseFloat(a.dataset.speedDesktop)||.02,mobileMax:parseInt(a.dataset.mobileMax)||767,tabletMax:parseInt(a.dataset.tabletMax)||1024,direction:parseInt(a.dataset.direction)||1},i=()=>{const e=innerWidth;return e<=o.mobileMax?o.speedMobile:e<=o.tabletMax?o.speedTablet:o.speedDesktop},l=()=>{let e=0;return n.forEach((t=>{const a=getComputedStyle(t);e+=t.offsetWidth+(parseFloat(a.marginRight)||0)+(parseFloat(a.marginLeft)||0)})),e},s=e=>0===e?2:Math.max(2,Math.ceil(3*innerWidth/e)-1),c=()=>{r.querySelectorAll('[data-pssst-clone="true"]').forEach((e=>e.remove()));const e=l(),t=s(e);for(let e=0;e<t;e++)n.forEach((e=>{const t=e.cloneNode(!0);t.setAttribute("data-pssst-clone","true"),t.setAttribute("aria-hidden","true"),r.appendChild(t)}));return e};let d=0,u=0,p=i(),g=null,m=null;const h=()=>{d=c(),p=i()},f=r.querySelectorAll("img");let y=f.length;const w=()=>{0==--y&&h()};let v;0===y?h():(f.forEach((e=>{e.complete?w():e.decode?e.decode().then(w).catch(w):w()})),setTimeout((()=>{0===d&&h()}),1e3));const b=()=>{clearTimeout(v),v=setTimeout((()=>{d=c(),p=i(),u%=d||1}),150)};window.addEventListener("resize",b);const x=e=>{null===g&&(g=e);const t=(e-g)/1e3;g=e,d>0&&t<.5&&(u+=innerWidth*p*t*o.direction,u=(u%d+d)%d,r.style.transform="translate3d("+-u+"px, 0, 0)"),m=requestAnimationFrame(x)};m=requestAnimationFrame(x),registerCleanup((()=>{m&&cancelAnimationFrame(m),window.removeEventListener("resize",b)}))}!function(){if(!window.gsap)return;const e=[window.CustomEase,window.ScrollTrigger,window.SplitText,window.ScrambleTextPlugin,window.Draggable,window.Observer,window.Flip].filter(Boolean);gsap.registerPlugin(...e)}(),window.ScrollTrigger&&ScrollTrigger.config({ignoreMobileResize:!0}),history.scrollRestoration="manual";let lenis=null,nextPage=document,globalInitDone=!1;const hasLenis=void 0!==window.Lenis,hasScrollTrigger=void 0!==window.ScrollTrigger,rmMQ=window.matchMedia("(prefers-reduced-motion: reduce)");let reducedMotion=rmMQ.matches;rmMQ.addEventListener?.("change",(e=>reducedMotion=e.matches)),rmMQ.addListener?.((e=>reducedMotion=e.matches));let staggerDefault=.05,durationDefault=.6;window.CustomEase&&CustomEase.create("osmo","0.625, 0.05, 0, 1"),window.gsap&&gsap.defaults({ease:"osmo",duration:durationDefault});const has=e=>!!nextPage.querySelector(e),pageCleanups=[],themeConfig={light:{nav:"dark",transition:"light"},dark:{nav:"light",transition:"dark"}},pixelHorizontalAmount=12,transitionDuration=1.2,pixelFadeDuration=.3,pixelOverlap=.3;const splitConfig={lines:{duration:1,stagger:.09},words:{duration:.6,stagger:.06},chars:{duration:.4,stagger:.01}};try {
  window.barba?(barba.hooks.before((()=>{const e=document.querySelector("[data-nav-status]");e&&e.setAttribute("data-nav-status","not-active")})),barba.hooks.beforeEnter((e=>{gsap.set(e.next.container,{position:"fixed",top:0,left:0,right:0}),lenis&&"function"==typeof lenis.stop&&lenis.stop();const t=e.next.container.querySelectorAll("[data-load-wrap]");t.length&&gsap.set(t,{display:"none"});const a=e.next.container.querySelectorAll("[data-load-reset]");a.length&&gsap.set(a,{autoAlpha:1}),applyThemeFrom(e.next.container)})),barba.hooks.afterLeave((()=>{cleanupPage()})),barba.hooks.enter((e=>{initBarbaNavUpdate(e)})),barba.hooks.afterEnter((e=>{initPage(e.next.container),hasLenis&&lenis&&(lenis.resize(),lenis.start()),hasScrollTrigger&&ScrollTrigger.refresh()})),barba.init({debug:!1,timeout:7e3,preventRunning:!0,transitions:[{name:"pixel",sync:!0,once:async e=>(initGlobalOnce(),initPage(e.next.container),document.fonts&&document.fonts.ready&&document.fonts.ready.then((()=>{hasScrollTrigger&&ScrollTrigger.refresh()})),runPageOnceAnimation(e.next.container)),leave:async e=>runPageLeaveAnimation(e.current.container,e.next.container,e),enter:async e=>runPageEnterAnimation(e.next.container)}]})):(initGlobalOnce(),initPage(document),hasScrollTrigger&&ScrollTrigger.refresh());
} catch (motionErr) {
  console.warn("Motion framework initialization safely bypassed (offline/CDN-safe):", motionErr);
}


/* ========================================================
   THE AUCTION SOCIETY — NATIVE REST API & INTERACTIVE CLIENT
   ======================================================== */

(function () {
  'use strict';

  // Global State
  const state = {
    user: null,
    categories: [],
    auctions: [],
    activeLot: null,
    activeCategory: '',
    searchQuery: '',
    sortBy: 'ending_soon',
    dashboardData: null
  };

  // Utility: INR Currency Formatter
  function formatINR(val) {
    const num = Number(val) || 0;
    return '₹' + num.toLocaleString('en-IN');
  }

  // Utility: Countdown Timer Formatter
  function formatCountdown(msRemaining) {
    if (msRemaining <= 0) return 'Closed';
    const totalSecs = Math.floor(msRemaining / 1000);
    const days = Math.floor(totalSecs / 86400);
    const hours = Math.floor((totalSecs % 86400) / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h ${mins}m left`;
    if (mins > 0) return `${mins}m ${secs}s left`;
    return `${secs}s left`;
  }

  // Utility: HTML Sanitization / XSS Prevention
  function escapeHtml(value) {
    if (value === null || value === undefined) return '';
    return String(value).replace(/[&<>"']/g, char => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[char]);
  }

  // Utility: Toast Notification
  function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast-msg ${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('is-visible'));
    setTimeout(() => {
      toast.classList.remove('is-visible');
      setTimeout(() => toast.remove(), 250);
    }, 3800);
  }

  // Modal Controllers
  function openModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    const openModals = document.querySelectorAll('.crt-modal-backdrop.is-open');
    if (openModals.length === 0) {
      document.body.style.overflow = '';
    }
  }

  function closeAllModals() {
    document.querySelectorAll('.crt-modal-backdrop.is-open').forEach(m => {
      m.classList.remove('is-open');
      m.setAttribute('aria-hidden', 'true');
    });
    document.body.style.overflow = '';
  }

  // 1. Authentication & Session Management
  async function checkAuth() {
    try {
      const res = await fetch('/api/me');
      if (res.ok) {
        const data = await res.json();
        state.user = (data && data.user) ? data.user : null;
        state.savedCount = (data && data.savedCount) ? data.savedCount : 0;
      } else {
        state.user = null;
      }
    } catch {
      state.user = null;
    }
    updateAuthUI();
  }

  function updateAuthUI() {
    const authViews = document.getElementById('account-auth-views');
    const dashView = document.getElementById('account-dashboard-view');
    const navAccountLabel = document.getElementById('crt-nav-account-label');

    if (state.user) {
      if (authViews) authViews.style.display = 'none';
      if (dashView) dashView.style.display = 'block';
      if (navAccountLabel) navAccountLabel.textContent = `ACCOUNT (${state.user.name.split(' ')[0]})`;

      const nameEl = document.getElementById('profile-user-name');
      const emailEl = document.getElementById('profile-user-email');
      const roleEl = document.getElementById('profile-user-role');
      if (nameEl) nameEl.textContent = state.user.name;
      if (emailEl) emailEl.textContent = state.user.email;
      if (roleEl) roleEl.textContent = state.user.role;

      const isSeller = state.user.role === 'Seller' || state.user.role === 'Both';
      const tabListings = document.getElementById('dash-tab-listings-btn');
      const tabCreate = document.getElementById('dash-tab-create-btn');
      if (tabListings) tabListings.style.display = isSeller ? 'inline-block' : 'none';
      if (tabCreate) tabCreate.style.display = isSeller ? 'inline-block' : 'none';

      loadDashboard();
    } else {
      if (authViews) authViews.style.display = 'block';
      if (dashView) dashView.style.display = 'none';
      if (navAccountLabel) navAccountLabel.textContent = 'ACCOUNT (SIGN IN)';
    }
  }

  // 2. Categories & Live Catalog
  async function loadCategories() {
    try {
      const res = await fetch('/api/categories');
      if (!res.ok) return;
      state.categories = await res.json();
      renderCategoryPills();
    } catch (e) {
      console.warn('Could not load categories:', e);
    }
  }

  function renderCategoryPills() {
    const pillsContainer = document.getElementById('catalog-category-pills');
    if (!pillsContainer) return;
    pillsContainer.innerHTML = '';

    const allBtn = document.createElement('button');
    allBtn.type = 'button';
    allBtn.className = `category-pill ${state.activeCategory === '' ? 'is-active' : ''}`;
    allBtn.dataset.category = '';
    allBtn.textContent = 'All Lots';
    allBtn.addEventListener('click', () => {
      state.activeCategory = '';
      renderCategoryPills();
      loadAuctions();
    });
    pillsContainer.appendChild(allBtn);

    state.categories.forEach(cat => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `category-pill ${state.activeCategory === cat.name ? 'is-active' : ''}`;
      btn.dataset.category = cat.name;
      btn.textContent = cat.name;
      btn.addEventListener('click', () => {
        state.activeCategory = cat.name;
        renderCategoryPills();
        loadAuctions();
      });
      pillsContainer.appendChild(btn);
    });
  }

  async function loadAuctions() {
    const grid = document.getElementById('catalog-grid');
    if (!grid) return;
    try {
      const params = new URLSearchParams();
      if (state.searchQuery) params.set('q', state.searchQuery);
      if (state.activeCategory) params.set('category', state.activeCategory);
      if (state.sortBy) params.set('sort', state.sortBy);

      const res = await fetch(`/api/auctions?${params.toString()}`);
      if (!res.ok) throw new Error('API query failed');
      state.auctions = await res.json();
      renderAuctionsGrid(state.auctions);
    } catch (err) {
      grid.innerHTML = `<div class="catalog-empty-state">Error connecting to SQL auction service: ${err.message}</div>`;
    }
  }

  function renderAuctionsGrid(auctions) {
    const grid = document.getElementById('catalog-grid');
    if (!grid) return;

    if (!auctions || auctions.length === 0) {
      grid.innerHTML = `
        <div class="catalog-empty-state">
          No lots match your search criteria. Try selecting another category or clearing search terms.
        </div>`;
      return;
    }

    grid.innerHTML = auctions.map(lot => {
      const isClosed = lot.status === 'Closed' || Date.now() >= lot.endsAt;
      const timeLeft = isClosed ? 'Closed' : formatCountdown(lot.endsAt - Date.now());
      const watchActive = lot.watching ? 'is-active' : '';

      return `
        <article class="lot-card" data-lot-id="${lot.id}">
          <div class="lot-card-thumb-wrap">
            <img src="${escapeHtml(lot.image)}" alt="${escapeHtml(lot.title)}" class="lot-card-thumb" loading="lazy" />
            <div class="lot-card-badges-overlay">
              <div class="lot-card-badges-left">
                <span class="badge-square green">LOT #${lot.id.toString().padStart(3, '0')}</span>
                <span class="badge-round green">${escapeHtml(lot.category)}</span>
                <span class="badge-square green">${escapeHtml(lot.condition)}</span>
              </div>
              <button type="button" class="lot-card-watchlist-btn ${watchActive}" data-action="watch" data-lot-id="${lot.id}" title="Save to Watchlist">
                ♥
              </button>
            </div>
          </div>
          <div class="lot-card-content">
            <h3 class="lot-card-title">${escapeHtml(lot.title)}</h3>
            <p class="lot-card-desc">${escapeHtml(lot.description)}</p>
            <div class="lot-card-bid-row">
              <div>
                <div style="font-size:11px; font-weight:700; color:#777; letter-spacing:0.08em;">CURRENT BID</div>
                <div class="lot-card-current-bid">${formatINR(lot.currentBid)}</div>
              </div>
              <div class="lot-card-bid-count">${lot.bidCount || 0} bids</div>
            </div>
            <div class="lot-card-footer">
              <span class="lot-card-timer">${timeLeft}</span>
              <button type="button" class="btn-lot-action" data-action="bid" data-lot-id="${lot.id}">
                ${isClosed ? 'View Results' : 'Place Bid'}
              </button>
            </div>
          </div>
        </article>`;
    }).join('');

    // Attach card event listeners
    grid.querySelectorAll('[data-action="bid"]').forEach(btn => {
      btn.addEventListener('click', () => openLotModal(Number(btn.dataset.lotId)));
    });

    grid.querySelectorAll('[data-action="watch"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleWatchlist(Number(btn.dataset.lotId));
      });
    });
  }

  // 3. Lot Detail & Live Bidding Drawer
  async function openLotModal(lotId) {
    try {
      const res = await fetch(`/api/auctions/${lotId}`);
      if (!res.ok) {
        showToast('Lot not found.', 'error');
        return;
      }
      const lot = await res.json();
      state.activeLot = lot;

      document.getElementById('lot-modal-header-title').textContent = `${lot.title} (LOT #${lot.id})`;
      document.getElementById('lot-modal-img').src = lot.image;
      document.getElementById('lot-modal-badge-lot').textContent = `LOT #${lot.id.toString().padStart(3, '0')}`;
      document.getElementById('lot-modal-badge-cat').textContent = lot.category;
      document.getElementById('lot-modal-badge-cond').textContent = lot.condition;
      document.getElementById('lot-modal-seller').textContent = lot.seller || 'Verified Member';
      document.getElementById('lot-modal-location').textContent = lot.location || 'Mumbai, Maharashtra';

      const reserveEl = document.getElementById('lot-modal-reserve-status');
      if (reserveEl) {
        if (lot.reserveMet || (lot.reservePrice && lot.currentBid >= lot.reservePrice)) {
          reserveEl.className = 'reserve-status-tag met';
          reserveEl.textContent = 'Reserve Met (Valid)';
        } else {
          reserveEl.className = 'reserve-status-tag pending';
          if (lot.isOwner && lot.reservePrice) {
            reserveEl.textContent = `Reserve Pending (₹${lot.reservePrice.toLocaleString('en-IN')})`;
          } else {
            reserveEl.textContent = 'Reserve Pending';
          }
        }
      }

      document.getElementById('lot-modal-desc').textContent = lot.description;
      document.getElementById('lot-modal-current-bid').textContent = formatINR(lot.currentBid);

      const isClosed = lot.status === 'Closed' || Date.now() >= lot.endsAt;
      const timeLeft = isClosed ? 'Closed' : formatCountdown(lot.endsAt - Date.now());
      document.getElementById('lot-modal-bid-sub').textContent = `${lot.bidCount || 0} bids · Min Increment: ${formatINR(lot.minIncrement)}`;
      document.getElementById('lot-modal-timer').textContent = timeLeft;

      // Watchlist toggle state
      const watchBtn = document.getElementById('lot-modal-watchlist-btn');
      if (watchBtn) {
        watchBtn.textContent = lot.watching ? '♥ Saved' : '♥ Save';
      }

      // Recent Bids Table
      const bidsList = document.getElementById('lot-modal-bids-list');
      if (bidsList) {
        if (lot.recentBids && lot.recentBids.length > 0) {
          bidsList.innerHTML = lot.recentBids.map(b => {
            const bidder = b.bidder || b.bidderName || 'Anonymous Bidder';
            const timestamp = b.time || b.at || Date.now();
            const timeStr = new Date(timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
            return `
              <div class="recent-bid-entry">
                <span class="recent-bid-amount">${formatINR(b.amount)}</span>
                <span class="recent-bid-meta">${escapeHtml(bidder)} · ${timeStr}</span>
              </div>`;
          }).join('');
        } else {
          bidsList.innerHTML = '<div class="recent-bid-entry"><span class="recent-bid-meta">No bids yet. Open at starting bid.</span></div>';
        }
      }

      // Pre-fill next bid amount
      const nextMin = lot.minNextBid || (lot.currentBid + lot.minIncrement);
      const bidInput = document.getElementById('bid-amount-input');
      if (bidInput) {
        bidInput.value = nextMin;
        bidInput.min = nextMin;
        bidInput.step = lot.minIncrement || 100;
        bidInput.disabled = isClosed;
      }

      const submitBtn = document.getElementById('btn-submit-bid');
      if (submitBtn) {
        submitBtn.disabled = isClosed;
        const btnText = submitBtn.querySelector('.btn-text');
        if (btnText) {
          btnText.textContent = isClosed ? 'Auction Ended' : 'Execute Bid (SQL Tx)';
        } else {
          submitBtn.textContent = isClosed ? 'Auction Ended' : 'Place Bid (SQL Transaction)';
        }
      }

      const feedback = document.getElementById('bid-form-feedback');
      if (feedback) {
        feedback.textContent = '';
        feedback.className = 'bid-form-feedback';
      }

      openModal('lot-bid-modal');
    } catch (err) {
      showToast(`Error opening lot: ${err.message}`, 'error');
    }
  }

  async function toggleWatchlist(lotId) {
    if (!state.user) {
      showToast('Please sign in to save lots to your watchlist.', 'info');
      setTimeout(() => { window.location.href = 'account.html'; }, 800);
      return;
    }
    try {
      const res = await fetch(`/api/auctions/${lotId}/watchlist`, { method: 'POST' });
      if (!res.ok) throw new Error('Could not update watchlist');
      const data = await res.json();
      showToast(data.watching ? 'Saved lot to watchlist.' : 'Removed lot from watchlist.', 'info');
      loadAuctions();
      if (state.activeLot && state.activeLot.id === lotId) {
        state.activeLot.watching = data.watching;
        const watchBtn = document.getElementById('lot-modal-watchlist-btn');
        if (watchBtn) watchBtn.textContent = data.watching ? '♥ Saved' : '♥ Save';
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  // 4. Bidding Execution
  async function handleBidSubmit(e) {
    e.preventDefault();
    if (!state.activeLot) return;
    if (!state.user) {
      showToast('Please sign in to place a bid.', 'info');
      setTimeout(() => { window.location.href = 'account.html'; }, 800);
      return;
    }

    const bidInput = document.getElementById('bid-amount-input');
    const amount = Number(bidInput.value);
    const feedback = document.getElementById('bid-form-feedback');

    try {
      const res = await fetch(`/api/auctions/${state.activeLot.id}/bid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
      });

      const data = await res.json();
      if (!res.ok) {
        feedback.className = 'bid-form-feedback error';
        feedback.textContent = data.error || 'Bid rejected by transaction trigger.';
        showToast(data.error || 'Bid rejected.', 'error');
        return;
      }

      feedback.className = 'bid-form-feedback success';
      feedback.textContent = `✓ Bid accepted at ${formatINR(amount)}! High bidder recorded.`;
      showToast(`🎉 Bid of ${formatINR(amount)} recorded in SQL ledger!`, 'success');

      // Refresh data
      openLotModal(state.activeLot.id);
      loadAuctions();
    } catch (err) {
      feedback.className = 'bid-form-feedback error';
      feedback.textContent = err.message;
    }
  }

  // 5. Account & Dashboard
  async function handleLogin(e) {
    e.preventDefault();
    const email = (document.getElementById('login-email') || document.getElementById('auth-login-email'))?.value.trim() || '';
    const password = (document.getElementById('login-password') || document.getElementById('auth-login-pass'))?.value || '';
    const feedback = document.getElementById('login-feedback');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        if (feedback) {
          feedback.className = 'auth-feedback error';
          feedback.textContent = data.error || 'Sign in failed.';
        }
        showToast(data.error || 'Sign in failed.', 'error');
        return;
      }
      if (feedback) {
        feedback.className = 'auth-feedback success';
        feedback.textContent = 'Authenticated. Loading member profile...';
      }
      state.user = (data && data.user) ? data.user : null;
      if (state.user) {
        showToast(`Welcome back, ${state.user.name}!`, 'success');
      }
      updateAuthUI();
    } catch (err) {
      if (feedback) {
        feedback.className = 'auth-feedback error';
        feedback.textContent = err.message;
      }
      showToast(err.message, 'error');
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    const name = (document.getElementById('register-name') || document.getElementById('reg-name'))?.value.trim() || '';
    const email = (document.getElementById('register-email') || document.getElementById('reg-email'))?.value.trim() || '';
    const password = (document.getElementById('register-password') || document.getElementById('reg-password'))?.value || '';
    const roleSelect = document.getElementById('register-role');
    const roleRadio = document.querySelector('input[name="role"]:checked');
    let role = roleSelect ? roleSelect.value : (roleRadio ? roleRadio.value : 'Buyer');
    role = role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
    const feedback = document.getElementById('register-feedback');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role })
      });
      const data = await res.json();
      if (!res.ok) {
        if (feedback) {
          feedback.className = 'auth-feedback error';
          feedback.textContent = data.error || 'Registration failed.';
        }
        showToast(data.error || 'Registration failed.', 'error');
        return;
      }
      if (feedback) {
        feedback.className = 'auth-feedback success';
        feedback.textContent = 'Member registered. Loading profile...';
      }
      state.user = (data && data.user) ? data.user : null;
      if (state.user) {
        showToast(`Welcome to The Auction Society, ${state.user.name}!`, 'success');
      }
      updateAuthUI();
    } catch (err) {
      if (feedback) {
        feedback.className = 'auth-feedback error';
        feedback.textContent = err.message;
      }
      showToast(err.message, 'error');
    }
  }

  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      state.user = null;
      showToast('Signed out from transaction engine.', 'info');
      updateAuthUI();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  async function loadDashboard() {
    const panel = document.getElementById('dashboard-content-panel');
    if (!panel) return;
    try {
      const res = await fetch('/api/dashboard');
      if (!res.ok) throw new Error('Failed to load dashboard');
      state.dashboardData = await res.json();
      renderDashboardTab('bids');
    } catch (err) {
      panel.innerHTML = `<div class="dashboard-empty">Could not load records: ${err.message}</div>`;
    }
  }

  function renderDashboardTab(tabName) {
    const panel = document.getElementById('dashboard-content-panel');
    if (!panel || !state.dashboardData) return;

    document.querySelectorAll('.dash-tab-btn').forEach(btn => {
      btn.classList.toggle('is-active', btn.dataset.dashTab === tabName);
    });

    const data = state.dashboardData;

    if (tabName === 'bids') {
      const bids = data.myBids || data.bids || [];
      if (bids.length === 0) {
        panel.innerHTML = '<div style="padding:20px; text-align:center; color:#666;">No active or past bids found.</div>';
        return;
      }
      panel.innerHTML = `
        <div class="dashboard-table-wrap">
          <table class="dashboard-table">
            <thead>
              <tr>
                <th>Lot Title</th>
                <th>Your Bid</th>
                <th>Current Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${bids.map(b => `
                <tr>
                  <td><strong>${escapeHtml(b.auction ? b.auction.title : (b.title || 'Lot #' + b.auctionId))}</strong></td>
                  <td>${formatINR(b.amount)}</td>
                  <td>${b.isWinning ? '<span class="badge-square green">High Bidder</span>' : '<span style="color:#d93025; font-weight:700;">Outbid</span>'}</td>
                  <td><button type="button" class="btn-dash-action" onclick="window.__auctionApp.openLotModal(${b.auctionId})">View Lot</button></td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>`;
    } else if (tabName === 'wins') {
      const wins = data.won || data.wins || [];
      if (wins.length === 0) {
        panel.innerHTML = '<div style="padding:20px; text-align:center; color:#666;">No won lots recorded yet.</div>';
        return;
      }
      panel.innerHTML = `
        <div class="dashboard-table-wrap">
          <table class="dashboard-table">
            <thead>
              <tr>
                <th>Won Lot</th>
                <th>Final Bid</th>
                <th>Settlement</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${wins.map(w => `
                <tr>
                  <td><strong>${escapeHtml(w.title)}</strong></td>
                  <td>${formatINR(w.currentBid)}</td>
                  <td>${w.paymentStatus === 'Paid' ? '<span class="badge-square green">Paid & Settled</span>' : '<span style="color:#c44000; font-weight:700;">Payment Pending</span>'}</td>
                  <td>
                    ${w.paymentStatus === 'Paid'
                      ? '<span style="font-size:12px; color:#555;">Completed</span>'
                      : `<button type="button" class="btn-dash-action" onclick="window.__auctionApp.payAuction(${w.id})">Simulate Payment (INR)</button>`}
                  </td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>`;
    } else if (tabName === 'watchlist') {
      const saved = data.saved || [];
      if (saved.length === 0) {
        panel.innerHTML = '<div style="padding:20px; text-align:center; color:#666;">Your watchlist is currently empty.</div>';
        return;
      }
      panel.innerHTML = `
        <div class="dashboard-table-wrap">
          <table class="dashboard-table">
            <thead>
              <tr>
                <th>Lot Title</th>
                <th>Category</th>
                <th>Current Bid</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${saved.map(s => `
                <tr>
                  <td><strong>${escapeHtml(s.title)}</strong></td>
                  <td>${escapeHtml(s.category)}</td>
                  <td>${formatINR(s.currentBid)}</td>
                  <td><button type="button" class="btn-dash-action" onclick="window.__auctionApp.openLotModal(${s.id})">Bid Now</button></td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>`;
    } else if (tabName === 'listings') {
      const listings = data.myAuctions || data.listings || [];
      if (listings.length === 0) {
        panel.innerHTML = '<div style="padding:20px; text-align:center; color:#666;">No listings created yet. Click "+ Create Listing" to list an item.</div>';
        return;
      }
      panel.innerHTML = `
        <div class="dashboard-table-wrap">
          <table class="dashboard-table">
            <thead>
              <tr>
                <th>Item Title</th>
                <th>Current Bid</th>
                <th>Bids</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${listings.map(l => `
                <tr>
                  <td><strong>${escapeHtml(l.title)}</strong></td>
                  <td>${formatINR(l.currentBid)}</td>
                  <td>${l.bidCount}</td>
                  <td><span class="badge-round green">${escapeHtml(l.status)}</span></td>
                  <td>
                    ${l.bidCount === 0
                      ? `<button type="button" class="btn-dash-action" style="background:#ff3366; color:#fff;" onclick="window.__auctionApp.cancelListing(${l.id})">Cancel</button>`
                      : '<span style="font-size:12px; color:#777;">Active Bids</span>'}
                  </td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>`;
    } else if (tabName === 'create') {
      panel.innerHTML = `
        <form id="create-listing-form" style="display:flex; flex-direction:column; gap:12px; max-width:540px; margin:0 auto;">
          <div class="form-group">
            <label>Item Title</label>
            <input type="text" id="listing-title" class="auth-input" required placeholder="e.g. 1972 Leica M5 35mm Rangefinder" />
          </div>
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px;">
            <div class="form-group">
              <label>Category</label>
              <select id="listing-category" class="catalog-sort-select">
                ${state.categories.map(c => `<option value="${c.name}">${c.name}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label>Condition</label>
              <select id="listing-condition" class="catalog-sort-select">
                <option value="New">New</option>
                <option value="Excellent" selected>Excellent</option>
                <option value="Very good">Very good</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Used">Used</option>
                <option value="Refurbished">Refurbished</option>
              </select>
            </div>
          </div>
          <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:10px;">
            <div class="form-group">
              <label>Starting (₹)</label>
              <input type="number" id="listing-start-price" class="auth-input" required min="100" value="5000" />
            </div>
            <div class="form-group">
              <label>Increment (₹)</label>
              <input type="number" id="listing-increment" class="auth-input" required min="50" value="200" />
            </div>
            <div class="form-group">
              <label>Reserve (₹)</label>
              <input type="number" id="listing-reserve" class="auth-input" required min="100" value="6500" />
            </div>
          </div>
          <div class="form-group">
            <label>Location</label>
            <input type="text" id="listing-location" class="auth-input" required value="Mumbai, Maharashtra" />
          </div>
          <div class="form-group">
            <label>Image URL</label>
            <input type="url" id="listing-image" class="auth-input" required value="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=85" />
          </div>
          <div class="form-group">
            <label>Description</label>
            <textarea id="listing-description" class="auth-input" rows="3" required placeholder="Detailed condition, provenance, and specifications..."></textarea>
          </div>
          <button type="submit" class="btn-auth-submit">Publish Listing to Ledger</button>
        </form>`;

      document.getElementById('create-listing-form').addEventListener('submit', handleCreateListing);
    }
  }

  async function handleCreateListing(e) {
    e.preventDefault();
    const payload = {
      title: document.getElementById('listing-title').value.trim(),
      category: document.getElementById('listing-category').value,
      condition: document.getElementById('listing-condition').value,
      startingPrice: Number(document.getElementById('listing-start-price').value),
      minIncrement: Number(document.getElementById('listing-increment').value),
      reservePrice: Number(document.getElementById('listing-reserve').value),
      endDate: new Date(Date.now() + 7 * 86400000).toISOString(),
      location: document.getElementById('listing-location').value.trim(),
      image: document.getElementById('listing-image').value.trim(),
      description: document.getElementById('listing-description').value.trim()
    };

    try {
      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create listing');
      showToast(`Listing "${payload.title}" created successfully!`, 'success');
      loadDashboard();
      loadAuctions();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  async function cancelListing(id) {
    if (!confirm('Are you sure you want to cancel this listing?')) return;
    try {
      const res = await fetch(`/api/listings/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not cancel listing');
      showToast('Listing cancelled.', 'info');
      loadDashboard();
      loadAuctions();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  async function payAuction(id) {
    try {
      const res = await fetch(`/api/auctions/${id}/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auctionId: id })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Payment failed');
      showToast('Payment settled in demo ledger! Status updated to Paid.', 'success');
      loadDashboard();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  // 6. DBMS Architecture & Schema Tab Content
  function renderDbmsTab(tabName) {
    const wrap = document.getElementById('arch-tab-content');
    if (!wrap) return;

    document.querySelectorAll('.arch-tab-btn').forEach(b => {
      b.classList.toggle('is-active', b.dataset.archTab === tabName);
    });

    if (tabName === 'schema') {
      wrap.innerHTML = `
        <div class="schema-entities-grid">
          <div class="schema-entity-card">
            <div class="schema-entity-header"><span>1. USERS</span><span class="badge-square green">3NF</span></div>
            <div class="schema-entity-fields">
              <strong>PK:</strong> user_id INT AUTO_INCREMENT<br/>
              name VARCHAR(100) NOT NULL<br/>
              email VARCHAR(255) UNIQUE NOT NULL<br/>
              password_hash CHAR(128) NOT NULL<br/>
              role ENUM('Buyer','Seller','Both','Admin')<br/>
              status ENUM('Active','Blocked') DEFAULT 'Active'<br/>
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            </div>
          </div>
          <div class="schema-entity-card">
            <div class="schema-entity-header"><span>2. CATEGORY</span><span class="badge-square green">3NF</span></div>
            <div class="schema-entity-fields">
              <strong>PK:</strong> category_id INT AUTO_INCREMENT<br/>
              name VARCHAR(100) UNIQUE NOT NULL<br/>
              slug VARCHAR(100) UNIQUE NOT NULL<br/>
              description TEXT
            </div>
          </div>
          <div class="schema-entity-card">
            <div class="schema-entity-header"><span>3. ITEM</span><span class="badge-square green">3NF</span></div>
            <div class="schema-entity-fields">
              <strong>PK:</strong> item_id INT AUTO_INCREMENT<br/>
              <strong>FK:</strong> seller_id → USERS(user_id)<br/>
              <strong>FK:</strong> category_id → CATEGORY(category_id)<br/>
              title VARCHAR(255) NOT NULL<br/>
              condition_type VARCHAR(50)<br/>
              location VARCHAR(100)<br/>
              image_url TEXT
            </div>
          </div>
          <div class="schema-entity-card">
            <div class="schema-entity-header"><span>4. AUCTION</span><span class="badge-square green">3NF</span></div>
            <div class="schema-entity-fields">
              <strong>PK:</strong> auction_id INT AUTO_INCREMENT<br/>
              <strong>FK:</strong> item_id → ITEM(item_id) ON DELETE CASCADE<br/>
              starting_price DECIMAL(12,2) NOT NULL<br/>
              reserve_price DECIMAL(12,2) NOT NULL<br/>
              min_increment DECIMAL(10,2) DEFAULT 100.00<br/>
              current_bid DECIMAL(12,2) DEFAULT 0.00<br/>
              bid_count INT UNSIGNED DEFAULT 0<br/>
              <strong>FK:</strong> winner_id → USERS(user_id)<br/>
              status ENUM('Active','Closed','Cancelled')<br/>
              end_time DATETIME NOT NULL
            </div>
          </div>
          <div class="schema-entity-card">
            <div class="schema-entity-header"><span>5. BID</span><span class="badge-square green">3NF</span></div>
            <div class="schema-entity-fields">
              <strong>PK:</strong> bid_id BIGINT AUTO_INCREMENT<br/>
              <strong>FK:</strong> auction_id → AUCTION(auction_id)<br/>
              <strong>FK:</strong> bidder_id → USERS(user_id)<br/>
              amount DECIMAL(12,2) NOT NULL<br/>
              bid_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP<br/>
              is_winning BOOLEAN DEFAULT FALSE<br/>
              ip_address VARCHAR(45)
            </div>
          </div>
          <div class="schema-entity-card">
            <div class="schema-entity-header"><span>6. PAYMENT</span><span class="badge-square green">3NF</span></div>
            <div class="schema-entity-fields">
              <strong>PK:</strong> payment_id INT AUTO_INCREMENT<br/>
              <strong>FK:</strong> auction_id → AUCTION(auction_id)<br/>
              <strong>FK:</strong> payer_id → USERS(user_id)<br/>
              amount DECIMAL(12,2) NOT NULL<br/>
              payment_status ENUM('Pending','Paid','Failed')<br/>
              paid_at TIMESTAMP NULL
            </div>
          </div>
          <div class="schema-entity-card">
            <div class="schema-entity-header"><span>7. WATCHLIST</span><span class="badge-square green">3NF</span></div>
            <div class="schema-entity-fields">
              <strong>PK (Composite):</strong> (user_id, auction_id)<br/>
              <strong>FK:</strong> user_id → USERS(user_id) ON DELETE CASCADE<br/>
              <strong>FK:</strong> auction_id → AUCTION(auction_id) ON DELETE CASCADE<br/>
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            </div>
          </div>
          <div class="schema-entity-card">
            <div class="schema-entity-header"><span>8. AUDIT_LOG</span><span class="badge-square green">3NF</span></div>
            <div class="schema-entity-fields">
              <strong>PK:</strong> log_id BIGINT AUTO_INCREMENT<br/>
              event_type VARCHAR(50) NOT NULL<br/>
              user_id INT NULL<br/>
              auction_id INT NULL<br/>
              summary TEXT NOT NULL<br/>
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            </div>
          </div>
        </div>`;
    } else if (tabName === 'triggers') {
      wrap.innerHTML = `
        <div class="code-sql-card">
<span class="sql-com">-- TRIGGER: trg_bid_validate (Enforces Atomic Monotonic Bid Progression)</span>
<span class="sql-kw">DELIMITER</span> $$
<span class="sql-kw">CREATE TRIGGER</span> <span class="sql-fn">trg_bid_validate</span>
<span class="sql-kw">BEFORE INSERT ON</span> BID
<span class="sql-kw">FOR EACH ROW</span>
<span class="sql-kw">BEGIN</span>
    <span class="sql-kw">DECLARE</span> v_current_bid <span class="sql-kw">DECIMAL</span>(12,2);
    <span class="sql-kw">DECLARE</span> v_min_increment <span class="sql-kw">DECIMAL</span>(10,2);
    <span class="sql-kw">DECLARE</span> v_status <span class="sql-kw">VARCHAR</span>(20);
    <span class="sql-kw">DECLARE</span> v_seller_id <span class="sql-kw">INT</span>;
    <span class="sql-kw">DECLARE</span> v_end_time <span class="sql-kw">DATETIME</span>;

    <span class="sql-com">-- Lock the auction row with exclusive lock to eliminate race conditions</span>
    <span class="sql-kw">SELECT</span> a.current_bid, a.min_increment, a.status, a.end_time, i.seller_id
    <span class="sql-kw">INTO</span> v_current_bid, v_min_increment, v_status, v_end_time, v_seller_id
    <span class="sql-kw">FROM</span> AUCTION a
    <span class="sql-kw">JOIN</span> ITEM i <span class="sql-kw">ON</span> a.item_id = i.item_id
    <span class="sql-kw">WHERE</span> a.auction_id = NEW.auction_id
    <span class="sql-kw">FOR UPDATE</span>;

    <span class="sql-com">-- Constraint 1: Auction must be Active</span>
    <span class="sql-kw">IF</span> v_status != <span class="sql-str">'Active'</span> <span class="sql-kw">OR</span> NOW() > v_end_time <span class="sql-kw">THEN</span>
        <span class="sql-kw">SIGNAL SQLSTATE</span> <span class="sql-str">'45000'</span>
        <span class="sql-kw">SET MESSAGE_TEXT</span> = <span class="sql-str">'Violation: Auction is closed or expired.'</span>;
    <span class="sql-kw">END IF</span>;

    <span class="sql-com">-- Constraint 2: Prevent seller from self-bidding</span>
    <span class="sql-kw">IF</span> NEW.bidder_id = v_seller_id <span class="sql-kw">THEN</span>
        <span class="sql-kw">SIGNAL SQLSTATE</span> <span class="sql-str">'45000'</span>
        <span class="sql-kw">SET MESSAGE_TEXT</span> = <span class="sql-str">'Violation: Sellers cannot bid on their own items.'</span>;
    <span class="sql-kw">END IF</span>;

    <span class="sql-com">-- Constraint 3: Strict Minimum Bid Increment</span>
    <span class="sql-kw">IF</span> NEW.amount < (v_current_bid + v_min_increment) <span class="sql-kw">THEN</span>
        <span class="sql-kw">SIGNAL SQLSTATE</span> <span class="sql-str">'45000'</span>
        <span class="sql-kw">SET MESSAGE_TEXT</span> = <span class="sql-str">'Violation: Bid amount does not satisfy minimum increment.'</span>;
    <span class="sql-kw">END IF</span>;
<span class="sql-kw">END</span>$$
<span class="sql-kw">DELIMITER</span> ;
        </div>`;
    } else if (tabName === 'acid') {
      wrap.innerHTML = `
        <div style="background:#fff; border:1.5px solid #1a1a1a; border-radius:6px; padding:20px; box-shadow:3px 3px 0 #1a1a1a; font-family:'Space Grotesk', sans-serif; line-height:1.6;">
          <h4 style="margin-top:0; font-family:'Fkrasterromancompact Smooth', serif; font-size:22px; color:#350AFF;">ACID & Concurrency Architecture</h4>
          <p>The Auction Society eliminates bidding race conditions through three synchronized database layers:</p>
          <ul style="padding-left: 20px;">
            <li><strong>Serializable Transaction Isolation:</strong> All bid insertions run in serializable transaction blocks (<code>SET TRANSACTION ISOLATION LEVEL SERIALIZABLE</code>), preventing phantom reads and non-repeatable reads.</li>
            <li><strong>Row-Exclusive Locks (<code>SELECT ... FOR UPDATE</code>):</strong> When a concurrent bid begins, the target auction row is locked at the storage engine (InnoDB) level, ensuring simultaneous bids are queued and executed strictly sequentially.</li>
            <li><strong>Optimistic Concurrency Verification:</strong> The REST API verifies the <code>bidCount</code> counter before committing; if another concurrent bid was recorded in the same millisecond, the slower transaction is rolled back with an optimistic lock error.</li>
            <li><strong>Zero-Balance Settlement:</strong> Winner evaluation and payments are recorded in idempotent, double-entry audit records.</li>
          </ul>
        </div>`;
    } else if (tabName === 'views') {
      wrap.innerHTML = `
        <div class="code-sql-card">
<span class="sql-com">-- VIEW: active_auctions_view (Real-time public lot query view)</span>
<span class="sql-kw">CREATE OR REPLACE VIEW</span> <span class="sql-fn">active_auctions_view</span> <span class="sql-kw">AS</span>
<span class="sql-kw">SELECT</span> 
    a.auction_id,
    i.title,
    c.name <span class="sql-kw">AS</span> category,
    i.condition_type,
    a.current_bid,
    a.min_increment,
    a.bid_count,
    a.end_time,
    u.name <span class="sql-kw">AS</span> seller_name,
    i.location,
    i.image_url
<span class="sql-kw">FROM</span> AUCTION a
<span class="sql-kw">JOIN</span> ITEM i <span class="sql-kw">ON</span> a.item_id = i.item_id
<span class="sql-kw">JOIN</span> CATEGORY c <span class="sql-kw">ON</span> i.category_id = c.category_id
<span class="sql-kw">JOIN</span> USERS u <span class="sql-kw">ON</span> i.seller_id = u.user_id
<span class="sql-kw">WHERE</span> a.status = <span class="sql-str">'Active'</span> <span class="sql-kw">AND</span> a.end_time > NOW();
        </div>`;
    }
  }

  // 7. System Log & Live Admin Desk
  async function loadSystemLog() {
    const term = document.getElementById('system-log-terminal');
    if (!term) return;

    try {
      term.innerHTML = '<div style="color:#777;">Querying SQL transaction ledger...</div>';
      const res = await fetch('/api/admin/dashboard');
      if (res.ok) {
        const adminData = await res.json();
        const logs = adminData.audit || adminData.auditLog || [];
        if (logs.length === 0) {
          term.innerHTML = '<div style="color:#777;">No audit events in ledger buffer.</div>';
        } else {
          term.innerHTML = logs.map(l => {
            const time = new Date(l.at || l.time || Date.now()).toLocaleTimeString('en-IN');
            const action = l.action || l.type || 'TX_COMMIT';
            const actor = l.actor ? `[${l.actor}] ` : '';
            const summary = l.summary || `${(l.tableName || 'LEDGER').toUpperCase()} #${l.recordId || l.id}`;
            return `<div class="log-entry-row"><span class="log-time">[${escapeHtml(time)}]</span> <span class="log-type">[${escapeHtml(action)}]</span> <span class="log-msg">${escapeHtml(actor)}${escapeHtml(summary)}</span></div>`;
          }).join('');
        }

        // Show admin tools if user is Admin
        const adminSection = document.getElementById('admin-desk-section');
        if (adminSection) {
          adminSection.style.display = 'block';
          renderAdminDesk(adminData);
        }
      } else {
        // Fallback: generate simulated ledger entries from current auctions
        term.innerHTML = state.auctions.map(a => {
          const time = new Date().toLocaleTimeString('en-IN');
          return `<div class="log-entry-row"><span class="log-time">[${escapeHtml(time)}]</span> <span class="log-type">[SQL_TX_SYNC]</span> <span class="log-msg">Lot #${a.id} "${escapeHtml(a.title)}" Current Bid: ${formatINR(a.currentBid)} (${a.bidCount} bids) - Status: ${escapeHtml(a.status)}</span></div>`;
        }).join('');
      }
    } catch {
      term.innerHTML = '<div style="color:#ff3366;">Error querying transaction ledger.</div>';
    }
  }

  function renderAdminDesk(adminData) {
    const catList = document.getElementById('admin-category-list');
    if (catList && adminData.categories) {
      catList.innerHTML = adminData.categories.map(c => `
        <div style="display:flex; justify-content:space-between; align-items:center; padding:4px 0; border-bottom:1px solid #eee; font-size:13px;">
          <span>${escapeHtml(c.name)}</span>
          <button type="button" style="background:#ff3366; color:#fff; border:none; padding:2px 8px; border-radius:3px; cursor:pointer;" onclick="window.__auctionApp.deleteCategory(${c.id})">Del</button>
        </div>`).join('');
    }

    const userList = document.getElementById('admin-users-list');
    if (userList && adminData.users) {
      userList.innerHTML = adminData.users.map(u => `
        <div style="display:flex; justify-content:space-between; align-items:center; padding:4px 0; border-bottom:1px solid #eee; font-size:13px;">
          <span><strong>${escapeHtml(u.name)}</strong> (${escapeHtml(u.role)}) - ${escapeHtml(u.status)}</span>
          <button type="button" style="background:#350AFF; color:#fff; border:none; padding:2px 8px; border-radius:3px; cursor:pointer;" onclick="window.__auctionApp.toggleUserStatus(${u.id}, '${u.status === 'Active' ? 'Blocked' : 'Active'}')">
            ${u.status === 'Active' ? 'Block' : 'Unblock'}
          </button>
        </div>`).join('');
    }
  }

  async function deleteCategory(id) {
    if (!confirm('Delete this category?')) return;
    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Cannot delete category');
      showToast('Category deleted.', 'info');
      loadSystemLog();
      loadCategories();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  async function toggleUserStatus(id, newStatus) {
    try {
      const res = await fetch(`/api/admin/users/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update user');
      showToast(`User status updated to ${newStatus}.`, 'info');
      loadSystemLog();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  // Initialization & Event Attachments
  function initApp() {
    // 1. Check Session & Load Catalog
    checkAuth();
    loadCategories();
    loadAuctions();

    // Auto-initialize DBMS Architecture view if present
    if (document.getElementById('arch-tab-content')) {
      const hash = window.location.hash.replace('#', '');
      const initialTab = ['schema', 'triggers', 'acid', 'views'].includes(hash) ? hash : 'schema';
      renderDbmsTab(initialTab);
    }

    // Auto-initialize System Log view if present
    if (document.getElementById('system-log-terminal')) {
      loadSystemLog();
    }

    // 2. Extending Navigation links: close nav when clicking internal/anchor links
    document.querySelectorAll('.twostep-nav__link').forEach(link => {
      link.addEventListener('click', () => {
        const nav = document.querySelector('[data-nav-status]');
        if (nav) nav.setAttribute('data-nav-status', 'not-active');
      });
    });

    // 3. Close Buttons on Modals
    document.getElementById('lot-modal-close')?.addEventListener('click', () => closeModal('lot-bid-modal'));
    document.getElementById('account-modal-close')?.addEventListener('click', () => closeModal('account-modal'));
    document.getElementById('dbms-modal-close')?.addEventListener('click', () => closeModal('dbms-arch-modal'));
    document.getElementById('system-log-modal-close')?.addEventListener('click', () => closeModal('system-log-modal'));

    // 5. Close on Backdrop Click
    document.querySelectorAll('.crt-modal-backdrop').forEach(backdrop => {
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) {
          closeAllModals();
        }
      });
    });

    // 6. Escape Key Listener
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeAllModals();
    });

    // 7. Search & Filter Bar
    const searchInput = document.getElementById('catalog-search-input');
    if (searchInput) {
      let debounceTimer;
      searchInput.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          state.searchQuery = searchInput.value.trim();
          loadAuctions();
        }, 220);
      });
    }

    const sortSelect = document.getElementById('catalog-sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', () => {
        state.sortBy = sortSelect.value;
        loadAuctions();
      });
    }

    // 8. Wire Quick Bid Increment Buttons
    document.querySelectorAll('.quick-bid-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const inc = Number(btn.dataset.inc);
        const input = document.getElementById('bid-amount-input');
        if (input && state.activeLot) {
          input.value = (Number(input.value) || state.activeLot.currentBid) + inc;
        }
      });
    });

    // 9. Wire Lot Bid Form Submit
    document.getElementById('lot-bid-form')?.addEventListener('submit', handleBidSubmit);

    // 10. Wire Watchlist button in Lot Modal
    document.getElementById('lot-modal-watchlist-btn')?.addEventListener('click', () => {
      if (state.activeLot) toggleWatchlist(state.activeLot.id);
    });

    // 11. Wire Auth Forms & Tabs
    document.getElementById('tab-btn-login')?.addEventListener('click', () => {
      document.getElementById('tab-btn-login').classList.add('is-active');
      document.getElementById('tab-btn-register').classList.remove('is-active');
      document.getElementById('form-login').classList.add('is-visible');
      document.getElementById('form-register').classList.remove('is-visible');
    });

    document.getElementById('tab-btn-register')?.addEventListener('click', () => {
      document.getElementById('tab-btn-register').classList.add('is-active');
      document.getElementById('tab-btn-login').classList.remove('is-active');
      document.getElementById('form-register').classList.add('is-visible');
      document.getElementById('form-login').classList.remove('is-visible');
    });

    document.getElementById('form-login')?.addEventListener('submit', handleLogin);
    document.getElementById('form-register')?.addEventListener('submit', handleRegister);
    document.getElementById('btn-logout')?.addEventListener('click', handleLogout);

    // 12. Wire Dashboard Tabs
    document.querySelectorAll('.dash-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => renderDashboardTab(btn.dataset.dashTab));
    });

    // 13. Wire DBMS Architecture Tabs
    document.querySelectorAll('.arch-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => renderDbmsTab(btn.dataset.archTab));
    });

    // 14. Wire System Log Refresh
    document.getElementById('btn-refresh-log')?.addEventListener('click', loadSystemLog);

    // 15. Wire Admin Add Category
    document.getElementById('admin-add-cat-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const input = document.getElementById('admin-new-cat-name');
      const name = input.value.trim();
      if (!name) return;
      try {
        const res = await fetch('/api/admin/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to add category');
        input.value = '';
        showToast(`Category "${name}" added.`, 'success');
        loadSystemLog();
        loadCategories();
      } catch (err) {
        showToast(err.message, 'error');
      }
    });

    // 16. Wire Featured Lots "Place Bid" buttons to open lot modal
    document.querySelectorAll('.section-6 .btn-bubble-arrow').forEach((btn, index) => {
      btn.addEventListener('click', (e) => {
        if (document.getElementById('lot-bid-modal')) {
          e.preventDefault();
          const lotId = index + 1; // Lot 1, 2, 3
          openLotModal(lotId);
        }
      });
    });

    // 17. Periodic countdown ticker (every 10 seconds)
    setInterval(() => {
      document.querySelectorAll('.lot-card').forEach(card => {
        const lotId = Number(card.dataset.lotId);
        const lot = state.auctions.find(a => a.id === lotId);
        if (lot) {
          const isClosed = lot.status === 'Closed' || Date.now() >= lot.endsAt;
          const timerEl = card.querySelector('.lot-card-timer');
          if (timerEl) {
            timerEl.textContent = isClosed ? 'Closed' : formatCountdown(lot.endsAt - Date.now());
          }
        }
      });
    }, 10000);
  }

  // Export functions to global scope for inline button handlers
  window.__auctionApp = {
    openModal,
    closeModal,
    openLotModal,
    payAuction,
    cancelListing,
    deleteCategory,
    toggleUserStatus
  };

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
})();
