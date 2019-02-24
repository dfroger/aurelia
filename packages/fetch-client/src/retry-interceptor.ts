import { ITimerHandler, PLATFORM } from '@aurelia/kernel';
import { HttpClient } from './http-client';
import { Interceptor, RetryableRequest, RetryConfiguration } from './interfaces';

export const retryStrategy: {
  fixed: 0;
  incremental: 1;
  exponential: 2;
  random: 3;
} = {
  fixed: 0,
  incremental: 1,
  exponential: 2,
  random: 3
};

const defaultRetryConfig: RetryConfiguration = {
  maxRetries: 3,
  interval: 1000,
  strategy: retryStrategy.fixed
};

/**
 * Interceptor that retries requests on error, based on a given RetryConfiguration.
 */
export class RetryInterceptor implements Interceptor {
  public retryConfig: RetryConfiguration;

  /**
   * Creates an instance of RetryInterceptor.
   */
  constructor(retryConfig?: RetryConfiguration) {
    this.retryConfig = {...defaultRetryConfig, ...(retryConfig !== undefined ? retryConfig : {})};

    if (this.retryConfig.strategy === retryStrategy.exponential &&
      (this.retryConfig.interval as number) <= 1000) {
      throw new Error('An interval less than or equal to 1 second is not allowed when using the exponential retry strategy');
    }
  }

  /**
   * Called with the request before it is sent. It remembers the request so it can be retried on error.
   *
   * @param request The request to be sent.
   * @returns The existing request, a new request or a response; or a Promise for any of these.
   */
  public request(request: RetryableRequest): RetryableRequest {
    if (!request.retryConfig) {
      request.retryConfig = {...this.retryConfig};
      request.retryConfig.counter = 0;
    }

    // do this on every request
    request.retryConfig.requestClone = request.clone();

    return request;
  }

  /**
   * Called with the response after it is received. Clears the remembered request, as it was succesfull.
   *
   * @param response The response.
   * @returns The response; or a Promise for one.
   */
  public response(response: Response, request: RetryableRequest): Response {
    // retry was successful, so clean up after ourselves
    Reflect.deleteProperty(request, 'retryConfig');
    return response;
  }

  /**
   * Handles fetch errors and errors generated by previous interceptors. This
   * function acts as a Promise rejection handler. It wil retry the remembered request based on the
   * configured RetryConfiguration.
   *
   * @param error The rejection value from the fetch request or from a
   * previous interceptor.
   * @returns The response of the retry; or a Promise for one.
   */

  public responseError(error: Response, request: RetryableRequest, httpClient: HttpClient): Response | Promise<Response> {
    const { retryConfig } = request as { retryConfig: Required<RetryConfiguration> };
    const { requestClone } = retryConfig;
    return Promise.resolve().then(() => {
      if (retryConfig.counter < retryConfig.maxRetries) {
        const result = retryConfig.doRetry !== undefined ? retryConfig.doRetry(error, request) : true;

        return Promise.resolve(result).then(doRetry => {
          if (doRetry) {
            retryConfig.counter++;
            const delay = calculateDelay(retryConfig);
            // tslint:disable-next-line:no-string-based-set-timeout
            return new Promise((resolve: ITimerHandler) => PLATFORM.global.setTimeout(resolve, !isNaN(delay) ? delay : 0))
              .then(() => {
                const newRequest = requestClone.clone();
                if (typeof (retryConfig.beforeRetry) === 'function') {
                  return retryConfig.beforeRetry(newRequest, httpClient);
                }
                return newRequest;
              })
              .then(newRequest => {
                const retryableRequest: RetryableRequest = {...newRequest, retryConfig};
                return httpClient.fetch(retryableRequest);
              });
          }

          // no more retries, so clean up
          Reflect.deleteProperty(request, 'retryConfig');
          throw error;
        });
      }
      // no more retries, so clean up
      Reflect.deleteProperty(request, 'retryConfig');
      throw error;
    });
  }
}

function calculateDelay(retryConfig: RetryConfiguration): number {
  const { interval, strategy, minRandomInterval, maxRandomInterval, counter } = retryConfig as Required<RetryConfiguration>;

  if (typeof (strategy) === 'function') {
    return (retryConfig.strategy as (retryCount: number) => number)(counter);
  }

  switch (strategy) {
    case (retryStrategy.fixed):
      return retryStrategies[retryStrategy.fixed](interval);
    case (retryStrategy.incremental):
      return retryStrategies[retryStrategy.incremental](counter, interval);
    case (retryStrategy.exponential):
      return retryStrategies[retryStrategy.exponential](counter, interval);
    case (retryStrategy.random):
      return retryStrategies[retryStrategy.random](counter, interval, minRandomInterval, maxRandomInterval);
    default:
      throw new Error('Unrecognized retry strategy');
  }
}

const retryStrategies = [
  // fixed
  interval => interval,

  // incremental
  (retryCount, interval) => interval * retryCount,

  // exponential
  (retryCount, interval) => retryCount === 1 ? interval : Math.pow(interval, retryCount) / 1000,

  // random
  (retryCount, interval, minRandomInterval = 0, maxRandomInterval = 60000) => {
    // tslint:disable-next-line:insecure-random
    return Math.random() * (maxRandomInterval - minRandomInterval) + minRandomInterval;
  }
] as [
    (interval: number) => number,
    (retryCount: number, interval: number) => number,
    (retryCount: number, interval: number) => number,
    (retryCount: number, interval: number, minRandomInterval?: number, maxRandomInterval?: number) => number
  ];
