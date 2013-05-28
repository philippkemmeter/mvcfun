/**
 * All HTTP status constants are registered here.
 *
 * @module mvcfun.http.StatusCodes
 * @author Philipp Kemmeter
 */
Object.defineProperty(module.exports, 'CONTINUE', {value:100});
Object.defineProperty(module.exports, 'SWITCHING_PROTOCOLS', {value:101});
Object.defineProperty(module.exports, 'PROCESSING', {value:102});
Object.defineProperty(module.exports, 'CONNECTION_TIMED_OUT', {value:118});

Object.defineProperty(module.exports, 'OK', {value:200});
Object.defineProperty(module.exports, 'CREATED', {value:201});
Object.defineProperty(module.exports, 'ACCEPTED', {value:202});
Object.defineProperty(module.exports, 'NON_AUTHORITATIVE_INFO', {value:203});
Object.defineProperty(module.exports, 'NO_CONTENT', {value:204});
Object.defineProperty(module.exports, 'RESET_CONTENT', {value:205});
Object.defineProperty(module.exports, 'PARTIAL_CONTENT', {value:206});
Object.defineProperty(module.exports, 'MULTI_STATUS', {value:207});

Object.defineProperty(module.exports, 'MULTIPLE_CHOICES', {value:300});
Object.defineProperty(module.exports, 'MOVED_PERMANENTLY', {value:301});
Object.defineProperty(module.exports, 'FOUND', {value:302});
Object.defineProperty(module.exports, 'SEE_OTHER', {value:303});
Object.defineProperty(module.exports, 'NOT_MODIFIED', {value:304});
Object.defineProperty(module.exports, 'USE_PROXY', {value:305});
Object.defineProperty(module.exports, 'TEMPORARY_REDIRECT', {value:307});

Object.defineProperty(module.exports, 'BAD_REQUEST', {value:400});
Object.defineProperty(module.exports, 'UNAUTHORIZED', {value:401});
Object.defineProperty(module.exports, 'PAYMENT_REQUIRED', {value:402});
Object.defineProperty(module.exports, 'FORBIDDEN', {value:403});
Object.defineProperty(module.exports, 'NOT_FOUND', {value:404});
Object.defineProperty(module.exports, 'METHOD_NOT_ALLOWED', {value:405});
Object.defineProperty(module.exports, 'NOT_ACCEPTABLE', {value:406});
Object.defineProperty(module.exports, 'PROXY_AUTHENTICATION_REQUEST',
    {value:407});
Object.defineProperty(module.exports, 'REQUEST_TIME_OUT', {value:408});
Object.defineProperty(module.exports, 'CONFLICT', {value:409});
Object.defineProperty(module.exports, 'GONE', {value:410});
Object.defineProperty(module.exports, 'LENGTH_REQUIRED', {value:411});
Object.defineProperty(module.exports, 'PRECONDITION_FAILED', {value:412});
Object.defineProperty(module.exports, 'REQUEST_ENTITY_TOO_LARGE', {value:413});
Object.defineProperty(module.exports, 'REQUEST_URL_TOO_LONG', {value:414});
Object.defineProperty(module.exports, 'UNSUPPORTED_MEDIA_TYPE', {value:415});
Object.defineProperty(module.exports, 'REQUESTED_RANGE_NOT_SATISFIABLE',
    {value:416});
Object.defineProperty(module.exports, 'EXPECTATION_FAILED', {value:417});
Object.defineProperty(module.exports, 'IM_A_TEAPOT', {value:418});
Object.defineProperty(module.exports,
    'THERE_ARE_TOO_MANY_CONNECTIONS_FROM_YOUR_INTERNET_ADDRESS', {value:421});
Object.defineProperty(module.exports, 'UNPROCESSABLE_ENTITY', {value:422});
Object.defineProperty(module.exports, 'LOCKED', {value:423});
Object.defineProperty(module.exports, 'FAILED_DEPENDENCY', {value:424});
Object.defineProperty(module.exports, 'UNORDERED_COLLECTION', {value:425});
Object.defineProperty(module.exports, 'UPGRADE_REQUIRED', {value:426});
Object.defineProperty(module.exports, 'UNAVAILABLE_FOR_LEGAL_REASONS',
    {value:451});

Object.defineProperty(module.exports, 'INTERNAL_SERVER_ERROR', {value:500});
Object.defineProperty(module.exports, 'NOT_IMPLEMENTED', {value:501});
Object.defineProperty(module.exports, 'BAD_GATEWAY', {value:502});
Object.defineProperty(module.exports, 'SERVICE_UNAVAILABLE', {value:503});
Object.defineProperty(module.exports, 'GATEWAY_TIME_OUT', {value:504});
Object.defineProperty(module.exports, 'HTTP_VERSION_NOT_SUPPORTED',
    {value:505});
Object.defineProperty(module.exports, 'VARIANT_ALSO_NEGOTIATES', {value:506});
Object.defineProperty(module.exports, 'INSUFFICIENT_STORAGE', {value:507});
Object.defineProperty(module.exports, 'BANDWIDTH_LIMIT_EXCEEDED', {value:509});
Object.defineProperty(module.exports, 'NOT_EXTENDED', {value:510});
