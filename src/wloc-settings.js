/* wloc-settings.js - Build 2026-08-16 16:56:29 */
const runtimePlatform = (() => {
  const hasGlobal = (globalName) => globalName in globalThis;
  switch (true) {
    case hasGlobal("$task"):
      return "Quantumult X";
    case hasGlobal("$loon"):
      return "Loon";
    case hasGlobal("$rocket"):
      return "Shadowrocket";
    case hasGlobal("Egern"):
      return "Egern";
    case Boolean(globalThis.$environment?.["surge-version"]):
      return "Surge";
    case Boolean(globalThis.$environment?.["stash-version"]):
      return "Stash";
    case hasGlobal("Cloudflare"):
      return "Worker";
    case Boolean(globalThis.process?.versions?.node):
      return "Node.js";
    default:
      return;
  }
})();
class RuntimeConsole {
  static #counters = new Map([]);
  static #groupLabels = [];
  static #timers = new Map([]);
  static clear = () => {};
  static count = (counterLabel = "default") => {
    switch (RuntimeConsole.#counters.has(counterLabel)) {
      case true:
        RuntimeConsole.#counters.set(
          counterLabel,
          RuntimeConsole.#counters.get(counterLabel) + 1,
        );
        break;
      case false:
        RuntimeConsole.#counters.set(counterLabel, 0);
    }
    RuntimeConsole.log(
      `${counterLabel}: ${RuntimeConsole.#counters.get(counterLabel)}`,
    );
  };
  static countReset = (counterLabel = "default") => {
    switch (RuntimeConsole.#counters.has(counterLabel)) {
      case true:
        RuntimeConsole.#counters.set(counterLabel, 0);
        RuntimeConsole.log(
          `${counterLabel}: ${RuntimeConsole.#counters.get(counterLabel)}`,
        );
        break;
      case false:
        RuntimeConsole.warn(`Counter "${counterLabel}" doesn’t exist`);
    }
  };
  static debug = (...messages) => {
    RuntimeConsole.#logLevelValue < 4 ||
      ((messages = messages.map((message) => ` ${message}`)),
      RuntimeConsole.log(...messages));
  };
  static error(...errors) {
    if (!(RuntimeConsole.#logLevelValue < 1)) {
      switch (runtimePlatform) {
        case "Surge":
        case "Loon":
        case "Stash":
        case "Egern":
        case "Shadowrocket":
        case "Quantumult X":
        default:
          errors = errors.map((error) => ` ${error}`);
          break;
        case "Worker":
        case "Node.js":
          errors = errors.map((error) => ` ${error?.stack ?? error}`);
      }
      RuntimeConsole.log(...errors);
    }
  }
  static exception = (...errors) => RuntimeConsole.error(...errors);
  static group = (groupLabel) =>
    RuntimeConsole.#groupLabels.unshift(groupLabel);
  static groupEnd = () => RuntimeConsole.#groupLabels.shift();
  static info(...messages) {
    RuntimeConsole.#logLevelValue < 3 ||
      ((messages = messages.map((message) => ` ${message}`)),
      RuntimeConsole.log(...messages));
  }
  static #logLevelValue = 3;
  static get logLevel() {
    switch (RuntimeConsole.#logLevelValue) {
      case 0:
        return "OFF";
      case 1:
        return "ERROR";
      case 2:
        return "WARN";
      case 3:
      default:
        return "INFO";
      case 4:
        return "DEBUG";
      case 5:
        return "ALL";
    }
  }
  static set logLevel(level) {
    switch (typeof level) {
      case "string":
        level = level.toLowerCase();
        break;
      case "number":
        break;
      default:
        level = "warn";
    }
    switch (level) {
      case 0:
      case "off":
        RuntimeConsole.#logLevelValue = 0;
        break;
      case 1:
      case "error":
        RuntimeConsole.#logLevelValue = 1;
        break;
      case 2:
      case "warn":
      case "warning":
      default:
        RuntimeConsole.#logLevelValue = 2;
        break;
      case 3:
      case "info":
        RuntimeConsole.#logLevelValue = 3;
        break;
      case 4:
      case "debug":
        RuntimeConsole.#logLevelValue = 4;
        break;
      case 5:
      case "all":
        RuntimeConsole.#logLevelValue = 5;
    }
  }
  static log = (...messages) => {
    0 !== RuntimeConsole.#logLevelValue &&
      ((messages = messages.flatMap((message) => {
        switch (typeof message) {
          case "object":
            return [JSON.stringify(message)];
          case "bigint":
          case "number":
          case "boolean":
            return [message.toString()];
          case "string":
            return message.split(/\r?\n/u);
          default:
            return [message];
        }
      })),
      RuntimeConsole.#groupLabels.forEach((groupLabel) => {
        (messages = messages.map((line) => `  ${line}`)).unshift(
          ` ${groupLabel}:`,
        );
      }),
      (messages = ["", ...messages]),
      console.log(messages.join("\n")));
  };
  static time = (timerLabel = "default") =>
    RuntimeConsole.#timers.set(timerLabel, Date.now());
  static timeEnd = (timerLabel = "default") =>
    RuntimeConsole.#timers.delete(timerLabel);
  static timeLog = (timerLabel = "default") => {
    const startedAt = RuntimeConsole.#timers.get(timerLabel);
    startedAt
      ? RuntimeConsole.log(`${timerLabel}: ${Date.now() - startedAt}ms`)
      : RuntimeConsole.warn(`Timer "${timerLabel}" doesn’t exist`);
  };
  static warn(...messages) {
    RuntimeConsole.#logLevelValue < 2 ||
      ((messages = messages.map((message) => ` ${message}`)),
      RuntimeConsole.log(...messages));
  }
}
class ObjectUtils {
  static escape(html) {
    const htmlEntities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return html.replace(/[&<>"']/g, (character) => htmlEntities[character]);
  }
  static get(source = {}, path = "", defaultValue = void 0) {
    Array.isArray(path) || (path = ObjectUtils.toPath(path));
    const resolvedValue = path.reduce(
      (currentObject, pathComponent) => Object(currentObject)[pathComponent],
      source,
    );
    return void 0 === resolvedValue ? defaultValue : resolvedValue;
  }
  static merge(target, ...sources) {
    if (null == target) return target;
    for (const source of sources)
      if (null != source)
        for (const propertyName of Object.keys(source)) {
          const sourceValue = source[propertyName],
            targetValue = target[propertyName];
          switch (true) {
            case ObjectUtils.#isPlainObject(sourceValue) &&
              ObjectUtils.#isPlainObject(targetValue):
              target[propertyName] = ObjectUtils.merge(
                targetValue,
                sourceValue,
              );
              break;
            case sourceValue instanceof Map && targetValue instanceof Map:
              if (sourceValue.size > 0)
                for (const [entryKey, entryValue] of sourceValue)
                  targetValue.set(entryKey, entryValue);
              break;
            case sourceValue instanceof Set && targetValue instanceof Set:
              if (sourceValue.size > 0)
                for (const setValue of sourceValue) targetValue.add(setValue);
              break;
            case Array.isArray(sourceValue) &&
              0 === sourceValue.length &&
              void 0 !== targetValue:
            case sourceValue instanceof Map &&
              0 === sourceValue.size &&
              void 0 !== targetValue:
            case sourceValue instanceof Set &&
              0 === sourceValue.size &&
              void 0 !== targetValue:
              break;
            case void 0 !== sourceValue:
              target[propertyName] = sourceValue;
          }
        }
    return target;
  }
  static #isPlainObject(candidate) {
    if (null === candidate || "object" != typeof candidate) return false;
    const prototype = Object.getPrototypeOf(candidate);
    return null === prototype || prototype === Object.prototype;
  }
  static omit(source = {}, paths = []) {
    Array.isArray(paths) || (paths = [paths.toString()]);
    paths.forEach((path) => ObjectUtils.unset(source, path));
    return source;
  }
  static pick(source = {}, propertyNames = []) {
    Array.isArray(propertyNames) ||
      (propertyNames = [propertyNames.toString()]);
    const selectedEntries = Object.entries(source).filter(
      ([propertyName, propertyValue]) => propertyNames.includes(propertyName),
    );
    return Object.fromEntries(selectedEntries);
  }
  static set(target, path, assignedValue) {
    Array.isArray(path) || (path = ObjectUtils.toPath(path));
    path
      .slice(0, -1)
      .reduce(
        (currentObject, pathComponent, pathIndex) =>
          Object(currentObject[pathComponent]) === currentObject[pathComponent]
            ? currentObject[pathComponent]
            : (currentObject[pathComponent] = /^\d+$/.test(path[pathIndex + 1])
                ? []
                : {}),
        target,
      )[path[path.length - 1]] = assignedValue;
    return target;
  }
  static toPath(path) {
    return path
      .replace(/\[(\d+)\]/g, ".$1")
      .split(".")
      .filter(Boolean);
  }
  static unescape(html) {
    const decodedEntities = {
      "&amp;": "&",
      "&lt;": "<",
      "&gt;": ">",
      "&quot;": '"',
      "&#39;": "'",
    };
    return html.replace(
      /&amp;|&lt;|&gt;|&quot;|&#39;/g,
      (entity) => decodedEntities[entity],
    );
  }
  static unset(target = {}, path = "") {
    Array.isArray(path) || (path = ObjectUtils.toPath(path));
    return path.reduce(
      (currentObject, pathComponent, pathIndex) =>
        pathIndex === path.length - 1
          ? (delete currentObject[pathComponent], true)
          : Object(currentObject)[pathComponent],
      target,
    );
  }
}
class ArgumentParser {
  static parse(argument) {
    let parsedArguments = {};
    switch (typeof argument) {
      case "string": {
        const queryString = argument.replace(/^\?/, "");
        if (!queryString) break;
        const queryEntries = Object.fromEntries(
          queryString
            .split("&")
            .filter(Boolean)
            .map((queryPair) => {
              const [encodedKey = "", encodedValue = ""] = queryPair.split(
                "=",
                2,
              );
              return [
                ArgumentParser.#decodeQueryComponent(encodedKey).replace(
                  /\[([^\[\]]+)\]/g,
                  ".$1",
                ),
                ArgumentParser.#decodeQueryComponent(encodedValue).replace(
                  /\"/g,
                  "",
                ),
              ];
            }),
        );
        Object.keys(queryEntries).forEach((argumentPath) =>
          ObjectUtils.set(
            parsedArguments,
            argumentPath,
            queryEntries[argumentPath],
          ),
        );
        break;
      }
      case "object":
        switch (argument) {
          case null:
            break;
          default: {
            const nestedArguments = {};
            Object.keys(argument).forEach((argumentPath) =>
              ObjectUtils.set(
                nestedArguments,
                argumentPath,
                argument[argumentPath],
              ),
            );
            parsedArguments = nestedArguments;
            break;
          }
        }
        break;
      case "undefined":
        parsedArguments = {};
    }
    return parsedArguments;
  }
  static stringify(argument = {}) {
    if (!argument || "object" != typeof argument) return "";
    const queryEntries = [];
    Object.keys(argument).forEach((argumentPath) =>
      ArgumentParser.#appendQueryEntries(argument, argumentPath, queryEntries),
    );
    return 0 === queryEntries.length
      ? ""
      : queryEntries
          .map(
            ([argumentPath, argumentValue]) =>
              `${ArgumentParser.#encodeQueryComponent(ArgumentParser.#formatQueryPath(argumentPath))}=${ArgumentParser.#encodeQueryComponent(argumentValue)}`,
          )
          .join("&");
  }
  static #appendQueryEntries(argument, argumentPath, queryEntries) {
    const argumentValue = ObjectUtils.get(argument, argumentPath);
    void 0 !== argumentValue &&
      (null !== argumentValue
        ? Array.isArray(argumentValue)
          ? argumentValue.forEach((arrayValue, arrayIndex) => {
              void 0 !== arrayValue &&
                ArgumentParser.#appendQueryEntries(
                  argument,
                  `${argumentPath}[${arrayIndex}]`,
                  queryEntries,
                );
            })
          : ArgumentParser.#isPlainObject(argumentValue)
            ? Object.keys(argumentValue).forEach((propertyName) =>
                ArgumentParser.#appendQueryEntries(
                  argument,
                  `${argumentPath}.${propertyName}`,
                  queryEntries,
                ),
              )
            : queryEntries.push([argumentPath, String(argumentValue)])
        : queryEntries.push([argumentPath, ""]));
  }
  static #formatQueryPath(argumentPath) {
    const [rootComponent, ...remainingComponents] =
      ObjectUtils.toPath(argumentPath);
    return remainingComponents.reduce(
      (formattedPath, pathComponent) =>
        /^\d+$/.test(pathComponent)
          ? `${formattedPath}[${pathComponent}]`
          : `${formattedPath}.${pathComponent}`,
      rootComponent,
    );
  }
  static #isPlainObject(candidate) {
    if (
      null === candidate ||
      "object" != typeof candidate ||
      Array.isArray(candidate)
    )
      return false;
    const prototype = Object.getPrototypeOf(candidate);
    return null === prototype || prototype === Object.prototype;
  }
  static #encodeQueryComponent(component) {
    return encodeURIComponent(component);
  }
  static #decodeQueryComponent(encodedComponent) {
    return decodeURIComponent(encodedComponent.replace(/\+/g, " "));
  }
}
RuntimeConsole.debug(" $argument");
globalThis.$argument = ArgumentParser.parse(globalThis.$argument);
globalThis.$argument.LogLevel &&
  (RuntimeConsole.logLevel = globalThis.$argument.LogLevel);
