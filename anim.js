var unmira = window.unmira;

unmira.state.data["anim"] = {
  run: function () {
    const loop = function () {
      unmira.state.queue.unshift(
        unmira.cmds.readline,
        unmira.cmds.screen,
        unmira.state.data.anim.docmd,
        loop
      );
      unmira.run();
    };
    unmira.state.queue.unshift(
      unmira.cmds._push(true),
      unmira.cmds.screen_editable,
      unmira.cmds._print(`Commands: .\n`),
      loop
    );
    unmira.run();
  },
  docmd: function () {
    const snapshot = unmira.state.stack.pop();
    const cmd = unmira.state.stack.pop();
    switch (cmd) {
      case "next":
        unmira.state.data.anim.animation.push(snapshot);
        break;
      case "play":
        unmira.state.queue.unshift(unmira.state.data.anim.playframe(0));
        break;
      case "save":
        const a = document.createElement("a");
        a.href =
          "data:application/x-download;charset=utf-8," +
          encodeURIComponent(JSON.stringify(unmira.state.data.anim.animation));
        a.download = "animation.json";
        document.body.appendChild(a);
        a.click();
        break;
      default:
        unmira.state.queue.push(unmira.cmds._print("unknown command: " + cmd));
    }
    unmira.state.running = true;
  },
  playframe: function (frame) {
    return function () {
      if (frame >= unmira.state.data.anim.animation.length) {
        unmira.state.running = true;
        return;
      }
      unmira.state.queue.unshift(
        unmira.cmds._push(unmira.state.data.anim.animation[frame]),
        unmira.cmds.draw,
        unmira.state.data.anim.playframe(frame + 1)
      );
      unmira.state.running = true;
    };
  },
  animation: []
};
