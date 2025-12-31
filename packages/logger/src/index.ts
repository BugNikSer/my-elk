import winston from 'winston';
import { inspect } from 'util';
import envVars from "@my-elk/env-vars";

type TLogLevel = 'error' | 'warn' | 'info' | 'http' | 'verbose' | 'debug' | 'silly';
const { combine, timestamp, printf, colorize, json, metadata, label } = winston.format;

const createLogger = ({
  app,
}: {
  app: string;
}) => {
  const isDevelopment = envVars.ENV === 'development';
  const mergeMeta = winston.format((info: winston.Logform.TransformableInfo) => {
    type TMeta = Record<string, any>
    const { message, metadata } = info;
    const { area, app, timestamp, label, ...rest } = metadata as TMeta;

    info.area = area;
    info.app = app;
    info.timestamp = timestamp;
    info.label = label;

    delete info.metadata;

    const meta = Object.values(rest).map(item => {
      if (typeof item === 'object') return inspect(item, false, null, isDevelopment);
      return item;
    })

    if (isDevelopment) info.message = [message, ...meta].filter(Boolean);
    else info.message = [message, ...meta].filter(Boolean).join(' ');

    return info;
  });

  const winstonFormat = isDevelopment
    ? combine(
      timestamp({ format: 'DD.MM.YY HH:mm:ss' }),
      metadata(),
      mergeMeta(),
      printf(info => {
        const { timestamp, area, level, message } = info;
  
        const applyColor = (val: string) => colorize().colorize(level as TLogLevel, val);
  
        const colorizedTimestamp = applyColor(String(timestamp));
        const colorizedArea = area ? applyColor(`[${area}]`) : null;
        const colorizedLevel = applyColor(level);
  
        return [
          colorizedTimestamp,
          colorizedArea,
          colorizedLevel,
          ...(message as any[]),
        ].filter(Boolean).join(' ');
      })
    )
    : combine(
      label({ label: app, message: false }),
      timestamp({ format: 'DD.MM.YY HH:mm:ss' }),
      metadata(),
      mergeMeta(),
      json(),
    );
  
  winston.addColors({
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'blue',
    verbose: 'blue',
    debug: 'magenta',
    silly: 'cyan',
  });
  
  const baseLogger = winston.createLogger({
    transports: [new winston.transports.Console()],
    format: winstonFormat,
    level: 'silly',
  });
  
  const areaLogger = (area: string) => {
    return Object.keys(baseLogger.levels).reduce((acc, level) => ({
      ...acc,
      [level]: (...params: any[]) => baseLogger.log({ level, message: '', area, ...params }),
    }), {} as Record<TLogLevel, (...params: any[]) => void>);
  };

  return { areaLogger };
};

export default createLogger;