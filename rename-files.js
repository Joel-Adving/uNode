const fs = require('fs')
const path = require('path')

function renameFiles(dir, ext) {
  fs.readdir(dir, (err, files) => {
    if (err) throw err

    files.forEach((file) => {
      const fullPath = path.join(dir, file)

      if (fs.lstatSync(fullPath).isDirectory()) {
        renameFiles(fullPath, ext)
      } else if (path.extname(file) === '.js') {
        const newPath = path.join(dir, path.basename(file, '.js') + ext)
        fs.rename(fullPath, newPath, (err) => {
          if (err) throw err
          console.log(`${fullPath} → ${newPath}`)
        })
      }
    })
  })
}

renameFiles('./dist/cjs', '.cjs')
renameFiles('./dist/esm', '.mjs')
