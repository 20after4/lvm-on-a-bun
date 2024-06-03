
import { Term } from './term.ts';
import type { InputEvent } from './term.ts';
import { parseArgs } from "util";
import { LVSegments } from './lvm.ts';
import { Table, HTMLTable, TUITable } from './table.ts';

var print = console.log;

async function main(argv:string[]) {
    var term = new Term(process.stdin, Bun.stdout);
    const { values, positionals } = parseArgs({
        args: argv,
        allowPositionals: true,
        options: {
            web: {
                type: "boolean",
             }
        }
    });

    var table:Table;

    const handleInput = async function(input:InputEvent)
    {
        if (input.raw == "\u0003" || input.raw == 'q') {
            term.d(table.rows.length+1).col(0).sd().nl().flush();
            process.exit(0);
        }
        table.update(input);
        refresh();
    }

    if ('web' in values) {
        const Webview = await import("webview-bun");

        table = new HTMLTable();
        await LVSegments(table);

        const webview = new Webview.Webview();
        webview.bind('input', handleInput);
        const {IndexPage} = await import('./index.tsx');

        const html = IndexPage(table);
        console.log(html);
        webview.setHTML(
            html
        );
        webview.run();
        return;
    } else {
        table = new TUITable();
        await LVSegments(table);
    }

    const refresh = async function(input?:InputEvent) {
        term.noflush().loadpos();
        term.write(table.Render());
        if (table.selectedIndex < table.rows.length -1 ) {
            term.u(table.rows.length - 1 - table.selectedIndex);
        }
        term.autoflush();
        term.loadpos().col(table.width + 1).text('hi');
    }



    term.savepos();
    process.stdin.setRawMode(true);
    term.addInputListener(handleInput);
    refresh();
}

if (import.meta.path === Bun.main) {
    await main(Bun.argv)
}

