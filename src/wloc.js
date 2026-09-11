/* wloc.js - Build 2026-08-08 21:31:58 */
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
function zeroInflateArray(array) {
  let index = array.length;
  for (; --index >= 0;) array[index] = 0;
}
zeroInflateArray(new Array(576));
zeroInflateArray(new Array(60));
zeroInflateArray(new Array(512));
zeroInflateArray(new Array(256));
zeroInflateArray(new Array(29));
zeroInflateArray(new Array(30));
var adler32 = (checksum, buffer, remainingLength, position) => {
  let adlerLow = 65535 & checksum,
    adlerHigh = (checksum >>> 16) & 65535,
    blockLength = 0;
  for (; 0 !== remainingLength;) {
    blockLength = remainingLength > 2000 ? 2000 : remainingLength;
    remainingLength -= blockLength;
    do {
      adlerLow = (adlerLow + buffer[position++]) | 0;
      adlerHigh = (adlerHigh + adlerLow) | 0;
    } while (--blockLength);
    adlerLow %= 65521;
    adlerHigh %= 65521;
  }
  return adlerLow | (adlerHigh << 16);
};
const crc32Table = new Uint32Array(
  (() => {
    let crc,
      table = [];
    for (var byte = 0; byte < 256; byte++) {
      crc = byte;
      for (var bitIndex = 0; bitIndex < 8; bitIndex++)
        crc = 1 & crc ? 3988292384 ^ (crc >>> 1) : crc >>> 1;
      table[byte] = crc;
    }
    return table;
  })(),
);
var crc32 = (checksum, buffer, length, position) => {
    const table = crc32Table,
      endPosition = position + length;
    checksum ^= -1;
    for (let byteIndex = position; byteIndex < endPosition; byteIndex++)
      checksum = (checksum >>> 8) ^ table[255 & (checksum ^ buffer[byteIndex])];
    return -1 ^ checksum;
  },
  zlibStatusMessages = {
    2: "need dictionary",
    1: "stream end",
    0: "",
    "-1": "file error",
    "-2": "stream error",
    "-3": "data error",
    "-4": "insufficient memory",
    "-5": "buffer error",
    "-6": "incompatible version",
  },
  zlibConstants = {
    Z_NO_FLUSH: 0,
    Z_FINISH: 4,
    Z_BLOCK: 5,
    Z_TREES: 6,
    Z_OK: 0,
    Z_STREAM_END: 1,
    Z_NEED_DICT: 2,
    Z_STREAM_ERROR: -2,
    Z_DATA_ERROR: -3,
    Z_MEM_ERROR: -4,
    Z_BUF_ERROR: -5,
    Z_DEFLATED: 8,
  };
const hasInflateOwnProperty = (object, property) =>
  Object.prototype.hasOwnProperty.call(object, property);
var assignInflateOptions = function (target) {
    const sources = Array.prototype.slice.call(arguments, 1);
    for (; sources.length;) {
      const source = sources.shift();
      if (source) {
        if ("object" != typeof source)
          throw new TypeError(source + "must be non-object");
        for (const property in source)
          hasInflateOwnProperty(source, property) &&
            (target[property] = source[property]);
      }
    }
    return target;
  },
  flattenInflateChunks = (chunks) => {
    let totalLength = 0;
    for (
      let chunkIndex = 0, chunkCount = chunks.length;
      chunkIndex < chunkCount;
      chunkIndex++
    )
      totalLength += chunks[chunkIndex].length;
    const result = new Uint8Array(totalLength);
    for (
      let chunkIndex = 0, outputOffset = 0, chunkCount = chunks.length;
      chunkIndex < chunkCount;
      chunkIndex++
    ) {
      let chunk = chunks[chunkIndex];
      result.set(chunk, outputOffset);
      outputOffset += chunk.length;
    }
    return result;
  };
let supportsTypedArrayCharCodes = true;
try {
  String.fromCharCode.apply(null, new Uint8Array(1));
} catch (typedArrayApplyError) {
  supportsTypedArrayCharCodes = false;
}
const utf8SequenceLengths = new Uint8Array(256);
for (let byte = 0; byte < 256; byte++)
  utf8SequenceLengths[byte] =
    byte >= 252
      ? 6
      : byte >= 248
        ? 5
        : byte >= 240
          ? 4
          : byte >= 224
            ? 3
            : byte >= 192
              ? 2
              : 1;
utf8SequenceLengths[254] = utf8SequenceLengths[255] = 1;
var stringToUtf8Bytes = (text) => {
    if ("function" == typeof TextEncoder && TextEncoder.prototype.encode)
      return new TextEncoder().encode(text);
    let buffer,
      codePoint,
      lowSurrogate,
      stringIndex,
      byteIndex,
      stringLength = text.length,
      byteLength = 0;
    for (stringIndex = 0; stringIndex < stringLength; stringIndex++) {
      codePoint = text.charCodeAt(stringIndex);
      55296 == (64512 & codePoint) &&
        stringIndex + 1 < stringLength &&
        ((lowSurrogate = text.charCodeAt(stringIndex + 1)),
        56320 == (64512 & lowSurrogate) &&
          ((codePoint =
            65536 + ((codePoint - 55296) << 10) + (lowSurrogate - 56320)),
          stringIndex++));
      byteLength +=
        codePoint < 128 ? 1 : codePoint < 2048 ? 2 : codePoint < 65536 ? 3 : 4;
    }
    for (
      buffer = new Uint8Array(byteLength), byteIndex = 0, stringIndex = 0;
      byteIndex < byteLength;
      stringIndex++
    ) {
      codePoint = text.charCodeAt(stringIndex);
      55296 == (64512 & codePoint) &&
        stringIndex + 1 < stringLength &&
        ((lowSurrogate = text.charCodeAt(stringIndex + 1)),
        56320 == (64512 & lowSurrogate) &&
          ((codePoint =
            65536 + ((codePoint - 55296) << 10) + (lowSurrogate - 56320)),
          stringIndex++));
      codePoint < 128
        ? (buffer[byteIndex++] = codePoint)
        : codePoint < 2048
          ? ((buffer[byteIndex++] = 192 | (codePoint >>> 6)),
            (buffer[byteIndex++] = 128 | (63 & codePoint)))
          : codePoint < 65536
            ? ((buffer[byteIndex++] = 224 | (codePoint >>> 12)),
              (buffer[byteIndex++] = 128 | ((codePoint >>> 6) & 63)),
              (buffer[byteIndex++] = 128 | (63 & codePoint)))
            : ((buffer[byteIndex++] = 240 | (codePoint >>> 18)),
              (buffer[byteIndex++] = 128 | ((codePoint >>> 12) & 63)),
              (buffer[byteIndex++] = 128 | ((codePoint >>> 6) & 63)),
              (buffer[byteIndex++] = 128 | (63 & codePoint)));
    }
    return buffer;
  },
  utf8BytesToString = (buffer, maximumLength) => {
    const byteLength = maximumLength || buffer.length;
    if ("function" == typeof TextDecoder && TextDecoder.prototype.decode)
      return new TextDecoder().decode(buffer.subarray(0, maximumLength));
    let byteIndex, codeUnitCount;
    const codeUnits = new Array(2 * byteLength);
    for (codeUnitCount = 0, byteIndex = 0; byteIndex < byteLength;) {
      let codePoint = buffer[byteIndex++];
      if (codePoint < 128) {
        codeUnits[codeUnitCount++] = codePoint;
        continue;
      }
      let sequenceLength = utf8SequenceLengths[codePoint];
      if (sequenceLength > 4) {
        codeUnits[codeUnitCount++] = 65533;
        byteIndex += sequenceLength - 1;
      } else {
        for (
          codePoint &=
            2 === sequenceLength ? 31 : 3 === sequenceLength ? 15 : 7;
          sequenceLength > 1 && byteIndex < byteLength;
        ) {
          codePoint = (codePoint << 6) | (63 & buffer[byteIndex++]);
          sequenceLength--;
        }
        sequenceLength > 1
          ? (codeUnits[codeUnitCount++] = 65533)
          : codePoint < 65536
            ? (codeUnits[codeUnitCount++] = codePoint)
            : ((codePoint -= 65536),
              (codeUnits[codeUnitCount++] = 55296 | ((codePoint >> 10) & 1023)),
              (codeUnits[codeUnitCount++] = 56320 | (1023 & codePoint)));
      }
    }
    return ((codeUnits, length) => {
      if (length < 65534 && codeUnits.subarray && supportsTypedArrayCharCodes)
        return String.fromCharCode.apply(
          null,
          codeUnits.length === length
            ? codeUnits
            : codeUnits.subarray(0, length),
        );
      let text = "";
      for (let codeUnitIndex = 0; codeUnitIndex < length; codeUnitIndex++)
        text += String.fromCharCode(codeUnits[codeUnitIndex]);
      return text;
    })(codeUnits, codeUnitCount);
  },
  findUtf8Boundary = (buffer, maximumLength) => {
    (maximumLength = maximumLength || buffer.length) > buffer.length &&
      (maximumLength = buffer.length);
    let sequenceStart = maximumLength - 1;
    for (; sequenceStart >= 0 && 128 == (192 & buffer[sequenceStart]);)
      sequenceStart--;
    return sequenceStart < 0 || 0 === sequenceStart
      ? maximumLength
      : sequenceStart + utf8SequenceLengths[buffer[sequenceStart]] >
          maximumLength
        ? sequenceStart
        : maximumLength;
  };
