var unmira = window.unmira;
unmira.graphics.screen = document.getElementById("screen");
unmira.graphics.term = document.getElementById("term");
unmira.graphics.all = document.getElementById("interface");

unmira.graphics.setScreen = function (contents) {
  unmira.graphics.screen.value = contents;
};

unmira.graphics.setTerm = function (contents) {
  unmira.graphics.term.value = contents;
  unmira.graphics.term.scrollTop = unmira.graphics.term.scrollHeight;
};

unmira.fixCursor = function () {
  var state = unmira.state.input;

  if (state.line < 0) {
    state.line = 0;
    if (state.buf[0].length > 0) state.buf.unshift([]);
  }
  if (state.line >= state.buf.length) state.line = state.buf.length - 1;
  if (state.char < 0) state.char = state.buf[state.line].length;
  if (state.char > state.buf[state.line].length) state.char = 0;
  state.buf[state.line] ||= [];
};

unmira.graphics.term.onkeydown = function (k) {
  var state = unmira.state.input;
  unmira.fixCursor();

  unmira.state.handlers.keydown.forEach(function (f) {
    f(k.key);
  });

  switch (k.key) {
    case "Enter":
      if (state.waiting) {
        unmira.state.stack.push(state.buf[state.line].join(""));
        if (state.buf[0].length) state.buf.unshift([]);
        state.line = 0;
        state.waiting = false;
        return unmira.run();
      } else {
        if (state.buf[0].length) state.buf.unshift([]);
        state.line = 0;
      }
      if (state.line) {
        state.line = 0;
        /** TODO: remove duplicate lines here
         * this is probably pretty slow because it requires comparing
         * each line structurally.
         * */
      }
      break;
    case "Backspace":
      state.buf[state.line].splice(--state.char, 1);
      if (state.char < 0) state.char = 0;
      return;
    case "ArrowUp":
      state.line++;
      break;
    case "ArrowDown":
      state.line--;
      break;
    case "ArrowLeft":
      state.char--;
      break;
    case "ArrowRight":
      state.char++;
      break;
    default:
      if (k.key.length === 1) {
        state.buf[state.line].splice(state.char++, 0, k.key);
      }
  }
  if (state.getchar) {
    state.getchar = false;
    return unmira.cmds.getchar();
  }
};

unmira.graphics.term.onkeyup = function (k) {
  unmira.fixCursor();
  unmira.state.handlers.keyup.forEach(function (f) {
    f(k.key);
  });
};

unmira.keepRunning = function () {
  unmira.state.interval = window.setInterval(function () {
    if (unmira.state.running) unmira.run();
  });
};
