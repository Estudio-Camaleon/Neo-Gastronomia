"use client";

import { MessageCircle, MapPin, Clock } from "lucide-react";
import Image from "next/image";
import { FoodMini } from "@/components/ui/food-loading";
import { ImageIcon } from "lucide-react";
import type { DireccionFisica } from "@/core/types/domain";

interface HeaderPreviewProps {
  variant: "desktop" | "mobile";
  compact?: boolean;
  bannerUrl: string;
  bannerPosicion: string;
  bannerScale: number;
  logoUrl: string;
  logoScale: number;
  logoPosicion: string;
  logoShape: string;
  nombre: string;
  descripcion?: string;
  mostrarNombre: boolean;
  colorPrimary: string;
  socials: { id: string; url?: string }[];
  direcciones?: DireccionFisica[];
  localidad?: string;
  uploading?: string | null;
}

const STICKER_OFFSET: Record<string, string> = {
  top: "-16px",
  center: "0px",
  bottom: "16px",
};

const TRANSFORM_ORIGIN_MAP: Record<string, string> = {
  top: "center top",
  center: "center",
  bottom: "center bottom",
};

const SOCIAL_ICONS: Record<string, React.ReactNode> = {
  whatsapp: <MessageCircle size={14} />,
  instagram: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  ),
  facebook: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  ),
  tiktok: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  ),
  twitter: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
  youtube: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  ),
};

