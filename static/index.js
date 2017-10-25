const walk = require('walk-sync')
const path = require('path')
const hoquet = require('hoquet')
const fs = require('fs')
const mkdirp = require('mkdirp')
const renderReadme = require('render-readme')
const fse = require('fs-extra')

fse.emptyDirSync(__dirname + '/dist')
fse.copySync(__dirname + '/assets', __dirname + '/dist/assets')

function findModules (modulesDir) {
  let paths = walk(modulesDir, {
    globs: ['**/README.md', '**/'],
    ignore: ['**/node_modules', '.git']
  })

  const modules = []
  const modulesByName = {}

  paths = paths
    .map((p) => [p, p.split('/')])
    .filter((p) => (p[1].length === 2))

  paths.forEach((p) => {
    const name = p[1][0]
    let module = modulesByName[name]
    if (!module) {
      module = modulesByName[name] = {
        name: name,
        headers: []
      }
      modules.push(module)
    }
    if (p[1][1] === 'README.md') {
      module.readmePath = path.join(modulesDir, p[0])
    }
  })

  modules.forEach((module) => {
    if (!module.readmePath) return
    var md = fs.readFileSync(module.readmePath, 'utf-8')
    var html = renderReadme(md)

    const lines = html.split('\n')
    module.headers = lines.map((line) => {
      var m = line.match(/<h[234567]><a name="([^"]+)"><\/a>([^<]+)/)
      if (m) return [m[1], m[2]]
      var m2 = line.match(/<h[234567]><a name="([^"]+)"><\/a><code>([^<]+)/)
      if (m2) return [m2[1], m2[2]]
      else return null
    }).filter((h) => h)
    module.readmeHtml = html
  })

  return modules
}

const modules = []
  .concat(findModules(path.join(__dirname, '..')))
  .concat(findModules(path.join(__dirname, '..', '..', 'my-modules')))

modules.forEach((m, i) => {
  m.index = i
})

// show modules with found APIs first
modules.sort((a, b) => {
  if (a.headers.length && b.headers.length) {
    if (a.name.indexOf('pex') === 0 && b.name.indexOf('pex') !== 0) return -1
    if (a.name.indexOf('pex') !== 0 && b.name.indexOf('pex') === 0) return 1
    if (a.name < b.name) return -1
    if (a.name > b.name) return 1
    return a.index - b.index
  }
  if (a.headers.length && !b.headers.length) return -1
  if (!a.headers.length && b.headers.length) return 1
  return a.index - b.index
})

// console.log(paths)
// console.log(paths.length)
console.log(modules)

function renderModule (module) {
  return ['div', { class: 'f7 lh-copy' },
    ['a', { class: 'no-underline', href: `modules/${module.name}/README.html`, target: 'readme-view', onclick: 'expand(this)' },
      ['h2', { class: 'item normal f7 ma0 mt1 black dim' }, module.name]
    ],
    module.headers.map((line) => {
      var color = 'silver'
      if (line[1].includes('.') || line[1].includes('(')) color = 'green'
      return ['a', { class: `no-underline ${color} dim truncate db`, style: 'max-width: 300px;', href: `modules/${module.name}/README.html#${line[0]}`, target: 'readme-view' },
        ['h3', { class: `item normal f7 mt1 ${color} dim ma0` }, line[1].replace(/`/g, '')]
      ]
    })
  ]
}

const html = ['html',
  ['head',
    ['meta', { name: 'viewport', content: 'width=device-width', 'initial-scale': '1' }],
    ['link', { rel: 'stylesheet', href: 'assets/tachyons.min.css' }],
    ['style', { type: 'text/css' }, `
      input#search {
        border: 1px solid #DDD;
        border-width: 0 0 1px 0;
      }
      input#search:focus {
        outline: none;
        border: 1px solid #19a974;
        border-width: 0 0 1px 0;
      }
      .f7 {
        font-size: .75rem
      }
      .expanded {
        display: block !important;
      }
    `]
  ],
  ['body', { class: 'code bg-black white flex flex-column', style: 'background: #FFFFFF; height: 100%; max-height: 100%;' },
    ['div', { class: 'flex flex-row h-100' },
      ['div', { class: 'pa3', style: 'overflow: scroll; width: 350px;' },
        ['img', { src: 'assets/pex-logo-white.png', height: 64, class: 'mb3' }],
        ['div', { class: 'flex mv2' },
          ['input', { type: 'text', placeholder: 'Search', id: 'search', class: 'f6 pv2 flex-auto' }]
        ],
        modules.map(renderModule),
        ['script', { src: 'assets/search.js' }, '']
      ],
      ['iframe', { name: 'readme-view', class: 'flex-auto', style: 'border-width: 0 0 0 1px;', src: 'modules/pex-context/README.html' }]
    ]
  ]
]

// create README.md files

modules.forEach((module) => {
  if (!module.readmePath) return
  const targetModulePath = `${__dirname}/dist/modules/${module.name}`
  if (!fs.existsSync(targetModulePath)) {
    mkdirp.sync(targetModulePath)
  }
  // var targetReadmePath = `${targetModulePath}/README.md`
  // copy(module.readmePath, targetReadmePath)

  var targetReadmeHtmlPath = `${targetModulePath}/README.html`
  var html = module.readmeHtml

  var header = `
  <html>
  <head>
  <link rel="stylesheet" href="../../assets/github-markdown.css">
  <link rel="stylesheet" href="../../assets/github.css">
  <style>
    .markdown-body {
      box-sizing: border-box;
      min-width: 200px;
      max-width: 980px;
      padding: 45px;
    }

    @media (max-width: 767px) {
      .markdown-body {
        padding: 15px;
      }
    }

  </style>
  </head>
  <body class="markdown-body">
  `
  var footer = `
  </body>
  </html>
  `

  html = header + html + footer
  fs.writeFileSync(targetReadmeHtmlPath, html)
})

const htmlStr = hoquet.render(html)
fs.writeFileSync(path.join(__dirname, 'dist/index.html'), htmlStr)
