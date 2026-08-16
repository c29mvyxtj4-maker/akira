import { Node, mergeAttributes } from '@tiptap/core'

/**
 * AudioNode — Extensión TipTap para insertar audio
 * Soporta archivos locales y URLs de audio (MP3, WAV, etc.)
 */
export var AudioNode = Node.create({
  name: 'audio',
  group: 'block',
  selectable: true,
  draggable: true,
  addAttributes: function () {
    return {
      src: { default: null },
    }
  },
  parseHTML: function () { return [{ tag: 'audio' }] },
  renderHTML: function (p) {
    return ['audio', mergeAttributes(p.HTMLAttributes, { controls: true, style: 'width:100%;margin:8px 0;background:rgba(255,255,255,0.02);padding:8px;border-radius:6px;border:1px solid rgba(255,255,255,0.1)' })]
  },
  addCommands: function () {
    var self = this
    return {
      insertAudio: function (attrs) {
        return function (command) {
          return command.insertContent({ type: self.name, attrs: attrs })
        }
      },
    }
  },
})

export default AudioNode
