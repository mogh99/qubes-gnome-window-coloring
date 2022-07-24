/* extension.js
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

/* exported init */

const { GObject, St, Meta, GLib } = imports.gi;

const Main = imports.ui.main;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const Window = Me.imports.window;

class Extension {
    constructor(uuid) {
        this._uuid = uuid;
        this.winCreatedHandlerID = null
        this.restackHandlerID = null
        this.windows = {}
    }

    windowCreated(display, metaWindow) {
        log("Window Created")

        let window = new Window.Window(metaWindow, this.deleteWindow.bind(this))

        this.windows[metaWindow.get_description()] = window

        global.window_group.add_child(window.border)
        global.window_group.set_child_above_sibling(window.border, window)
    }

    deleteWindow(windowIDX){
        log("Window Deleted = "+windowIDX)

        delete this.windows[windowIDX]
    }

    restack(display){
        global.window_group.get_children().forEach(
            (child) => {
                let metaWindow = this.checkMetaWindow(child)

                if (!metaWindow) return;

                let window = this.windows[metaWindow.get_description()]
                
                global.window_group.set_child_above_sibling(window.border, child)
            }
        )
    }

    checkMetaWindow(child){
        let metaWindow = null
        try {
            metaWindow = child.get_meta_window()
        } catch (error) {
            log(error)
        }

        if(!metaWindow) return false;

        let type = metaWindow.get_window_type()

        if (
            type == Meta.WindowType.NORMAL ||
            type == Meta.WindowType.DIALOG ||
            type == Meta.WindowType.MODAL_DIALOG
        ) return metaWindow

        return false
    }

    enable() {
        log("Enabled")
        
        this.winCreatedHandlerID = global.display.connect('window-created', this.windowCreated.bind(this))
        this.restackHandlerID = global.display.connect('restacked', this.restack.bind(this))

        global.window_group.get_children().forEach(
            (child) => {
                let metaWindow = this.checkMetaWindow(child)

                if (!metaWindow) return;

                log(Window.Window)
                let window = new Window.Window(metaWindow, this.deleteWindow.bind(this))

                
                this.windows[metaWindow.get_description()] = window
                global.window_group.add_child(window.border)
                global.window_group.set_child_above_sibling(window.border, child)
            }
        )
    }

    disable() {
        log("Disabled")

        for (let windowIdx in this.windows){
            this.windows[windowIdx].windowClosed()
            this.deleteWindow(windowIdx)
        }

        global.display.disconnect(this.winCreatedHandlerID)
        global.display.disconnect(this.restackHandlerID)
    }
}

function init(meta) {
    return new Extension(meta.uuid);
}
