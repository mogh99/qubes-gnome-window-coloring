const { GObject, St } = imports.gi;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const cmd = Me.imports.cmd;

const BORDERSIZE = 3;

class Window{
    constructor(metaWindow, deleteWindow){
        this.metaWindow = metaWindow
        this.deleteWindow = deleteWindow

        this.qubeName = null
        this.qubeColor = null

        this.windowActor = this.metaWindow.get_compositor_private()
        this.idx = this.metaWindow.get_description()
        
        this.border = new St.Bin({style_class: 'border'})
        
        let rect = this.metaWindow.get_frame_rect()
        this.border.set_position(rect.x, rect.y)
        this.border.set_size(rect.width - BORDERSIZE, rect.height - BORDERSIZE)
        this.setBorderColor()

        this.closedID = this.windowActor.connect('destroy', this.windowClosed.bind(this))
        this.sizeChangedID = this.metaWindow.connect('size-changed', this.updateBorderLayout.bind(this))
        this.positionChangedID = this.metaWindow.connect('position-changed', this.updateBorderLayout.bind(this))
    }

    setBorderColor(){
        this.qubeName = cmd.getQubeName(this.idx)
        this.qubeColor = cmd.getQubeLabel(this.qubeName)
        
        this.border.set_style(`border-color: ${this.qubeColor}`)
    }

    updateBorderLayout(){
        log("Update Window Border")
        let rect = this.metaWindow.get_frame_rect()
        this.border.set_position(rect.x, rect.y)
        this.border.set_size(rect.width + BORDERSIZE, rect.height + BORDERSIZE)
    }

    windowClosed(){
        log("Window Closed")

        global.window_group.remove_child(this.border)

        this.deleteWindow(this.idx)

        this.windowActor.disconnect(this.closedID)
        this.metaWindow.disconnect(this.sizeChangedID)
        this.metaWindow.disconnect(this.positionChangedID)
    }
}
