"use client";

import { useEffect, useRef, useState, ReactNode } from "react";

interface RevealProps {
	children: ReactNode;
	delay?: number;
	className?: string;
}

export default function Reveal({
	children,
	delay = 0,
	className = "",
}: RevealProps) {
	const ref = useRef<HTMLDivElement>(null);
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		const el = ref.current;
		if (!el) return;

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setTimeout(() => setVisible(true), delay);
				} else {
					setVisible(false);
				}
			},
			{
				threshold: 0.1,
				rootMargin: "0px 0px -50px 0px",
			},
		);

		observer.observe(el);
		return () => observer.disconnect();
	}, [delay]);

	return (
		<div
			ref={ref}
			className={`reveal ${visible ? "reveal-visible" : ""} ${className}`}>
			{children}
		</div>
	);
}