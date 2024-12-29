// generate-imports-map.js
const fs = require('fs')
const path = require('path')
const routes = require('./path/to/routes.json')

let importsMap = 'export const importsMap = {\n'

routes.forEach(route => {
        if (route.component) {
            // Convert the path to a format that's relative to where you'll be importing from
            const importPath = route.component.replace('views', './views')
            const componentName = path.basename(importPath)

            // Create an import statement for the component
            importsMap += "${route.path}": React.lazy(() = > import('${importPath}')), \n`;
        }
    })

importsMap += '};\n'

fs.writeFileSync(path.resolve(__dirname,'./src/importsMap.js'), importsMap)
console.log('Import map generated.')
