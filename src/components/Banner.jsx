import { useEffect, useRef } from "react";

export default function NativeBanner() {
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (!wrapperRef.current) return;

    wrapperRef.current.innerHTML = "";

    const adDiv = document.createElement("div");
    adDiv.id = "container-53fe6d3e025cc86030eb681e01663e11";
    wrapperRef.current.appendChild(adDiv);

    const script = document.createElement("script");
    script.async = true;
    script.setAttribute("data-cfasync", "false");
    script.src =
      "https://overhearappointdare.com/53fe6d3e025cc86030eb681e01663e11/invoke.js";

    wrapperRef.current.appendChild(script);

    return () => {
      if (wrapperRef.current) {
        wrapperRef.current.innerHTML = "";
      }
    };
  }, []);

  return (
    <div className="flex w-full justify-center">
      <div ref={wrapperRef} />
    </div>
  );
}