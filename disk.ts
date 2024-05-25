export const NVMEDevPattern = /(\/dev\/)?nvme(\d+)(n(\d+)p(\d+))/
export const DevPattern = /(\/dev\/)?(sd)([a-z])(([0-9]+))/
export type SegmentInfo = {
    /** the logical volume name that this segment is associated with. */
    name: string,
    /** information about the disk and partition holding the PV. */
    pvdev: PartitionInfo,
    /** The starting physical extent number for this segment. */
    start: number,
    /** The ending physical extent numbner for this segment. */
    end: number,
}

export interface PartitionInfo {
    deviceNode: string,
    /** the linux disk subsystem that this device blongs to */
    subsystem: string,
    /** for nvme disks, this is the namespace number, usually this is simply a 1 */
    namespace?: number,
    /** The device node without the /dev/ path prefix */
    device:string,
    /** The partition number */
    part: number,
    /** Suffix is everything after the disk device name in the device node string.
     * For nvme devices it is the n#p# string, for sd devices it is simply the partition numbner.
     */
    suffix?:string,

}

export class PartitionInfo {
    constructor(deviceNode:string) {
        this.deviceNode = deviceNode;
        const nvme = NVMEDevPattern.exec(deviceNode);
        const sd = DevPattern.exec(deviceNode);

        if (nvme && nvme.length > 1) {
            this.subsystem = "nvme";
            this.device = `nvme${nvme[2]}`;
            this.namespace = parseInt(nvme[4]);
            this.part = parseInt(nvme[5]);
            this.suffix = nvme[3];
        } else if (sd) {
            this.subsystem = 'sd';
            // sd[1];
            this.device = sd[2]+sd[3];
            this.part = parseInt(sd[5])
            this.suffix = sd[4];
            //this.parts = sd;
        }
    }
    toString():string {
        return this.deviceNode;
    }
}
