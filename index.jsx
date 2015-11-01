'use strict'

const ATTRIBUTES = require('./attributes');
const VOID_ELEMENTS = ['area', 'base', 'br', 'col', 'command', 'embed', 'hr', 'img', 'input', 'keygen', 'link', 'meta', 'param', 'source', 'track', 'wbr']

const escapeHtml = input => input
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#x27;")

let convert = element => {

  let type = element.type

  if (!type) return element;

  let props = element.props
  let children = (props.dangerouslySetInnerHTML && props.dangerouslySetInnerHTML.__html) || props.children
  let renderedChildren

  if (Array.isArray(children)) {
    renderedChildren = children.map(convert).join('')
  } else if(children && typeof children === 'object') {
    renderedChildren = convert(children)
  } else {
    renderedChildren = children || ''
  }

  let attributes = Object.keys(element.props).reduce((result, key) => {

    if (/^(data|aria)-.*/.test(key)) {

      result += ' ' + key + '="' + escapeHtml(String(element.props[key])) + '"'

    } else if (key !== 'children' && ATTRIBUTES[key] !== undefined) {

      let attrName = (ATTRIBUTES[key] && ATTRIBUTES[key].alias) || key
      let attrValue =  ATTRIBUTES[key].boolean ? '' : element.props[key]

      result += ' ' + attrName + '="' + attrValue + '"'
    }
    return result

  }, '')

  if (~VOID_ELEMENTS.indexOf(type)) {
    return '<' + type + attributes + '/>'
  } else {
    return '<' + type + attributes + '>' + renderedChildren + '</' + type + '>'
  }
}

module.exports = convert