export function HeaderPreview({
  variant,
  compact = false,
  bannerUrl,
  bannerPosicion,
  bannerScale,
  logoUrl,
  logoScale,
  logoPosicion,
  logoShape,
  nombre,
  descripcion,
  mostrarNombre,
  colorPrimary,
  socials,
  direcciones,
  localidad,
  uploading,
}: HeaderPreviewProps) {
  const isMobile = variant === "mobile";
  const isCompact = compact || isMobile;
  const isSticker = logoShape === "none";
  const isRoundedShape = logoShape === "rounded";
  const isCircularShape = logoShape === "circle";
  const cardBgStyle = colorPrimary
    ? `color-mix(in srgb, ${colorPrimary}, black 75%)`
    : "#163B2D";
  const stickerMarginTop = isSticker
    ? (STICKER_OFFSET[logoPosicion] ?? "0px")
    : undefined;
  const logoTransformOrigin = TRANSFORM_ORIGIN_MAP[logoPosicion] ?? "center";
  const topSocialIds = socials.slice(0, 3).map((s) => s.id);
  const hasSocials = topSocialIds.length > 0;

  const logoStyle: React.CSSProperties = {
    objectPosition: logoPosicion,
    transform: `scale(${logoScale})`,
    transformOrigin: logoTransformOrigin,
    marginTop: stickerMarginTop,
    objectFit: isSticker ? "contain" : "cover",
  };

  const fallbackStyle: React.CSSProperties = {
    background: colorPrimary || "var(--color-custom-500)",
  };
  if (isSticker && stickerMarginTop) {
    fallbackStyle.marginTop = stickerMarginTop;
  }

  const logoContainerSize = isCompact
    ? "w-[52px] h-[52px]"
    : "w-[72px] h-[72px] sm:w-[88px] sm:h-[88px] md:w-[120px] md:h-[120px]";

  const logoContainerClasses = isSticker
    ? "relative flex items-center justify-center"
    : `${logoContainerSize} overflow-hidden bg-white ${
        isCircularShape ? "rounded-full" : isRoundedShape ? "rounded-2xl" : ""
      }`;

  const logoContainerStyle: React.CSSProperties | undefined = isSticker
    ? undefined
    : ({
        boxShadow: `0 0 0 ${isMobile ? "5px" : "6px"} ${cardBgStyle}, 0 ${isMobile ? "20px" : "25px"} ${isMobile ? "40px" : "50px"} -12px rgba(0,0,0,0.5)`,
      } as React.CSSProperties);

  const logoInner = logoUrl ? (
    isSticker ? (
      <img
        src={logoUrl}
        alt={nombre}
        className={isCompact ? "max-h-14 max-w-14" : "max-h-24 max-w-24 sm:max-h-28 sm:max-w-28 md:max-h-36 md:max-w-36 drop-shadow-2xl"}
        style={logoStyle}
      />
    ) : (
      <img
        src={logoUrl}
        alt={nombre}
        className="h-full w-full object-cover"
        style={{ ...logoStyle, objectFit: "cover" }}
      />
    )
  ) : (
    <div
      className={`flex items-center justify-center text-white font-black ${
        isCompact ? "text-[16px]" : "text-[21px] sm:text-[23px] md:text-[33px]"
      } ${
        isSticker
          ? isCompact
            ? "w-[52px] h-[52px]"
            : "w-[72px] h-[72px] sm:w-[88px] sm:h-[88px] md:w-[120px] md:h-[120px]"
          : "h-full w-full"
      }${isCircularShape ? " rounded-full" : ""}`}
      style={fallbackStyle}
    >
      {nombre
        ? nombre.split(" ").map((s) => s[0]).slice(0, 2).join("")
        : "?"}
    </div>
  );

  const cardWidth = isCompact ? "w-full max-w-[260px]" : "w-full max-w-[380px]";
  const cardPadding = isCompact
    ? "px-2.5 pb-3 pt-[34px]"
    : "px-4 sm:px-5 pb-5 sm:pb-6 pt-[56px] sm:pt-[68px]";
  const cardRadius = isCompact ? "rounded-[14px]" : "rounded-[22px] md:rounded-[28px]";
  const logoOffset = isCompact ? "-top-[24px]" : "-top-[44px] md:-top-[52px]";

  return (
    <div className="relative">
      <div
        className="relative w-full overflow-hidden"
        style={{ aspectRatio: !isCompact ? "21/6" : undefined, minHeight: isCompact ? "150px" : "200px" }}
      >
        {bannerUrl ? (
          <div
            className="absolute inset-0"
            style={{ transform: `scale(${bannerScale ?? 1})`, transformOrigin: "center top" }}
          >
            {bannerUrl.startsWith("blob:") ? (
              <img
                src={bannerUrl}
                alt=""
                className="h-full w-full object-cover"
                style={{ objectPosition: bannerPosicion }}
              />
            ) : (
              <Image
                src={bannerUrl}
                fill
                className="object-cover"
                style={{ objectPosition: bannerPosicion }}
                alt=""
                sizes={isMobile ? "280px" : "(max-width: 768px) 100vw, 700px"}
              />
            )}
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[var(--admin-text-muted)] opacity-30">
            <ImageIcon className="size-7 sm:size-9" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/50" />

        <div className="absolute inset-0 flex items-center justify-center px-4 sm:px-6">
          <div className={`relative ${cardWidth}`}>
            <div className={`absolute left-1/2 -translate-x-1/2 ${logoOffset} z-20`}>
              <div className={logoContainerClasses} style={logoContainerStyle}>
                {logoInner}
              </div>
            </div>

            <div
              className={`backdrop-blur-xl shadow-2xl ${cardPadding} ${cardRadius}`}
              style={{
                backgroundColor: `color-mix(in srgb, ${cardBgStyle}, transparent 15%)`,
              }}
            >
              {mostrarNombre && (
                <h1
                  className={`text-center text-white font-extrabold leading-tight tracking-tight ${
                    isCompact ? "text-[13px]" : "text-[19px] sm:text-[21px] md:text-[27px]"
                  }`}
                >
                  {nombre || "Nombre del negocio"}
                </h1>
              )}

              {descripcion && (
                <p
                  className={`text-center text-white/70 mx-auto leading-relaxed ${
                    isCompact ? "text-[10px] mt-0.5" : "text-[13px] sm:text-[15px] md:text-[17px] mt-1.5 max-w-[500px]"
                  }`}
                >
                  {descripcion}
                </p>
              )}

              {hasSocials && (
                <div className={`flex flex-wrap justify-center gap-1 ${
                  isCompact ? "mt-1.5" : "sm:gap-2 mt-2.5 sm:mt-3"
                }`}>
                  {topSocialIds.map((id) => (
                    <span key={id} className={`flex items-center justify-center rounded-full bg-white/10 text-white/80 ${
                      isCompact ? "size-5" : "size-8 sm:size-10"
                    }`}>
                      {SOCIAL_ICONS[id] ?? null}
                    </span>
                  ))}
                </div>
              )}

              <div className={`flex justify-center gap-1.5 ${
                isCompact ? "mt-1.5" : "mt-2.5 sm:mt-3"
              }`}>
                <div
                  className={`flex items-center rounded-full bg-white/10 text-white/80 gap-1 ${
                    isCompact ? "px-1.5 py-0.5 text-[9px]" : "sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 text-[12px] sm:text-[13px] md:text-[15px]"
                  }`}
                >
                  <MapPin className={isCompact ? "size-2" : "size-3 sm:size-3.5"} />
                  <span className={`truncate ${isCompact ? "max-w-[30px]" : "max-w-[50px] sm:max-w-[60px] md:max-w-[80px]"}`}>
                    {direcciones && direcciones.length > 0
                      ? direcciones[0]?.nombre || direcciones[0]?.direccion
                      : localidad || "Ubicación"}
                  </span>
                </div>
                <div
                  className={`flex items-center rounded-full bg-white/10 text-white/80 gap-1 ${
                    isCompact ? "px-1.5 py-0.5 text-[9px]" : "sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 text-[12px] sm:text-[13px] md:text-[15px]"
                  }`}
                >
                  <Clock className={isCompact ? "size-2.5" : "size-3 sm:size-3.5"} />
                  <span>Horarios</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {uploading === "banner_url" && (
          <div className="absolute inset-0 bg-[var(--admin-surface)]/80 backdrop-blur-sm flex items-center justify-center z-30">
            <FoodMini size={20} />
          </div>
        )}
      </div>
    </div>
  );
}
