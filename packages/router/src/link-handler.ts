import { IDOM } from '@aurelia/runtime';
import { HTMLDOM } from '@aurelia/runtime-html';
import { Key } from '@aurelia/kernel';

/**
 * Provides information about how to handle an anchor event.
 */
export interface ILinkHandlerOptions {
  /**
   * Attribute href should be used for route if present and
   * attribute au-href is not present
   */
  useHref?: boolean;
  /**
   * Callback method for when a link is clicked
   */
  callback(info: AnchorEventInfo): void;
}

/**
 * Provides information about how to handle an anchor event.
 */
export interface AnchorEventInfo {
  /**
   * Indicates whether the event should be handled or not.
   */
  shouldHandleEvent: boolean;
  /**
   * The href of the link or null if not-applicable.
   */
  href: string | null;
  /**
   * The anchor element or null if not-applicable.
   */
  anchor: Element | null;
}

/**
 * Class responsible for handling interactions that should trigger navigation.
 */
export class LinkHandler {
  public static readonly inject: readonly Key[] = [IDOM];

  public window: Window;
  public document: Document;

  // tslint:disable-next-line:no-empty
  private options: ILinkHandlerOptions = {
    useHref: false,
    callback: () => { }
  };
  private isActive: boolean = false;

  // private handler: EventListener;

  constructor(
    dom: HTMLDOM
  ) {
    this.window = dom.window;
    this.document = dom.document;
  }
  /**
   * Gets the href and a "should handle" recommendation, given an Event.
   *
   * @param event - The Event to inspect for target anchor and href.
   */
  private static getEventInfo(event: Event, win: Window, options: ILinkHandlerOptions): AnchorEventInfo {
    const info: AnchorEventInfo = {
      shouldHandleEvent: false,
      href: null,
      anchor: null
    };

    const target = info.anchor = LinkHandler.closestAnchor(event.target as Element);
    if (!target || !LinkHandler.targetIsThisWindow(target, win)) {
      return info;
    }

    if (target.hasAttribute('external')) {
      return info;
    }

    if ((event as MouseEvent).altKey || (event as MouseEvent).ctrlKey || (event as MouseEvent).metaKey || (event as MouseEvent).shiftKey) {
      return info;
    }

    const auHref: string | null = target.hasAttribute('au-href') ? target.getAttribute('au-href') : null;
    const href: string | null = options.useHref && target.hasAttribute('href') ? target.getAttribute('href') : null;
    if ((auHref === null || auHref.length === 0) && (href === null || href.length === 0)) {
      return info;
    }

    info.anchor = target;
    info.href = auHref || href;

    const leftButtonClicked: boolean = (event as MouseEvent).which === 1;

    info.shouldHandleEvent = leftButtonClicked;
    return info;
  }

  /**
   * Finds the closest ancestor that's an anchor element.
   *
   * @param el - The element to search upward from.
   * @returns The link element that is the closest ancestor.
   */
  private static closestAnchor(el: Element): Element | null {
    while (el !== null && el !== void 0) {
      if (el.tagName === 'A') {
        return el;
      }
      el = el.parentNode as Element;
    }
    return null;
  }

  /**
   * Gets a value indicating whether or not an anchor targets the current window.
   *
   * @param target - The anchor element whose target should be inspected.
   * @returns True if the target of the link element is this window; false otherwise.
   */
  private static targetIsThisWindow(target: Element, win: Window): boolean {
    const targetWindow = target.getAttribute('target');

    return !targetWindow ||
      targetWindow === win.name ||
      targetWindow === '_self';
  }

  /**
   * Activate the instance.
   *
   */
  public activate(options: ILinkHandlerOptions): void {
    if (this.isActive) {
      throw new Error('Link handler has already been activated');
    }

    this.isActive = true;
    this.options = { ...options };

    this.document.addEventListener('click', this.handler, true);
  }

  /**
   * Deactivate the instance. Event handlers and other resources should be cleaned up here.
   */
  public deactivate(): void {
    if (!this.isActive) {
      throw new Error('Link handler has not been activated');
    }
    this.document.removeEventListener('click', this.handler, true);
    this.isActive = false;
  }

  private readonly handler: EventListener = (e) => {
    const info = LinkHandler.getEventInfo(e, this.window, this.options);

    if (info.shouldHandleEvent) {
      e.preventDefault();
      this.options.callback(info);
    }
  };
}