var ZlibStream = function () {
  this.input = null;
  this.next_in = 0;
  this.avail_in = 0;
  this.total_in = 0;
  this.output = null;
  this.next_out = 0;
  this.avail_out = 0;
  this.total_out = 0;
  this.msg = "";
  this.state = null;
  this.data_type = 2;
  this.adler = 0;
};
const INFLATE_FAST_MODE_BAD = 16209;
var inflateFast = function (stream, initialAvailableOutput) {
  let inputPosition,
    inputLimit,
    outputPosition,
    outputStart,
    outputLimit,
    maximumDistance,
    windowSize,
    windowAvailable,
    windowNext,
    window,
    bitBuffer,
    bitCount,
    literalLengthTable,
    distanceTable,
    literalLengthMask,
    distanceMask,
    tableEntry,
    operation,
    matchLength,
    distance,
    copyPosition,
    copySource,
    input,
    output;
  const state = stream.state;
  inputPosition = stream.next_in;
  input = stream.input;
  inputLimit = inputPosition + (stream.avail_in - 5);
  outputPosition = stream.next_out;
  output = stream.output;
  outputStart = outputPosition - (initialAvailableOutput - stream.avail_out);
  outputLimit = outputPosition + (stream.avail_out - 257);
  maximumDistance = state.dmax;
  windowSize = state.wsize;
  windowAvailable = state.whave;
  windowNext = state.wnext;
  window = state.window;
  bitBuffer = state.hold;
  bitCount = state.bits;
  literalLengthTable = state.lencode;
  distanceTable = state.distcode;
  literalLengthMask = (1 << state.lenbits) - 1;
  distanceMask = (1 << state.distbits) - 1;
  e: do {
    bitCount < 15 &&
      ((bitBuffer += input[inputPosition++] << bitCount),
      (bitCount += 8),
      (bitBuffer += input[inputPosition++] << bitCount),
      (bitCount += 8));
    tableEntry = literalLengthTable[bitBuffer & literalLengthMask];
    t: for (;;) {
      if (
        ((operation = tableEntry >>> 24),
        (bitBuffer >>>= operation),
        (bitCount -= operation),
        (operation = (tableEntry >>> 16) & 255),
        0 === operation)
      )
        output[outputPosition++] = 65535 & tableEntry;
      else {
        if (!(16 & operation)) {
          if (64 & operation) {
            if (32 & operation) {
              state.mode = 16191;
              break e;
            }
            stream.msg = "invalid literal/length code";
            state.mode = INFLATE_FAST_MODE_BAD;
            break e;
          }
          tableEntry =
            literalLengthTable[
              (65535 & tableEntry) + (bitBuffer & ((1 << operation) - 1))
            ];
          continue t;
        }
        for (
          matchLength = 65535 & tableEntry,
            operation &= 15,
            operation &&
              (bitCount < operation &&
                ((bitBuffer += input[inputPosition++] << bitCount),
                (bitCount += 8)),
              (matchLength += bitBuffer & ((1 << operation) - 1)),
              (bitBuffer >>>= operation),
              (bitCount -= operation)),
            bitCount < 15 &&
              ((bitBuffer += input[inputPosition++] << bitCount),
              (bitCount += 8),
              (bitBuffer += input[inputPosition++] << bitCount),
              (bitCount += 8)),
            tableEntry = distanceTable[bitBuffer & distanceMask];
          ;
        ) {
          if (
            ((operation = tableEntry >>> 24),
            (bitBuffer >>>= operation),
            (bitCount -= operation),
            (operation = (tableEntry >>> 16) & 255),
            16 & operation)
          ) {
            if (
              ((distance = 65535 & tableEntry),
              (operation &= 15),
              bitCount < operation &&
                ((bitBuffer += input[inputPosition++] << bitCount),
                (bitCount += 8),
                bitCount < operation &&
                  ((bitBuffer += input[inputPosition++] << bitCount),
                  (bitCount += 8))),
              (distance += bitBuffer & ((1 << operation) - 1)),
              distance > maximumDistance)
            ) {
              stream.msg = "invalid distance too far back";
              state.mode = INFLATE_FAST_MODE_BAD;
              break e;
            }
            if (
              ((bitBuffer >>>= operation),
              (bitCount -= operation),
              (operation = outputPosition - outputStart),
              distance > operation)
            ) {
              if (
                ((operation = distance - operation),
                operation > windowAvailable && state.sane)
              ) {
                stream.msg = "invalid distance too far back";
                state.mode = INFLATE_FAST_MODE_BAD;
                break e;
              }
              if (
                ((copyPosition = 0), (copySource = window), 0 === windowNext)
              ) {
                if (
                  ((copyPosition += windowSize - operation),
                  operation < matchLength)
                ) {
                  matchLength -= operation;
                  do {
                    output[outputPosition++] = window[copyPosition++];
                  } while (--operation);
                  copyPosition = outputPosition - distance;
                  copySource = output;
                }
              } else if (windowNext < operation) {
                if (
                  ((copyPosition += windowSize + windowNext - operation),
                  (operation -= windowNext),
                  operation < matchLength)
                ) {
                  matchLength -= operation;
                  do {
                    output[outputPosition++] = window[copyPosition++];
                  } while (--operation);
                  if (((copyPosition = 0), windowNext < matchLength)) {
                    operation = windowNext;
                    matchLength -= operation;
                    do {
                      output[outputPosition++] = window[copyPosition++];
                    } while (--operation);
                    copyPosition = outputPosition - distance;
                    copySource = output;
                  }
                }
              } else if (
                ((copyPosition += windowNext - operation),
                operation < matchLength)
              ) {
                matchLength -= operation;
                do {
                  output[outputPosition++] = window[copyPosition++];
                } while (--operation);
                copyPosition = outputPosition - distance;
                copySource = output;
              }
              for (; matchLength > 2;) {
                output[outputPosition++] = copySource[copyPosition++];
                output[outputPosition++] = copySource[copyPosition++];
                output[outputPosition++] = copySource[copyPosition++];
                matchLength -= 3;
              }
              matchLength &&
                ((output[outputPosition++] = copySource[copyPosition++]),
                matchLength > 1 &&
                  (output[outputPosition++] = copySource[copyPosition++]));
            } else {
              copyPosition = outputPosition - distance;
              do {
                output[outputPosition++] = output[copyPosition++];
                output[outputPosition++] = output[copyPosition++];
                output[outputPosition++] = output[copyPosition++];
                matchLength -= 3;
              } while (matchLength > 2);
              matchLength &&
                ((output[outputPosition++] = output[copyPosition++]),
                matchLength > 1 &&
                  (output[outputPosition++] = output[copyPosition++]));
            }
            break;
          }
          if (64 & operation) {
            stream.msg = "invalid distance code";
            state.mode = INFLATE_FAST_MODE_BAD;
            break e;
          }
          tableEntry =
            distanceTable[
              (65535 & tableEntry) + (bitBuffer & ((1 << operation) - 1))
            ];
        }
      }
      break;
    }
  } while (inputPosition < inputLimit && outputPosition < outputLimit);
  matchLength = bitCount >> 3;
  inputPosition -= matchLength;
  bitCount -= matchLength << 3;
  bitBuffer &= (1 << bitCount) - 1;
  stream.next_in = inputPosition;
  stream.next_out = outputPosition;
  stream.avail_in =
    inputPosition < inputLimit
      ? inputLimit - inputPosition + 5
      : 5 - (inputPosition - inputLimit);
  stream.avail_out =
    outputPosition < outputLimit
      ? outputLimit - outputPosition + 257
      : 257 - (outputPosition - outputLimit);
  state.hold = bitBuffer;
  state.bits = bitCount;
};
const HUFFMAN_MAX_BITS = 15,
  inflateLengthBases = new Uint16Array([
    3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59, 67,
    83, 99, 115, 131, 163, 195, 227, 258, 0, 0,
  ]),
  inflateLengthExtraBits = new Uint8Array([
    16, 16, 16, 16, 16, 16, 16, 16, 17, 17, 17, 17, 18, 18, 18, 18, 19, 19, 19,
    19, 20, 20, 20, 20, 21, 21, 21, 21, 16, 199, 75,
  ]),
  inflateDistanceBases = new Uint16Array([
    1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513,
    769, 1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385, 24577, 0, 0,
  ]),
  inflateDistanceExtraBits = new Uint8Array([
    16, 16, 16, 16, 17, 17, 18, 18, 19, 19, 20, 20, 21, 21, 22, 22, 23, 23, 24,
    24, 25, 25, 26, 26, 27, 27, 28, 28, 29, 29, 64, 64,
  ]);
var buildInflateHuffmanTable = (
  tableType,
  codeLengths,
  codeLengthsOffset,
  symbolCount,
  table,
  tableOffset,
  sortedSymbols,
  options,
) => {
  const requestedRootBits = options.bits;
  let increment,
    fillCount,
    previousRootIndex,
    rootMask,
    nextTableOffset,
    baseSymbol,
    codeLength = 0,
    symbolIndex = 0,
    minimumLengthOrTableSize = 0,
    maximumLength = 0,
    rootBits = 0,
    currentTableBits = 0,
    droppedBits = 0,
    remainingCodeSpace = 0,
    usedTableEntries = 0,
    huffmanCode = 0,
    baseValues = null;
  const lengthCounts = new Uint16Array(16),
    lengthOffsets = new Uint16Array(16);
  let entryBits,
    entryOperation,
    entryValue,
    extraBits = null;
  for (codeLength = 0; codeLength <= HUFFMAN_MAX_BITS; codeLength++)
    lengthCounts[codeLength] = 0;
  for (symbolIndex = 0; symbolIndex < symbolCount; symbolIndex++)
    lengthCounts[codeLengths[codeLengthsOffset + symbolIndex]]++;
  for (
    rootBits = requestedRootBits, maximumLength = HUFFMAN_MAX_BITS;
    maximumLength >= 1 && 0 === lengthCounts[maximumLength];
    maximumLength--
  );
  if (
    (rootBits > maximumLength && (rootBits = maximumLength),
    0 === maximumLength)
  ) {
    table[tableOffset++] = 20971520;
    table[tableOffset++] = 20971520;
    options.bits = 1;
    return 0;
  }
  for (
    minimumLengthOrTableSize = 1;
    minimumLengthOrTableSize < maximumLength &&
    0 === lengthCounts[minimumLengthOrTableSize];
    minimumLengthOrTableSize++
  );
  for (
    rootBits < minimumLengthOrTableSize &&
      (rootBits = minimumLengthOrTableSize),
      remainingCodeSpace = 1,
      codeLength = 1;
    codeLength <= HUFFMAN_MAX_BITS;
    codeLength++
  )
    if (
      ((remainingCodeSpace <<= 1),
      (remainingCodeSpace -= lengthCounts[codeLength]),
      remainingCodeSpace < 0)
    )
      return -1;
  if (remainingCodeSpace > 0 && (0 === tableType || 1 !== maximumLength))
    return -1;
  for (
    lengthOffsets[1] = 0, codeLength = 1;
    codeLength < HUFFMAN_MAX_BITS;
    codeLength++
  )
    lengthOffsets[codeLength + 1] =
      lengthOffsets[codeLength] + lengthCounts[codeLength];
  for (symbolIndex = 0; symbolIndex < symbolCount; symbolIndex++)
    0 !== codeLengths[codeLengthsOffset + symbolIndex] &&
      (sortedSymbols[
        lengthOffsets[codeLengths[codeLengthsOffset + symbolIndex]]++
      ] = symbolIndex);
  if (
    (0 === tableType
      ? ((baseValues = extraBits = sortedSymbols), (baseSymbol = 20))
      : 1 === tableType
        ? ((baseValues = inflateLengthBases),
          (extraBits = inflateLengthExtraBits),
          (baseSymbol = 257))
        : ((baseValues = inflateDistanceBases),
          (extraBits = inflateDistanceExtraBits),
          (baseSymbol = 0)),
    (huffmanCode = 0),
    (symbolIndex = 0),
    (codeLength = minimumLengthOrTableSize),
    (nextTableOffset = tableOffset),
    (currentTableBits = rootBits),
    (droppedBits = 0),
    (previousRootIndex = -1),
    (usedTableEntries = 1 << rootBits),
    (rootMask = usedTableEntries - 1),
    (1 === tableType && usedTableEntries > 852) ||
      (2 === tableType && usedTableEntries > 592))
  )
    return 1;
  for (;;) {
    entryBits = codeLength - droppedBits;
    sortedSymbols[symbolIndex] + 1 < baseSymbol
      ? ((entryOperation = 0), (entryValue = sortedSymbols[symbolIndex]))
      : sortedSymbols[symbolIndex] >= baseSymbol
        ? ((entryOperation =
            extraBits[sortedSymbols[symbolIndex] - baseSymbol]),
          (entryValue = baseValues[sortedSymbols[symbolIndex] - baseSymbol]))
        : ((entryOperation = 96), (entryValue = 0));
    increment = 1 << (codeLength - droppedBits);
    fillCount = 1 << currentTableBits;
    minimumLengthOrTableSize = fillCount;
    do {
      fillCount -= increment;
      table[nextTableOffset + (huffmanCode >> droppedBits) + fillCount] =
        (entryBits << 24) | (entryOperation << 16) | entryValue;
    } while (0 !== fillCount);
    for (increment = 1 << (codeLength - 1); huffmanCode & increment;)
      increment >>= 1;
    if (
      (0 !== increment
        ? ((huffmanCode &= increment - 1), (huffmanCode += increment))
        : (huffmanCode = 0),
      symbolIndex++,
      0 === --lengthCounts[codeLength])
    ) {
      if (codeLength === maximumLength) break;
      codeLength = codeLengths[codeLengthsOffset + sortedSymbols[symbolIndex]];
    }
    if (
      codeLength > rootBits &&
      (huffmanCode & rootMask) !== previousRootIndex
    ) {
      for (
        0 === droppedBits && (droppedBits = rootBits),
          nextTableOffset += minimumLengthOrTableSize,
          currentTableBits = codeLength - droppedBits,
          remainingCodeSpace = 1 << currentTableBits;
        currentTableBits + droppedBits < maximumLength &&
        ((remainingCodeSpace -= lengthCounts[currentTableBits + droppedBits]),
        !(remainingCodeSpace <= 0));
      ) {
        currentTableBits++;
        remainingCodeSpace <<= 1;
      }
      if (
        ((usedTableEntries += 1 << currentTableBits),
        (1 === tableType && usedTableEntries > 852) ||
          (2 === tableType && usedTableEntries > 592))
      )
        return 1;
      previousRootIndex = huffmanCode & rootMask;
      table[previousRootIndex] =
        (rootBits << 24) |
        (currentTableBits << 16) |
        (nextTableOffset - tableOffset);
    }
  }
  0 !== huffmanCode &&
    (table[nextTableOffset + huffmanCode] =
      ((codeLength - droppedBits) << 24) | (64 << 16));
  options.bits = rootBits;
  return 0;
};
const {
    Z_FINISH: INFLATE_Z_FINISH,
    Z_BLOCK: INFLATE_Z_BLOCK,
    Z_TREES: INFLATE_Z_TREES,
    Z_OK: INFLATE_Z_OK,
    Z_STREAM_END: INFLATE_Z_STREAM_END,
    Z_NEED_DICT: INFLATE_Z_NEED_DICT,
    Z_STREAM_ERROR: INFLATE_Z_STREAM_ERROR,
    Z_DATA_ERROR: INFLATE_Z_DATA_ERROR,
    Z_MEM_ERROR: INFLATE_Z_MEM_ERROR,
    Z_BUF_ERROR: INFLATE_Z_BUF_ERROR,
    Z_DEFLATED: INFLATE_Z_DEFLATED,
  } = zlibConstants,
  INFLATE_MODE_HEAD = 16180,
  INFLATE_MODE_DICT = 16190,
  INFLATE_MODE_TYPE = 16191,
  INFLATE_MODE_TYPEDO = 16192,
  INFLATE_MODE_COPY_FIRST = 16194,
  INFLATE_MODE_LEN_FIRST = 16199,
  INFLATE_MODE_LEN = 16200,
  INFLATE_MODE_CHECK = 16206,
  INFLATE_MODE_BAD = 16209,
  swapChecksumBytes = (checksum) =>
    ((checksum >>> 24) & 255) +
    ((checksum >>> 8) & 65280) +
    ((65280 & checksum) << 8) +
    ((255 & checksum) << 24);
