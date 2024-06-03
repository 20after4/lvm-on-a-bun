import { $ } from "bun";
import type { SegmentInfo } from './disk.ts';
import { PartitionInfo } from './disk.ts';
import { TUITable, Table } from './table.ts';



export async function LVSegments(table:Table) {
    const lvs = await $`sudo lvs --reportformat=json --binary --options=lv_all,seg_all,vg_name`.json();

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
