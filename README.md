# UnMiRa\*

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

\* this can be changed with `unmira.cmds.screen_editable`

