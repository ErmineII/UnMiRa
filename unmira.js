var unmira = {
  graphics: {},
  cmds: {
    /** commands to be pushed on unmira.state.queue
     * (like vm instructions)
     */
    readline: function () {
      var input = unmira.state.input;
      unmira.state.running = false;
      input.waiting = true; // wait for input
    },
    getchar: function () {
      unmira.state.running = false;
      if (unmira.state.input.buf.length) {
        unmira.stack.push(unmira.state.input.buf[0][0] || "\n"); // first char
        unmira.state.running = true; // continue
      } else {
        unmira.state.input.getchar = true; // wait for input
      }
    },
    draw: function () {
      unmira.graphics.setScreen(unmira.state.stack.pop());
      unmira.state.running = true;
    },
    print: function () {
      unmira.state.termBuf += unmira.state.stack.pop();
      unmira.state.running = true;
    },
    puts: function () {
      unmira.state.termBuf += unmira.state.stack.pop() + "\n";
      unmira.state.running = true;
    },
    _print: function (str) {
      return function () {
        unmira.state.termBuf += str;
        unmira.state.running = true;
      };
    },
    _push: function (data) {
      return function () {
        unmira.state.stack.push(data);
        unmira.state.running = true;
      };
    },
    dup: function () {
      unmira.state.stack.push(
        unmira.state.stack[unmira.state.stack.length - 1]
      );
      unmira.state.running = true;
    },
    drop: function () {
      unmira.state.stack.pop();
      unmira.state.running = true;
    },
    _do: function (fn) {
      return function () {
        fn();
        unmira.state.running = true;
      };
    },
    halt: function () {
      window.clearInterval(unmira.state.interval);
      delete unmira.state.interval;
    },
    skip: function () {
      unmira.state.queue = unmira.state.queue.slice(unmira.state.stack.pop());
      unmira.state.running = true;
    },
    _loop: function (body, label) {
      var loop = function () {
        unmira.state.queue = body.concat(unmira.state.queue);
        unmira.state.running = true;
      };
      loop.label = label || "break";
      body.push(loop);
      return loop;
    },
    _goto: function (label) {
      return function () {
        while (unmira.state.queue.shift().label !== label) {}
        unmira.state.running = true;
      };
    },
    _label: function (label) {
      var f = function () {
        unmira.state.running = true;
      };
      f.label = label;
      return f;
    },
    screen: function () {
      unmira.state.stack.push(unmira.graphics.screen.value);
      unmira.state.running = true;
    },
    screen_editable: function () {
      unmira.graphics.screen.readOnly = !unmira.state.stack.pop();
      unmira.state.running = true;
    }
  }
};

unmira.freshstate = function () {
  unmira.state = {
    queue: [],
    screenBuf: "",
    termBuf: "",
    data: {},
    stack: [],
    running: false,
    handlers: {
      keydown: [],
      keyup: []
    },
    input: {
      buf: [[]],
      waiting: false,
      getchar: false,
      line: 0,
      char: 0
    }
  };
};

unmira.header = `-----A-A------
|| n IV Ii [)a
\`'-------- I\\-`;

unmira.logo = ` AAAAAAAAA 
( _______ )
( I      I)
( Iu n m I)
( I      I)
( Ii r a I)
( I      I)
( l______I)
(         )
 VVVVVVVVV`;

unmira.run = function () {
  unmira.state.running = false;
  unmira.state.queue.shift()(); // run the front of the command queue
  if (unmira.state.interval === undefined) {
    unmira.keepRunning();
  }
};

unmira.freshstate();