function InflateState() {
  this.strm = null;
  this.mode = 0;
  this.last = false;
  this.wrap = 0;
  this.havedict = false;
  this.flags = 0;
  this.dmax = 0;
  this.check = 0;
  this.total = 0;
  this.head = null;
  this.wbits = 0;
  this.wsize = 0;
  this.whave = 0;
  this.wnext = 0;
  this.window = null;
  this.hold = 0;
  this.bits = 0;
  this.length = 0;
  this.offset = 0;
  this.extra = 0;
  this.lencode = null;
  this.distcode = null;
  this.lenbits = 0;
  this.distbits = 0;
  this.ncode = 0;
  this.nlen = 0;
  this.ndist = 0;
  this.have = 0;
  this.next = null;
  this.lens = new Uint16Array(320);
  this.work = new Uint16Array(288);
  this.lendyn = null;
  this.distdyn = null;
  this.sane = 0;
  this.back = 0;
  this.was = 0;
}
const hasInvalidInflateState = (stream) => {
    if (!stream) return 1;
    const state = stream.state;
    return !state ||
      state.strm !== stream ||
      state.mode < INFLATE_MODE_HEAD ||
      state.mode > 16211
      ? 1
      : 0;
  },
  inflateResetKeep = (stream) => {
    if (hasInvalidInflateState(stream)) return INFLATE_Z_STREAM_ERROR;
    const state = stream.state;
    stream.total_in = stream.total_out = state.total = 0;
    stream.msg = "";
    state.wrap && (stream.adler = 1 & state.wrap);
    state.mode = INFLATE_MODE_HEAD;
    state.last = 0;
    state.havedict = 0;
    state.flags = -1;
    state.dmax = 32768;
    state.head = null;
    state.hold = 0;
    state.bits = 0;
    state.lencode = state.lendyn = new Int32Array(852);
    state.distcode = state.distdyn = new Int32Array(592);
    state.sane = 1;
    state.back = -1;
    return INFLATE_Z_OK;
  },
  inflateReset = (stream) => {
    if (hasInvalidInflateState(stream)) return INFLATE_Z_STREAM_ERROR;
    const state = stream.state;
    state.wsize = 0;
    state.whave = 0;
    state.wnext = 0;
    return inflateResetKeep(stream);
  },
  inflateResetWithWindowBits = (stream, windowBits) => {
    let wrapperFlags;
    if (hasInvalidInflateState(stream)) return INFLATE_Z_STREAM_ERROR;
    const state = stream.state;
    windowBits < 0
      ? ((wrapperFlags = 0), (windowBits = -windowBits))
      : ((wrapperFlags = 5 + (windowBits >> 4)),
        windowBits < 48 && (windowBits &= 15));
    return windowBits && (windowBits < 8 || windowBits > 15)
      ? INFLATE_Z_STREAM_ERROR
      : (null !== state.window &&
          state.wbits !== windowBits &&
          (state.window = null),
        (state.wrap = wrapperFlags),
        (state.wbits = windowBits),
        inflateReset(stream));
  },
  inflateInitWithWindowBits = (stream, windowBits) => {
    if (!stream) return INFLATE_Z_STREAM_ERROR;
    const state = new InflateState();
    stream.state = state;
    state.strm = stream;
    state.window = null;
    state.mode = INFLATE_MODE_HEAD;
    const status = inflateResetWithWindowBits(stream, windowBits);
    status !== INFLATE_Z_OK && (stream.state = null);
    return status;
  };
let fixedLiteralLengthTable,
  fixedDistanceTable,
  needsFixedHuffmanTables = true;
const setFixedHuffmanTables = (state) => {
    if (needsFixedHuffmanTables) {
      fixedLiteralLengthTable = new Int32Array(512);
      fixedDistanceTable = new Int32Array(32);
      let symbolIndex = 0;
      for (; symbolIndex < 144;) state.lens[symbolIndex++] = 8;
      for (; symbolIndex < 256;) state.lens[symbolIndex++] = 9;
      for (; symbolIndex < 280;) state.lens[symbolIndex++] = 7;
      for (; symbolIndex < 288;) state.lens[symbolIndex++] = 8;
      for (
        buildInflateHuffmanTable(
          1,
          state.lens,
          0,
          288,
          fixedLiteralLengthTable,
          0,
          state.work,
          {
            bits: 9,
          },
        ),
          symbolIndex = 0;
        symbolIndex < 32;
      )
        state.lens[symbolIndex++] = 5;
      buildInflateHuffmanTable(
        2,
        state.lens,
        0,
        32,
        fixedDistanceTable,
        0,
        state.work,
        {
          bits: 5,
        },
      );
      needsFixedHuffmanTables = false;
    }
    state.lencode = fixedLiteralLengthTable;
    state.lenbits = 9;
    state.distcode = fixedDistanceTable;
    state.distbits = 5;
  },
  updateInflateWindow = (stream, source, endPosition, copyLength) => {
    let firstCopyLength;
    const state = stream.state;
    null === state.window && (state.window = new Uint8Array(1 << state.wbits));
    0 === state.wsize &&
      ((state.wsize = 1 << state.wbits), (state.wnext = 0), (state.whave = 0));
    copyLength >= state.wsize
      ? (state.window.set(
          source.subarray(endPosition - state.wsize, endPosition),
          0,
        ),
        (state.wnext = 0),
        (state.whave = state.wsize))
      : ((firstCopyLength = state.wsize - state.wnext),
        firstCopyLength > copyLength && (firstCopyLength = copyLength),
        state.window.set(
          source.subarray(
            endPosition - copyLength,
            endPosition - copyLength + firstCopyLength,
          ),
          state.wnext,
        ),
        (copyLength -= firstCopyLength)
          ? (state.window.set(
              source.subarray(endPosition - copyLength, endPosition),
              0,
            ),
            (state.wnext = copyLength),
            (state.whave = state.wsize))
          : ((state.wnext += firstCopyLength),
            state.wnext === state.wsize && (state.wnext = 0),
            state.whave < state.wsize && (state.whave += firstCopyLength)));
    return 0;
  };
