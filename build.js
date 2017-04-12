var fs = require('fs')
var React = require('react')
var DOM = React.DOM
var execSync = require('child_process').execSync
var commonmark = require('commonmark')

var repos = fs.readFileSync(__dirname + '/repos.txt', 'utf8').trim().split('\n')
var reposData = fs.readFileSync(__dirname + '/repos.json.txt', 'utf8').trim().split('\n').map(JSON.parse)
var reader = new commonmark.Parser()
var writer = new commonmark.HtmlRenderer()

// repos include category names as comments
// reposData have only repositories json strings
// so we have to match the indices
var items = []
var repoDataIdex = 0
for (var i = 0; i < repos.length; i++) {
  var repoName = repos[i]
  if (repoName[0] === '#') {
    items.push({ name: repoName.slice(1), group: true })
  } else {
    items.push(reposData[repoDataIdex])
    repoDataIdex++
  }
}

var Website = React.createFactory(React.createClass({
  render: function () {
    var sidebarHeader = DOM.h1({}, 'REFERENCE')
    var sidebarItems = this.props.items.map(function (item, itemIndex) {
      if (!item) return null
      if (item.group) {
        return DOM.li({ className: 'group'}, item.name)
      }
      var repo = (item.package.homepage && item.package.homepage) ? item.package.homepage : ''
      var readmeStr = item.readme
      var readmeDir = __dirname + '/build/readme/' + item.package.name
      var baseUrl = ''
      if (item.package.repository && item.package.repository.url) {
        // TODO: improve this
        baseUrl = item.package.repository.url
        baseUrl = baseUrl.replace('.git', '')
        baseUrl = baseUrl.replace(/.+\/\/github.com\//, '')
        baseUrl = 'https://raw.githubusercontent.com/' + baseUrl + '/master/'
      }
      var readmeHtml = writer.render(reader.parse(readmeStr))
      readmeHtml = readmeHtml.replace(/img src="(?!http)([^"]+)/g, 'img src=\"' + baseUrl + '$1')
      readmeHtml = readmeHtml.replace(/language-javascript/g, 'javascript')
      if (!fs.existsSync(readmeDir)) {
        fs.mkdirSync(readmeDir)
      }
      fs.writeFileSync(readmeDir + '/README.md', readmeStr)
      fs.writeFileSync(readmeDir + '/index.html', readmeHtml)
      return DOM.li(
        {},
        DOM.a(
          { href: 'javascript:showReadme(\'' + repo + '\', \'' + item.package.name + '\')'},
          DOM.span({}, item.name),
          DOM.span({ className: 'version'}, item.package.version),
          DOM.span({ className: 'issues'}, DOM.span({ className: 'dash' }, '/ '), item.issues)
        )
      )
    })

    var sidebarItemList = DOM.ul({}, sidebarItems)

    // var readmesJS = ''
    // readmesJS += 'var readmes = ['
    // readmesJS += this.props.items.map(function(item, itemIndex) {
    //    return '"' + ('' + item.readme).replace(/\n/g, '<br/>').replace(/"/g, '\'') + '"'
    // }).join(',\n')
    // readmesJS += ']'

    return DOM.html(
      {},
      DOM.head(
        {},
        DOM.meta(
          {charset: 'UTF-8'}),
          DOM.title({}, 'PEX Docs'),
          DOM.link({rel: 'stylesheet', type: 'text/css', href: 'assets/style.css'}),
          DOM.link({rel: 'stylesheet', type: 'text/css', href: 'assets/monokai-sublime.css'}),
          DOM.script({src: 'assets/highlight.pack.js'}),
          // DOM.script({}, readmesJS),
          DOM.script({src: 'assets/readme.js'})
      ),
      DOM.body(
        {},
        DOM.div(
          { id: 'menu'},
          DOM.a(
            { href: 'http://pex.gl'},
            DOM.img({ id: 'logo', src: 'assets/pex-logo.png'})
          )
        ),
        DOM.div(
          { id: 'container'},
          DOM.div({ id: 'sidebar'}, sidebarHeader, sidebarItemList),
          DOM.div({ id: 'readmeViewer'})
        )
      )
    )
  }
}))

var html = React.renderToStaticMarkup(
  Website({ items: items })
)

html = html.replace(/>/g, '>\n')
html = '<!DOCTYPE html>\n' + html
html = html.replace(/&quot/g, '"')

fs.writeFileSync(__dirname + '/build/index.html', html)

execSync('cp -r ' + __dirname + '/assets build')
