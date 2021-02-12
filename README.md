# UnMiRa\*

[use the unmira machine](unmira.html)
(right now UnMiRa is a virtual machine, a forth-like shell, and a ascii-art font)

![logo](/logo.png)

- `fg.js`: all the input/output/HTML-specific stuff. If someone wanted to
  port it to a new platform, this is what they would change
- `term.js`: the shell
- `unmira.js`: the queue machine

\*uncooked mini ravioli

## the queue machine

Housed in [unmira.js](unmira.js) is `unmira.state.queue`. Each tick of
the interval UnMiRa starts will execute the function at the beginning
of the queue. A UnMiRa program can manipulate this queue and can loop
by enqueuing a function that will enqueue itself. Data is stored in
`unmira.state.stack`. Each function in the queue should set
`unmira.state.running = true` at the end.

## the "screen"

This is just a `readonly`\* `<textarea>` with [an ascii art font](bigpix-Regular.otf)
that can be drawn on. Try `@source draw` in the shell.

\* this can be changed with `unmira.cmds.screen_editable` which will make it
editable if it pops a true value

## programs

The one available package/program is `anim` in [`anim.js`](anim.js). In the
shell, type `_anim` to start it. There is currently no way to exit. For each
frame, edit the screen as text, then type next or a blank line in the console.
`save` saves the animation as json. `upload` places a file upload button at
the top of the page to upload a .json file. `play` plays the animation, `del`
deletes the last frame. I'd add more features if I wasn't pressed for time,
but I will if you ask me, and you can fork it.

## contributing

Feel free to copy, this is public domain. I'll probably add your changes, and
if necessary I can change the license to something else if you want protection
and your changes are substantial enough.
