"use client";

import { QRCodeCanvas } from "qrcode.react";
import { QrCode, Download, ExternalLink } from "lucide-react";
import { useRef } from "react";

interface QrCodeBlockProps {
  slug: string;
}

export function QrCodeBlock({ slug }: QrCodeBlockProps) {
  const qrRef = useRef<HTMLDivElement>(null);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://neo.app";
  const menuUrl = `${siteUrl.replace(/\/$/, "")}/${slug}`;

  const downloadQr = () => {
    const canvas = qrRef.current?.querySelector("canvas");
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `neo-${slug}-qr.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl p-5 shadow-sm">
      <div className="flex items-center gap-2 border-b border-[var(--admin-border)] pb-2.5 mb-4">
        <QrCode size={14} className="text-[var(--admin-text-muted)]" />
        <h2 className="text-xs font-semibold text-[var(--admin-text)]">
          Código QR del Menú
        </h2>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-5">
        <div
          ref={qrRef}
          className="bg-white p-2 rounded-xl shadow-sm border border-[var(--admin-border)]"
        >
          <QRCodeCanvas
            value={menuUrl}
            size={140}
            level="M"
            fgColor="#0f172a"
            style={{ display: "block" }}
          />
        </div>

        <div className="flex-1 space-y-2.5 text-center sm:text-left">
          <p className="text-xs font-semibold text-[var(--admin-text)]">
            Escaneá y probá tu menú digital
          </p>
          <p className="text-[10px] text-[var(--admin-text-muted)] leading-relaxed">
            Este QR lleva a los clientes directo a tu carta digital. Imprimilo y
            ponelo en tu local, en mesas o en la vidriera.
          </p>
          <a
            href={menuUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] font-medium text-[var(--admin-accent)] hover:underline inline-flex items-center gap-1"
          >
            <ExternalLink size={10} />
            {menuUrl}
          </a>
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={downloadQr}
              className="inline-flex items-center gap-1.5 text-[10px] font-semibold px-3 py-1.5 rounded-lg bg-[var(--admin-accent)] text-white hover:opacity-90 transition-all shadow-sm"
            >
              <Download size={10} />
              Descargar QR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
