import { Border,  NewStyle, Style } from 'blipgloss';
import type {CustomBorder} from 'blipgloss';
import type { ParsedInputEvent } from './term.ts';
import  { Keycodes } from './term.ts';
type hexColor = `#${string}`
export class Table<T extends Record<string, any>> {
    widths : Record<string, number>
    rows:Array<T> = [];
    cols:Array<string> = [];
    colKeys:Record<string, string> = {};
    selectedIndex = 0;

    constructor() {
        this.widths = {};
    }

    sort(compareFn?: (a: T, b: T) => number): Array<T> {
        return this.rows.sort(compareFn);
    }

    addRow(row:T) {
        for (const k in row) {
            if (! (k in this.colKeys)) {
                this.cols.push(k);
                this.widths[k] = 0;
                this.colKeys[k] = k;
            }
            this.widths[k] = Math.max(this.widths[k], String(row[k]).length);
        }
        this.rows.push(row);
    }

    THead():string {
        return '';
    }

    TR(row:T, selected:boolean=false):string {
        return '';
    }

    Render() {
        const lines = [];
        lines.push(this.THead());
        var i = 0;
        for (const row of this.rows) {
            lines.push(this.TR(row, i == this.selectedIndex))
            i++;
        }
        return lines.join("\n");
    }
}

export class HTMLTable<T extends Record<string, any>> extends Table<T> {

    THead() {
        const cols = this.cols.map(k => `<th>${k}</th>`);
        return `<thead><tr>${cols.join('')}</tr></thead>`;
    }

    TR(row:T) {
        const line = [];
        for (const k in row) {
            line.push(`<td>${row[k]}</td>`);
        }
        return `  <tr>${line.join('')}</tr>`
    }

    Render() {
        const lines = [];
        lines.push("<table>");

        lines.push(this.THead());

        lines.push("<tbody>");
        for (const row of this.rows) {
            lines.push(this.TR(row));
        }
        lines.push(" </tbody>");
        lines.push("</table>");
        return lines.join("\n");
    }
}

export class TUITable<T extends Record<string, any>> extends Table<T> {

    colStyle:Style;
    headStyle:Style;
    selectionStyle:Style;

    constructor(colors:Array<hexColor> = ["#3D1674", "#fdfdfd", "#2D0654", "#fdfdfd", "#8D74d4", "#000000"]) {
        const [bg1, fg1, bg2, fg2, bg3, fg3] = colors

        super();
        this.widths = {};
        this.colStyle = NewStyle()
            .Bold(false)
            .Foreground(fg1)
            .Background(bg1)
            .BorderBackground(bg1)
            .PaddingLeft(1)
            .Border(Border.Normal, false, true, false, false)

        this.headStyle = this.colStyle.Copy()
            .Bold(true)
            .BorderBackground(bg2)
            .Background(bg2)
            .Foreground(fg2);

        this.selectionStyle = this.colStyle.Copy()
            .Background(bg3)
            .BorderBackground(bg3)
            .Foreground(fg3);

        const bottomBorder:CustomBorder = {
            Bottom: '─',
            BottomRight: '┴',
            BottomLeft: '└',
        }

    }

    update(evt:ParsedInputEvent) {
        if (evt.code == Keycodes.DOWN && this.selectedIndex < this.rows.length - 1) {
            this.selectedIndex++;
        } else if (evt.code == Keycodes.UP && this.selectedIndex > 0) {
            this.selectedIndex--;
        }
    }

    THead() {
        const cols = this.cols.map(k => this.headStyle.Width(this.widths[k]+2).Render(k));
        return cols.join('');
    }

    TR(row:T, selected:boolean=false) {
        const style = selected ? this.selectionStyle : this.colStyle;
        const line = [];
        for (const k in row) {
            line.push(style.Width(this.widths[k]+2).Render(row[k]));
        }
        return line.join('');
    }
}