RuntimeConsole.debug(
  " $argument",
  `$argument: ${JSON.stringify(globalThis.$argument)}`,
);
const httpStatusMessages = {
  100: "Continue",
  101: "Switching Protocols",
  102: "Processing",
  103: "Early Hints",
  200: "OK",
  201: "Created",
  202: "Accepted",
  203: "Non-Authoritative Information",
  204: "No Content",
  205: "Reset Content",
  206: "Partial Content",
  207: "Multi-Status",
  208: "Already Reported",
  226: "IM Used",
  300: "Multiple Choices",
  301: "Moved Permanently",
  302: "Found",
  304: "Not Modified",
  307: "Temporary Redirect",
  308: "Permanent Redirect",
  400: "Bad Request",
  401: "Unauthorized",
  402: "Payment Required",
  403: "Forbidden",
  404: "Not Found",
  405: "Method Not Allowed",
  406: "Not Acceptable",
  407: "Proxy Authentication Required",
  408: "Request Timeout",
  409: "Conflict",
  410: "Gone",
  411: "Length Required",
  412: "Precondition Failed",
  413: "Content Too Large",
  414: "URI Too Long",
  415: "Unsupported Media Type",
  416: "Range Not Satisfiable",
  417: "Expectation Failed",
  418: "I'm a teapot",
  421: "Misdirected Request",
  422: "Unprocessable Entity",
  423: "Locked",
  424: "Failed Dependency",
  425: "Too Early",
  426: "Upgrade Required",
  428: "Precondition Required",
  429: "Too Many Requests",
  431: "Request Header Fields Too Large",
  451: "Unavailable For Legal Reasons",
  500: "Internal Server Error",
  501: "Not Implemented",
  502: "Bad Gateway",
  503: "Service Unavailable",
  504: "Gateway Timeout",
  505: "HTTP Version Not Supported",
  506: "Variant Also Negotiates",
  507: "Insufficient Storage",
  508: "Loop Detected",
  510: "Not Extended",
  511: "Network Authentication Required",
};
function completeRequest(result = {}) {
  switch (runtimePlatform) {
    case "Surge":
      result.policy &&
        ObjectUtils.set(result, "headers.X-Surge-Policy", result.policy);
      RuntimeConsole.log(
        " 执行结束!",
        ` ${new Date().getTime() / 1000 - $script.startTime} 秒`,
      );
      $done(result);
      break;
    case "Loon":
      result.policy && (result.node = result.policy);
      RuntimeConsole.log(
        " 执行结束!",
        ` ${(new Date() - $script.startTime) / 1000} 秒`,
      );
      $done(result);
      break;
    case "Stash":
      result.policy &&
        ObjectUtils.set(
          result,
          "headers.X-Stash-Selected-Proxy",
          encodeURI(result.policy),
        );
      RuntimeConsole.log(
        " 执行结束!",
        ` ${(new Date() - $script.startTime) / 1000} 秒`,
      );
      $done(result);
      break;
    case "Egern":
    case "Shadowrocket":
      RuntimeConsole.log(" 执行结束!");
      $done(result);
      break;
    case "Quantumult X":
      switch (
        (result.policy && ObjectUtils.set(result, "opts.policy", result.policy),
        typeof (result = ObjectUtils.pick(result, [
          "status",
          "url",
          "headers",
          "body",
          "bodyBytes",
        ])).status)
      ) {
        case "number":
          result.status = `HTTP/1.1 ${result.status} ${httpStatusMessages[result.status]}`;
          break;
        case "string":
        case "undefined":
          break;
        default:
          throw new TypeError(
            `${Function.name}: 参数类型错误, status 必须为数字或字符串`,
          );
      }
      result.body instanceof ArrayBuffer
        ? ((result.bodyBytes = result.body), (result.body = void 0))
        : ArrayBuffer.isView(result.body)
          ? ((result.bodyBytes = result.body.buffer.slice(
              result.body.byteOffset,
              result.body.byteLength + result.body.byteOffset,
            )),
            (result.body = void 0))
          : result.body && (result.bodyBytes = void 0);
      RuntimeConsole.log(" 执行结束!");
      $done(result);
      break;
    case "Worker":
    default:
      RuntimeConsole.log(" 执行结束!");
      break;
    case "Node.js":
      RuntimeConsole.log(" 执行结束!");
      process.exit(1);
  }
}
class PersistentStorage {
  static data = null;
  static dataFile = "box.dat";
  static #nestedKeyPattern = /^@(?<key>[^.]+)(?:\.(?<path>.*))?$/;
  static getItem(storageKey, defaultValue = null) {
    let storedValue = defaultValue;
    switch (storageKey.startsWith("@")) {
      case true: {
        const { key: rootKey, path: nestedPath } = storageKey.match(
          PersistentStorage.#nestedKeyPattern,
        )?.groups;
        storageKey = rootKey;
        let storedObject = PersistentStorage.getItem(storageKey, {});
        "object" != typeof storedObject && (storedObject = {});
        storedValue = ObjectUtils.get(storedObject, nestedPath);
        try {
          storedValue = JSON.parse(storedValue);
        } catch {}
        break;
      }
      default:
        switch (runtimePlatform) {
          case "Surge":
          case "Loon":
          case "Stash":
          case "Egern":
          case "Shadowrocket":
            storedValue = $persistentStore.read(storageKey);
            break;
          case "Quantumult X":
            storedValue = $prefs.valueForKey(storageKey);
            break;
          case "Worker":
            PersistentStorage.data = PersistentStorage.data ?? {};
            storedValue = PersistentStorage.data[storageKey];
            break;
          case "Node.js":
            PersistentStorage.data = PersistentStorage.#readDataFile(
              PersistentStorage.dataFile,
            );
            storedValue = PersistentStorage.data?.[storageKey];
            break;
          default:
            storedValue = PersistentStorage.data?.[storageKey] || null;
        }
        try {
          storedValue = JSON.parse(storedValue);
        } catch {}
    }
    return storedValue ?? defaultValue;
  }
  static setItem(storageKey = new String(), storedValue = new String()) {
    let writeResult = false;
    if ("object" == typeof storedValue)
      storedValue = JSON.stringify(storedValue);
    else storedValue = String(storedValue);
    switch (storageKey.startsWith("@")) {
      case true: {
        const { key: rootKey, path: nestedPath } = storageKey.match(
          PersistentStorage.#nestedKeyPattern,
        )?.groups;
        storageKey = rootKey;
        let storedObject = PersistentStorage.getItem(storageKey, {});
        "object" != typeof storedObject && (storedObject = {});
        ObjectUtils.set(storedObject, nestedPath, storedValue);
        writeResult = PersistentStorage.setItem(storageKey, storedObject);
        break;
      }
      default:
        switch (runtimePlatform) {
          case "Surge":
          case "Loon":
          case "Stash":
          case "Egern":
          case "Shadowrocket":
            writeResult = $persistentStore.write(storedValue, storageKey);
            break;
          case "Quantumult X":
            writeResult = $prefs.setValueForKey(storedValue, storageKey);
            break;
          case "Worker":
            PersistentStorage.data = PersistentStorage.data ?? {};
            PersistentStorage.data[storageKey] = storedValue;
            writeResult = true;
            break;
          case "Node.js":
            PersistentStorage.data = PersistentStorage.#readDataFile(
              PersistentStorage.dataFile,
            );
            PersistentStorage.data[storageKey] = storedValue;
            PersistentStorage.#writeDataFile(PersistentStorage.dataFile);
            writeResult = true;
            break;
          default:
            writeResult = PersistentStorage.data?.[storageKey] || null;
        }
    }
    return writeResult;
  }
  static removeItem(storageKey) {
    let removeResult = false;
    switch (storageKey.startsWith("@")) {
      case true: {
        const { key: rootKey, path: nestedPath } = storageKey.match(
          PersistentStorage.#nestedKeyPattern,
        )?.groups;
        storageKey = rootKey;
        let storedObject = PersistentStorage.getItem(storageKey);
        "object" != typeof storedObject && (storedObject = {});
        ObjectUtils.unset(storedObject, nestedPath);
        removeResult = PersistentStorage.setItem(storageKey, storedObject);
        break;
      }
      default:
        switch (runtimePlatform) {
          case "Surge":
            removeResult = $persistentStore.write(null, storageKey);
            break;
          case "Loon":
          case "Stash":
          case "Egern":
          case "Shadowrocket":
          default:
            removeResult = false;
            break;
          case "Quantumult X":
            removeResult = $prefs.removeValueForKey(storageKey);
            break;
          case "Worker":
            PersistentStorage.data = PersistentStorage.data ?? {};
            delete PersistentStorage.data[storageKey];
            removeResult = true;
            break;
          case "Node.js":
            PersistentStorage.data = PersistentStorage.#readDataFile(
              PersistentStorage.dataFile,
            );
            delete PersistentStorage.data[storageKey];
            PersistentStorage.#writeDataFile(PersistentStorage.dataFile);
            removeResult = true;
        }
    }
    return removeResult;
  }
  static clear() {
    let clearResult = false;
    switch (runtimePlatform) {
      case "Surge":
      case "Loon":
      case "Stash":
      case "Egern":
      case "Shadowrocket":
      default:
        clearResult = false;
        break;
      case "Quantumult X":
        clearResult = $prefs.removeAllValues();
        break;
      case "Worker":
        PersistentStorage.data = {};
        clearResult = true;
        break;
      case "Node.js":
        PersistentStorage.data = PersistentStorage.#readDataFile(
          PersistentStorage.dataFile,
        );
        PersistentStorage.data = {};
        PersistentStorage.#writeDataFile(PersistentStorage.dataFile);
        clearResult = true;
    }
    return clearResult;
  }
  static #readDataFile = (fileName) => {
    if ("Node.js" !== runtimePlatform) return {};
    {
      this.fs = this.fs ? this.fs : require("fs");
      this.path = this.path ? this.path : require("path");
      const resolvedPath = this.path.resolve(fileName),
        workingDirectoryPath = this.path.resolve(process.cwd(), fileName),
        resolvedPathExists = this.fs.existsSync(resolvedPath),
        workingDirectoryPathExists =
          !resolvedPathExists && this.fs.existsSync(workingDirectoryPath);
      if (!resolvedPathExists && !workingDirectoryPathExists) return {};
      {
        const readPath = resolvedPathExists
          ? resolvedPath
          : workingDirectoryPath;
        try {
          return JSON.parse(this.fs.readFileSync(readPath));
        } catch (readError) {
          return {};
        }
      }
    }
  };
  static #writeDataFile = (fileName = this.dataFile) => {
    if ("Node.js" === runtimePlatform) {
      this.fs = this.fs ? this.fs : require("fs");
      this.path = this.path ? this.path : require("path");
      const resolvedPath = this.path.resolve(fileName),
        workingDirectoryPath = this.path.resolve(process.cwd(), fileName),
        resolvedPathExists = this.fs.existsSync(resolvedPath),
        workingDirectoryPathExists =
          !resolvedPathExists && this.fs.existsSync(workingDirectoryPath),
        serializedData = JSON.stringify(this.data);
      resolvedPathExists
        ? this.fs.writeFileSync(resolvedPath, serializedData)
        : workingDirectoryPathExists
          ? this.fs.writeFileSync(workingDirectoryPath, serializedData)
          : this.fs.writeFileSync(resolvedPath, serializedData);
    }
  };
}
const settingsStorageKey = "wloc_settings",
  requestUrl = $request.url || "";
