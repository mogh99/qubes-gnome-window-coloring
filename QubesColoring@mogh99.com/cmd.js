const GLib = imports.gi.GLib;

const BORDER_COLOR_GRAY    = 'gray';

function getQubeName(idx) {
    let cmd = GLib.spawn_command_line_sync(`xprop _QUBES_VMNAME -id ${idx}`)
    
    if (!cmd[0]) return null;

    let tmpString = imports.byteArray.toString(cmd[1])
    let qubeName = tmpString.match(/"(.*?)"/)

    if (!qubeName) return null

    return qubeName[1]
}

function getQubeLabel(qubeName) {
    if (!qubeName) return BORDER_COLOR_GRAY;

    let colorLabel = GLib.spawn_command_line_sync(`qvm-prefs ${qubeName} label`)
    if (!colorLabel[0]) return null;

    return imports.byteArray.toString(colorLabel[1])
}
