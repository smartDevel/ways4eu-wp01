"use client";

import { useEffect } from "react";

export default function DisqusComments({ identifier, title, path }) {
  useEffect(() => {
    window.disqus_config = function disqusConfig() {
      this.page.url = `https://ways4eu.com${path}`;
      this.page.identifier = String(identifier);
      this.page.title = title;
    };

    const script = document.createElement("script");
    script.src = "https://ways4eu.disqus.com/embed.js";
    script.setAttribute("data-timestamp", String(Date.now()));
    script.async = true;
    document.body.appendChild(script);

    return () => {
      script.remove();
      delete window.disqus_config;
    };
  }, [identifier, path, title]);

  return <div id="disqus_thread" className="comments" />;
}
