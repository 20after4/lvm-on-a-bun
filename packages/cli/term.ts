import * as Bun from 'bun';
import * as lipgloss from 'blipgloss';
const csi = '\x1b[';

export enum TermAttr {
    ALL_OFF = 0,
    BOLD = 1,
    UNDERLINE = 4,
    NEGATIVE = 7,
    NOBOLD = 22,
    NOUNDERLINE = 24,
    POSITIVE = 27,

}

export class TerminalRect {
    t:number;
    l:number;
    b:number;
    r:number;

    constructor(t:number,l:number,b:number,r:number) {
        this.t = t;
        this.l = l;
        this.b = b;
        this.r = r;
    }

    toString() {
        return `${this.t};${this.l};${this.b};${this.r};`
    }
}

type tlbr = [number, number, number, number];

type Rect = tlbr | TerminalRect;

function rect(r:Rect) {
    if (r instanceof TerminalRect) {
        return r;
    } else {
        return new TerminalRect(...r);
    }
}

export interface CursorPosition {
    row: number,
    col: number,
}

type InputListener = (event:InputEvent) => void;


/** A simple utility class to write terminal escape sequences to an output
 * stream using a fluent interface.
 *
 * @example const term = new Term(Bun.stdout);
 *          term.savepos().d(2).r(2).text('hello').loadpos()
 *
 */
export class Term {
    stdin:NodeJS.ReadStream;
    out;
    writer;
    buffered = false;
    currentStyle?: lipgloss.Style;
    inputListeners:Set<InputListener>;

    constructor(stdin:NodeJS.ReadStream, out:Bun.BunFile) {
        stdin.unref();
        stdin.setEncoding( 'utf8' );
        stdin.on('data', (data) => {
            const input = KeyboardInputHandler(data as unknown as string);
            this.dispatchEvent(input);
        })
        this.stdin = stdin;
        this.out = out;
        this.writer = out.writer();
        this.writer.unref();
        this.inputListeners = new Set();
    }

    addInputListener(callback: InputListener): void {
        this.inputListeners.add(callback);
    }

    async dispatchEvent(event: InputEvent): Promise<boolean> {
        for (const listener of this.inputListeners) {
            await listener(event);
        }
        return true;
    }

    removeEventListener(callback: InputListener): void {
        this.inputListeners.delete(callback);
    }

    /** Automatically flush writes immediately as soon as output is ready to be written to the terminal. */
    autoflush() { this.buffered == false; this.flush(); return this; }
    /**
     * Disable auto-flushing. Writes to the terminal will be buffered until you call flush() manually.
     * Buffering is more efficient when you need to do a series of many small updates and is especially
     * helpful when several screen updates should appear simultaneously as one atomic refresh rather than
     * a series of actions that appear on the screen progressively.
     */
    noflush() { this.buffered = true; return this; }
    /** Send all previously buffered writes to the terminal.
     * This is only useful when autoflush is disabled and it does nothing when the output buffer is already empty.
     */
    flush() { this.writer.flush(); return this; }
    /** Move cursor up by one or more rows */
    u(rows:number=1):this  { return this.write( csi + rows + 'A'); }
    /** Move cursor down by one or more rows */
    d(rows:number=1):this  { return this.write( csi + rows + 'B'); }
    /** Scroll entire output up by one or more rows */
    su(rows:number=1):this { return this.write( csi + rows + 'S'); }
    /** Scroll entire output down by one or more rows */
    sd(rows:number=1):this { return this.write( csi + rows + 'T'); }
    /** Move cursor left by one or more columns */
    l(cols:number=1):this  { return this.write( csi + cols + 'C'); }
    /** Move cursor right by one or more columns */
    r(cols:number=1):this  { return this.write(csi + cols + 'D'); }
    /** Move cursor to specified column on the current row */
    col(c:number=1):this   { return this.write(csi + c + 'G'); }
    /** Output one or more newlines. */
    nl(n:number=1):this    { return this.write("\n".repeat(n)); }
    /** Move cursor to specific row and column */
    go(row:number=1, col:number=1):this { return this.write(csi + row + ';' + col + 'H'); }
    /** Save cursor position */
    savepos():this         { return this.write(csi + 's'); }
    /** Restore previously saved cursor position */
    loadpos():this         { return this.write(csi + 'u'); }
    /** Change style of a specified area.
     * Updates a rectangular area with specified style attributes
     */
    change(area:Rect, ...attr:TermAttr[]):this {
        return this.write(csi + rect(area).toString() + attr.join(';') + '$r');
    }
    scrollregion(top:number=-1,bottom:number=-1):this {
        return this.write(`${csi}${top > 0 ? top : ""};${ bottom > 0 ? bottom : ""}r`);
    }
    text(txt:string):this {
        if (this.currentStyle) {
            txt = this.currentStyle.Render(txt)
        }
        return this.write(txt);
    }
    json(obj:{}) { return this.write(JSON.stringify(obj, undefined, 4)); }
    style(style:lipgloss.Style):this { this.currentStyle=style; return this; }
    write(txt:string) {
        this.writer.write(txt);
        if (this.buffered === false) {
            this.writer.flush();
        }
        return this;
    }
    input(evt:InputEvent) {  }
}

export enum Keycodes {
    UP=65,
    DOWN=66,
    RIGHT = 67,
    LEFT = 68,
}
export type Keycode = keyof typeof Keycodes;
export type Keysym = typeof Keycodes[Keycode];
export interface InputEvent {
     code?: Keycodes;
     sym?: Keycodes|string;
     raw: string;
}

export function KeyboardInputHandler(input:string):InputEvent {

    var evt:InputEvent = { raw: input }
    var sym:Keysym;
    if (input.length == 1) {
        evt.sym = input;
        evt.code = input.charCodeAt(0);
    } else if (input.charCodeAt(0) == 27) {
        if (input.charCodeAt(1) == 91) {
            const code = input.charCodeAt(2);
            if (code in Keycodes) {
                evt.code = code;
                evt.sym = Keycodes[code];
            }
        }
    }
    return evt;
}
