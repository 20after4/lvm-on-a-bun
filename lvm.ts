import { $ } from "bun";
import type { Shell } from "bun";
import { Term, KeyboardInputHandler } from './term.ts';
import type { ParsedInputEvent } from './term.ts';
import { parseArgs } from "util";
import type { SegmentInfo } from './disk.ts';
import { PartitionInfo } from './disk.ts';
import { TUITable } from './table.ts';

var print = console.log;
var term = new Term(process.stdin, Bun.stdout);

async function LVSegments():Promise<TUITable<SegmentInfo>> {
    const lvs = await $`sudo lvs --reportformat=json --binary --options=lv_all,seg_all,vg_name`.json();

    var table = new TUITable<SegmentInfo>();

    for (const lv of lvs.report[0].lv) {
        var segs, dev;
        [dev, segs] = lv.seg_pe_ranges.split(":");
        var seg_ranges = segs.split("-");

        const seg:SegmentInfo = {
            name: lv.lv_name,
            pvdev: new PartitionInfo(dev),
            start: parseInt(seg_ranges[0]),
            end: parseInt(seg_ranges[1]),

        }
        table.addRow(seg);
    }
    table.sort((a, b) => a.pvdev.deviceNode.localeCompare( b.pvdev.deviceNode) || a.start - b.start );
    return table;
}

async function main(argv:string[]) {
    process.stdin.setRawMode(true);

    const { values, positionals } = parseArgs({
        args: argv,
        allowPositionals: true,
        options: {

        }
    });

    const table = await LVSegments();

    var refresh = async function(input?:ParsedInputEvent) {
        term.noflush().loadpos();

        if (input) {
            if (input.raw == "\u0003" || input.raw == 'q') {
                term.d(table.rows.length+1).col(0).sd().nl().flush();
                process.exit(0);
            }
            table.update(input);
            //term.json(input);
        }

        term.write(table.Render());
        if (table.selectedIndex < table.rows.length -1 ) {
            term.u(table.rows.length - 1 - table.selectedIndex);
        }
        term.autoflush();
    }
    term.input = function(evt:ParsedInputEvent) {
        refresh(evt);
    };

    term.savepos();
    refresh();
}

if (import.meta.path === Bun.main) {
    await main(Bun.argv)
}

