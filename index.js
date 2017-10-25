const walk = require('walk-sync')
const path = require('path')
const hoquet = require('hoquet')
const fs = require('fs')
const mkdirp = require('mkdirp')
const renderReadme = require('render-readme')
const fse = require('fs-extra')
const R = require('ramda')

fse.emptyDirSync(__dirname + '/dist')
fse.copySync(__dirname + '/assets', __dirname + '/dist/assets')

const repos = fs.readFileSync('repos.txt', 'utf-8').split('\n').filter((l) => l)

function parseLine (line) {
  var m = line.match(/<h[234567]><a name="([^"]+)"><\/a>([^<]+)/)
  if (m) return [m[1], m[2]]
  var m2 = line.match(/<h[234567]><a name="([^"]+)"><\/a><code>([^<]+)/)
  if (m2) return [m2[1], m2[2]]
  else return null
}

function findModules () {
  const lines = fs.readFileSync('repos.json.txt', 'utf-8').split('\n')
  return lines.filter((l) => l).map((line) => {
    const moduleInfo = JSON.parse(line)

    const html = renderReadme(moduleInfo.readme)
    const htmlLines = html.split('\n')

    return {
      name: moduleInfo.name,
      headers: htmlLines.map(parseLine).filter((h) => h),
      readmeHtml: html,
      version: moduleInfo.package.version,
      user: moduleInfo.user
    }
  })
}

const modules = findModules()
const modulesByName = {}
modules.forEach((module) => modulesByName[module.name] = module)
// console.log(modulesByName)

function renderRepo (name) {
  if (name.startsWith('#')) {
    // render section
    return ['div', { class: 'lh-copy' },
      ['a', { class: 'no-underline', target: 'readme-view' },
        ['h1', { class: 'f5 item normal ma0 mt3 mb3 black' }, name.replace('#', '')]
      ]
    ]
  }
  const moduleName = name.split('/')[1]
  const module = modulesByName[moduleName]
  if (!module) console.log(module)
  return ['div', { class: 'f7 lh-copy' },
      ['div', { class: 'flex flex-row no-underline', onclick: 'expand(this)' },
        ['h2', { class: 'item normal f7 ma0 mt1 ' },
          ['a', { class: 'dim no-underline dark-green', href: `modules/${module.name}/README.html`, target: 'readme-view' }, module.name ]
        ],
        ['a', { class: 'dim no-underline ml2 flex-auto w3 truncate normal f7 ma0 mt1 moon-gray', href: `https://github.com/${module.user}`, target: '_blank'}, module.user],
        ['span', { class: 'w3 truncate normal f7 ma0 mt1 dark-green' }, module.version]
      ],
    module.headers.map((line) => {
      let color = 'gray'
      if (line[1].includes('.') || line[1].includes('(')) color = 'green'
      return ['a', { class: `ml2 no-underline ${color} dim truncate`, style: 'max-width: 300px;', href: `modules/${module.name}/README.html#${line[0]}`, target: 'readme-view' },
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
        ['img', { src: 'assets/pex-logo-white.png', height: 24, class: 'mv3' }],
        ['div', { class: 'flex mv2' },
          ['input', { type: 'text', placeholder: 'Search', id: 'search', class: 'f5 pv2 flex-auto' }]
        ],
        repos.map(renderRepo),
        ['script', { src: 'assets/search.js' }, '']
      ],
      ['iframe', { name: 'readme-view', class: 'flex-auto', style: 'border-width: 0 0 0 1px;', src: 'modules/pex-context/README.html' }]
    ]
  ]
]

// create README.md files

modules.forEach((module) => {
  const targetModulePath = `${__dirname}/dist/modules/${module.name}`
  if (!fs.existsSync(targetModulePath)) {
    mkdirp.sync(targetModulePath)
  }

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
