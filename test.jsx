'use strict'

const convert = require('./index')
const ATTRIBUTES = require('./attributes')
const expect = require('unexpected')
const React = require('react')
const ReactDOMServer = require('react-dom/server')

const assert = (elm, debug) => {

  let converted = convert(elm)
  let reactConverted = ReactDOMServer.renderToStaticMarkup(elm)

  if (debug) {
    console.log('Input: ', converted)
    console.log('React: ', reactConverted)
  }
  expect(converted, 'to be', reactConverted)
}

const test = (description, elm, debug) => it(description, () => assert(elm, debug))

describe('React to HTML', () => {

  describe('Standard elements', () => {

    test('should render a simple standard element', <span></span>)
    test('should render a standard element with single child', <div><span>test</span></div>)
    test('should render a standard element with multiple children', <div><span>Child 1</span> child2 <strong>Child3</strong></div>)
  })

  describe('Void elements', () => {
    test('should render a non-void element with closing tag', <span />)
    test('should render a void element as single tag', <br />)
    test('should render a void element as single tag and attributes', <input type="number" />)
    test('should render a void element as single tag and multiple attributes', <input type="number" title="Test number" />)
  })

  describe('dangerouslySetInnerHTML', () => {
    it ('should render HTML set with dangerouslySetInnerHTML', () => {
      assert(<div dangerouslySetInnerHTML={{__html: '<span>Test <a href="/404">inner</a> html</span>'}}></div>)
    })
  })

  describe('Attributes', () => {
    test('should render a standard element with a single attribute', <span data-test="test attr value"></span>)
    test('should render a standard element with a multiple attributes', <span data-test="attr 1" title="attr 2"></span>)
    test('should render a nested element with a multiple attributes',
      <div alt="alt description">
        <span data-test="attr 1" title="attr 2"> Some value</span>
      </div>
    )

    it('should format function as parameter', () => {
      let fixtureFunction = test => { return 'I am actual code æøÅ' < 12; }
      assert(<div data-my-handler={fixtureFunction}>My div</div>)
    })

    test('should handle "class" attribute', <div className="test-class">Some DIV element</div>)
    test('should handle "for" attribute', <label htmlFor="some-input">Input your name<input type="text" /></label>)
    test('should handle ignore all but data-* attributes', <span data-valid1="test" data-valid2="213" ignore-this="hello">A span</span>)
    test('should set "true" for data-* attributes without values', <span data-valid1 data-valid2>A span</span>)
    test('should handle ignore all but aria-* attributes', <span aria-valid1="test" aria-valid2="213" ignore-this="hello">A span</span>)
    test('should set "true" for aria-* attributes without values', <span aria-valid1 aria-valid2>A span</span>)
    test('should handle dynamically set attribute', <hr title={23} />)

    it('should ignore vales for boolean-type attributes', () => {
      Object.keys(ATTRIBUTES).forEach(attr => {
        if (attr !== 'style') assert(React.createElement('div', {[attr]: "1000"}))
      })
    })
  })

  describe('Components', () => {

    it('should render simple component', () => {
      class fixture extends React.Component {
        render() {
          return <div>Hello</div>
        }
      }
      assert(<fixture />)
    })
  })
}) 