function parseCoordinate(value) {
  return parseFloat(String(value || "0").replace(",", "."));
}
const queryParameters = (function (url) {
    const queryString = url.split("?")[1] || "",
      parameters = new Map();
    for (const queryEntry of queryString.split("&")) {
      if (!queryEntry) continue;
      const separatorIndex = queryEntry.indexOf("="),
        encodedKey =
          -1 === separatorIndex
            ? queryEntry
            : queryEntry.slice(0, separatorIndex),
        encodedValue =
          -1 === separatorIndex ? "" : queryEntry.slice(separatorIndex + 1);
      let key, value;
      try {
        key = decodeURIComponent(encodedKey.replace(/\+/g, " "));
      } catch {
        key = encodedKey;
      }
      try {
        value = decodeURIComponent(encodedValue.replace(/\+/g, " "));
      } catch {
        value = encodedValue;
      }
      parameters.has(key) || parameters.set(key, value);
    }
    return parameters;
  })(requestUrl),
  action = queryParameters.get("action") || "save";
let result;
if (
  (RuntimeConsole.debug(`[wloc-settings] url=${requestUrl}, action=${action}`),
  "query" === action)
)
  try {
    const savedSettings = PersistentStorage.getItem(settingsStorageKey);
    savedSettings &&
    "object" == typeof savedSettings &&
    savedSettings.longitude &&
    savedSettings.latitude
      ? ((result = {
          success: true,
          longitude: savedSettings.longitude,
          latitude: savedSettings.latitude,
          accuracy: savedSettings.accuracy || 25,
          randomRadius: savedSettings.randomRadius ?? 0,
          updatedAt: savedSettings.updatedAt || null,
        }),
        RuntimeConsole.debug(
          `[wloc-settings] 查询: ${savedSettings.longitude}, ${savedSettings.latitude}`,
        ))
      : (result = {
          success: false,
          error: "无已保存的坐标",
        });
  } catch (error) {
    result = {
      success: false,
      error: error.message || "读取失败",
    };
  }
