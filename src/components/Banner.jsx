import { useEffect, useRef } from "react";

export default function Banner() {
  const adRef = useRef(null);

  useEffect(() => {
    if (!adRef.current) return;

    adRef.current.innerHTML = "";

    window.atOptions = {
      key: "fd503866394ff26c4cf35b6596aa6fed",
      format: "iframe",
      height: 60,
      width: 468,
      params: {}
    };

    const script = document.createElement("script");
    script.src =
      "https://overhearappointdare.com/fd503866394ff26c4cf35b6596aa6fed/invoke.js";
    script.async = true;

    adRef.current.appendChild(script);
  }, []);

  return (
    <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
      <div ref={adRef} style={{ width: "468px", height: "60px" }} />
    </div>
  );
}