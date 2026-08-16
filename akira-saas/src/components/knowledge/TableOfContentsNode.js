import { Node } from '@tiptap/core'

/**
 * TableOfContentsNode — Extensión TipTap para insertar tabla de contenidos automática
 * Genera una lista de headings (H1-H6) del documento
 */
export var TableOfContentsNode = Node.create({
  name: 'tableOfContents',
  group: 'block',
  addAttributes: function () { return {} },
  parseHTML: function () { return [{ tag: 'div[data-toc]' }] },
  renderHTML: function () {
    return ['div', { 'data-toc': '', style: 'border:1px solid var(--border);border-radius:8px;padding:12px;background:rgba(255,255,255,0.02);margin:10px 0' }, 'Tabla de contenidos']
  },
  addCommands: function () {
    var self = this
    return {
      insertTableOfContents: function () {
        return function (command) {
          return command.insertContent({ type: self.name })
        }
      },
    }
  },
})

export default TableOfContentsNode
