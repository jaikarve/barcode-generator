module.exports = {
  "extends": "kinvey-platform",
  "rules" : {
    // This allows properties of parameters to be written but not parameters themselves
    "no-param-reassign": ["error", { "props": false }],
  }
}
