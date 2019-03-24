"use strict";
// global utils 
function makeSafeId(text) {
    return text.replace(/[ \)\(,\.]/g, '-').toLowerCase();
  }

(function(){
  window.onload = function(){
    document.querySelector('header').classList.add("intro");
    document.querySelector('header p').classList.add("hidden");
  }
  
  
  window.onscroll = animate;
  
  function animate(ev) {
    let top = window.scrollY;
    console.log(top);
    let p = document.querySelector("header p");
    let h = document.querySelector("header");
    if (window.scrollY > 400){
      p.style.opacity = (top - 300) / 300
    } 
    if (window.scrollY > 800){
      console.log('removing');
      h.classList.remove('intro');
      p.classList.add('gone');
      setTimeout(function(){window.scrollTo(0, 0);}, 1000);
      window.onscroll = null;
    }
    
  }
})();