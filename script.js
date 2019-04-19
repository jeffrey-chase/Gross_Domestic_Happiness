"use strict";
// global utils 
function makeSafeId(text) {
  return text.replace(/[ \)\(,\.]/g, '-').toLowerCase();
}

(function () {
  window.onload = function () {
    animate();
    window.onscroll = animate;
    let ar = document.querySelector("#down-arrow");
    setTimeout(function () {
      ar.style.opacity = 1;
    }, 600);

  }



  function animate() {
    let top = window.scrollY;
    let content = document.querySelector("header .container");
    let guide = document.querySelector(".dropdown");
    content.style.opacity = 0;
    guide.classList.add('hidden')
    let contentBottom = content.getBoundingClientRect().bottom;
    
    let h = document.querySelector("header");

    if (window.scrollY > 400) {
      content.style.opacity = ((top - 400) / 300);
    } else {
      h.style.color = d3.interpolateRgb("#f442e8", "rgb(255,255,255)")(window.scrollY / 200);
    }
    if (window.scrollY > contentBottom + window.innerHeight) {
      h.classList.remove('intro');
      content.classList.add('gone');
      guide.classList.remove('hidden');
      setTimeout(function () {
        window.scrollTo(0, 0);
      }, 1000);

      function noscroll() {
        window.scrollTo(0, 0);
      }

      // add listener to disable scroll
      window.onscroll = () => {
        window.scrollTo(0, 0)
      }


      setTimeout(function () {
        window.onscroll = mapParallax;

      }, 100);

      document.querySelector("#down-arrow").style.display = "none";

    }

  }

  function mapParallax() {
    let map = document.querySelector("#maparea");
    let mapControls = document.querySelector("#mapcontrols");
    let scroll = d3.interpolate(75, 10)(window.scrollY / 2000);
    map.style.transform = "translateY(" + scroll + "px)";
    mapControls.style.transform = "translateY(" + (scroll + 5)+ "px)";
  }
})();
