"use client";

import {
	useCallback,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
} from "react";

const SCROLL_TOLERANCE_PX = 4;

export function useHorizontalScrollOverflow() {
	const ref = useRef<HTMLDivElement>(null);
	const [overflowing, setOverflowing] = useState(false);
	const [canScrollLeft, setCanScrollLeft] = useState(false);
	const [canScrollRight, setCanScrollRight] = useState(false);

	const updateOverflowState = useCallback(() => {
		const el = ref.current;
		if (!el) return;
		const { scrollLeft, scrollWidth, clientWidth } = el;
		const overflow = scrollWidth > clientWidth + SCROLL_TOLERANCE_PX;
		setOverflowing(overflow);
		if (!overflow) {
			setCanScrollLeft(false);
			setCanScrollRight(false);
			return;
		}
		const maxScroll = scrollWidth - clientWidth;
		setCanScrollLeft(scrollLeft > SCROLL_TOLERANCE_PX);
		setCanScrollRight(scrollLeft < maxScroll - SCROLL_TOLERANCE_PX);
	}, []);

	useLayoutEffect(() => {
		updateOverflowState();
	}, [updateOverflowState]);

	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		updateOverflowState();

		const ro = new ResizeObserver(updateOverflowState);
		ro.observe(el);
		const inner = el.firstElementChild;
		if (inner) {
			ro.observe(inner);
		}

		el.addEventListener("scroll", updateOverflowState, { passive: true });
		return () => {
			ro.disconnect();
			el.removeEventListener("scroll", updateOverflowState);
		};
	}, [updateOverflowState]);

	const scrollByViewport = useCallback((direction: -1 | 1) => {
		const el = ref.current;
		if (!el) return;
		el.scrollBy({
			left: direction * Math.max(120, el.clientWidth * 0.65),
			behavior: "smooth",
		});
	}, []);

	return {
		scrollRef: ref,
		overflowing,
		canScrollLeft,
		canScrollRight,
		scrollByViewport,
		refreshOverflow: updateOverflowState,
	};
}
