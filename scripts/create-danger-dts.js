var fs = require("fs")
var fileOutput = ""

const extras = ["source/platforms/messaging/violation.ts"]
const dslFiles = fs.readdirSync("source/dsl").map(f => `source/dsl/${f}`)

dslFiles.concat(extras).forEach(file => {
  // Sometimes they have more stuff, in those cases
  // offer a way to crop the file.
  const content = fs.readFileSync(file).toString()
  if (content.includes("/// End of Danger DSL definition")) {
    fileOutput += content.split("/// End of Danger DSL definition")[0]
  } else {
    fileOutput += content
  }
  fileOutput += "\n"
})

// The definition of all the exposed vars is inside
// the Dangerfile.js file.
const allDangerfile = fs.readFileSync("source/runner/Dangerfile.ts").toString()
const moduleContext = allDangerfile.split("/// Start of Danger DSL definition")[1].split("/// End of Danger DSL definition")[0]

// we need to add either `declare function` or `declare var` to the interface
const context = moduleContext.split("\n").map((line) => {
  if ((line.length === 0) || (line.includes("*"))) { return line }
  if (line.includes("(")) { return "  function " + line.trim() }
  if (line.includes(":")) { return "  var " + line.trim() }
}).join("\n")

fileOutput += context

// Remove all JS-y bits
fileOutput = fileOutput.split("\n").filter((line) => {
  return !line.startsWith("import") &&
      !line.includes("* @type ")
}).join("\n")

// We don't export in  the definitions files
// fileOutput = fileOutput.replace(/export interface/gi, "interface")

// Remove any 2 line breaks
const flowTyped = fileOutput.replace(/\n\s*\n/g, "\n")

// This is so you can get it for this repo 👍
fs.writeFileSync("source/danger.d.ts", flowTyped)
fs.writeFileSync("distribution/danger.d.ts", flowTyped)
console.log("Awesome - shipped to source/danger.dts")