var zlibInflate = {
  inflateReset: inflateReset,
  inflateReset2: inflateResetWithWindowBits,
  inflateResetKeep: inflateResetKeep,
  inflateInit: (stream) => inflateInitWithWindowBits(stream, 15),
  inflateInit2: inflateInitWithWindowBits,
  inflate: (stream, flushMode) => {
    let state,
      input,
      output,
      inputPosition,
      outputPosition,
      availableInput,
      availableOutput,
      bitBuffer,
      bitCount,
      inputByteCount,
      outputByteCount,
      copyLength,
      copyPosition,
      copySource,
      entryBits,
      entryOperation,
      entryValue,
      parentEntryBits,
      parentEntryOperation,
      parentEntryValue,
      decodedValue,
      status,
      tableEntry = 0;
    const headerChecksumBytes = new Uint8Array(4);
    let tableOptions, requiredBits;
    const codeLengthOrder = new Uint8Array([
      16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15,
    ]);
    if (
      hasInvalidInflateState(stream) ||
      !stream.output ||
      (!stream.input && 0 !== stream.avail_in)
    )
      return INFLATE_Z_STREAM_ERROR;
    state = stream.state;
    state.mode === INFLATE_MODE_TYPE && (state.mode = INFLATE_MODE_TYPEDO);
    outputPosition = stream.next_out;
    output = stream.output;
    availableOutput = stream.avail_out;
    inputPosition = stream.next_in;
    input = stream.input;
    availableInput = stream.avail_in;
    bitBuffer = state.hold;
    bitCount = state.bits;
    inputByteCount = availableInput;
    outputByteCount = availableOutput;
    status = INFLATE_Z_OK;
    e: for (;;)
      switch (state.mode) {
        case INFLATE_MODE_HEAD:
          if (0 === state.wrap) {
            state.mode = INFLATE_MODE_TYPEDO;
            break;
          }
          for (; bitCount < 16;) {
            if (0 === availableInput) break e;
            availableInput--;
            bitBuffer += input[inputPosition++] << bitCount;
            bitCount += 8;
          }
          if (2 & state.wrap && 35615 === bitBuffer) {
            0 === state.wbits && (state.wbits = 15);
            state.check = 0;
            headerChecksumBytes[0] = 255 & bitBuffer;
            headerChecksumBytes[1] = (bitBuffer >>> 8) & 255;
            state.check = crc32(state.check, headerChecksumBytes, 2, 0);
            bitBuffer = 0;
            bitCount = 0;
            state.mode = 16181;
            break;
          }
          if (
            (state.head && (state.head.done = false),
            !(1 & state.wrap) ||
              (((255 & bitBuffer) << 8) + (bitBuffer >> 8)) % 31)
          ) {
            stream.msg = "incorrect header check";
            state.mode = INFLATE_MODE_BAD;
            break;
          }
          if ((15 & bitBuffer) !== INFLATE_Z_DEFLATED) {
            stream.msg = "unknown compression method";
            state.mode = INFLATE_MODE_BAD;
            break;
          }
          if (
            ((bitBuffer >>>= 4),
            (bitCount -= 4),
            (decodedValue = 8 + (15 & bitBuffer)),
            0 === state.wbits && (state.wbits = decodedValue),
            decodedValue > 15 || decodedValue > state.wbits)
          ) {
            stream.msg = "invalid window size";
            state.mode = INFLATE_MODE_BAD;
            break;
          }
          state.dmax = 1 << state.wbits;
          state.flags = 0;
          stream.adler = state.check = 1;
          state.mode = 512 & bitBuffer ? 16189 : INFLATE_MODE_TYPE;
          bitBuffer = 0;
          bitCount = 0;
          break;
        case 16181:
          for (; bitCount < 16;) {
            if (0 === availableInput) break e;
            availableInput--;
            bitBuffer += input[inputPosition++] << bitCount;
            bitCount += 8;
          }
          if (
            ((state.flags = bitBuffer),
            (255 & state.flags) !== INFLATE_Z_DEFLATED)
          ) {
            stream.msg = "unknown compression method";
            state.mode = INFLATE_MODE_BAD;
            break;
          }
          if (57344 & state.flags) {
            stream.msg = "unknown header flags set";
            state.mode = INFLATE_MODE_BAD;
            break;
          }
          state.head && (state.head.text = (bitBuffer >> 8) & 1);
          512 & state.flags &&
            4 & state.wrap &&
            ((headerChecksumBytes[0] = 255 & bitBuffer),
            (headerChecksumBytes[1] = (bitBuffer >>> 8) & 255),
            (state.check = crc32(state.check, headerChecksumBytes, 2, 0)));
          bitBuffer = 0;
          bitCount = 0;
          state.mode = 16182;
        case 16182:
          for (; bitCount < 32;) {
            if (0 === availableInput) break e;
            availableInput--;
            bitBuffer += input[inputPosition++] << bitCount;
            bitCount += 8;
          }
          state.head && (state.head.time = bitBuffer);
          512 & state.flags &&
            4 & state.wrap &&
            ((headerChecksumBytes[0] = 255 & bitBuffer),
            (headerChecksumBytes[1] = (bitBuffer >>> 8) & 255),
            (headerChecksumBytes[2] = (bitBuffer >>> 16) & 255),
            (headerChecksumBytes[3] = (bitBuffer >>> 24) & 255),
            (state.check = crc32(state.check, headerChecksumBytes, 4, 0)));
          bitBuffer = 0;
          bitCount = 0;
          state.mode = 16183;
        case 16183:
          for (; bitCount < 16;) {
            if (0 === availableInput) break e;
            availableInput--;
            bitBuffer += input[inputPosition++] << bitCount;
            bitCount += 8;
          }
          state.head &&
            ((state.head.xflags = 255 & bitBuffer),
            (state.head.os = bitBuffer >> 8));
          512 & state.flags &&
            4 & state.wrap &&
            ((headerChecksumBytes[0] = 255 & bitBuffer),
            (headerChecksumBytes[1] = (bitBuffer >>> 8) & 255),
            (state.check = crc32(state.check, headerChecksumBytes, 2, 0)));
          bitBuffer = 0;
          bitCount = 0;
          state.mode = 16184;
        case 16184:
          if (1024 & state.flags) {
            for (; bitCount < 16;) {
              if (0 === availableInput) break e;
              availableInput--;
              bitBuffer += input[inputPosition++] << bitCount;
              bitCount += 8;
            }
            state.length = bitBuffer;
            state.head && (state.head.extra_len = bitBuffer);
            512 & state.flags &&
              4 & state.wrap &&
              ((headerChecksumBytes[0] = 255 & bitBuffer),
              (headerChecksumBytes[1] = (bitBuffer >>> 8) & 255),
              (state.check = crc32(state.check, headerChecksumBytes, 2, 0)));
            bitBuffer = 0;
            bitCount = 0;
          } else state.head && (state.head.extra = null);
          state.mode = 16185;
        case 16185:
          if (
            1024 & state.flags &&
            ((copyLength = state.length),
            copyLength > availableInput && (copyLength = availableInput),
            copyLength &&
              (state.head &&
                ((decodedValue = state.head.extra_len - state.length),
                state.head.extra ||
                  (state.head.extra = new Uint8Array(state.head.extra_len)),
                state.head.extra.set(
                  input.subarray(inputPosition, inputPosition + copyLength),
                  decodedValue,
                )),
              512 & state.flags &&
                4 & state.wrap &&
                (state.check = crc32(
                  state.check,
                  input,
                  copyLength,
                  inputPosition,
                )),
              (availableInput -= copyLength),
              (inputPosition += copyLength),
              (state.length -= copyLength)),
            state.length)
          )
            break e;
          state.length = 0;
          state.mode = 16186;
        case 16186:
          if (2048 & state.flags) {
            if (0 === availableInput) break e;
            copyLength = 0;
            do {
              decodedValue = input[inputPosition + copyLength++];
              state.head &&
                decodedValue &&
                state.length < 65536 &&
                (state.head.name += String.fromCharCode(decodedValue));
            } while (decodedValue && copyLength < availableInput);
            if (
              (512 & state.flags &&
                4 & state.wrap &&
                (state.check = crc32(
                  state.check,
                  input,
                  copyLength,
                  inputPosition,
                )),
              (availableInput -= copyLength),
              (inputPosition += copyLength),
              decodedValue)
            )
              break e;
          } else state.head && (state.head.name = null);
          state.length = 0;
          state.mode = 16187;
        case 16187:
          if (4096 & state.flags) {
            if (0 === availableInput) break e;
            copyLength = 0;
            do {
              decodedValue = input[inputPosition + copyLength++];
              state.head &&
                decodedValue &&
                state.length < 65536 &&
                (state.head.comment += String.fromCharCode(decodedValue));
            } while (decodedValue && copyLength < availableInput);
            if (
              (512 & state.flags &&
                4 & state.wrap &&
                (state.check = crc32(
                  state.check,
                  input,
                  copyLength,
                  inputPosition,
                )),
              (availableInput -= copyLength),
              (inputPosition += copyLength),
              decodedValue)
            )
              break e;
          } else state.head && (state.head.comment = null);
          state.mode = 16188;
        case 16188:
          if (512 & state.flags) {
            for (; bitCount < 16;) {
              if (0 === availableInput) break e;
              availableInput--;
              bitBuffer += input[inputPosition++] << bitCount;
              bitCount += 8;
            }
            if (4 & state.wrap && bitBuffer !== (65535 & state.check)) {
              stream.msg = "header crc mismatch";
              state.mode = INFLATE_MODE_BAD;
              break;
            }
            bitBuffer = 0;
            bitCount = 0;
          }
          state.head &&
            ((state.head.hcrc = (state.flags >> 9) & 1),
            (state.head.done = true));
          stream.adler = state.check = 0;
          state.mode = INFLATE_MODE_TYPE;
          break;
        case 16189:
          for (; bitCount < 32;) {
            if (0 === availableInput) break e;
            availableInput--;
            bitBuffer += input[inputPosition++] << bitCount;
            bitCount += 8;
          }
          stream.adler = state.check = swapChecksumBytes(bitBuffer);
          bitBuffer = 0;
          bitCount = 0;
          state.mode = INFLATE_MODE_DICT;
        case INFLATE_MODE_DICT:
          if (0 === state.havedict) {
            stream.next_out = outputPosition;
            stream.avail_out = availableOutput;
            stream.next_in = inputPosition;
            stream.avail_in = availableInput;
            state.hold = bitBuffer;
            state.bits = bitCount;
            return INFLATE_Z_NEED_DICT;
          }
          stream.adler = state.check = 1;
          state.mode = INFLATE_MODE_TYPE;
        case INFLATE_MODE_TYPE:
          if (flushMode === INFLATE_Z_BLOCK || flushMode === INFLATE_Z_TREES)
            break e;
        case INFLATE_MODE_TYPEDO:
          if (state.last) {
            bitBuffer >>>= 7 & bitCount;
            bitCount -= 7 & bitCount;
            state.mode = INFLATE_MODE_CHECK;
            break;
          }
          for (; bitCount < 3;) {
            if (0 === availableInput) break e;
            availableInput--;
            bitBuffer += input[inputPosition++] << bitCount;
            bitCount += 8;
          }
          switch (
            ((state.last = 1 & bitBuffer),
            (bitBuffer >>>= 1),
            (bitCount -= 1),
            3 & bitBuffer)
          ) {
            case 0:
              state.mode = 16193;
              break;
            case 1:
              if (
                (setFixedHuffmanTables(state),
                (state.mode = INFLATE_MODE_LEN_FIRST),
                flushMode === INFLATE_Z_TREES)
              ) {
                bitBuffer >>>= 2;
                bitCount -= 2;
                break e;
              }
              break;
            case 2:
              state.mode = 16196;
              break;
            case 3:
              stream.msg = "invalid block type";
              state.mode = INFLATE_MODE_BAD;
          }
          bitBuffer >>>= 2;
          bitCount -= 2;
          break;
        case 16193:
          for (
            bitBuffer >>>= 7 & bitCount, bitCount -= 7 & bitCount;
            bitCount < 32;
          ) {
            if (0 === availableInput) break e;
            availableInput--;
            bitBuffer += input[inputPosition++] << bitCount;
            bitCount += 8;
          }
          if ((65535 & bitBuffer) != ((bitBuffer >>> 16) ^ 65535)) {
            stream.msg = "invalid stored block lengths";
            state.mode = INFLATE_MODE_BAD;
            break;
          }
          if (
            ((state.length = 65535 & bitBuffer),
            (bitBuffer = 0),
            (bitCount = 0),
            (state.mode = INFLATE_MODE_COPY_FIRST),
            flushMode === INFLATE_Z_TREES)
          )
            break e;
        case INFLATE_MODE_COPY_FIRST:
          state.mode = 16195;
        case 16195:
          if (((copyLength = state.length), copyLength)) {
            if (
              (copyLength > availableInput && (copyLength = availableInput),
              copyLength > availableOutput && (copyLength = availableOutput),
              0 === copyLength)
            )
              break e;
            output.set(
              input.subarray(inputPosition, inputPosition + copyLength),
              outputPosition,
            );
            availableInput -= copyLength;
            inputPosition += copyLength;
            availableOutput -= copyLength;
            outputPosition += copyLength;
            state.length -= copyLength;
            break;
          }
          state.mode = INFLATE_MODE_TYPE;
          break;
        case 16196:
          for (; bitCount < 14;) {
            if (0 === availableInput) break e;
            availableInput--;
            bitBuffer += input[inputPosition++] << bitCount;
            bitCount += 8;
          }
          if (
            ((state.nlen = 257 + (31 & bitBuffer)),
            (bitBuffer >>>= 5),
            (bitCount -= 5),
            (state.ndist = 1 + (31 & bitBuffer)),
            (bitBuffer >>>= 5),
            (bitCount -= 5),
            (state.ncode = 4 + (15 & bitBuffer)),
            (bitBuffer >>>= 4),
            (bitCount -= 4),
            state.nlen > 286 || state.ndist > 30)
          ) {
            stream.msg = "too many length or distance symbols";
            state.mode = INFLATE_MODE_BAD;
            break;
          }
          state.have = 0;
          state.mode = 16197;
        case 16197:
          for (; state.have < state.ncode;) {
            for (; bitCount < 3;) {
              if (0 === availableInput) break e;
              availableInput--;
              bitBuffer += input[inputPosition++] << bitCount;
              bitCount += 8;
            }
            state.lens[codeLengthOrder[state.have++]] = 7 & bitBuffer;
            bitBuffer >>>= 3;
            bitCount -= 3;
          }
          for (; state.have < 19;)
            state.lens[codeLengthOrder[state.have++]] = 0;
          if (
            ((state.lencode = state.lendyn),
            (state.lenbits = 7),
            (tableOptions = {
              bits: state.lenbits,
            }),
            (status = buildInflateHuffmanTable(
              0,
              state.lens,
              0,
              19,
              state.lencode,
              0,
              state.work,
              tableOptions,
            )),
            (state.lenbits = tableOptions.bits),
            status)
          ) {
            stream.msg = "invalid code lengths set";
            state.mode = INFLATE_MODE_BAD;
            break;
          }
          state.have = 0;
          state.mode = 16198;
        case 16198:
          for (; state.have < state.nlen + state.ndist;) {
            for (
              ;
              (tableEntry =
                state.lencode[bitBuffer & ((1 << state.lenbits) - 1)]),
                (entryBits = tableEntry >>> 24),
                (entryOperation = (tableEntry >>> 16) & 255),
                (entryValue = 65535 & tableEntry),
                !(entryBits <= bitCount);
            ) {
              if (0 === availableInput) break e;
              availableInput--;
              bitBuffer += input[inputPosition++] << bitCount;
              bitCount += 8;
            }
            if (entryValue < 16) {
              bitBuffer >>>= entryBits;
              bitCount -= entryBits;
              state.lens[state.have++] = entryValue;
            } else {
              if (16 === entryValue) {
                for (requiredBits = entryBits + 2; bitCount < requiredBits;) {
                  if (0 === availableInput) break e;
                  availableInput--;
                  bitBuffer += input[inputPosition++] << bitCount;
                  bitCount += 8;
                }
                if (
                  ((bitBuffer >>>= entryBits),
                  (bitCount -= entryBits),
                  0 === state.have)
                ) {
                  stream.msg = "invalid bit length repeat";
                  state.mode = INFLATE_MODE_BAD;
                  break;
                }
                decodedValue = state.lens[state.have - 1];
                copyLength = 3 + (3 & bitBuffer);
                bitBuffer >>>= 2;
                bitCount -= 2;
              } else if (17 === entryValue) {
                for (requiredBits = entryBits + 3; bitCount < requiredBits;) {
                  if (0 === availableInput) break e;
                  availableInput--;
                  bitBuffer += input[inputPosition++] << bitCount;
                  bitCount += 8;
                }
                bitBuffer >>>= entryBits;
                bitCount -= entryBits;
                decodedValue = 0;
                copyLength = 3 + (7 & bitBuffer);
                bitBuffer >>>= 3;
                bitCount -= 3;
              } else {
                for (requiredBits = entryBits + 7; bitCount < requiredBits;) {
                  if (0 === availableInput) break e;
                  availableInput--;
                  bitBuffer += input[inputPosition++] << bitCount;
                  bitCount += 8;
                }
                bitBuffer >>>= entryBits;
                bitCount -= entryBits;
                decodedValue = 0;
                copyLength = 11 + (127 & bitBuffer);
                bitBuffer >>>= 7;
                bitCount -= 7;
              }
              if (state.have + copyLength > state.nlen + state.ndist) {
                stream.msg = "invalid bit length repeat";
                state.mode = INFLATE_MODE_BAD;
                break;
              }
              for (; copyLength--;) state.lens[state.have++] = decodedValue;
            }
          }
          if (state.mode === INFLATE_MODE_BAD) break;
          if (0 === state.lens[256]) {
            stream.msg = "invalid code -- missing end-of-block";
            state.mode = INFLATE_MODE_BAD;
            break;
          }
          if (
            ((state.lenbits = 9),
            (tableOptions = {
              bits: state.lenbits,
            }),
            (status = buildInflateHuffmanTable(
              1,
              state.lens,
              0,
              state.nlen,
              state.lencode,
              0,
              state.work,
              tableOptions,
            )),
            (state.lenbits = tableOptions.bits),
            status)
          ) {
            stream.msg = "invalid literal/lengths set";
            state.mode = INFLATE_MODE_BAD;
            break;
          }
          if (
            ((state.distbits = 6),
            (state.distcode = state.distdyn),
            (tableOptions = {
              bits: state.distbits,
            }),
            (status = buildInflateHuffmanTable(
              2,
              state.lens,
              state.nlen,
              state.ndist,
              state.distcode,
              0,
              state.work,
              tableOptions,
            )),
            (state.distbits = tableOptions.bits),
            status)
          ) {
            stream.msg = "invalid distances set";
            state.mode = INFLATE_MODE_BAD;
            break;
          }
          if (
            ((state.mode = INFLATE_MODE_LEN_FIRST),
            flushMode === INFLATE_Z_TREES)
          )
            break e;
        case INFLATE_MODE_LEN_FIRST:
          state.mode = INFLATE_MODE_LEN;
        case INFLATE_MODE_LEN:
          if (availableInput >= 6 && availableOutput >= 258) {
            stream.next_out = outputPosition;
            stream.avail_out = availableOutput;
            stream.next_in = inputPosition;
            stream.avail_in = availableInput;
            state.hold = bitBuffer;
            state.bits = bitCount;
            inflateFast(stream, outputByteCount);
            outputPosition = stream.next_out;
            output = stream.output;
            availableOutput = stream.avail_out;
            inputPosition = stream.next_in;
            input = stream.input;
            availableInput = stream.avail_in;
            bitBuffer = state.hold;
            bitCount = state.bits;
            state.mode === INFLATE_MODE_TYPE && (state.back = -1);
            break;
          }
          for (
            state.back = 0;
            (tableEntry =
              state.lencode[bitBuffer & ((1 << state.lenbits) - 1)]),
              (entryBits = tableEntry >>> 24),
              (entryOperation = (tableEntry >>> 16) & 255),
              (entryValue = 65535 & tableEntry),
              !(entryBits <= bitCount);
          ) {
            if (0 === availableInput) break e;
            availableInput--;
            bitBuffer += input[inputPosition++] << bitCount;
            bitCount += 8;
          }
          if (entryOperation && !(240 & entryOperation)) {
            for (
              parentEntryBits = entryBits,
                parentEntryOperation = entryOperation,
                parentEntryValue = entryValue;
              (tableEntry =
                state.lencode[
                  parentEntryValue +
                    ((bitBuffer &
                      ((1 << (parentEntryBits + parentEntryOperation)) - 1)) >>
                      parentEntryBits)
                ]),
                (entryBits = tableEntry >>> 24),
                (entryOperation = (tableEntry >>> 16) & 255),
                (entryValue = 65535 & tableEntry),
                !(parentEntryBits + entryBits <= bitCount);
            ) {
              if (0 === availableInput) break e;
              availableInput--;
              bitBuffer += input[inputPosition++] << bitCount;
              bitCount += 8;
            }
            bitBuffer >>>= parentEntryBits;
            bitCount -= parentEntryBits;
            state.back += parentEntryBits;
          }
          if (
            ((bitBuffer >>>= entryBits),
            (bitCount -= entryBits),
            (state.back += entryBits),
            (state.length = entryValue),
            0 === entryOperation)
          ) {
            state.mode = 16205;
            break;
          }
          if (32 & entryOperation) {
            state.back = -1;
            state.mode = INFLATE_MODE_TYPE;
            break;
          }
          if (64 & entryOperation) {
            stream.msg = "invalid literal/length code";
            state.mode = INFLATE_MODE_BAD;
            break;
          }
          state.extra = 15 & entryOperation;
          state.mode = 16201;
        case 16201:
          if (state.extra) {
            for (requiredBits = state.extra; bitCount < requiredBits;) {
              if (0 === availableInput) break e;
              availableInput--;
              bitBuffer += input[inputPosition++] << bitCount;
              bitCount += 8;
            }
            state.length += bitBuffer & ((1 << state.extra) - 1);
            bitBuffer >>>= state.extra;
            bitCount -= state.extra;
            state.back += state.extra;
          }
          state.was = state.length;
          state.mode = 16202;
        case 16202:
          for (
            ;
            (tableEntry =
              state.distcode[bitBuffer & ((1 << state.distbits) - 1)]),
              (entryBits = tableEntry >>> 24),
              (entryOperation = (tableEntry >>> 16) & 255),
              (entryValue = 65535 & tableEntry),
              !(entryBits <= bitCount);
          ) {
            if (0 === availableInput) break e;
            availableInput--;
            bitBuffer += input[inputPosition++] << bitCount;
            bitCount += 8;
          }
          if (!(240 & entryOperation)) {
            for (
              parentEntryBits = entryBits,
                parentEntryOperation = entryOperation,
                parentEntryValue = entryValue;
              (tableEntry =
                state.distcode[
                  parentEntryValue +
                    ((bitBuffer &
                      ((1 << (parentEntryBits + parentEntryOperation)) - 1)) >>
                      parentEntryBits)
                ]),
                (entryBits = tableEntry >>> 24),
                (entryOperation = (tableEntry >>> 16) & 255),
                (entryValue = 65535 & tableEntry),
                !(parentEntryBits + entryBits <= bitCount);
            ) {
              if (0 === availableInput) break e;
              availableInput--;
              bitBuffer += input[inputPosition++] << bitCount;
              bitCount += 8;
            }
            bitBuffer >>>= parentEntryBits;
            bitCount -= parentEntryBits;
            state.back += parentEntryBits;
          }
          if (
            ((bitBuffer >>>= entryBits),
            (bitCount -= entryBits),
            (state.back += entryBits),
            64 & entryOperation)
          ) {
            stream.msg = "invalid distance code";
            state.mode = INFLATE_MODE_BAD;
            break;
          }
          state.offset = entryValue;
          state.extra = 15 & entryOperation;
          state.mode = 16203;
        case 16203:
          if (state.extra) {
            for (requiredBits = state.extra; bitCount < requiredBits;) {
              if (0 === availableInput) break e;
              availableInput--;
              bitBuffer += input[inputPosition++] << bitCount;
              bitCount += 8;
            }
            state.offset += bitBuffer & ((1 << state.extra) - 1);
            bitBuffer >>>= state.extra;
            bitCount -= state.extra;
            state.back += state.extra;
          }
          if (state.offset > state.dmax) {
            stream.msg = "invalid distance too far back";
            state.mode = INFLATE_MODE_BAD;
            break;
          }
          state.mode = 16204;
        case 16204:
          if (0 === availableOutput) break e;
          if (
            ((copyLength = outputByteCount - availableOutput),
            state.offset > copyLength)
          ) {
            if (
              ((copyLength = state.offset - copyLength),
              copyLength > state.whave && state.sane)
            ) {
              stream.msg = "invalid distance too far back";
              state.mode = INFLATE_MODE_BAD;
              break;
            }
            copyLength > state.wnext
              ? ((copyLength -= state.wnext),
                (copyPosition = state.wsize - copyLength))
              : (copyPosition = state.wnext - copyLength);
            copyLength > state.length && (copyLength = state.length);
            copySource = state.window;
          } else {
            copySource = output;
            copyPosition = outputPosition - state.offset;
            copyLength = state.length;
          }
          copyLength > availableOutput && (copyLength = availableOutput);
          availableOutput -= copyLength;
          state.length -= copyLength;
          do {
            output[outputPosition++] = copySource[copyPosition++];
          } while (--copyLength);
          0 === state.length && (state.mode = INFLATE_MODE_LEN);
          break;
        case 16205:
          if (0 === availableOutput) break e;
          output[outputPosition++] = state.length;
          availableOutput--;
          state.mode = INFLATE_MODE_LEN;
          break;
        case INFLATE_MODE_CHECK:
          if (state.wrap) {
            for (; bitCount < 32;) {
              if (0 === availableInput) break e;
              availableInput--;
              bitBuffer |= input[inputPosition++] << bitCount;
              bitCount += 8;
            }
            if (
              ((outputByteCount -= availableOutput),
              (stream.total_out += outputByteCount),
              (state.total += outputByteCount),
              4 & state.wrap &&
                outputByteCount &&
                (stream.adler = state.check =
                  state.flags
                    ? crc32(
                        state.check,
                        output,
                        outputByteCount,
                        outputPosition - outputByteCount,
                      )
                    : adler32(
                        state.check,
                        output,
                        outputByteCount,
                        outputPosition - outputByteCount,
                      )),
              (outputByteCount = availableOutput),
              4 & state.wrap &&
                (state.flags ? bitBuffer : swapChecksumBytes(bitBuffer)) !==
                  state.check)
            ) {
              stream.msg = "incorrect data check";
              state.mode = INFLATE_MODE_BAD;
              break;
            }
            bitBuffer = 0;
            bitCount = 0;
          }
          state.mode = 16207;
        case 16207:
          if (state.wrap && state.flags) {
            for (; bitCount < 32;) {
              if (0 === availableInput) break e;
              availableInput--;
              bitBuffer += input[inputPosition++] << bitCount;
              bitCount += 8;
            }
            if (4 & state.wrap && bitBuffer !== (4294967295 & state.total)) {
              stream.msg = "incorrect length check";
              state.mode = INFLATE_MODE_BAD;
              break;
            }
            bitBuffer = 0;
            bitCount = 0;
          }
          state.mode = 16208;
        case 16208:
          status = INFLATE_Z_STREAM_END;
          break e;
        case INFLATE_MODE_BAD:
          status = INFLATE_Z_DATA_ERROR;
          break e;
        case 16210:
          return INFLATE_Z_MEM_ERROR;
        default:
          return INFLATE_Z_STREAM_ERROR;
      }
    stream.next_out = outputPosition;
    stream.avail_out = availableOutput;
    stream.next_in = inputPosition;
    stream.avail_in = availableInput;
    state.hold = bitBuffer;
    state.bits = bitCount;
    (state.wsize ||
      (outputByteCount !== stream.avail_out &&
        state.mode < INFLATE_MODE_BAD &&
        (state.mode < INFLATE_MODE_CHECK || flushMode !== INFLATE_Z_FINISH))) &&
      updateInflateWindow(
        stream,
        stream.output,
        stream.next_out,
        outputByteCount - stream.avail_out,
      );
    inputByteCount -= stream.avail_in;
    outputByteCount -= stream.avail_out;
    stream.total_in += inputByteCount;
    stream.total_out += outputByteCount;
    state.total += outputByteCount;
    4 & state.wrap &&
      outputByteCount &&
      (stream.adler = state.check =
        state.flags
          ? crc32(
              state.check,
              output,
              outputByteCount,
              stream.next_out - outputByteCount,
            )
          : adler32(
              state.check,
              output,
              outputByteCount,
              stream.next_out - outputByteCount,
            ));
    stream.data_type =
      state.bits +
      (state.last ? 64 : 0) +
      (state.mode === INFLATE_MODE_TYPE ? 128 : 0) +
      (state.mode === INFLATE_MODE_LEN_FIRST ||
      state.mode === INFLATE_MODE_COPY_FIRST
        ? 256
        : 0);
    ((0 === inputByteCount && 0 === outputByteCount) ||
      flushMode === INFLATE_Z_FINISH) &&
      status === INFLATE_Z_OK &&
      (status = INFLATE_Z_BUF_ERROR);
    return status;
  },
  inflateEnd: (stream) => {
    if (hasInvalidInflateState(stream)) return INFLATE_Z_STREAM_ERROR;
    let state = stream.state;
    state.window && (state.window = null);
    stream.state = null;
    return INFLATE_Z_OK;
  },
  inflateGetHeader: (stream, header) => {
    if (hasInvalidInflateState(stream)) return INFLATE_Z_STREAM_ERROR;
    const state = stream.state;
    return 2 & state.wrap
      ? ((state.head = header), (header.done = false), INFLATE_Z_OK)
      : INFLATE_Z_STREAM_ERROR;
  },
  inflateSetDictionary: (stream, dictionary) => {
    const dictionaryLength = dictionary.length;
    let state, dictionaryChecksum, windowStatus;
    return hasInvalidInflateState(stream)
      ? INFLATE_Z_STREAM_ERROR
      : ((state = stream.state),
        0 !== state.wrap && state.mode !== INFLATE_MODE_DICT
          ? INFLATE_Z_STREAM_ERROR
          : state.mode === INFLATE_MODE_DICT &&
              ((dictionaryChecksum = 1),
              (dictionaryChecksum = adler32(
                dictionaryChecksum,
                dictionary,
                dictionaryLength,
                0,
              )),
              dictionaryChecksum !== state.check)
            ? INFLATE_Z_DATA_ERROR
            : ((windowStatus = updateInflateWindow(
                stream,
                dictionary,
                dictionaryLength,
                dictionaryLength,
              )),
              windowStatus
                ? ((state.mode = 16210), INFLATE_Z_MEM_ERROR)
                : ((state.havedict = 1), INFLATE_Z_OK)));
  },
  inflateInfo: "pako inflate (from Nodeca project)",
};
var GzipHeader = function () {
  this.text = 0;
  this.time = 0;
  this.xflags = 0;
  this.os = 0;
  this.extra = null;
  this.extra_len = 0;
  this.name = "";
  this.comment = "";
  this.hcrc = 0;
  this.done = false;
};
const inflateObjectToString = Object.prototype.toString,
  {
    Z_NO_FLUSH: PAKO_Z_NO_FLUSH,
    Z_FINISH: PAKO_Z_FINISH,
    Z_OK: PAKO_Z_OK,
    Z_STREAM_END: PAKO_Z_STREAM_END,
    Z_NEED_DICT: PAKO_Z_NEED_DICT,
    Z_STREAM_ERROR: PAKO_Z_STREAM_ERROR,
    Z_DATA_ERROR: PAKO_Z_DATA_ERROR,
    Z_MEM_ERROR: PAKO_Z_MEM_ERROR,
    Z_BUF_ERROR: PAKO_Z_BUF_ERROR,
  } = zlibConstants,
  defaultInflateOptions = {
    chunkSize: 65536,
    windowBits: 15,
    to: "",
  };
