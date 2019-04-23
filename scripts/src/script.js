"use strict";
// global utils 
function makeSafeId(text) {
  return text.replace(/[ \)\(,\.]/g, '-').toLowerCase();
}

(function () {
  window.onload = function () {
    document.querySelector('#restart').onclick = restart;

    animate();
    window.onscroll = animate;
    let ar = document.querySelectorAll(".down-arrow");
    setTimeout(function () {
      ar[0].style.opacity = 1;
    }, 600);
    setTimeout(function () {
      ar[1].style.opacity = 1;
    }, 3000);
  }



  function animate() {
    let top = window.scrollY;
    let content = document.querySelector("header .container");
    let guide = document.querySelector(".dropdown");
    content.style.opacity = 0;
    let contentBottom = content.getBoundingClientRect().bottom;

    let h = document.querySelector("header");

    if (window.scrollY > 400) {
      content.style.opacity = ((top - 400) / 300);
    } else {
      h.style.color = d3.interpolateRgb("#f442e8", "rgb(255,255,255)")(window.scrollY / 200);
    }
    if (contentBottom < 50) {
      h.classList.remove('intro');
      content.classList.add('gone');
      guide.classList.remove('hidden');
      document.querySelector('#restart').classList.remove('hidden');
      setTimeout(function () {
        window.scrollTo(0, 0);
      }, 1000);

      function noscroll() {
        window.scrollTo(0, 0);
      }

      // add listener to disable scroll
      window.onscroll = (e) => {
        e.preventDefault();
        window.scrollTo(0, 0);
        return false;
      }


      setTimeout(function () {
        window.onscroll = null;
        window.scrollTo(0, 0);
        window.addEventListener('scroll', mapParallax)

      }, 100);

      document.querySelectorAll(".down-arrow")[0].style.display = "none";
      document.querySelectorAll(".down-arrow")[1].style.display = "none";
    }

  }


  function mapParallax() {
    let map = document.querySelector("#maparea");
    let mapControls = document.querySelector("#mapcontrols");
    let scroll = d3.interpolate(50, 0)(window.scrollY / 2000);
    map.style.transform = "translateY(" + scroll + "px)";
    mapControls.style.transform = "translateY(" + (scroll + 5) + "px)";
  }

  function restart() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    //    document.location.reload(false); // force restart
    let ars = document.querySelectorAll(".down-arrow");
    ars[0].style.opacity = 1;
    ars[1].style.opacity = 1;
    
    let content = document.querySelector("header .container");
    let guide = document.querySelector(".dropdown");
    document.querySelector('#restart').classList.add('hidden');
    content.style.opacity = 0;
    let contentBottom = content.getBoundingClientRect().bottom;

    let h = document.querySelector("header");
    h.classList.add('intro')
    guide.classList.add('hidden');
    content.classList.remove('gone');
    window.onscroll = animate;
  }
})();
