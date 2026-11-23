"use client";

import { useMemo, useState } from "react";
import { site } from "@/lib/config";

const SERVICES = [
  ["Facebook", "f"],
  ["Instagram", "◎"],
  ["TikTok", "♪"],
  ["WhatsApp", "◉"],
  ["Email", "@"],
  ["Telegram", "➤"],
  ["Print", "▤"],
  ["LinkedIn", "in"],
  ["X", "X"],
  ["Pinterest", "P"],
  ["Reddit", "r"],
  ["Weibo", "微"],
  ["Tumblr", "t"],
];

export default function ShareButtons({ title, text = "", url, favorites = [] }) {
  const [message, setMessage] = useState("");
  const payload = useMemo(() => buildPayload({ title, text, url, favorites }), [favorites, text, title, url]);

  async function copyFor(service) {
    const copied = await copyText(payload.fullText);
    setMessage(copied
      ? `${payload.kind} copied. Paste it into ${service}.`
      : `Open ${service} and paste the ${payload.kind.toLowerCase()} manually.`);
  }

  function openCopyService(service) {
    const destination = service === "TikTok" ? "https://www.tiktok.com/" : "https://www.instagram.com/";
    window.open(destination, "_blank", "noopener,noreferrer");
    copyFor(service);
  }

  function printPage() {
    setMessage("Opening the print dialog.");
    window.print();
  }

  return (
    <section className="share-section" aria-labelledby={`share-${payload.id}`}>
      <div className="share-heading-row">
        <div>
          <p className="share-kicker">Share</p>
          <h2 id={`share-${payload.id}`}>{favorites.length ? "Share my favorites" : "Share this post"}</h2>
        </div>
        {favorites.length > 0 && <p className="share-privacy">Only titles, ratings and post links are shared. Your saved list stays on this device.</p>}
      </div>
      <div className="share-buttons">
        {SERVICES.map(([service, icon]) => {
          if (service === "Instagram" || service === "TikTok") {
            return <ShareButton key={service} service={service} icon={icon} onClick={() => openCopyService(service)} />;
          }
          if (service === "Print") {
            return <ShareButton key={service} service={service} icon={icon} onClick={printPage} />;
          }
          const href = shareHref(service, payload);
          const copiesFirst = favorites.length > 0 && (service === "Facebook" || service === "LinkedIn" || service === "Reddit");
          return (
            <a
              key={service}
              className={`share-button share-${service.toLowerCase()}`}
              href={href}
              target={service === "Email" ? undefined : "_blank"}
              rel={service === "Email" ? undefined : "noreferrer"}
              aria-label={`Share via ${service}`}
              onClick={copiesFirst ? () => copyFor(service) : undefined}
            >
              <span className="share-icon" aria-hidden="true">{icon}</span>
              <span>{service}</span>
            </a>
          );
        })}
      </div>
      <p className="share-message" role="status">{message}</p>
    </section>
  );
}

function ShareButton({ service, icon, onClick }) {
  return (
    <button type="button" className={`share-button share-${service.toLowerCase()}`} aria-label={service === "Print" ? "Print this page" : `Share via ${service}`} onClick={onClick}>
      <span className="share-icon" aria-hidden="true">{icon}</span>
      <span>{service}</span>
    </button>
  );
}

function buildPayload({ title, text, url, favorites }) {
  const shareUrl = absoluteUrl(url || "/");
  const id = favorites.length ? "favorites" : "post";
  if (!favorites.length) {
    const fullText = [title, text, shareUrl].filter(Boolean).join("\n\n");
    return { id, kind: "Post link", title, text: text || title, shortText: text || title, url: shareUrl, fullText };
  }

  const lines = favorites.map((favorite, index) => {
    const rating = favorite.rating ? ` — ${favorite.rating}/5 stars` : " — not rated";
    return `${index + 1}. ${favorite.title}${rating}\n${absoluteUrl(favorite.path)}`;
  });
  const list = `My CurioSphere favorites\n\n${lines.join("\n\n")}`;
  const shortText = favorites.length === 1
    ? `My CurioSphere favorite: ${favorites[0].title}`
    : `My ${favorites.length} CurioSphere favorites`;
  return { id, kind: "Favorites list", title: "My CurioSphere favorites", text: list, shortText, url: shareUrl, fullText: list };
}

function shareHref(service, payload) {
  const url = encodeURIComponent(payload.url);
  const title = encodeURIComponent(payload.title);
  const text = encodeURIComponent(payload.text);
  const shortText = encodeURIComponent(payload.shortText);
  const fullText = encodeURIComponent(`${payload.fullText}\n\n${payload.url}`);

  if (service === "Facebook") return `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`;
  if (service === "WhatsApp") return `https://wa.me/?text=${fullText}`;
  if (service === "Email") return `mailto:?subject=${title}&body=${fullText}`;
  if (service === "Telegram") return `https://t.me/share/url?url=${url}&text=${text}`;
  if (service === "LinkedIn") return `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
  if (service === "X") return `https://twitter.com/intent/tweet?url=${url}&text=${shortText}`;
  if (service === "Pinterest") return `https://pinterest.com/pin/create/button/?url=${url}&description=${text}`;
  if (service === "Reddit") return `https://www.reddit.com/submit?url=${url}&title=${title}`;
  if (service === "Weibo") return `https://service.weibo.com/share/share.php?url=${url}&title=${text}`;
  return `https://www.tumblr.com/widgets/share/tool?canonicalUrl=${url}&title=${title}&caption=${text}`;
}

function absoluteUrl(value) {
  try {
    return new URL(value, site.url).href;
  } catch {
    return site.url;
  }
}

async function copyText(value) {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    const field = document.createElement("textarea");
    field.value = value;
    field.style.position = "fixed";
    field.style.opacity = "0";
    document.body.appendChild(field);
    field.select();
    const copied = document.execCommand("copy");
    field.remove();
    return copied;
  }
}
