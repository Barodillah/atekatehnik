import { useCallback, useLayoutEffect, useRef, useState } from 'react';

/**
 * Block shape used by the packer:
 * {
 *   id: string,
 *   type: string,
 *   height: number,          // measured px height of the block itself
 *   group?: string,          // consecutive blocks with same group share a container (table / grid section)
 *   groupHeader?: number,    // extra px the container costs when a run of this group starts on a page
 *   keepWithNext?: boolean,  // never leave this block as the last one on a page
 *   ...any render data
 * }
 */

const costOnPage = (block, page) => {
  const last = page[page.length - 1];
  const startsGroup = block.group && (!last || last.group !== block.group);
  return block.height + (startsGroup ? block.groupHeader || 0 : 0);
};

/**
 * Greedy pagination: fill each page as much as possible before breaking.
 * @param {Array} blocks
 * @param {(pageIndex:number) => number} getAvailable available content height (px) for a page
 * @returns {Array<Array>} pages
 */
export const paginate = (blocks, getAvailable) => {
  const pages = [];
  let page = [];
  let used = 0;

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    const next = blocks[i + 1];

    let need = costOnPage(block, page);
    if (block.keepWithNext && next) need += costOnPage(next, [...page, block]);

    if (page.length > 0 && used + need > getAvailable(pages.length)) {
      pages.push(page);
      page = [];
      used = 0;
    }

    used += costOnPage(block, page);
    page.push(block);
  }

  if (page.length > 0 || pages.length === 0) pages.push(page);
  return pages;
};

/** Split a page's blocks into runs: consecutive blocks of the same group are combined. */
export const groupRuns = (blocks) => {
  const runs = [];
  blocks.forEach((block) => {
    const last = runs[runs.length - 1];
    if (block.group && last && last.group === block.group) {
      last.blocks.push(block);
    } else {
      runs.push({ group: block.group || null, blocks: [block] });
    }
  });
  return runs;
};

const heightsEqual = (a, b) => {
  if (!a || !b) return false;
  const ka = Object.keys(a);
  if (ka.length !== Object.keys(b).length) return false;
  return ka.every((k) => Math.abs(a[k] - (b[k] ?? -1)) < 0.5);
};

/**
 * Measures every element with a `data-measure="<id>"` attribute inside the returned ref.
 * Re-measures automatically when any measured element resizes (fonts / images loading, content edits).
 */
export const useBlockHeights = () => {
  const ref = useRef(null);
  const [heights, setHeights] = useState(null);

  const measure = useCallback(() => {
    const root = ref.current;
    // Skip when hidden (e.g. display:none while printing) so we never paginate with zero heights.
    if (!root || root.offsetWidth === 0) return;
    const next = {};
    root.querySelectorAll('[data-measure]').forEach((el) => {
      next[el.dataset.measure] = el.getBoundingClientRect().height;
    });
    setHeights((prev) => (heightsEqual(prev, next) ? prev : next));
  }, []);

  useLayoutEffect(() => {
    measure();
    const root = ref.current;
    if (!root || typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(() => measure());
    root.querySelectorAll('[data-measure]').forEach((el) => ro.observe(el));
    return () => ro.disconnect();
  });

  return [ref, heights];
};