function Inflate(options) {
  this.options = assignInflateOptions({}, defaultInflateOptions, options || {});
  const resolvedOptions = this.options;
  resolvedOptions.raw &&
    resolvedOptions.windowBits >= 0 &&
    resolvedOptions.windowBits < 16 &&
    ((resolvedOptions.windowBits = -resolvedOptions.windowBits),
    0 === resolvedOptions.windowBits && (resolvedOptions.windowBits = -15));
  !(resolvedOptions.windowBits >= 0 && resolvedOptions.windowBits < 16) ||
    (options && options.windowBits) ||
    (resolvedOptions.windowBits += 32);
  resolvedOptions.windowBits > 15 &&
    resolvedOptions.windowBits < 48 &&
    (15 & resolvedOptions.windowBits || (resolvedOptions.windowBits |= 15));
  this.err = 0;
  this.msg = "";
  this.ended = false;
  this.chunks = [];
  this.strm = new ZlibStream();
  this.strm.avail_out = 0;
  let status = zlibInflate.inflateInit2(this.strm, resolvedOptions.windowBits);
  if (status !== PAKO_Z_OK) throw new Error(zlibStatusMessages[status]);
  if (
    ((this.header = new GzipHeader()),
    zlibInflate.inflateGetHeader(this.strm, this.header),
    resolvedOptions.dictionary &&
      ("string" == typeof resolvedOptions.dictionary
        ? (resolvedOptions.dictionary = stringToUtf8Bytes(
            resolvedOptions.dictionary,
          ))
        : "[object ArrayBuffer]" ===
            inflateObjectToString.call(resolvedOptions.dictionary) &&
          (resolvedOptions.dictionary = new Uint8Array(
            resolvedOptions.dictionary,
          )),
      resolvedOptions.raw &&
        ((status = zlibInflate.inflateSetDictionary(
          this.strm,
          resolvedOptions.dictionary,
        )),
        status !== PAKO_Z_OK)))
  )
    throw new Error(zlibStatusMessages[status]);
}
Inflate.prototype.push = function (data, flush) {
  const stream = this.strm,
    chunkSize = this.options.chunkSize,
    dictionary = this.options.dictionary;
  let status, flushMode, availableOutput;
  if (this.ended) return false;
  for (
    flushMode =
      flush === ~~flush
        ? flush
        : true === flush
          ? PAKO_Z_FINISH
          : PAKO_Z_NO_FLUSH,
      "[object ArrayBuffer]" === inflateObjectToString.call(data)
        ? (stream.input = new Uint8Array(data))
        : (stream.input = data),
      stream.next_in = 0,
      stream.avail_in = stream.input.length;
    ;
  ) {
    for (
      0 === stream.avail_out &&
        ((stream.output = new Uint8Array(chunkSize)),
        (stream.next_out = 0),
        (stream.avail_out = chunkSize)),
        status = zlibInflate.inflate(stream, flushMode),
        status === PAKO_Z_NEED_DICT &&
          dictionary &&
          ((status = zlibInflate.inflateSetDictionary(stream, dictionary)),
          status === PAKO_Z_OK
            ? (status = zlibInflate.inflate(stream, flushMode))
            : status === PAKO_Z_DATA_ERROR && (status = PAKO_Z_NEED_DICT));
      stream.avail_in > 0 &&
      status === PAKO_Z_STREAM_END &&
      2 & stream.state.wrap &&
      0 !== stream.state.flags &&
      0 !== stream.input[stream.next_in];
    ) {
      zlibInflate.inflateReset(stream);
      status = zlibInflate.inflate(stream, flushMode);
    }
    switch (status) {
      case PAKO_Z_STREAM_ERROR:
      case PAKO_Z_DATA_ERROR:
      case PAKO_Z_NEED_DICT:
      case PAKO_Z_MEM_ERROR:
        this.onEnd(status);
        this.ended = true;
        return false;
    }
    if (
      ((availableOutput = stream.avail_out),
      stream.next_out &&
        (0 === stream.avail_out ||
          status === PAKO_Z_STREAM_END ||
          flushMode > 0))
    )
      if ("string" === this.options.to) {
        let utf8Boundary = findUtf8Boundary(stream.output, stream.next_out),
          trailingByteCount = stream.next_out - utf8Boundary,
          textChunk = utf8BytesToString(stream.output, utf8Boundary);
        stream.next_out = trailingByteCount;
        stream.avail_out = chunkSize - trailingByteCount;
        trailingByteCount &&
          stream.output.set(
            stream.output.subarray(
              utf8Boundary,
              utf8Boundary + trailingByteCount,
            ),
            0,
          );
        this.onData(textChunk);
      } else {
        this.onData(
          stream.output.length === stream.next_out
            ? stream.output
            : stream.output.subarray(0, stream.next_out),
        );
        stream.avail_out = 0;
        stream.next_out = 0;
      }
    if (
      (status !== PAKO_Z_OK && status !== PAKO_Z_BUF_ERROR) ||
      0 !== availableOutput
    ) {
      if (status === PAKO_Z_STREAM_END) {
        status = zlibInflate.inflateEnd(this.strm);
        this.onEnd(status);
        this.ended = true;
        return true;
      }
      if (0 === stream.avail_in) {
        if (flushMode === PAKO_Z_FINISH) {
          status = zlibInflate.inflateEnd(this.strm);
          this.onEnd(status === PAKO_Z_OK ? PAKO_Z_BUF_ERROR : status);
          this.ended = true;
          return false;
        }
        break;
      }
    }
  }
  return true;
};
Inflate.prototype.onData = function (chunk) {
  this.chunks.push(chunk);
};
Inflate.prototype.onEnd = function (status) {
  status === PAKO_Z_OK &&
    ("string" === this.options.to
      ? (this.result = this.chunks.join(""))
      : (this.result = flattenInflateChunks(this.chunks)));
  this.chunks = [];
  this.err = status;
  this.msg = this.strm.msg;
};
var pakoInflateExports = {
  ungzip: function (data, options) {
    const inflator = new Inflate(options);
    if ((inflator.push(data, true), inflator.err))
      throw inflator.msg || zlibStatusMessages[inflator.err];
    return inflator.result;
  },
};
const { ungzip: pakoUngzip } = pakoInflateExports;
var ungzipBody = pakoUngzip;
function readVarint(bytes, offset) {
  let decodedValue = 0,
    multiplier = 1,
    bitCount = 0;
  for (; offset < bytes.length;) {
    const byte = 255 & bytes[offset++];
    if (
      (bitCount < 56 && (decodedValue += (127 & byte) * multiplier),
      !(128 & byte))
    )
      return [decodedValue, offset];
    if (((multiplier *= 128), (bitCount += 7), bitCount >= 70))
      throw new Error("varint too long at " + offset);
  }
  throw new Error("truncated varint");
}
function encodeVarint(value) {
  let integerValue = Math.floor(value);
  if (integerValue >= 0) {
    const encodedBytes = [];
    for (; integerValue >= 128;) {
      encodedBytes.push((integerValue % 128) | 128);
      integerValue = Math.floor(integerValue / 128);
    }
    encodedBytes.push(integerValue);
    return encodedBytes;
  }
  const twosComplementBytes = [0, 0, 0, 0, 0, 0, 0, 0];
  let magnitude = -integerValue;
  for (let byteIndex = 0; byteIndex < 8; byteIndex++) {
    twosComplementBytes[byteIndex] = 255 & magnitude;
    magnitude = Math.floor(magnitude / 256);
  }
  let carry = 1;
  for (let byteIndex = 0; byteIndex < 8; byteIndex++) {
    const complementedByte = (255 & ~twosComplementBytes[byteIndex]) + carry;
    twosComplementBytes[byteIndex] = 255 & complementedByte;
    carry = complementedByte >> 8;
  }
  const encodedBytes = [];
  for (let groupIndex = 0; groupIndex < 10; groupIndex++) {
    let encodedByte = 0;
    for (let bitIndex = 0; bitIndex < 7; bitIndex++) {
      const sourceBitIndex = 7 * groupIndex + bitIndex;
      sourceBitIndex < 64 &&
        (encodedByte |=
          ((twosComplementBytes[sourceBitIndex >> 3] >> (7 & sourceBitIndex)) &
            1) <<
          bitIndex);
    }
    groupIndex < 9 && (encodedByte |= 128);
    encodedBytes.push(encodedByte);
  }
  return encodedBytes;
}
function concatenateBytes(chunks) {
  const bytes = [];
  for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++)
    for (let byteIndex = 0; byteIndex < chunks[chunkIndex].length; byteIndex++)
      bytes.push(255 & chunks[chunkIndex][byteIndex]);
  return bytes;
}
function parseProtobufFields(bytes) {
  const fields = [];
  let offset = 0;
  for (; offset < bytes.length;) {
    const fieldStart = offset,
      [tag, nextOffset] = readVarint(bytes, offset);
    offset = nextOffset;
    const fieldNumber = Math.floor(tag / 8),
      wireType = 7 & tag;
    if (0 === fieldNumber)
      throw new Error("invalid protobuf field 0 at " + fieldStart);
    let fieldValue;
    if (0 === wireType) {
      const [varintValue, nextOffset] = readVarint(bytes, offset);
      fieldValue = varintValue;
      offset = nextOffset;
    } else if (1 === wireType) {
      fieldValue = bytes.slice(offset, offset + 8);
      offset += 8;
    } else if (2 === wireType) {
      const [fieldLength, nextOffset] = readVarint(bytes, offset);
      offset = nextOffset;
      fieldValue = bytes.slice(offset, offset + fieldLength);
      offset += fieldLength;
    } else {
      if (5 !== wireType) throw new Error("unsupported wire type " + wireType);
      fieldValue = bytes.slice(offset, offset + 4);
      offset += 4;
    }
    fields.push({
      fieldNo: fieldNumber,
      wireType: wireType,
      value: fieldValue,
      raw: bytes.slice(fieldStart, offset),
    });
  }
  return fields;
}
function encodeProtobufField(fieldNumber, wireType, value) {
  const encodedTag = encodeVarint(8 * fieldNumber + wireType);
  if (0 === wireType)
    return concatenateBytes([encodedTag, encodeVarint(value)]);
  if (1 === wireType || 5 === wireType)
    return concatenateBytes([encodedTag, value]);
  if (2 === wireType)
    return concatenateBytes([encodedTag, encodeVarint(value.length), value]);
  throw new Error("cannot encode wire type " + wireType);
}
function patchLocationMessage(bytes, settings, stats) {
  const fields = parseProtobufFields(bytes);
  let hasLatitude = false,
    hasLongitude = false;
  for (const field of fields) {
    1 === field.fieldNo && 0 === field.wireType && (hasLatitude = true);
    2 === field.fieldNo && 0 === field.wireType && (hasLongitude = true);
  }
  if (!hasLatitude || !hasLongitude) return bytes;
  const patchedFields = [];
  for (const field of fields)
    1 === field.fieldNo && 0 === field.wireType
      ? patchedFields.push(
          encodeProtobufField(1, 0, Math.round(100000000 * settings.latitude)),
        )
      : 2 === field.fieldNo && 0 === field.wireType
        ? patchedFields.push(
            encodeProtobufField(
              2,
              0,
              Math.round(100000000 * settings.longitude),
            ),
          )
        : 3 === field.fieldNo && 0 === field.wireType
          ? patchedFields.push(encodeProtobufField(3, 0, settings.accuracy))
          : patchedFields.push(field.raw);
  stats.locations++;
  return concatenateBytes(patchedFields);
}
function patchWifiMessage(bytes, settings, stats) {
  const fields = parseProtobufFields(bytes);
  let hasMacAddress = false;
  for (const field of fields)
    if (1 === field.fieldNo && 2 === field.wireType) {
      const macAddress = Array.from(field.value)
        .map((byte) => String.fromCharCode(255 & byte))
        .join("");
      hasMacAddress = /^[0-9a-fA-F]{1,2}(:[0-9a-fA-F]{1,2}){5}$/.test(
        macAddress,
      );
    }
  if (!hasMacAddress) return bytes;
  let locationChanged = false;
  const patchedFields = [];
  for (const field of fields)
    if (2 === field.fieldNo && 2 === field.wireType)
      try {
        const patchedLocation = patchLocationMessage(
          field.value,
          settings,
          stats,
        );
        (patchedLocation.length === field.value.length &&
          patchedLocation.join(",") === field.value.join(",")) ||
          (locationChanged = true);
        patchedFields.push(
          encodeProtobufField(field.fieldNo, field.wireType, patchedLocation),
        );
      } catch {
        stats.skipped++;
        patchedFields.push(field.raw);
      }
    else patchedFields.push(field.raw);
  locationChanged && stats.wifi++;
  return concatenateBytes(patchedFields);
}
function patchCellMessage(bytes, settings, stats) {
  const fields = parseProtobufFields(bytes);
  let locationChanged = false;
  const patchedFields = [];
  for (const field of fields)
    if (5 === field.fieldNo && 2 === field.wireType)
      try {
        const patchedLocation = patchLocationMessage(
          field.value,
          settings,
          stats,
        );
        (patchedLocation.length === field.value.length &&
          patchedLocation.join(",") === field.value.join(",")) ||
          (locationChanged = true);
        patchedFields.push(
          encodeProtobufField(field.fieldNo, field.wireType, patchedLocation),
        );
      } catch {
        stats.skipped++;
        patchedFields.push(field.raw);
      }
    else patchedFields.push(field.raw);
  locationChanged && stats.cell++;
  return concatenateBytes(patchedFields);
}
function patchWlocMessage(bytes, settings, stats) {
  const fields = parseProtobufFields(bytes),
    patchedFields = [];
  for (const field of fields)
    2 === field.wireType && 2 === field.fieldNo
      ? patchedFields.push(
          encodeProtobufField(
            field.fieldNo,
            field.wireType,
            patchWifiMessage(field.value, settings, stats),
          ),
        )
      : 2 !== field.wireType || (22 !== field.fieldNo && 24 !== field.fieldNo)
        ? patchedFields.push(field.raw)
        : patchedFields.push(
            encodeProtobufField(
              field.fieldNo,
              field.wireType,
              patchCellMessage(field.value, settings, stats),
            ),
          );
  return concatenateBytes(patchedFields);
}
function snapshotPatchStats(stats) {
  return {
    wifi: stats.wifi || 0,
    cell: stats.cell || 0,
    locations: stats.locations || 0,
    skipped: stats.skipped || 0,
  };
}
function restorePatchStats(stats, snapshot) {
  stats.wifi = snapshot.wifi;
  stats.cell = snapshot.cell;
  stats.locations = snapshot.locations;
  stats.skipped = snapshot.skipped;
}
function bytesEqual(leftBytes, rightBytes) {
  if (leftBytes.length !== rightBytes.length) return false;
  for (let byteIndex = 0; byteIndex < leftBytes.length; byteIndex++)
    if (leftBytes[byteIndex] !== rightBytes[byteIndex]) return false;
  return true;
}
function patchWlocFrame(bytes, frameOffset, settings, stats) {
  if (bytes.length < frameOffset + 10)
    throw new Error(
      "body too short: " + bytes.length + ", base=" + frameOffset,
    );
  const payloadLength =
    ((255 & bytes[frameOffset + 8]) << 8) | (255 & bytes[frameOffset + 9]);
  if (payloadLength <= 0)
    throw new Error("invalid empty frame length at " + frameOffset);
  if (payloadLength + frameOffset + 10 > bytes.length)
    throw new Error(
      "invalid frame length " +
        payloadLength +
        " at " +
        frameOffset +
        " for " +
        bytes.length,
    );
  const prefix = bytes.slice(0, frameOffset + 8),
    payload = bytes.slice(frameOffset + 10, frameOffset + 10 + payloadLength),
    suffix = bytes.slice(frameOffset + 10 + payloadLength),
    statsBeforePatch = snapshotPatchStats(stats),
    patchedPayload = patchWlocMessage(payload, settings, stats),
    patchCount =
      stats.locations -
      statsBeforePatch.locations +
      (stats.wifi - statsBeforePatch.wifi) +
      (stats.cell - statsBeforePatch.cell);
  if (patchedPayload.length > 65535)
    throw new Error("patched payload too large: " + patchedPayload.length);
  if (patchCount <= 0 || bytesEqual(payload, patchedPayload)) {
    restorePatchStats(stats, statsBeforePatch);
    throw new Error(
      "frame parsed but no patchable wloc payload at " + frameOffset,
    );
  }
  return concatenateBytes([
    prefix,
    [(patchedPayload.length >> 8) & 255, 255 & patchedPayload.length],
    patchedPayload,
    suffix,
  ]);
}
function patchWlocBody(bytes, settings) {
  const stats = {
    wifi: 0,
    cell: 0,
    locations: 0,
    skipped: 0,
  };
  if (bytes.length < 10) throw new Error("body too short: " + bytes.length);
  const scanErrors = [],
    candidateOffsets = [0, 2, 4, 6, 8, 10, 12, 14, 16],
    maxFrameOffset = Math.min(96, Math.max(0, bytes.length - 10));
  for (let offset = 0; offset <= maxFrameOffset; offset++)
    candidateOffsets.indexOf(offset) < 0 && candidateOffsets.push(offset);
  for (
    let candidateIndex = 0;
    candidateIndex < candidateOffsets.length;
    candidateIndex++
  ) {
    const frameOffset = candidateOffsets[candidateIndex],
      statsBeforeAttempt = snapshotPatchStats(stats);
    try {
      const patchedBody = patchWlocFrame(bytes, frameOffset, settings, stats);
      RuntimeConsole.info(
        `[wloc] patched at offset=${frameOffset} locations=${stats.locations} wifi=${stats.wifi} cell=${stats.cell} skipped=${stats.skipped}`,
      );
      return {
        data: patchedBody,
        stats: stats,
      };
    } catch (error) {
      restorePatchStats(stats, statsBeforeAttempt);
      scanErrors.length < 6 &&
        scanErrors.push(
          "@" +
            frameOffset +
            ":" +
            (error && error.message ? error.message : String(error)),
        );
    }
  }
  try {
    const patchedBody = (function (bytes, settings, stats) {
      const rawScanErrors = [],
        maxRawOffset = Math.min(256, bytes.length);
      for (let rawOffset = 0; rawOffset <= maxRawOffset; rawOffset++) {
        const statsBeforeAttempt = snapshotPatchStats(stats);
        try {
          const payload = bytes.slice(rawOffset),
            patchedPayload = patchWlocMessage(payload, settings, stats);
          if (
            stats.locations -
              statsBeforeAttempt.locations +
              (stats.wifi - statsBeforeAttempt.wifi) +
              (stats.cell - statsBeforeAttempt.cell) >
              0 &&
            !bytesEqual(payload, patchedPayload)
          )
            return concatenateBytes([
              bytes.slice(0, rawOffset),
              patchedPayload,
            ]);
          restorePatchStats(stats, statsBeforeAttempt);
        } catch (error) {
          restorePatchStats(stats, statsBeforeAttempt);
          rawScanErrors.length < 6 &&
            rawScanErrors.push(
              "raw@" +
                rawOffset +
                ":" +
                (error && error.message ? error.message : String(error)),
            );
        }
      }
      throw new Error("raw protobuf scan failed; " + rawScanErrors.join(" | "));
    })(bytes, settings, stats);
    RuntimeConsole.info(
      `[wloc] patched via raw fallback locations=${stats.locations} wifi=${stats.wifi} cell=${stats.cell} skipped=${stats.skipped}`,
    );
    return {
      data: patchedBody,
      stats: stats,
    };
  } catch (error) {
    scanErrors.push(
      "raw:" + (error && error.message ? error.message : String(error)),
    );
  }
  throw new Error("no patchable wloc payload found; " + scanErrors.join(" | "));
}
function isGzip(bytes) {
  return bytes.length >= 2 && 31 === bytes[0] && 139 === bytes[1];
}
async function rewriteWlocResponse(request, response, settings) {
  const requestUrl = request.url || "";
  RuntimeConsole.group(`[wloc] Response ${requestUrl}`);
  try {
    let inputBytes = (function (body) {
      if (!body) return [];
      if ("undefined" != typeof ArrayBuffer) {
        if (body instanceof ArrayBuffer)
          return Array.prototype.slice.call(new Uint8Array(body));
        if (ArrayBuffer.isView && ArrayBuffer.isView(body))
          return Array.prototype.slice.call(
            new Uint8Array(body.buffer, body.byteOffset, body.byteLength),
          );
      }
      if ("number" == typeof body.length && "string" != typeof body) {
        const bytes = [];
        for (let byteIndex = 0; byteIndex < body.length; byteIndex++)
          bytes.push(255 & body[byteIndex]);
        return bytes;
      }
      if ("string" == typeof body) {
        const bytes = [];
        for (
          let characterIndex = 0;
          characterIndex < body.length;
          characterIndex++
        )
          bytes.push(255 & body.charCodeAt(characterIndex));
        return bytes;
      }
      return [];
    })(response.bodyBytes || response.rawBody || response.body);
    if (!inputBytes.length) {
      RuntimeConsole.warn("[wloc] 无二进制 body，跳过");
      return response;
    }
    if (
      (RuntimeConsole.debug(
        `[wloc] input length=${inputBytes.length} gzip=${isGzip(inputBytes)}`,
      ),
      null == settings.longitude || null == settings.latitude)
    ) {
      RuntimeConsole.info(
        "[wloc] 透传模式：未设置坐标，不修改响应（恢复真实定位）",
      );
      return response;
    }
    let decodedBytes = inputBytes;
    isGzip(inputBytes) &&
      (decodedBytes = Array.from(ungzipBody(new Uint8Array(inputBytes))));
    const targetSettings = (function (settings) {
        const radiusMeters = Number(settings.randomRadius);
        if (!Number.isFinite(radiusMeters) || radiusMeters <= 0)
          return settings;
        const distanceMeters = Math.sqrt(Math.random()) * radiusMeters,
          bearingRadians = 2 * Math.random() * Math.PI,
          angularDistance = distanceMeters / 6378137,
          latitudeRadians = (settings.latitude * Math.PI) / 180,
          longitudeRadians = (settings.longitude * Math.PI) / 180,
          targetLatitudeRadians = Math.asin(
            Math.sin(latitudeRadians) * Math.cos(angularDistance) +
              Math.cos(latitudeRadians) *
                Math.sin(angularDistance) *
                Math.cos(bearingRadians),
          ),
          targetLongitudeRadians =
            ((longitudeRadians +
              Math.atan2(
                Math.sin(bearingRadians) *
                  Math.sin(angularDistance) *
                  Math.cos(latitudeRadians),
                Math.cos(angularDistance) -
                  Math.sin(latitudeRadians) * Math.sin(targetLatitudeRadians),
              ) +
              3 * Math.PI) %
              (2 * Math.PI)) -
            Math.PI;
        return {
          ...settings,
          longitude: Number(
            ((180 * targetLongitudeRadians) / Math.PI).toFixed(8),
          ),
          latitude: Number(
            ((180 * targetLatitudeRadians) / Math.PI).toFixed(8),
          ),
          randomDistance: distanceMeters,
        };
      })(settings),
      { data: patchedBytes, stats: stats } = patchWlocBody(
        decodedBytes,
        targetSettings,
      ),
      responseBytes = new Uint8Array(patchedBytes);
    response.body = responseBytes;
    response.bodyBytes = responseBytes;
    response.rawBody = responseBytes;
    response.headers &&
      (delete response.headers["Content-Encoding"],
      delete response.headers["content-encoding"],
      delete response.headers["Transfer-Encoding"],
      delete response.headers["transfer-encoding"],
      (response.headers["Content-Length"] = String(responseBytes.length)));
    response.status = 200;
    response.statusCode = 200;
    RuntimeConsole.info(
      `[wloc] 目标坐标: ${targetSettings.longitude},${targetSettings.latitude} 精度=${targetSettings.accuracy} 扰动=${targetSettings.randomDistance?.toFixed(1) || 0}m patched=${stats.locations}`,
    );
    return response;
  } catch (error) {
    RuntimeConsole.error(`[wloc] ${error.message || error}`);
    return response;
  } finally {
    RuntimeConsole.groupEnd();
  }
}
const defaultLocationSettings = {
  longitude: null,
  latitude: null,
  accuracy: 25,
  randomRadius: 0,
  logLevel: "info",
};
function loadLocationSettings() {
  const argumentSettings = globalThis.$argument || {},
    savedSettings = (function () {
      try {
        const storedSettings = PersistentStorage.getItem("wloc_settings");
        if (storedSettings && "object" == typeof storedSettings)
          return storedSettings;
      } catch (error) {
        RuntimeConsole.debug(`[settings] 持久化数据读取失败: ${error.message}`);
      }
      return null;
    })(),
    settings = {
      ...defaultLocationSettings,
    };
  if (
    (argumentSettings.longitude &&
      (settings.longitude = parseFloat(argumentSettings.longitude)),
    argumentSettings.latitude &&
      (settings.latitude = parseFloat(argumentSettings.latitude)),
    argumentSettings.accuracy &&
      (settings.accuracy = parseInt(argumentSettings.accuracy, 10)),
    void 0 !== argumentSettings.randomRadius &&
      (settings.randomRadius = parseFloat(argumentSettings.randomRadius)),
    argumentSettings.logLevel &&
      (settings.logLevel = argumentSettings.logLevel),
    argumentSettings.LogLevel &&
      (settings.logLevel = argumentSettings.LogLevel),
    savedSettings)
  ) {
    savedSettings.longitude &&
      (settings.longitude = parseFloat(savedSettings.longitude));
    savedSettings.latitude &&
      (settings.latitude = parseFloat(savedSettings.latitude));
    savedSettings.accuracy &&
      (settings.accuracy = parseInt(savedSettings.accuracy, 10));
    void 0 !== savedSettings.randomRadius &&
      (settings.randomRadius = parseFloat(savedSettings.randomRadius));
    RuntimeConsole.info(
      `[settings] 使用已保存坐标: ${settings.longitude},${settings.latitude}`,
    );
  } else if (
    113.94114 === settings.longitude &&
    22.544577 === settings.latitude
  ) {
    settings.longitude = null;
    settings.latitude = null;
    RuntimeConsole.info(
      "[settings] 透传模式：持久化数据为空且为默认参数，不修改定位",
    );
    return settings;
  }
  null == settings.longitude || null == settings.latitude
    ? RuntimeConsole.info("[settings] 透传模式：未设置坐标，将不修改定位响应")
    : RuntimeConsole.debug(
        `[settings] lon=${settings.longitude} lat=${settings.latitude} acc=${settings.accuracy} randomRadius=${settings.randomRadius}`,
      );
  return settings;
}
let rewrittenResponse;
(async () => {
  const response = (function () {
    try {
      return "undefined" != typeof $response ? $response : void 0;
    } catch {
      return;
    }
  })();
  if (!response) return void RuntimeConsole.warn("[wloc] 非响应模式，跳过");
  const settings = loadLocationSettings();
  RuntimeConsole.logLevel = settings.logLevel;
  rewrittenResponse = await rewriteWlocResponse($request, response, settings);
})()
  .catch((error) => RuntimeConsole.error(error))
  .finally(() => {
    switch (typeof rewrittenResponse) {
      case "object":
        rewrittenResponse.headers?.["Content-Encoding"] &&
          (rewrittenResponse.headers["Content-Encoding"] = "identity");
        rewrittenResponse.headers?.["content-encoding"] &&
          (rewrittenResponse.headers["content-encoding"] = "identity");
        "Quantumult X" === runtimePlatform
          ? (rewrittenResponse.status || (rewrittenResponse.status = 200),
            delete rewrittenResponse.headers?.["Content-Length"],
            delete rewrittenResponse.headers?.["content-length"],
            delete rewrittenResponse.headers?.["Transfer-Encoding"],
            completeRequest(rewrittenResponse))
          : completeRequest(
              "Stash" === runtimePlatform
                ? rewrittenResponse
                : {
                    response: rewrittenResponse,
                  },
            );
        break;
      case "undefined":
        completeRequest({});
        break;
      default:
        RuntimeConsole.error(
          "[wloc] 不合法的 response 类型: " + typeof rewrittenResponse,
        );
        completeRequest({});
    }
  });
