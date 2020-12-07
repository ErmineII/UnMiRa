var unmira = window.unmira;

unmira.state.handlers.keyup.push(function (_) {
  unmira.state.data["term"].update();
});

unmira.state.data["term"] = {
  keyupHandlerIndex: unmira.state.handlers.keyup.length - 1,
  run: function () {
    unmira.state.queue.push(
      unmira.cmds._print(`Welcome to the unmira console. Try 'help'.\n`),
      unmira.state.data["term"].readeval_cmd
    );
    unmira.run();
  },
  cmds: {
    not: function () {
      unmira.state.stack.push(unmira.state.stack.pop() ? 0 : 1);
      unmira.state.running = true;
    },
    "+": function () {
      var fst = unmira.state.stack.pop();
      unmira.state.stack.push(unmira.state.stack.pop() + fst);
      unmira.state.running = true;
    },
    "*": function () {
      var fst = unmira.state.stack.pop();
      unmira.state.stack.push(unmira.state.stack.pop() * fst);
      unmira.state.running = true;
    },
    "/": function () {
      var fst = unmira.state.stack.pop();
      unmira.state.stack.push(unmira.state.stack.pop() / fst);
      unmira.state.running = true;
    },
    "-": function () {
      var fst = unmira.state.stack.pop();
      unmira.state.stack.push(unmira.state.stack.pop() - fst);
      unmira.state.running = true;
    },
    int: function () {
      unmira.state.stack.push(parseInt(unmira.state.stack.pop(), 10));
      unmira.state.running = true;
    },
    nl: unmira.cmds._push("\n"),
    stack: function () {
      unmira.state.stack.push(unmira.state.stack.join(", "));
      unmira.state.running = true;
    },
    "[": function () {
      var compiled = [];
      var nesting = 1;
      var cmd = unmira.state.queue.shift();
      while (nesting) {
        if (cmd === "]") nesting--;
        else {
          if (cmd === unmira.state.data["term"]["["]) nesting++;
          compiled.push(cmd);
          cmd = unmira.state.queue.shift();
        }
      }
      unmira.state.stack.push(compiled);
      unmira.state.running = true;
    },
    "]": "]",
    _get: function (varname) {
      return function () {
        unmira.state.stack.push(unmira.state.data["term"].words[varname]);
        unmira.state.running = true;
      };
    },
    _set: function (varname) {
      return function () {
        unmira.state.data["term"].words[varname] = unmira.state.stack.pop();
        unmira.state.running = true;
      };
    },
    _run: function (cmdname) {
      return function () {
        unmira.state.queue = unmira.state.data["term"].words[cmdname].concat(
          unmira.state.queue
        );
        unmira.state.running = true;
      };
    },
    help: unmira.cmds._print(`UnMiRa term: a forth-like interactive shell
basic syntax:
!<var>, @<var>: set, get value of variable
[ <code> ] !<word>: define word
<word>, _<program>: call word, program
" <multi word string> ": literal string
'<singlewordquoting>: another literal string
\\: comment (no parenthesis comments yet)

use 'list' command to list commands
`),
    list: function () {
      try {
        unmira.state.queue.unshift(
          unmira.cmds._print("_" + Object.keys(unmira.state.data).join(" _")),
          unmira.cmds._print(
            "\n@" + Object.keys(unmira.state.data["term"].words).join(" @")
          ),
          unmira.cmds._print(
            "\n" +
              Object.keys(unmira.state.data["term"].cmds)
                .concat(Object.keys(unmira.cmds))
                .filter(function (z) {
                  return z[0] !== "_";
                })
                .join(" ") +
              "\n"
          )
        );
      } catch (s) {
        console.log(s);
      } finally {
        unmira.state.running = true;
      }
    },
    dowhile: function () {
      var body = unmira.state.stack.pop();
      body.push(function () {
        if (unmira.state.stack.pop()) {
          unmira.state.queue = body.concat(unmira.state.queue);
        }
        unmira.state.running = true;
      });
      unmira.state.queue = body.concat(unmira.state.queue);
      unmira.state.running = true;
    }
  },
  words: {
    prompt: "> ",
    source: ` S-,   S-,
 |S' O \`,|
 ||  |  ||
S'|O D=Q|\`,
\`,|| W  |S'
 ||D-D-O||
 |\`, W S'|
 \`-' " \`-'`,
    cursor: "|"
  },
  update: function () {
    if (unmira.state.input.buf[unmira.state.input.line]) {
      var tmp = unmira.state.input.buf[unmira.state.input.line].slice();
      tmp.splice(
        unmira.state.input.char,
        0,
        unmira.state.data["term"].words.cursor
      );
      unmira.graphics.setTerm(unmira.state.termBuf + tmp.join(""));
    } else
      unmira.graphics.setTerm(
        unmira.state.termBuf + unmira.state.data["term"].words.cursor
      );
  },
  cleanup: function () {
    delete unmira.state.handlers.keyup[
      unmira.state.data["term"].keyupHandlerIndex
    ];
    delete unmira.state.data["term"];
  },
  readeval_cmd: function () {
    var data = unmira.state.data["term"];
    if (!data) {
      unmira.state.running = true; //do nothing
      return;
    }
    unmira.state.queue.push(
      unmira.cmds._push(data.words.prompt),
      unmira.cmds.print,
      unmira.cmds._do(data.update),
      unmira.cmds.readline,
      unmira.cmds.dup,
      unmira.cmds.puts,
      data.runstring_cmd,
      data.readeval_cmd
    );
    unmira.state.running = true;
  },
  runstring_cmd: function () {
    // actually evaluate the input at the terminal
    var commands = unmira.state.stack.pop();
    if (commands === "END!") {
      unmira.state.data["term"].cleanup();
      unmira.state.running = true;
      return;
    }
    commands = commands.split(" ");
    var cmd;
    while (commands.length) {
      cmd = commands.shift();
      if (cmd === "") {
        continue;
      } else if (cmd[0] === '"') {
        cmd = cmd.split("").reverse().join("");
        var stringbit = "";
        var nextbit = commands.shift();
        while (nextbit !== cmd) {
          if (!commands.length) {
            unmira.state.queue.unshift(
              unmira.cmds._print("ERROR: unfinished string \n")
            );
            break;
          }
          stringbit += " " + nextbit;
          nextbit = commands.shift();
        }
        unmira.state.queue.push(unmira.cmds._push(stringbit.substring(1)));
      } else if (cmd[0] === "'") {
        unmira.state.queue.push(unmira.cmds._push(cmd.substring(1)));
      } else if (cmd[0] === "\\") {
        break;
      } else if (cmd[0] === "!") {
        unmira.state.queue.push(
          unmira.state.data["term"].cmds._set(cmd.substring(1))
        );
      } else if (cmd[0] === "@") {
        unmira.state.queue.push(
          unmira.state.data["term"].cmds._get(cmd.substring(1))
        );
      } else if (cmd[0] === "_") {
        var prog = unmira.state.data[cmd.substring(1)];
        if (prog === undefined) {
          unmira.state.queue.unshift(
            unmira.cmds._print("ERROR: not installed \n")
          );
        } else if (prog.run === undefined) {
          unmira.state.queue.unshift(
            unmira.cmds._print("ERROR: not executable \n")
          );
        } else {
          prog.run();
        }
      } else if (!isNaN(parseInt(cmd, 10))) {
        unmira.state.queue.push(unmira.cmds._push(parseInt(cmd, 10)));
      } else if (unmira.state.data["term"].words[cmd] !== undefined) {
        if (unmira.state.data["term"].words[cmd].reverse === undefined)
          unmira.state.queue.unshift(
            unmira.cmds._print("ERROR: can't call @" + cmd + "\n")
          );
        else unmira.state.queue.push(unmira.state.data["term"].cmds._run(cmd));
      } else {
        unmira.state.queue.push(
          unmira.state.data["term"].cmds[cmd] ||
            unmira.cmds[cmd] ||
            unmira.cmds._print("ERROR: unknown command: '" + cmd + "'\n")
        );
      }
    }
    unmira.state.running = true;
  }
};
