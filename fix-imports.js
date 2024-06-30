const fs = require('fs')
const path = require('path')

function fixCjsImports(dir) {
  fs.readdir(dir, (err, files) => {
    if (err) {
      console.error(`Error reading directory ${dir}:`, err)
      return
    }

    files.forEach((file) => {
      const fullPath = path.join(dir, file)

      if (fs.lstatSync(fullPath).isDirectory()) {
        fixCjsImports(fullPath)
      } else if (path.extname(file) === '.cjs') {
        console.log(`Processing ${fullPath}`)
        fs.readFile(fullPath, 'utf8', (err, data) => {
          if (err) {
            console.error(`Error reading file ${fullPath}:`, err)
            return
          }

          let result = data.replace(/require\('\.\/(.*?)'\)/g, "require('./$1.cjs')")
          result = result.replace(/from '\.\/(.*?)'/g, "from './$1.cjs'")
          result = result.replace(/require\("\.\/(.*?)"\)/g, 'require("./$1.cjs")')
          result = result.replace(/from "\.\/(.*?)"/g, 'from "./$1.cjs"')

          if (result !== data) {
            console.log(`Updating imports in ${fullPath}`)
            fs.writeFile(fullPath, result, 'utf8', (err) => {
              if (err) {
                console.error(`Error writing file ${fullPath}:`, err)
                return
              }
              console.log(`Fixed imports in ${fullPath}`)
            })
          } else {
            console.log(`No imports to fix in ${fullPath}`)
          }
        })
      }
    })
  })
}

fixCjsImports('./dist/cjs')

function fixEsmImports(dir) {
  fs.readdir(dir, (err, files) => {
    if (err) {
      console.error(`Error reading directory ${dir}:`, err)
      return
    }

    files.forEach((file) => {
      const fullPath = path.join(dir, file)

      if (fs.lstatSync(fullPath).isDirectory()) {
        fixEsmImports(fullPath)
      } else if (path.extname(file) === '.mjs') {
        console.log(`Processing ${fullPath}`)
        fs.readFile(fullPath, 'utf8', (err, data) => {
          if (err) {
            console.error(`Error reading file ${fullPath}:`, err)
            return
          }

          let result = data.replace(/from '\.\/(.*?)'/g, "from './$1.mjs'")
          result = result.replace(/from "\.\/(.*?)"/g, 'from "./$1.mjs"')

          if (result !== data) {
            console.log(`Updating imports in ${fullPath}`)
            fs.writeFile(fullPath, result, 'utf8', (err) => {
              if (err) {
                console.error(`Error writing file ${fullPath}:`, err)
                return
              }
              console.log(`Fixed imports in ${fullPath}`)
            })
          } else {
            console.log(`No imports to fix in ${fullPath}`)
          }
        })
      }
    })
  })
}

fixEsmImports('./dist/esm')
