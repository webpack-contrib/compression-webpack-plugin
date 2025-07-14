/**
 * @param {string} str string
 * @returns {string} normalized string
 */
function removeCWD(str) {
  const isWin = process.platform === "win32";
  let cwd = process.cwd();

  if (isWin) {
    str = str.replaceAll("\\", "/");

    cwd = cwd.replaceAll("\\", "/");
  }

  return str.replaceAll(new RegExp(cwd, "g"), "");
}

/**
 * @param {Error[]} errors errors
 * @returns {string[]} normalized errors
 */
export default (errors) =>
  errors.map((error) =>
    removeCWD(error.toString().split("\n").slice(0, 2).join("\n")),
  );
