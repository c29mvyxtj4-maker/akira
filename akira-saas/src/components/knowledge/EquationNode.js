import { Node, mergeAttributes } from '@tiptap/core'

export const EquationNode = Node.create({
  name: 'equation',
  group: 'block',
  atom: true,
  addAttributes() {
    return {
      content: {
        default: 'E = mc^2',
      },
    }
  },
  parseHTML() {
    return [{ tag: 'div[data-equation]' }]
  },
  renderHTML({ node, HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, { 'data-equation': '', style: 'padding:12px;background:rgba(99,102,241,0.08);border:1px solid rgba(99,102,241,0.25);border-radius:8px;font-family:monospace;font-size:13px;margin:10px 0;color:rgba(255,255,255,0.8)' }),
      node.attrs.content
    ]
  },
  addCommands() {
    return {
      setEquation: (attrs) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs,
        })
      },
    }
  },
})

export default EquationNode
