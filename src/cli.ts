import fs = require("fs")
import path = require("path")
import optimist = require("optimist")

export enum ArgumentType {
  Integer = "integer",
  Float = "float",
  String = "string"
}

export class ArgumentDesc {
  required: Boolean;
  type: ArgumentType;
  description : string;
}

export function execute(cmd: ( args: { [id: string]: any } ) => any, options: { [id: string]: ArgumentDesc }, description: string ) {
  var argv = optimist.argv

  // parse command line
  if (argv.help || argv.h) {
    help(description, options)
    process.exit(0)
  } else if (argv.configuration) {
    configuration(description, options)
    process.exit(0)
  } else if (argv.version) {
    version()
    process.exit(0)
  } else if (validate(argv, options)) {
    var args: { [id: string]: any } = {};
    for (var optionName in options) {
      if (options[optionName].type == ArgumentType.Integer) {
        args[optionName] = parseInt(argv[optionName])
      }
      else if (options[optionName].type == ArgumentType.Float) {
        args[optionName] = parseFloat(argv[optionName])
      }
      else {
        args[optionName] = argv[optionName] as string
      }
    }
    cmd(args)
  } else {
    print('WRONG PARAMETERS')
    help(description, options)
    process.exit(1)
  }
}

export function print(message?: any) {
  console.log(message)
}

function validate (input, expectedOptions: { [id: string]: ArgumentDesc }) {
  var r: Boolean = true
  Object.keys(expectedOptions).forEach(k => {
    if (expectedOptions[k].required && !input.hasOwnProperty(k)) {
      r = false
    }
  })
  return r
}

function help(description: string, options: { [id: string]: ArgumentDesc } ) {
  let man = `${description}

Usage:
  cmd
  cmd [options]

Options:
  -h --help             Show this screen.
  --version             Show version.
  --configuration       Prints options and output configuration as JSON string.`

  man += `
`
  var tab = '                '
  for (var optionName in options) {
    let opt = options[optionName]
    let t = tab.substr(0, 20 - optionName.length)
    man += '\n  --' + optionName + t + (opt.type ? '<' + opt.type + '> ' : '')+ (opt.description ? opt.description : '')
  }
  print(man)
}

function version() {
  let argv = optimist.argv
  let packageFilePath: string = path.join(__dirname, 'package.json')
  if (!fs.existsSync(packageFilePath)) {
    packageFilePath = path.join(__dirname, '../package.json')
  }
  if (fs.existsSync(packageFilePath)) {
    let packageInfo = JSON.parse(fs.readFileSync(packageFilePath).toString())
    print('Version ' + packageInfo.version)
  }
}

function configuration (description: string, options: { [id: string]: ArgumentDesc } ) {
  print(JSON.stringify({description: description, options: options}))
}
