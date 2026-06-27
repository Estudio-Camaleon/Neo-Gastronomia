"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { FaWhatsapp } from "react-icons/fa";
import { Clock } from "lucide-react";
import { formatTurnos } from "@/features/public-menu/utils";

import type { NegocioPublico } from "@/features/public-menu/types";

/** Variables derivadas */
function getCardBgStyle(primary?: string | null) {
  return primary
    ? `color-mix(in srgb, ${primary}, black 75%)`
    : "#163B2D";
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

type Shape = "circle" | "rounded" | "none";

export function BrandCard({
  negocio,
  todayKey,
  className,
}: {
  negocio: NegocioPublico;
  todayKey: string | null;
  className?: string;
}) {
  const cardBgStyle = getCardBgStyle(negocio.color_primary);
  const logoShape: Shape = (negocio.logo_shape as Shape) ?? "circle";
  const isRoundedShape = logoShape === "rounded";
  const isCircularShape = logoShape === "circle";
  const isSticker = logoShape === "none";
  const logoScale = negocio.logo_scale ?? 1;
  const logoPosicion = negocio.logo_posicion ?? "center";
  const logoFit = negocio.logo_fit ?? "contain";
  const stickerMarginTop = isSticker
    ? (STICKER_OFFSET[logoPosicion] ?? "0px")
    : undefined;
  const logoTransformOrigin =
    TRANSFORM_ORIGIN_MAP[logoPosicion] ?? "center";

  return (
    <div className={`relative flex flex-col items-center px-4 ${className ?? ""}`}>
      <div className="relative w-[88%] max-w-[400px]">
        {/* Logo — protrudes from top of card */}
        <div className="absolute left-1/2 -translate-x-1/2 -top-[52px] z-20">
          <motion.div
            initial={{ scale: 0, y: 24 }}
            animate={{ scale: 1, y: 0 }}
            transition={{
              type: "spring",
              stiffness: 180,
              damping: 16,
              delay: 0.1,
            }}
            className="relative"
          >
            <div
              className={
                isSticker
                  ? "relative flex items-center justify-center"
                  : `w-[104px] h-[104px] sm:w-[120px] sm:h-[120px] shadow-2xl overflow-hidden bg-white ${
                      isRoundedShape ? "rounded-2xl" : "rounded-full"
                    }`
              }
              style={
                isSticker
                  ? undefined
                  : {
                      boxShadow: `0 0 0 6px ${cardBgStyle}, 0 25px 50px -12px rgba(0,0,0,0.5)`,
                    }
              }
            >
              {negocio.logo_url ? (
                <Image
                  src={negocio.logo_url}
                  alt={negocio.nombre}
                  width={200}
                  height={200}
                  sizes="120px"
                  className={
                    isSticker
                      ? "max-h-32 max-w-32 sm:max-h-36 sm:max-w-36 drop-shadow-2xl"
                      : "h-full w-full"
                  }
                  style={
                    isSticker
                      ? {
                          objectPosition: logoPosicion,
                          transform: "scale(" + logoScale + ")",
                          transformOrigin: logoTransformOrigin,
                          marginTop: stickerMarginTop,
                        }
                      : {
                          objectPosition: logoPosicion,
                          transform: "scale(" + logoScale + ")",
                          transformOrigin: logoTransformOrigin,
                          objectFit: logoFit as "contain" | "cover",
                        }
                  }
                  priority
                />
              ) : (
                <div
                  className={`flex items-center justify-center text-white font-black text-2xl sm:text-3xl ${
                    isSticker ? "w-[104px] h-[104px]" : "h-full w-full"
                  } ${
                    isCircularShape ? "rounded-full" : ""
                  }`}
                  style={{
                    background:
                      negocio.color_primary ?? "var(--color-custom-500)",
                  }}
                >
                  {negocio.nombre
                    .split(" ")
                    .filter(Boolean)
                    .map((s) => s[0])
                    .slice(0, 2)
                    .join("")}
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Card body */}
        <div
          className="backdrop-blur-xl rounded-[28px] shadow-2xl pt-[68px] pb-6 px-5 sm:px-8"
          style={{
            backgroundColor: `color-mix(in srgb, ${cardBgStyle}, transparent 15%)`,
          }}
        >
          {/* Business name */}
          {(negocio.mostrar_nombre ?? true) && (
            <motion.h1
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-center text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight"
            >
              {negocio.nombre}
            </motion.h1>
          )}

          {/* Description / tagline */}
          {negocio.descripcion && (
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.25 }}
              className="text-center text-white/70 text-sm sm:text-base mt-2 max-w-[500px] mx-auto leading-relaxed"
            >
              {negocio.descripcion}
            </motion.p>
          )}

          {/* Today's hours + WhatsApp */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.4 }}
            className="flex justify-center items-center gap-2 mt-4"
          >
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white/80 text-xs sm:text-sm">
              <Clock size={15} />
              <span>
                Hoy:{" "}
                {negocio.horarios && todayKey
                  ? negocio.horarios[todayKey]
                    ? formatTurnos(negocio.horarios[todayKey])
                    : "Cerrado"
                  : "Sin horarios"}
              </span>
            </div>
            {negocio.whatsapp && (
              <a
                href={`https://wa.me/${negocio.whatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noreferrer"
                aria-label="WhatsApp"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/80 transition-all hover:bg-[#25D366] hover:text-white hover:scale-110 active:scale-95 shrink-0"
              >
                <FaWhatsapp size={18} />
              </a>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
