"use strict";

function makeSafeId(text) {
    return text.replace(/[ \)\(,\.]/g, '-').toLowerCase();
  }