else if ("clear" === action)
  try {
    PersistentStorage.setItem(settingsStorageKey, null);
    result = {
      success: true,
    };
    RuntimeConsole.info("[wloc-settings] 已清除坐标数据");
  } catch (error) {
    result = {
      success: false,
      error: error.message || "清除失败",
    };
    RuntimeConsole.error(`[wloc-settings] 清除失败: ${error.message}`);
  }
else {
  const longitude = parseCoordinate(
      queryParameters.get("lon") || queryParameters.get("longitude"),
    ),
    latitude = parseCoordinate(
      queryParameters.get("lat") || queryParameters.get("latitude"),
    ),
    accuracy = parseInt(
      queryParameters.get("acc") || queryParameters.get("accuracy") || "25",
      10,
    );
  if (
    !Number.isFinite(longitude) ||
    !Number.isFinite(latitude) ||
    Math.abs(latitude) > 90 ||
    Math.abs(longitude) > 180
  )
    result = {
      success: false,
      error: "缺少 lon/lat 参数",
    };
  else {
    let previousSettings = {};
    try {
      const savedSettings = PersistentStorage.getItem(settingsStorageKey);
      savedSettings &&
        "object" == typeof savedSettings &&
        (previousSettings = savedSettings);
    } catch {}
    const settings = {
        ...previousSettings,
        longitude: longitude,
        latitude: latitude,
        accuracy: accuracy,
        updatedAt: new Date(Date.now() + 28800000)
          .toISOString()
          .replace("Z", "+08:00"),
      },
      randomRadiusParameter = queryParameters.get("randomRadius");
    null != randomRadiusParameter &&
      "" !== randomRadiusParameter &&
      (settings.randomRadius = parseCoordinate(randomRadiusParameter));
    try {
      PersistentStorage.setItem(settingsStorageKey, settings)
        ? ((result = {
            success: true,
            longitude: longitude,
            latitude: latitude,
            accuracy: accuracy,
            randomRadius: settings.randomRadius ?? 0,
          }),
          RuntimeConsole.info(
            `[wloc-settings] 已保存: ${longitude}, ${latitude}`,
          ))
        : ((result = {
            success: false,
            error: "Storage.setItem 返回 false",
          }),
          RuntimeConsole.error("[wloc-settings] setItem 返回 false"));
    } catch (error) {
      result = {
        success: false,
        error: error.message || "写入失败",
      };
      RuntimeConsole.error(`[wloc-settings] ${error.message}`);
    }
  }
}
const jsonResponse = {
  status: 200,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
  },
  body: JSON.stringify(result),
};
completeRequest(
  "Quantumult X" === runtimePlatform
    ? jsonResponse
    : {
        response: jsonResponse,
      },
);
