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
      unmira.cmds._print(
        "Commands: next(or blank), play, save, upload, del.\n"
      ),
      loop
    );
    unmira.run();
  },
  docmd: function () {
    const snapshot = unmira.state.stack.pop();
    const cmd = unmira.state.stack.pop();
    switch (cmd) {
      case "next":
      case "":
        unmira.state.data.anim.animation.push(snapshot);
        unmira.state.queue.unshift(
          unmira.cmds._print(
            "now on frame #" + unmira.state.data.anim.animation.length + "\n"
          )
        );
        break;
      case "del":
        unmira.state.data.anim.animation.pop();
        unmira.state.queue.unshift(
          unmira.cmds._print(
            "now on frame #" + unmira.state.data.anim.animation.length + "\n"
          )
        );
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
      case "upload":
        const f = document.createElement("input");
        f.type = "file";
        f.onchange = function () {
          if (f.files.length <= 0) {
            return false;
          }
          const fr = new FileReader();
          fr.onload = function (e) {
            unmira.state.data.anim.animation = JSON.parse(e.target.result);
            f.remove();
          };
          fr.readAsText(f.files.item(0));
        };
        document.body.prepend(f);
        unmira.state.queue.unshift(
          unmira.cmds._print("Use the file input at the top of the page ^\n")
        );
        break;
      default:
        unmira.state.queue.push(
          unmira.cmds._print("unknown command: " + cmd + "\n")
        );
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
        unmira.cmds._push(unmira.state.data.anim.animation[Math.floor(frame)]),
        unmira.cmds.draw,
        unmira.state.data.anim.playframe(frame + 0.2) // half the speed
      );
      unmira.state.running = true;
    };
  },
  animation: []
};
